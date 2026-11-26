import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowLeft,
  Bell,
  BellRing,
  Check,
  ClipboardCheck,
  Edit3,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  Package,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  UserPlus,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { AdminImagePicker } from "@/components/AdminImagePicker";
import { BrandMark, LanguageSwitcher } from "@/components/SiteChrome";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  buildCatalogOverrideKey,
  useStore,
} from "@/contexts/StoreContext";
import {
  formatPrice,
  getRangeCopy,
  getSubcategoryImage,
  productRanges as baseProductRanges,
  type ProductSubcategory,
  type ProductVariant,
} from "@/lib/catalog";
import {
  db,
  FIREBASE_PROJECT_ID,
  handleFirestoreError,
  OperationType,
  OWNER_ADMIN_EMAIL,
} from "@/lib/firebase";
import { translations } from "@/lib/i18n";
import { validateCatalogImageGallery } from "@/lib/imageUtils";
import {
  DEFAULT_NOTIFICATION_CONFIG,
  dispatchExternalAdminAlert,
  getDesktopNotificationPermission,
  playNotificationChime,
  recordAdminUpdateNotification,
  requestDesktopNotificationPermission,
  showDesktopNotification,
  type AdminNotificationConfig,
  type AdminNotificationItem,
  type AdminNotificationType,
} from "@/lib/notifications";
import {
  ORDER_STATUS_SEQUENCE,
  timestampToIso,
  type OrderStatusStep,
  type TrackedOrder,
} from "@/lib/orders";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

type AdminTab = "orders" | "catalog" | "settings";

type OrderPrivateContact = {
  fullName: string;
  phone: string;
  email: string;
  notes: string;
};

type AdminAccountEntry = {
  uid: string;
  email: string;
  addedBy: string;
  createdAt: string;
};

type VarietyDraft = {
  subcategoryId: string;
  nameEn: string;
  nameAr: string;
  noteEn: string;
  noteAr: string;
  isActive: boolean;
  imageUrls: string[];
  variants: ProductVariant[];
};

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const NTFY_TOPIC_REGEX = /^[a-zA-Z0-9_-]{3,120}$/;
const ALLOWED_WEBHOOK_HOSTS = new Set([
  "ntfy.sh",
  "hooks.slack.com",
  "discord.com",
  "discordapp.com",
  "hooks.zapier.com",
  "hook.eu1.make.com",
  "hook.us1.make.com",
  "hook.eu2.make.com",
  "hook.us2.make.com",
]);

function isValidClientWebhookUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(trimmed);
    return (
      parsed.protocol === "https:" &&
      !parsed.username &&
      !parsed.password &&
      ALLOWED_WEBHOOK_HOSTS.has(parsed.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

function sanitizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function formatDateTime(iso: string, lang: "en" | "ar") {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shouldNotifyForType(
  type: AdminNotificationType,
  config: AdminNotificationConfig
): boolean {
  switch (type) {
    case "order_created":
    case "inquiry_created":
      return config.notifyOnNewOrder;
    case "order_status_updated":
      return config.notifyOnStatusChange;
    case "catalog_updated":
      return config.notifyOnCatalogUpdate;
    case "settings_updated":
      return config.notifyOnSettingsUpdate;
    default:
      return true;
  }
}

function NotificationTypeIcon({ type }: { type: AdminNotificationType }) {
  switch (type) {
    case "order_created":
      return <ShoppingBag size={15} aria-hidden="true" />;
    case "inquiry_created":
      return <Mail size={15} aria-hidden="true" />;
    case "order_status_updated":
      return <ClipboardCheck size={15} aria-hidden="true" />;
    case "catalog_updated":
      return <Package size={15} aria-hidden="true" />;
    case "settings_updated":
    default:
      return <Settings size={15} aria-hidden="true" />;
  }
}

type FatalErrorReporter = (
  error: unknown,
  op: OperationType,
  path: string | null
) => void;

function OrdersTab({
  onFatalError,
  notifConfig,
}: {
  onFatalError: FatalErrorReporter;
  notifConfig: AdminNotificationConfig;
}) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const tr = translations[lang].tracking;
  const a = translations[lang].admin;

  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactsByOrder, setContactsByOrder] = useState<
    Record<string, OrderPrivateContact | null>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatusStep>(
    "all"
  );
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("updatedAt", "desc")
    );
    const unsub = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const next: TrackedOrder[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const status = ORDER_STATUS_SEQUENCE.includes(
            data.status as OrderStatusStep
          )
            ? (data.status as OrderStatusStep)
            : "received";
          next.push({
            referenceId: String(data.referenceId || docSnap.id),
            kind: data.kind === "inquiry" ? "inquiry" : "order",
            orderType: data.orderType === "trade" ? "trade" : "home",
            customerName: String(data.customerName || "Store customer"),
            itemsSummary: Array.isArray(data.itemsSummary)
              ? data.itemsSummary.map((line) => String(line))
              : [],
            subtotal:
              typeof data.subtotal === "number" ? data.subtotal : undefined,
            status,
            createdAt: timestampToIso(data.createdAt),
            updatedAt: timestampToIso(data.updatedAt),
            isSample: data.isSample === true ? true : undefined,
          });
        });
        setOrders(next);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        onFatalError(error, OperationType.LIST, "orders");
      }
    );

    return () => unsub();
  }, [onFatalError]);

  useEffect(() => {
    let cancelled = false;
    const missingIds = orders
      .map((o) => o.referenceId)
      .filter((id) => !(id in contactsByOrder));

    if (missingIds.length === 0) return;

    void Promise.all(
      missingIds.map(async (id) => {
        const path = `orders/${id}/private/contact`;
        try {
          const snap = await getDoc(doc(db, "orders", id, "private", "contact"));
          if (cancelled) return;
          if (!snap.exists()) {
            setContactsByOrder((prev) => ({ ...prev, [id]: null }));
            return;
          }
          const data = snap.data();
          setContactsByOrder((prev) => ({
            ...prev,
            [id]: {
              fullName: String(data.fullName || ""),
              phone: String(data.phone || ""),
              email: String(data.email || ""),
              notes: String(data.notes || ""),
            },
          }));
        } catch (error) {
          if (!cancelled) {
            onFatalError(error, OperationType.GET, path);
          }
        }
      })
    );

    return () => {
      cancelled = true;
    };
  }, [orders, contactsByOrder, onFatalError]);

  const metrics = useMemo(() => {
    let received = 0;
    let inProgress = 0;
    let delivered = 0;
    for (const order of orders) {
      if (order.status === "received") received += 1;
      else if (order.status === "delivered") delivered += 1;
      else inProgress += 1;
    }
    return {
      total: orders.length,
      received,
      inProgress,
      delivered,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      const contact = contactsByOrder[order.referenceId];
      const haystack = [
        order.referenceId,
        order.customerName,
        contact?.fullName ?? "",
        contact?.phone ?? "",
        contact?.email ?? "",
        ...order.itemsSummary,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, statusFilter, searchQuery, contactsByOrder]);

  const handleStatusChange = async (
    order: TrackedOrder,
    nextStatus: OrderStatusStep
  ) => {
    if (order.status === nextStatus) return;
    setSavingOrderId(order.referenceId);
    const path = `orders/${order.referenceId}`;
    try {
      await updateDoc(doc(db, "orders", order.referenceId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });

      const statusEn = translations.en.tracking.steps[nextStatus].label;
      const statusAr = translations.ar.tracking.steps[nextStatus].label;
      const titleEn = `Order ${order.referenceId} → ${statusEn}`;
      const titleAr = `الطلب ${order.referenceId} ← ${statusAr}`;
      const bodyEn = `${order.customerName} · updated to "${statusEn}"`;
      const bodyAr = `${order.customerName} · تم التحديث إلى «${statusAr}»`;

      if (notifConfig.notifyOnStatusChange) {
        void recordAdminUpdateNotification({
          type: "order_status_updated",
          titleEn,
          titleAr,
          bodyEn,
          bodyAr,
          targetTab: "orders",
          referenceId: order.referenceId,
          actorEmail: user?.email,
        });
        if (notifConfig.ntfyTopic.trim() || notifConfig.webhookUrl.trim()) {
          void dispatchExternalAdminAlert({
            title: lang === "ar" ? titleAr : titleEn,
            body: lang === "ar" ? bodyAr : bodyEn,
            referenceId: order.referenceId,
            eventType: "order_status_updated",
            config: notifConfig,
          });
        }
      }
    } catch (error) {
      onFatalError(error, OperationType.UPDATE, path);
    } finally {
      setSavingOrderId(null);
    }
  };

  const handleDeleteOrder = async (referenceId: string) => {
    setSavingOrderId(referenceId);
    try {
      await deleteDoc(doc(db, "orders", referenceId, "private", "contact"));
      await deleteDoc(doc(db, "orders", referenceId));
      setConfirmDeleteId(null);
    } catch (error) {
      onFatalError(error, OperationType.DELETE, `orders/${referenceId}`);
    } finally {
      setSavingOrderId(null);
    }
  };

  return (
    <div className="admin-tab-panel">
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <span>{a.metrics.totalOrders}</span>
          <strong className="tabular-nums">{metrics.total}</strong>
        </div>
        <div className="admin-metric-card">
          <span>{a.metrics.newRequests}</span>
          <strong className="tabular-nums">{metrics.received}</strong>
        </div>
        <div className="admin-metric-card">
          <span>{a.metrics.inProgress}</span>
          <strong className="tabular-nums">{metrics.inProgress}</strong>
        </div>
        <div className="admin-metric-card">
          <span>{a.metrics.delivered}</span>
          <strong className="tabular-nums">{metrics.delivered}</strong>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={15} className="admin-search-icon" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={a.orders.searchPlaceholder}
            aria-label={a.orders.searchPlaceholder}
            className="admin-search-input"
            data-testid="admin-orders-search"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | OrderStatusStep)
          }
          className="filter-select"
          aria-label={a.orders.statusLabel}
          data-testid="admin-status-filter"
        >
          <option value="all">{a.orders.statusFilterAll}</option>
          {ORDER_STATUS_SEQUENCE.map((step) => (
            <option key={step} value={step}>
              {tr.steps[step].label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-empty-card">
          <p>...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-empty-card">
          <h3>{a.orders.emptyTitle}</h3>
          <p>{a.orders.emptyBody}</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {filteredOrders.map((order) => {
            const contact = contactsByOrder[order.referenceId];
            const cleanPhone = contact?.phone
              ? contact.phone.replace(/[^\d+]/g, "")
              : "";
            const callHref = cleanPhone.length >= 6 ? `tel:${cleanPhone}` : null;
            const emailHref = contact?.email?.trim()
              ? `mailto:${encodeURIComponent(
                  contact.email.trim()
                )}?subject=${encodeURIComponent(
                  `${a.orders.emailSubjectPrefix} (${order.referenceId})`
                )}`
              : null;
            const isSaving = savingOrderId === order.referenceId;
            const isConfirmingDelete = confirmDeleteId === order.referenceId;

            return (
              <article
                key={order.referenceId}
                className="admin-order-card"
                data-testid={`admin-order-${order.referenceId}`}
              >
                <div className="admin-order-head">
                  <div className="admin-order-id-block">
                    <strong className="admin-order-ref tabular-nums" dir="ltr">
                      {order.referenceId}
                    </strong>
                    <span className="admin-order-type-badge">
                      {order.kind === "inquiry" ? tr.typeInquiry : tr.typeOrder}{" "}
                      ·{" "}
                      {order.orderType === "trade"
                        ? tr.channelTrade
                        : tr.channelHome}
                    </span>
                  </div>
                  <div className="admin-order-meta-right">
                    {typeof order.subtotal === "number" && (
                      <strong className="admin-order-subtotal tabular-nums">
                        {formatPrice(order.subtotal, lang)}
                      </strong>
                    )}
                    <span className="admin-order-date tabular-nums">
                      {formatDateTime(order.updatedAt, lang)}
                    </span>
                  </div>
                </div>

                <div className="admin-order-body">
                  <div className="admin-order-col">
                    <span className="inquiry-label">{a.orders.contactLabel}</span>
                    <p className="admin-customer-name">
                      {contact?.fullName || order.customerName}
                    </p>
                    {contact ? (
                      <div className="admin-contact-lines">
                        {contact.phone && (
                          <span dir="ltr" className="tabular-nums">
                            {contact.phone}
                          </span>
                        )}
                        {contact.email && <span dir="ltr">{contact.email}</span>}
                        {contact.notes && (
                          <p className="admin-order-notes">
                            <strong>{a.orders.notesLabel}:</strong>{" "}
                            {contact.notes}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="admin-muted-note">{a.orders.noPiiNote}</p>
                    )}
                  </div>

                  <div className="admin-order-col">
                    <span className="inquiry-label">{tr.itemsLabel}</span>
                    <ul className="tracking-items-list">
                      {order.itemsSummary.map((line, idx) => (
                        <li key={`${order.referenceId}-item-${idx}`}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="admin-order-footer">
                  <div className="admin-order-status-controls">
                    <span className="inquiry-label">
                      {isSaving ? a.orders.updatingStatus : a.orders.statusLabel}
                    </span>
                    <div className="admin-status-pills">
                      {ORDER_STATUS_SEQUENCE.map((step) => {
                        const isActive = order.status === step;
                        return (
                          <button
                            key={step}
                            type="button"
                            disabled={isSaving}
                            onClick={() => void handleStatusChange(order, step)}
                            className={
                              isActive
                                ? "admin-status-btn is-active"
                                : "admin-status-btn"
                            }
                          >
                            {tr.steps[step].label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="admin-order-actions">
                    {callHref && (
                      <a href={callHref} className="admin-ghost-btn">
                        <Phone size={14} aria-hidden="true" />
                        <span>{a.orders.callCustomer}</span>
                      </a>
                    )}
                    {emailHref && (
                      <a href={emailHref} className="admin-ghost-btn">
                        <Mail size={14} aria-hidden="true" />
                        <span>{a.orders.emailCustomer}</span>
                      </a>
                    )}
                    {isConfirmingDelete ? (
                      <div className="admin-delete-confirm">
                        <button
                          type="button"
                          disabled={isSaving}
                          className="admin-danger-btn"
                          onClick={() => void handleDeleteOrder(order.referenceId)}
                        >
                          {a.orders.confirmDelete}
                        </button>
                        <button
                          type="button"
                          className="admin-ghost-btn"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          {a.orders.cancelDelete}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="admin-ghost-btn"
                        onClick={() => setConfirmDeleteId(order.referenceId)}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        <span>{a.orders.deleteOrder}</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CatalogTab({
  onFatalError,
  notifConfig,
}: {
  onFatalError: FatalErrorReporter;
  notifConfig: AdminNotificationConfig;
}) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const { allRangesWithHidden, overridesByKey, categoryImageOverrides } =
    useStore();
  const a = translations[lang].admin.catalog;

  const [selectedCategory, setSelectedCategory] = useState(
    baseProductRanges[0]?.slug ?? "honey"
  );
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<VarietyDraft | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [editingCategoryPic, setEditingCategoryPic] = useState(false);
  const [categoryPicsDraft, setCategoryPicsDraft] = useState<string[]>([]);
  const [categoryPicError, setCategoryPicError] = useState<string | null>(null);
  const [savingCategoryPic, setSavingCategoryPic] = useState(false);

  const activeRange =
    allRangesWithHidden.find((r) => r.slug === selectedCategory) ??
    allRangesWithHidden[0];

  const baseRange = baseProductRanges.find((r) => r.slug === selectedCategory);
  const baseSubIds = useMemo(
    () => new Set(baseRange?.subcategories.map((s) => s.id) ?? []),
    [baseRange]
  );

  const currentCategoryOverride = categoryImageOverrides[selectedCategory];

  const emitCatalogNotification = (
    titleEn: string,
    titleAr: string,
    bodyEn: string,
    bodyAr: string,
    referenceId: string
  ) => {
    if (!notifConfig.notifyOnCatalogUpdate) return;
    void recordAdminUpdateNotification({
      type: "catalog_updated",
      titleEn,
      titleAr,
      bodyEn,
      bodyAr,
      targetTab: "catalog",
      referenceId,
      actorEmail: user?.email,
    });
    if (notifConfig.ntfyTopic.trim() || notifConfig.webhookUrl.trim()) {
      void dispatchExternalAdminAlert({
        title: lang === "ar" ? titleAr : titleEn,
        body: lang === "ar" ? bodyAr : bodyEn,
        referenceId,
        eventType: "catalog_updated",
        config: notifConfig,
      });
    }
  };

  const openCategoryPicEditor = () => {
    setCategoryPicError(null);
    setStatusMessage(null);
    const initialGallery = currentCategoryOverride?.imageUrls?.length
      ? currentCategoryOverride.imageUrls
      : currentCategoryOverride?.imageUrl
        ? [currentCategoryOverride.imageUrl]
        : [];
    setCategoryPicsDraft(initialGallery);
    setEditingCategoryPic(true);
  };

  const handleSaveCategoryPic = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCategoryPicError(null);
    setStatusMessage(null);

    const validation = validateCatalogImageGallery(categoryPicsDraft);
    if (!validation.valid) {
      setCategoryPicError(
        validation.reason === "count"
          ? a.maxPicturesError
          : validation.reason === "size"
            ? a.pictureTooLargeError
            : a.pictureInvalidError
      );
      return;
    }

    setSavingCategoryPic(true);
    try {
      if (validation.normalized.length === 0) {
        if (currentCategoryOverride) {
          await deleteDoc(doc(db, "categoryImages", selectedCategory));
        }
      } else {
        await setDoc(doc(db, "categoryImages", selectedCategory), {
          categorySlug: selectedCategory,
          imageUrl: validation.normalized[0] ?? "",
          imageUrls: validation.normalized,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid,
        });
      }
      setEditingCategoryPic(false);
      setStatusMessage(a.savedToast);
      emitCatalogNotification(
        `Category photos updated (${selectedCategory})`,
        `تم تحديث صور الفئة (${selectedCategory})`,
        `${validation.normalized.length} photo(s) active for category.`,
        `تم اعتماد ${validation.normalized.length} صورة للفئة.`,
        selectedCategory
      );
    } catch (error) {
      onFatalError(
        error,
        OperationType.WRITE,
        `categoryImages/${selectedCategory}`
      );
    } finally {
      setSavingCategoryPic(false);
    }
  };

  const handleResetCategoryPic = async () => {
    setSavingCategoryPic(true);
    setCategoryPicError(null);
    try {
      await deleteDoc(doc(db, "categoryImages", selectedCategory));
      setCategoryPicsDraft([]);
      setEditingCategoryPic(false);
      setStatusMessage(a.savedToast);
      emitCatalogNotification(
        `Category photos reset (${selectedCategory})`,
        `استعادة صور الفئة الافتراضية (${selectedCategory})`,
        "Restored built-in category gallery.",
        "تمت استعادة الصور الافتراضية للفئة.",
        selectedCategory
      );
    } catch (error) {
      onFatalError(
        error,
        OperationType.DELETE,
        `categoryImages/${selectedCategory}`
      );
    } finally {
      setSavingCategoryPic(false);
    }
  };

  const startEdit = (sub: ProductSubcategory) => {
    setCreatingNew(false);
    setErrorMessage(null);
    setStatusMessage(null);
    const key = buildCatalogOverrideKey(selectedCategory, sub.id);
    const override = overridesByKey[key];
    const initialGallery = override?.imageUrls?.length
      ? override.imageUrls
      : override?.imageUrl
        ? [override.imageUrl]
        : [];
    setEditingKey(key);
    setDraft({
      subcategoryId: sub.id,
      nameEn: sub.en.name,
      nameAr: sub.ar.name,
      noteEn: sub.en.note,
      noteAr: sub.ar.note,
      isActive: !(key in overridesByKey) || overridesByKey[key].isActive,
      imageUrls: initialGallery,
      variants: sub.variants.map((v) => ({ ...v })),
    });
  };

  const startCreateNew = () => {
    setEditingKey(null);
    setCreatingNew(true);
    setErrorMessage(null);
    setStatusMessage(null);
    setDraft({
      subcategoryId: "",
      nameEn: "",
      nameAr: "",
      noteEn: "",
      noteAr: "",
      isActive: true,
      imageUrls: [],
      variants: [
        {
          id: "500g",
          en: "500 g",
          ar: "٥٠٠ جم",
          price: 250,
        },
      ],
    });
  };

  const closeEditor = () => {
    setEditingKey(null);
    setCreatingNew(false);
    setDraft(null);
    setErrorMessage(null);
  };

  const updateDraftVariant = (
    index: number,
    patch: Partial<ProductVariant>
  ) => {
    if (!draft) return;
    setDraft({
      ...draft,
      variants: draft.variants.map((v, i) =>
        i === index ? { ...v, ...patch } : v
      ),
    });
  };

  const addDraftVariant = () => {
    if (!draft || draft.variants.length >= 10) return;
    setDraft({
      ...draft,
      variants: [
        ...draft.variants,
        {
          id: `pack-${draft.variants.length + 1}`,
          en: "1 kg",
          ar: "١ كجم",
          price: 400,
        },
      ],
    });
  };

  const removeDraftVariant = (index: number) => {
    if (!draft || draft.variants.length <= 1) return;
    setDraft({
      ...draft,
      variants: draft.variants.filter((_, i) => i !== index),
    });
  };

  const handleSaveDraft = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft || !user) return;
    setErrorMessage(null);
    setStatusMessage(null);

    const subId = creatingNew
      ? sanitizeSlug(draft.subcategoryId || draft.nameEn)
      : draft.subcategoryId;

    if (
      !subId ||
      subId.length < 2 ||
      subId.length > 64 ||
      !VALID_ID_REGEX.test(subId)
    ) {
      setErrorMessage(a.validationError);
      return;
    }

    const nameEn = draft.nameEn.trim().slice(0, 120);
    const nameAr = draft.nameAr.trim().slice(0, 120);
    if (!nameEn || !nameAr) {
      setErrorMessage(a.validationError);
      return;
    }

    const cleanVariants = draft.variants
      .map((v) => ({
        id: sanitizeSlug(v.id) || v.id.trim().slice(0, 32),
        en: v.en.trim().slice(0, 60),
        ar: v.ar.trim().slice(0, 60),
        price: Number(v.price),
      }))
      .filter(
        (v) =>
          v.id &&
          v.en &&
          v.ar &&
          Number.isFinite(v.price) &&
          v.price >= 0 &&
          v.price <= 10000000
      )
      .slice(0, 10);

    if (cleanVariants.length === 0) {
      setErrorMessage(a.validationError);
      return;
    }

    const imageValidation = validateCatalogImageGallery(draft.imageUrls);
    if (!imageValidation.valid) {
      setErrorMessage(
        imageValidation.reason === "count"
          ? a.maxPicturesError
          : imageValidation.reason === "size"
            ? a.pictureTooLargeError
            : a.pictureInvalidError
      );
      return;
    }

    const productKey = buildCatalogOverrideKey(selectedCategory, subId);
    setSavingKey(productKey);

    try {
      await setDoc(doc(db, "catalogOverrides", productKey), {
        productKey,
        categorySlug: selectedCategory,
        subcategoryId: subId,
        nameEn,
        nameAr,
        noteEn: draft.noteEn.trim().slice(0, 400),
        noteAr: draft.noteAr.trim().slice(0, 400),
        isActive: Boolean(draft.isActive),
        imageUrl: imageValidation.normalized[0] ?? "",
        imageUrls: imageValidation.normalized,
        variants: cleanVariants,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      });
      setStatusMessage(a.savedToast);
      emitCatalogNotification(
        `Catalog updated: ${nameEn}`,
        `تحديث الكتالوج: ${nameAr}`,
        `${selectedCategory} · ${cleanVariants.length} pack option(s)`,
        `${selectedCategory} · ${cleanVariants.length} خيارات تعبئة`,
        productKey
      );
      setCreatingNew(false);
      setEditingKey(null);
      setDraft(null);
    } catch (error) {
      onFatalError(
        error,
        OperationType.WRITE,
        `catalogOverrides/${productKey}`
      );
    } finally {
      setSavingKey(null);
    }
  };

  const handleResetVariety = async (subcategoryId: string) => {
    const productKey = buildCatalogOverrideKey(selectedCategory, subcategoryId);
    setSavingKey(productKey);
    try {
      await deleteDoc(doc(db, "catalogOverrides", productKey));
      if (editingKey === productKey) {
        closeEditor();
      }
      setStatusMessage(a.savedToast);
      emitCatalogNotification(
        `Variety reset to default (${subcategoryId})`,
        `استعادة الصنف للافتراضي (${subcategoryId})`,
        `Category: ${selectedCategory}`,
        `الفئة: ${selectedCategory}`,
        productKey
      );
    } catch (error) {
      onFatalError(
        error,
        OperationType.DELETE,
        `catalogOverrides/${productKey}`
      );
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="admin-tab-panel">
      <div className="admin-catalog-topbar">
        <div className="category-tabs" role="tablist" aria-label={a.categoryLabel}>
          {allRangesWithHidden.map((range) => {
            const copy = getRangeCopy(range, lang);
            const active = range.slug === selectedCategory;
            return (
              <button
                key={range.slug}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? "category-tab is-active" : "category-tab"}
                onClick={() => {
                  setSelectedCategory(range.slug);
                  closeEditor();
                  setEditingCategoryPic(false);
                  setCategoryPicError(null);
                  setStatusMessage(null);
                }}
              >
                {copy.title}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="button button-dark admin-add-variety-btn"
          onClick={startCreateNew}
          data-testid="admin-add-variety-btn"
        >
          <Plus size={15} aria-hidden="true" />
          <span>{a.addNewBtn}</span>
        </button>
      </div>

      {activeRange && (
        <div className="admin-category-cover-card">
          <div className="admin-category-cover-head">
            <div className="admin-category-cover-info">
              <div className="admin-variety-thumb-wrap">
                <img
                  src={activeRange.image}
                  alt={getRangeCopy(activeRange, lang).title}
                  className="admin-variety-thumb"
                  referrerPolicy="no-referrer"
                />
                {activeRange.images && activeRange.images.length > 1 && (
                  <span className="admin-thumb-count tabular-nums">
                    {activeRange.images.length}
                  </span>
                )}
              </div>
              <div>
                <div className="admin-variety-badges">
                  <span className="admin-badge">
                    {getRangeCopy(activeRange, lang).title}
                  </span>
                  {currentCategoryOverride && (
                    <span className="admin-badge admin-badge-visible">
                      {a.pictureCustomBadge}
                    </span>
                  )}
                </div>
                <h3>{a.categoryPictureTitle}</h3>
                <p className="admin-variety-note">{a.categoryPictureHint}</p>
              </div>
            </div>
            <div className="admin-variety-actions">
              <button
                type="button"
                className="admin-ghost-btn"
                onClick={() =>
                  editingCategoryPic
                    ? setEditingCategoryPic(false)
                    : openCategoryPicEditor()
                }
                data-testid="admin-edit-category-pic-btn"
              >
                <Edit3 size={14} aria-hidden="true" />
                <span>
                  {editingCategoryPic ? a.cancelBtn : a.changePictureBtn}
                </span>
              </button>
              {currentCategoryOverride && (
                <button
                  type="button"
                  className="admin-ghost-btn"
                  disabled={savingCategoryPic}
                  onClick={() => void handleResetCategoryPic()}
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  <span>{a.resetPictureBtn}</span>
                </button>
              )}
            </div>
          </div>

          {editingCategoryPic && (
            <form
              className="admin-catalog-editor admin-catalog-editor-inline"
              onSubmit={handleSaveCategoryPic}
            >
              <AdminImagePicker
                label={a.categoryPictureTitle}
                values={categoryPicsDraft}
                defaultSrc={baseRange?.image ?? activeRange.image}
                defaultImages={
                  baseRange?.images ?? [baseRange?.image ?? activeRange.image]
                }
                onChange={setCategoryPicsDraft}
                testIdPrefix="admin-category-pic"
              />
              {categoryPicError && (
                <p className="inquiry-error" role="alert">
                  {categoryPicError}
                </p>
              )}
              <div className="admin-editor-foot" style={{ marginTop: 12 }}>
                <button
                  type="submit"
                  className="button button-dark"
                  disabled={savingCategoryPic}
                  data-testid="admin-save-category-pic-btn"
                >
                  <Check size={15} aria-hidden="true" />
                  <span>
                    {savingCategoryPic ? a.savingBtn : a.savePictureBtn}
                  </span>
                </button>
                <button
                  type="button"
                  className="admin-ghost-btn"
                  onClick={() => setEditingCategoryPic(false)}
                >
                  {a.cancelBtn}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {statusMessage && (
        <div className="admin-feedback-banner" role="status">
          <Check size={15} aria-hidden="true" />
          <span>{statusMessage}</span>
        </div>
      )}

      {creatingNew && draft && (
        <form className="admin-catalog-editor" onSubmit={handleSaveDraft}>
          <div className="admin-editor-head">
            <h3>{a.newFormTitle}</h3>
            <button
              type="button"
              className="admin-ghost-btn"
              onClick={closeEditor}
            >
              {a.cancelBtn}
            </button>
          </div>
          <CatalogEditorFields
            draft={draft}
            setDraft={setDraft}
            defaultImageSrc={baseRange?.image ?? activeRange?.image ?? ""}
            defaultImagesGallery={
              baseRange?.images ??
              (baseRange?.image || activeRange?.image
                ? [baseRange?.image ?? activeRange?.image ?? ""]
                : [])
            }
            isNew
            saving={savingKey !== null}
            errorMessage={errorMessage}
            onAddVariant={addDraftVariant}
            onUpdateVariant={updateDraftVariant}
            onRemoveVariant={removeDraftVariant}
            onCancel={closeEditor}
          />
        </form>
      )}

      <div className="admin-varieties-grid">
        {activeRange?.subcategories.map((sub) => {
          const key = buildCatalogOverrideKey(selectedCategory, sub.id);
          const override = overridesByKey[key];
          const baseSub = baseRange?.subcategories.find((s) => s.id === sub.id);
          const defaultSubImage =
            baseSub?.image ?? baseRange?.image ?? activeRange.image;
          const isBuiltIn = baseSubIds.has(sub.id);
          const isEditing = editingKey === key && !creatingNew;
          const isVisible = !override || override.isActive;

          return (
            <article key={key} className="admin-variety-card">
              <div className="admin-variety-head">
                <div className="admin-variety-identity">
                  {activeRange && (
                    <div className="admin-variety-thumb-wrap">
                      <img
                        src={getSubcategoryImage(activeRange, sub)}
                        alt={sub[lang].name}
                        className="admin-variety-thumb"
                        referrerPolicy="no-referrer"
                      />
                      {sub.images && sub.images.length > 1 && (
                        <span className="admin-thumb-count tabular-nums">
                          {sub.images.length}
                        </span>
                      )}
                    </div>
                  )}
                  <div>
                    <div className="admin-variety-badges">
                      {!isBuiltIn && (
                        <span className="admin-badge admin-badge-accent">
                          {a.customBadge}
                        </span>
                      )}
                      {isBuiltIn && override && (
                        <span className="admin-badge">{a.overrideBadge}</span>
                      )}
                      <span
                        className={
                          isVisible
                            ? "admin-badge admin-badge-visible"
                            : "admin-badge admin-badge-hidden"
                        }
                      >
                        {isVisible ? (
                          <Eye size={12} aria-hidden="true" />
                        ) : (
                          <EyeOff size={12} aria-hidden="true" />
                        )}
                        <span>{isVisible ? a.visibleStatus : a.hiddenStatus}</span>
                      </span>
                    </div>
                    <h3>{sub[lang].name}</h3>
                    <p className="admin-variety-note">{sub[lang].note}</p>
                  </div>
                </div>

                <div className="admin-variety-actions">
                  <button
                    type="button"
                    className="admin-ghost-btn"
                    onClick={() => (isEditing ? closeEditor() : startEdit(sub))}
                    data-testid={`admin-edit-${sub.id}`}
                  >
                    <Edit3 size={14} aria-hidden="true" />
                    <span>{isEditing ? a.cancelBtn : a.saveBtn.split(" ")[0]}</span>
                  </button>
                  {override && (
                    <button
                      type="button"
                      className="admin-ghost-btn"
                      disabled={savingKey === key}
                      onClick={() => void handleResetVariety(sub.id)}
                    >
                      <RotateCcw size={14} aria-hidden="true" />
                      <span>{a.resetDefaultBtn}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="admin-variants-summary">
                {sub.variants.map((variant) => (
                  <span key={variant.id} className="admin-variant-pill tabular-nums">
                    {variant[lang]} · {formatPrice(variant.price, lang)}
                  </span>
                ))}
              </div>

              {isEditing && draft && (
                <form
                  className="admin-catalog-editor admin-catalog-editor-inline"
                  onSubmit={handleSaveDraft}
                >
                  <CatalogEditorFields
                    draft={draft}
                    setDraft={setDraft}
                    defaultImageSrc={defaultSubImage}
                    defaultImagesGallery={
                      baseSub?.images ??
                      baseRange?.images ??
                      (defaultSubImage ? [defaultSubImage] : [])
                    }
                    isNew={false}
                    saving={savingKey === key}
                    errorMessage={errorMessage}
                    onAddVariant={addDraftVariant}
                    onUpdateVariant={updateDraftVariant}
                    onRemoveVariant={removeDraftVariant}
                    onCancel={closeEditor}
                  />
                </form>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function CatalogEditorFields({
  draft,
  setDraft,
  defaultImageSrc,
  defaultImagesGallery,
  isNew,
  saving,
  errorMessage,
  onAddVariant,
  onUpdateVariant,
  onRemoveVariant,
  onCancel,
}: {
  draft: VarietyDraft;
  setDraft: (next: VarietyDraft) => void;
  defaultImageSrc: string;
  defaultImagesGallery?: string[];
  isNew: boolean;
  saving: boolean;
  errorMessage: string | null;
  onAddVariant: () => void;
  onUpdateVariant: (index: number, patch: Partial<ProductVariant>) => void;
  onRemoveVariant: (index: number) => void;
  onCancel: () => void;
}) {
  const { lang } = useLanguage();
  const a = translations[lang].admin.catalog;

  return (
    <div className="admin-editor-body">
      {isNew && (
        <label className="inquiry-field">
          <span className="inquiry-label">{a.varietyIdLabel}</span>
          <input
            type="text"
            value={draft.subcategoryId}
            onChange={(e) =>
              setDraft({ ...draft, subcategoryId: e.target.value })
            }
            placeholder={a.varietyIdPlaceholder}
            dir="ltr"
          />
        </label>
      )}

      <div className="admin-editor-grid">
        <label className="inquiry-field">
          <span className="inquiry-label">{a.nameEnLabel}</span>
          <input
            type="text"
            value={draft.nameEn}
            onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })}
            dir="ltr"
            required
          />
        </label>
        <label className="inquiry-field">
          <span className="inquiry-label">{a.nameArLabel}</span>
          <input
            type="text"
            value={draft.nameAr}
            onChange={(e) => setDraft({ ...draft, nameAr: e.target.value })}
            dir="rtl"
            required
          />
        </label>
        <label className="inquiry-field">
          <span className="inquiry-label">{a.noteEnLabel}</span>
          <input
            type="text"
            value={draft.noteEn}
            onChange={(e) => setDraft({ ...draft, noteEn: e.target.value })}
            dir="ltr"
          />
        </label>
        <label className="inquiry-field">
          <span className="inquiry-label">{a.noteArLabel}</span>
          <input
            type="text"
            value={draft.noteAr}
            onChange={(e) => setDraft({ ...draft, noteAr: e.target.value })}
            dir="rtl"
          />
        </label>
      </div>

      <AdminImagePicker
        label={a.pictureLabel}
        values={draft.imageUrls}
        defaultSrc={defaultImageSrc}
        defaultImages={defaultImagesGallery}
        onChange={(imageUrls) => setDraft({ ...draft, imageUrls })}
        testIdPrefix={`admin-variety-pic-${draft.subcategoryId || "new"}`}
      />

      <label className="admin-visibility-toggle">
        <input
          type="checkbox"
          checked={draft.isActive}
          onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
        />
        <span>
          {a.visibilityLabel}:{" "}
          <strong>{draft.isActive ? a.visibleStatus : a.hiddenStatus}</strong>
        </span>
      </label>

      <div className="admin-variants-editor">
        <div className="admin-variants-head">
          <span className="inquiry-label">{a.variantsLabel}</span>
          {draft.variants.length < 10 && (
            <button
              type="button"
              className="admin-ghost-btn"
              onClick={onAddVariant}
            >
              <Plus size={13} aria-hidden="true" />
              <span>{a.addVariantBtn}</span>
            </button>
          )}
        </div>

        <div className="admin-variants-rows">
          {draft.variants.map((variant, index) => (
            <div key={`var-${index}`} className="admin-variant-row">
              <label className="inquiry-field">
                <span className="inquiry-label">{a.variantIdLabel}</span>
                <input
                  type="text"
                  value={variant.id}
                  onChange={(e) => onUpdateVariant(index, { id: e.target.value })}
                  dir="ltr"
                />
              </label>
              <label className="inquiry-field">
                <span className="inquiry-label">{a.variantEnLabel}</span>
                <input
                  type="text"
                  value={variant.en}
                  onChange={(e) => onUpdateVariant(index, { en: e.target.value })}
                  dir="ltr"
                />
              </label>
              <label className="inquiry-field">
                <span className="inquiry-label">{a.variantArLabel}</span>
                <input
                  type="text"
                  value={variant.ar}
                  onChange={(e) => onUpdateVariant(index, { ar: e.target.value })}
                  dir="rtl"
                />
              </label>
              <label className="inquiry-field">
                <span className="inquiry-label">{a.variantPriceLabel}</span>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={variant.price}
                  onChange={(e) =>
                    onUpdateVariant(index, { price: Number(e.target.value) })
                  }
                  dir="ltr"
                  className="tabular-nums"
                />
              </label>
              <button
                type="button"
                className="admin-ghost-btn admin-remove-variant-btn"
                disabled={draft.variants.length <= 1}
                onClick={() => onRemoveVariant(index)}
                aria-label="Remove variant"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {errorMessage && (
        <p className="inquiry-error" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="admin-editor-foot">
        <button
          type="submit"
          className="button button-dark"
          disabled={saving}
          data-testid="admin-save-variety-btn"
        >
          <Check size={15} aria-hidden="true" />
          <span>{saving ? a.savingBtn : a.saveBtn}</span>
        </button>
        <button type="button" className="admin-ghost-btn" onClick={onCancel}>
          {a.cancelBtn}
        </button>
      </div>
    </div>
  );
}

function SettingsTab({
  onFatalError,
  notifConfig,
}: {
  onFatalError: FatalErrorReporter;
  notifConfig: AdminNotificationConfig;
}) {
  const { lang } = useLanguage();
  const { user, isOwnerAdmin } = useAuth();
  const { storeSettings } = useStore();
  const s = translations[lang].admin.settings;
  const aNotif = translations[lang].admin.notifications;

  const [supportPhone, setSupportPhone] = useState(storeSettings.supportPhone);
  const [supportEmail, setSupportEmail] = useState(storeSettings.supportEmail);
  const [announcementEn, setAnnouncementEn] = useState(
    storeSettings.announcementEn
  );
  const [announcementAr, setAnnouncementAr] = useState(
    storeSettings.announcementAr
  );
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const [notifDraft, setNotifDraft] =
    useState<AdminNotificationConfig>(notifConfig);
  const [savingNotif, setSavingNotif] = useState(false);
  const [savedNotifToast, setSavedNotifToast] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [sendingTestAlert, setSendingTestAlert] = useState(false);
  const [testAlertStatus, setTestAlertStatus] = useState<string | null>(null);
  const [serverCapabilities, setServerCapabilities] = useState<{
    emailReady: boolean;
    envWebhookReady: boolean;
  } | null>(null);
  const [desktopPerm, setDesktopPerm] = useState(() =>
    getDesktopNotificationPermission()
  );

  const [admins, setAdmins] = useState<AdminAccountEntry[]>([]);
  const [newUid, setNewUid] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [savingAdmin, setSavingAdmin] = useState(false);

  useEffect(() => {
    setSupportPhone(storeSettings.supportPhone);
    setSupportEmail(storeSettings.supportEmail);
    setAnnouncementEn(storeSettings.announcementEn);
    setAnnouncementAr(storeSettings.announcementAr);
  }, [storeSettings]);

  useEffect(() => {
    setNotifDraft(notifConfig);
  }, [notifConfig]);

  useEffect(() => {
    let active = true;
    const fetchCapabilities = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const endpoint = `${import.meta.env.BASE_URL}api/admin/notification-capabilities`;
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok || !active) return;
        const data = (await res.json()) as {
          emailReady?: boolean;
          envWebhookReady?: boolean;
        };
        if (active) {
          setServerCapabilities({
            emailReady: Boolean(data.emailReady),
            envWebhookReady: Boolean(data.envWebhookReady),
          });
        }
      } catch {
        // Optional capabilities check on static hosting
      }
    };
    void fetchCapabilities();
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "admins"),
      (snapshot) => {
        const next: AdminAccountEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          next.push({
            uid: docSnap.id,
            email: String(data.email || ""),
            addedBy: String(data.addedBy || ""),
            createdAt: timestampToIso(data.createdAt),
          });
        });
        setAdmins(next);
      },
      (error) => {
        onFatalError(error, OperationType.LIST, "admins");
      }
    );
    return () => unsub();
  }, [onFatalError]);

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSavingSettings(true);
    setSavedToast(false);
    try {
      await setDoc(doc(db, "storeSettings", "public"), {
        supportPhone: supportPhone.trim().slice(0, 32),
        supportEmail: supportEmail.trim().slice(0, 180),
        announcementEn: announcementEn.trim().slice(0, 160),
        announcementAr: announcementAr.trim().slice(0, 160),
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
      if (notifConfig.notifyOnSettingsUpdate) {
        void recordAdminUpdateNotification({
          type: "settings_updated",
          titleEn: "Storefront contact & banner updated",
          titleAr: "تم تحديث بيانات المتجر والشريط العلوي",
          bodyEn: announcementEn.trim() || "Storefront settings saved.",
          bodyAr: announcementAr.trim() || "تم حفظ إعدادات المتجر.",
          targetTab: "settings",
          actorEmail: user.email,
        });
      }
    } catch (error) {
      onFatalError(error, OperationType.WRITE, "storeSettings/public");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleDesktopAlerts = async (checked: boolean) => {
    if (!checked) {
      setNotifDraft((prev) => ({ ...prev, desktopAlertsEnabled: false }));
      return;
    }
    const perm = getDesktopNotificationPermission();
    setDesktopPerm(perm);
    if (perm === "default") {
      const nextPerm = await requestDesktopNotificationPermission();
      setDesktopPerm(nextPerm);
      setNotifDraft((prev) => ({
        ...prev,
        desktopAlertsEnabled: nextPerm === "granted",
      }));
      return;
    }
    setNotifDraft((prev) => ({
      ...prev,
      desktopAlertsEnabled: perm === "granted",
    }));
  };

  const validateNotifDraft = (): boolean => {
    const cleanTopic = notifDraft.ntfyTopic.trim();
    const cleanWebhook = notifDraft.webhookUrl.trim();
    if (cleanTopic && !NTFY_TOPIC_REGEX.test(cleanTopic)) {
      setNotifError(s.testAlertError);
      return false;
    }
    if (cleanWebhook && !isValidClientWebhookUrl(cleanWebhook)) {
      setNotifError(s.testAlertError);
      return false;
    }
    setNotifError(null);
    return true;
  };

  const handleSaveNotificationConfig = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validateNotifDraft()) return;

    const cleanDraft: AdminNotificationConfig = {
      configId: "notifications",
      soundEnabled: Boolean(notifDraft.soundEnabled),
      desktopAlertsEnabled: Boolean(notifDraft.desktopAlertsEnabled),
      notifyOnNewOrder: Boolean(notifDraft.notifyOnNewOrder),
      notifyOnStatusChange: Boolean(notifDraft.notifyOnStatusChange),
      notifyOnCatalogUpdate: Boolean(notifDraft.notifyOnCatalogUpdate),
      notifyOnSettingsUpdate: Boolean(notifDraft.notifyOnSettingsUpdate),
      notifyEmail: notifDraft.notifyEmail.trim().slice(0, 180),
      ntfyTopic: notifDraft.ntfyTopic.trim().slice(0, 120),
      webhookUrl: notifDraft.webhookUrl.trim().slice(0, 512),
    };

    setSavingNotif(true);
    setSavedNotifToast(false);
    try {
      await setDoc(doc(db, "adminConfig", "notifications"), {
        ...cleanDraft,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      });
      setSavedNotifToast(true);
      setTimeout(() => setSavedNotifToast(false), 3000);
      if (cleanDraft.notifyOnSettingsUpdate) {
        void recordAdminUpdateNotification({
          type: "settings_updated",
          titleEn: "Notification preferences updated",
          titleAr: "تم تحديث تفضيلات التنبيه",
          bodyEn: cleanDraft.ntfyTopic
            ? `ntfy topic: ${cleanDraft.ntfyTopic}`
            : "Live dashboard alerts configured.",
          bodyAr: cleanDraft.ntfyTopic
            ? `قناة ntfy: ${cleanDraft.ntfyTopic}`
            : "تم حفظ تفضيلات تنبيهات اللوحة.",
          targetTab: "settings",
          actorEmail: user.email,
        });
      }
    } catch (error) {
      onFatalError(error, OperationType.WRITE, "adminConfig/notifications");
    } finally {
      setSavingNotif(false);
    }
  };

  const handleSendTestAlert = async () => {
    if (!validateNotifDraft()) return;
    setSendingTestAlert(true);
    setTestAlertStatus(null);
    try {
      if (notifDraft.soundEnabled) {
        playNotificationChime();
      }
      const testTitle =
        lang === "ar"
          ? "تنبيه تجريبي من لوحة إدارة الخلية"
          : "Test Alert from Alkhaleyah Dashboard";
      const testBody =
        lang === "ar"
          ? "قنوات التنبيه الفورية تعمل بنجاح."
          : "Your live order and update alerts are working properly.";
      toast.info(testTitle, { description: testBody });
      if (notifDraft.desktopAlertsEnabled) {
        showDesktopNotification({
          title: testTitle,
          body: testBody,
          tag: "alkhaleyah-test",
        });
      }
      const dispatchRes = await dispatchExternalAdminAlert({
        title: testTitle,
        body: testBody,
        eventType: "test",
        config: notifDraft,
      });
      const wantsEmail = Boolean(notifDraft.notifyEmail.trim());
      if (!dispatchRes.ok) {
        setTestAlertStatus(s.testAlertLocalOnly);
      } else if (wantsEmail && !dispatchRes.result?.emailSent) {
        setTestAlertStatus(s.testAlertEmailNotConfigured);
      } else {
        setTestAlertStatus(s.testAlertSentToast);
      }
      setTimeout(() => setTestAlertStatus(null), 6000);
    } finally {
      setSendingTestAlert(false);
    }
  };

  const handleAddAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !isOwnerAdmin) return;
    const cleanUid = newUid.trim();
    const cleanEmail = newEmail.trim();
    if (
      cleanUid.length < 2 ||
      cleanUid.length > 128 ||
      !VALID_ID_REGEX.test(cleanUid) ||
      cleanEmail.length < 3 ||
      cleanEmail.length > 180
    ) {
      return;
    }

    setSavingAdmin(true);
    try {
      await setDoc(doc(db, "admins", cleanUid), {
        email: cleanEmail,
        addedBy: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewUid("");
      setNewEmail("");
      if (notifConfig.notifyOnSettingsUpdate) {
        void recordAdminUpdateNotification({
          type: "settings_updated",
          titleEn: `Admin access granted: ${cleanEmail}`,
          titleAr: `تم منح صلاحية الإدارة: ${cleanEmail}`,
          bodyEn: `UID: ${cleanUid}`,
          bodyAr: `المعرّف: ${cleanUid}`,
          targetTab: "settings",
          actorEmail: user.email,
        });
      }
    } catch (error) {
      onFatalError(error, OperationType.WRITE, `admins/${cleanUid}`);
    } finally {
      setSavingAdmin(false);
    }
  };

  const handleRevokeAdmin = async (uid: string) => {
    if (!isOwnerAdmin) return;
    try {
      await deleteDoc(doc(db, "admins", uid));
      if (notifConfig.notifyOnSettingsUpdate) {
        void recordAdminUpdateNotification({
          type: "settings_updated",
          titleEn: `Admin access revoked (${uid})`,
          titleAr: `تمت إزالة صلاحية الإدارة (${uid})`,
          bodyEn: "Authorized team list updated.",
          bodyAr: "تم تحديث قائمة المديرين المصرح لهم.",
          targetTab: "settings",
          actorEmail: user?.email,
        });
      }
    } catch (error) {
      onFatalError(error, OperationType.DELETE, `admins/${uid}`);
    }
  };

  return (
    <div className="admin-tab-panel admin-settings-grid">
      <form
        className="admin-settings-card"
        onSubmit={handleSaveNotificationConfig}
        data-testid="admin-notification-settings-card"
      >
        <h3>{s.notificationsTitle}</h3>
        <p className="admin-settings-lead">{s.notificationsBody}</p>

        <div className="admin-notif-checkboxes">
          <label className="admin-visibility-toggle">
            <input
              type="checkbox"
              checked={notifDraft.soundEnabled}
              onChange={(e) =>
                setNotifDraft({ ...notifDraft, soundEnabled: e.target.checked })
              }
            />
            <span>{s.soundAlertLabel}</span>
          </label>
          <label className="admin-visibility-toggle">
            <input
              type="checkbox"
              checked={notifDraft.desktopAlertsEnabled}
              onChange={(e) => void handleToggleDesktopAlerts(e.target.checked)}
            />
            <span>{s.desktopAlertLabel}</span>
          </label>
          {desktopPerm === "denied" && (
            <p className="admin-muted-note">{aNotif.desktopBlockedHint}</p>
          )}
          {desktopPerm === "unsupported" && (
            <p className="admin-muted-note">{aNotif.desktopUnsupportedHint}</p>
          )}
          <label className="admin-visibility-toggle">
            <input
              type="checkbox"
              checked={notifDraft.notifyOnNewOrder}
              onChange={(e) =>
                setNotifDraft({
                  ...notifDraft,
                  notifyOnNewOrder: e.target.checked,
                })
              }
            />
            <span>{s.notifyNewOrderLabel}</span>
          </label>
          <label className="admin-visibility-toggle">
            <input
              type="checkbox"
              checked={notifDraft.notifyOnStatusChange}
              onChange={(e) =>
                setNotifDraft({
                  ...notifDraft,
                  notifyOnStatusChange: e.target.checked,
                })
              }
            />
            <span>{s.notifyStatusLabel}</span>
          </label>
          <label className="admin-visibility-toggle">
            <input
              type="checkbox"
              checked={notifDraft.notifyOnCatalogUpdate}
              onChange={(e) =>
                setNotifDraft({
                  ...notifDraft,
                  notifyOnCatalogUpdate: e.target.checked,
                })
              }
            />
            <span>{s.notifyCatalogLabel}</span>
          </label>
          <label className="admin-visibility-toggle">
            <input
              type="checkbox"
              checked={notifDraft.notifyOnSettingsUpdate}
              onChange={(e) =>
                setNotifDraft({
                  ...notifDraft,
                  notifyOnSettingsUpdate: e.target.checked,
                })
              }
            />
            <span>{s.notifySettingsLabel}</span>
          </label>
        </div>

        <div className="admin-editor-grid">
          <label className="inquiry-field">
            <span className="inquiry-label">{s.notifyEmailLabel}</span>
            <input
              type="email"
              value={notifDraft.notifyEmail}
              onChange={(e) =>
                setNotifDraft({ ...notifDraft, notifyEmail: e.target.value })
              }
              dir="ltr"
              placeholder={OWNER_ADMIN_EMAIL}
            />
          </label>
          <label className="inquiry-field">
            <span className="inquiry-label">{s.ntfyTopicLabel}</span>
            <input
              type="text"
              value={notifDraft.ntfyTopic}
              onChange={(e) =>
                setNotifDraft({ ...notifDraft, ntfyTopic: e.target.value })
              }
              dir="ltr"
              placeholder={s.ntfyTopicPlaceholder}
            />
            <small className="admin-muted-note">{s.ntfyTopicHint}</small>
          </label>
        </div>

        <label className="inquiry-field">
          <span className="inquiry-label">{s.webhookUrlLabel}</span>
          <input
            type="url"
            value={notifDraft.webhookUrl}
            onChange={(e) =>
              setNotifDraft({ ...notifDraft, webhookUrl: e.target.value })
            }
            dir="ltr"
            placeholder={s.webhookUrlPlaceholder}
          />
          <small className="admin-muted-note">{s.webhookUrlHint}</small>
        </label>

        <div className="admin-server-capabilities">
          <span className="inquiry-label">{s.serverChannelsLabel}</span>
          <p className="admin-muted-note">
            {serverCapabilities?.emailReady
              ? s.serverEmailReady
              : s.serverEmailNeedsKey}
          </p>
          {serverCapabilities?.envWebhookReady && (
            <p className="admin-muted-note">{s.serverWebhookReady}</p>
          )}
        </div>

        {notifError && (
          <p className="inquiry-error" role="alert">
            {notifError}
          </p>
        )}

        <div className="admin-settings-foot">
          <button
            type="submit"
            className="button button-dark"
            disabled={savingNotif}
            data-testid="admin-save-notif-btn"
          >
            <Check size={15} aria-hidden="true" />
            <span>{savingNotif ? s.savingNotifBtn : s.saveNotifBtn}</span>
          </button>
          <button
            type="button"
            className="admin-ghost-btn"
            disabled={sendingTestAlert}
            onClick={() => void handleSendTestAlert()}
            data-testid="admin-test-alert-btn"
          >
            <Send size={14} aria-hidden="true" />
            <span>
              {sendingTestAlert ? s.sendingTestAlertBtn : s.sendTestAlertBtn}
            </span>
          </button>
          {savedNotifToast && (
            <span className="admin-saved-inline" role="status">
              {s.savedNotifToast}
            </span>
          )}
          {testAlertStatus && (
            <span className="admin-saved-inline" role="status">
              {testAlertStatus}
            </span>
          )}
        </div>
      </form>

      <div className="admin-settings-stack">
        <form className="admin-settings-card" onSubmit={handleSaveSettings}>
          <h3>{s.sectionTitle}</h3>
          <p className="admin-settings-lead">{s.sectionBody}</p>

          <div className="admin-editor-grid">
            <label className="inquiry-field">
              <span className="inquiry-label">{s.supportPhoneLabel}</span>
              <input
                type="tel"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                dir="ltr"
                placeholder="+20 10X XXX XXXX"
              />
            </label>
            <label className="inquiry-field">
              <span className="inquiry-label">{s.supportEmailLabel}</span>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                dir="ltr"
                placeholder="orders@alkhaleyah.com"
              />
            </label>
            <label className="inquiry-field">
              <span className="inquiry-label">{s.announcementEnLabel}</span>
              <input
                type="text"
                value={announcementEn}
                onChange={(e) => setAnnouncementEn(e.target.value)}
                dir="ltr"
              />
            </label>
            <label className="inquiry-field">
              <span className="inquiry-label">{s.announcementArLabel}</span>
              <input
                type="text"
                value={announcementAr}
                onChange={(e) => setAnnouncementAr(e.target.value)}
                dir="rtl"
              />
            </label>
          </div>

          <div className="admin-settings-foot">
            <button
              type="submit"
              className="button button-dark"
              disabled={savingSettings}
              data-testid="admin-save-settings-btn"
            >
              <Check size={15} aria-hidden="true" />
              <span>
                {savingSettings ? s.savingSettingsBtn : s.saveSettingsBtn}
              </span>
            </button>
            {savedToast && (
              <span className="admin-saved-inline" role="status">
                {s.savedSettingsToast}
              </span>
            )}
          </div>
        </form>

        <div className="admin-settings-card">
          <h3>{s.adminsTitle}</h3>
          <p className="admin-settings-lead">{s.adminsBody}</p>

          <div className="admin-accounts-list">
            <div className="admin-account-row">
              <div>
                <strong dir="ltr">{OWNER_ADMIN_EMAIL}</strong>
              </div>
              <span className="admin-badge admin-badge-visible">
                {s.ownerBadge}
              </span>
            </div>

            {admins.map((entry) => (
              <div key={entry.uid} className="admin-account-row">
                <div>
                  <strong dir="ltr">{entry.email}</strong>
                  <span className="admin-uid-text tabular-nums" dir="ltr">
                    {entry.uid}
                  </span>
                </div>
                {isOwnerAdmin && (
                  <button
                    type="button"
                    className="admin-danger-btn"
                    onClick={() => void handleRevokeAdmin(entry.uid)}
                  >
                    {s.removeAdminBtn}
                  </button>
                )}
              </div>
            ))}
          </div>

          {isOwnerAdmin && (
            <form className="admin-add-admin-form" onSubmit={handleAddAdmin}>
              <div className="admin-editor-grid">
                <label className="inquiry-field">
                  <span className="inquiry-label">{s.adminUidLabel}</span>
                  <input
                    type="text"
                    value={newUid}
                    onChange={(e) => setNewUid(e.target.value)}
                    placeholder={s.adminUidPlaceholder}
                    dir="ltr"
                    required
                  />
                </label>
                <label className="inquiry-field">
                  <span className="inquiry-label">{s.adminEmailLabel}</span>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="member@example.com"
                    dir="ltr"
                    required
                  />
                </label>
              </div>
              <button
                type="submit"
                className="button button-dark"
                disabled={savingAdmin}
              >
                <UserPlus size={15} aria-hidden="true" />
                <span>{s.addAdminBtn}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function extractAuthErrorCode(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return "";
}

export default function AdminDashboard() {
  const { lang } = useLanguage();
  const {
    user,
    authReady,
    isAdmin,
    redirectError,
    signInWithGoogle,
    signInWithGoogleRedirect,
    signOutUser,
  } = useAuth();
  const a = translations[lang].admin;

  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [signingIn, setSigningIn] = useState(false);
  const [authErrorCode, setAuthErrorCode] = useState<string>("");
  const [authErrorFlag, setAuthErrorFlag] = useState(false);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  const [notifications, setNotifications] = useState<AdminNotificationItem[]>(
    []
  );
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [notifConfig, setNotifConfig] = useState<AdminNotificationConfig>(
    DEFAULT_NOTIFICATION_CONFIG
  );
  const [desktopPerm, setDesktopPerm] = useState(() =>
    getDesktopNotificationPermission()
  );

  const notifConfigRef = useRef(notifConfig);
  notifConfigRef.current = notifConfig;
  const langRef = useRef(lang);
  langRef.current = lang;
  const initializedNotifsRef = useRef(false);
  const seenNotifIdsRef = useRef<Set<string>>(new Set());
  const notifContainerRef = useRef<HTMLDivElement | null>(null);
  const baseTitleRef = useRef<string>(
    typeof document !== "undefined" ? document.title : "Alkhaleyah"
  );

  const reportFatalFirestoreError = useCallback<FatalErrorReporter>(
    (error, op, path) => {
      try {
        handleFirestoreError(error, op, path);
      } catch (formatted) {
        setFatalError(
          formatted instanceof Error ? formatted : new Error(String(formatted))
        );
      }
    },
    []
  );

  useEffect(() => {
    if (!authReady || !isAdmin || !user) return;
    const unsubConfig = onSnapshot(
      doc(db, "adminConfig", "notifications"),
      (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        setNotifConfig({
          configId: "notifications",
          soundEnabled:
            typeof data.soundEnabled === "boolean"
              ? data.soundEnabled
              : DEFAULT_NOTIFICATION_CONFIG.soundEnabled,
          desktopAlertsEnabled:
            typeof data.desktopAlertsEnabled === "boolean"
              ? data.desktopAlertsEnabled
              : DEFAULT_NOTIFICATION_CONFIG.desktopAlertsEnabled,
          notifyOnNewOrder:
            typeof data.notifyOnNewOrder === "boolean"
              ? data.notifyOnNewOrder
              : DEFAULT_NOTIFICATION_CONFIG.notifyOnNewOrder,
          notifyOnStatusChange:
            typeof data.notifyOnStatusChange === "boolean"
              ? data.notifyOnStatusChange
              : DEFAULT_NOTIFICATION_CONFIG.notifyOnStatusChange,
          notifyOnCatalogUpdate:
            typeof data.notifyOnCatalogUpdate === "boolean"
              ? data.notifyOnCatalogUpdate
              : DEFAULT_NOTIFICATION_CONFIG.notifyOnCatalogUpdate,
          notifyOnSettingsUpdate:
            typeof data.notifyOnSettingsUpdate === "boolean"
              ? data.notifyOnSettingsUpdate
              : DEFAULT_NOTIFICATION_CONFIG.notifyOnSettingsUpdate,
          notifyEmail:
            typeof data.notifyEmail === "string"
              ? data.notifyEmail
              : OWNER_ADMIN_EMAIL,
          ntfyTopic: typeof data.ntfyTopic === "string" ? data.ntfyTopic : "",
          webhookUrl:
            typeof data.webhookUrl === "string" ? data.webhookUrl : "",
        });
      },
      (error) => {
        reportFatalFirestoreError(
          error,
          OperationType.GET,
          "adminConfig/notifications"
        );
      }
    );
    return () => unsubConfig();
  }, [authReady, isAdmin, user, reportFatalFirestoreError]);

  useEffect(() => {
    if (!authReady || !isAdmin || !user) {
      initializedNotifsRef.current = false;
      seenNotifIdsRef.current.clear();
      setNotifications([]);
      return;
    }

    const notifQuery = query(
      collection(db, "adminNotifications"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubNotifs = onSnapshot(
      notifQuery,
      (snapshot) => {
        const next: AdminNotificationItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const type = String(data.type || "order_created") as AdminNotificationType;
          const targetTab =
            data.targetTab === "catalog" || data.targetTab === "settings"
              ? data.targetTab
              : "orders";
          next.push({
            id: String(data.id || docSnap.id),
            type,
            titleEn: String(data.titleEn || ""),
            titleAr: String(data.titleAr || ""),
            bodyEn: String(data.bodyEn || ""),
            bodyAr: String(data.bodyAr || ""),
            targetTab,
            referenceId: String(data.referenceId || ""),
            actor: String(data.actor || ""),
            isRead: data.isRead === true,
            createdAt: timestampToIso(data.createdAt),
          });
        });

        setNotifications(next);

        if (!initializedNotifsRef.current) {
          for (const item of next) {
            seenNotifIdsRef.current.add(item.id);
          }
          initializedNotifsRef.current = true;
          return;
        }

        const cfg = notifConfigRef.current;
        const currentLang = langRef.current;

        for (const item of next) {
          if (seenNotifIdsRef.current.has(item.id)) continue;
          seenNotifIdsRef.current.add(item.id);
          if (item.isRead) continue;
          if (!shouldNotifyForType(item.type, cfg)) continue;

          const title =
            currentLang === "ar"
              ? item.titleAr || item.titleEn
              : item.titleEn || item.titleAr;
          const body =
            currentLang === "ar"
              ? item.bodyAr || item.bodyEn
              : item.bodyEn || item.bodyAr;

          toast.info(title, {
            description: body,
            action: {
              label: translations[currentLang].admin.notifications.openTabLabel,
              onClick: () => setActiveTab(item.targetTab),
            },
          });

          if (cfg.soundEnabled) {
            playNotificationChime();
          }

          if (cfg.desktopAlertsEnabled) {
            showDesktopNotification({
              title,
              body,
              tag: item.id,
              onClick: () => setActiveTab(item.targetTab),
            });
          }

          if (
            (item.type === "order_created" || item.type === "inquiry_created") &&
            (cfg.ntfyTopic.trim() || cfg.webhookUrl.trim())
          ) {
            void dispatchExternalAdminAlert({
              title,
              body,
              referenceId: item.referenceId,
              eventType: item.type,
              config: cfg,
            });
          }
        }
      },
      (error) => {
        reportFatalFirestoreError(
          error,
          OperationType.LIST,
          "adminNotifications"
        );
      }
    );

    return () => unsubNotifs();
  }, [authReady, isAdmin, user, reportFatalFirestoreError]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  useEffect(() => {
    const baseTitle = baseTitleRef.current;
    if (!isAdmin) {
      document.title = baseTitle;
      return;
    }
    document.title = unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle;
    return () => {
      document.title = baseTitle;
    };
  }, [isAdmin, unreadCount]);

  useEffect(() => {
    if (!notifPanelOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (
        notifContainerRef.current &&
        !notifContainerRef.current.contains(e.target as Node)
      ) {
        setNotifPanelOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNotifPanelOpen(false);
    };
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKey);
    };
  }, [notifPanelOpen]);

  if (fatalError) {
    throw fatalError;
  }

  const handleMarkNotificationRead = async (item: AdminNotificationItem) => {
    setActiveTab(item.targetTab);
    setNotifPanelOpen(false);
    if (item.isRead) return;
    try {
      await updateDoc(doc(db, "adminNotifications", item.id), {
        isRead: true,
      });
    } catch (error) {
      reportFatalFirestoreError(
        error,
        OperationType.UPDATE,
        `adminNotifications/${item.id}`
      );
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((item) => !item.isRead);
    if (unread.length === 0) return;
    try {
      const batch = writeBatch(db);
      for (const item of unread) {
        batch.update(doc(db, "adminNotifications", item.id), { isRead: true });
      }
      await batch.commit();
    } catch (error) {
      reportFatalFirestoreError(
        error,
        OperationType.UPDATE,
        "adminNotifications"
      );
    }
  };

  const handleClearRead = async () => {
    const readItems = notifications.filter((item) => item.isRead);
    if (readItems.length === 0) return;
    try {
      const batch = writeBatch(db);
      for (const item of readItems) {
        batch.delete(doc(db, "adminNotifications", item.id));
      }
      await batch.commit();
    } catch (error) {
      reportFatalFirestoreError(
        error,
        OperationType.DELETE,
        "adminNotifications"
      );
    }
  };

  const handleToggleQuickSound = async () => {
    if (!user) return;
    const nextConfig: AdminNotificationConfig = {
      ...notifConfig,
      soundEnabled: !notifConfig.soundEnabled,
    };
    try {
      await setDoc(doc(db, "adminConfig", "notifications"), {
        ...nextConfig,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      });
    } catch (error) {
      reportFatalFirestoreError(
        error,
        OperationType.WRITE,
        "adminConfig/notifications"
      );
    }
  };

  const handleEnableDesktopFromBanner = async () => {
    const nextPerm = await requestDesktopNotificationPermission();
    setDesktopPerm(nextPerm);
    if (nextPerm === "granted" && user) {
      const nextConfig: AdminNotificationConfig = {
        ...notifConfig,
        desktopAlertsEnabled: true,
      };
      try {
        await setDoc(doc(db, "adminConfig", "notifications"), {
          ...nextConfig,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid,
        });
      } catch (error) {
        reportFatalFirestoreError(
          error,
          OperationType.WRITE,
          "adminConfig/notifications"
        );
      }
    }
  };

  const effectiveErrorCode =
    authErrorCode || extractAuthErrorCode(redirectError);
  const hasAuthError = authErrorFlag || Boolean(redirectError);

  const handleGoogleLogin = async () => {
    setAuthErrorCode("");
    setAuthErrorFlag(false);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      const code = extractAuthErrorCode(error);
      setAuthErrorCode(code);
      setAuthErrorFlag(true);
      console.error("Admin Google sign-in error:", error);
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoogleRedirectLogin = async () => {
    setAuthErrorCode("");
    setAuthErrorFlag(false);
    setSigningIn(true);
    try {
      await signInWithGoogleRedirect();
    } catch (error) {
      setAuthErrorCode(extractAuthErrorCode(error));
      setAuthErrorFlag(true);
      setSigningIn(false);
    }
  };

  const isTopLevelWindow =
    typeof window !== "undefined" && window.self === window.top;
  const currentHost =
    typeof window !== "undefined" ? window.location.hostname : "";
  const firebaseAuthSettingsUrl = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`;

  const renderAuthError = () => {
    if (!hasAuthError) return null;
    if (effectiveErrorCode === "auth/unauthorized-domain") {
      return (
        <div className="admin-auth-error-box" role="alert">
          <p className="inquiry-error">{a.signInUnauthorizedDomain}</p>
          {currentHost && (
            <code className="admin-host-code" dir="ltr">
              {currentHost}
            </code>
          )}
          <a
            href={firebaseAuthSettingsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            <span>{a.signInAuthorizedDomainsLink}</span>
          </a>
        </div>
      );
    }

    let message = a.signInFailed;
    if (effectiveErrorCode === "auth/popup-blocked") {
      message = a.signInPopupBlocked;
    } else if (
      effectiveErrorCode === "auth/popup-closed-by-user" ||
      effectiveErrorCode === "auth/cancelled-popup-request"
    ) {
      message = a.signInPopupClosed;
    } else if (effectiveErrorCode === "auth/operation-not-allowed") {
      message = a.signInOperationNotAllowed;
    }

    return (
      <div className="admin-auth-error-box" role="alert">
        <p className="inquiry-error">{message}</p>
        {effectiveErrorCode && (
          <span className="admin-error-code" dir="ltr">
            {a.signInErrorCodeLabel}: {effectiveErrorCode}
          </span>
        )}
        {effectiveErrorCode === "auth/popup-blocked" && isTopLevelWindow && (
          <button
            type="button"
            className="admin-ghost-btn"
            disabled={signingIn}
            onClick={() => void handleGoogleRedirectLogin()}
          >
            <span>{a.signInWithRedirectFallback}</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="site-shell admin-page">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-topbar-left">
            <BrandMark />
            <Link href="/" className="admin-back-link">
              <ArrowLeft size={14} className="rtl-flip" aria-hidden="true" />
              <span>{a.backToStore}</span>
            </Link>
          </div>
          <div className="admin-topbar-right">
            {authReady && isAdmin && (
              <div className="admin-notif-wrap" ref={notifContainerRef}>
                <button
                  type="button"
                  className={
                    unreadCount > 0
                      ? "admin-notif-bell has-unread"
                      : "admin-notif-bell"
                  }
                  onClick={() => setNotifPanelOpen((open) => !open)}
                  aria-label={a.notifications.bellAria}
                  aria-expanded={notifPanelOpen}
                  data-testid="admin-notif-bell"
                >
                  {unreadCount > 0 ? (
                    <BellRing size={16} aria-hidden="true" />
                  ) : (
                    <Bell size={16} aria-hidden="true" />
                  )}
                  {unreadCount > 0 && (
                    <span className="admin-notif-badge tabular-nums">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifPanelOpen && (
                  <div
                    className="admin-notif-panel"
                    role="dialog"
                    aria-label={a.notifications.panelTitle}
                    data-testid="admin-notif-panel"
                  >
                    <div className="admin-notif-panel-head">
                      <div className="admin-notif-panel-title">
                        <strong>{a.notifications.panelTitle}</strong>
                        {unreadCount > 0 && (
                          <span className="admin-badge admin-badge-visible tabular-nums">
                            {unreadCount} {a.notifications.unreadSuffix}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="admin-notif-close"
                        onClick={() => setNotifPanelOpen(false)}
                        aria-label="Close"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <div className="admin-notif-toolbar">
                      <button
                        type="button"
                        className="admin-ghost-btn"
                        onClick={() => void handleToggleQuickSound()}
                      >
                        {notifConfig.soundEnabled ? (
                          <Volume2 size={13} aria-hidden="true" />
                        ) : (
                          <VolumeX size={13} aria-hidden="true" />
                        )}
                        <span>
                          {notifConfig.soundEnabled
                            ? a.notifications.soundOnBtn
                            : a.notifications.soundOffBtn}
                        </span>
                      </button>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="admin-ghost-btn"
                          onClick={() => void handleMarkAllRead()}
                        >
                          <Check size={13} aria-hidden="true" />
                          <span>{a.notifications.markAllRead}</span>
                        </button>
                      )}
                      {notifications.some((n) => n.isRead) && (
                        <button
                          type="button"
                          className="admin-ghost-btn"
                          onClick={() => void handleClearRead()}
                        >
                          <Trash2 size={13} aria-hidden="true" />
                          <span>{a.notifications.clearRead}</span>
                        </button>
                      )}
                    </div>

                    {desktopPerm === "default" && (
                      <div className="admin-notif-perm-banner">
                        <p>{a.notifications.enableDesktopBanner}</p>
                        <button
                          type="button"
                          className="button button-dark"
                          onClick={() => void handleEnableDesktopFromBanner()}
                        >
                          <BellRing size={13} aria-hidden="true" />
                          <span>{a.notifications.enableDesktopBtn}</span>
                        </button>
                      </div>
                    )}

                    <div className="admin-notif-list">
                      {notifications.length === 0 ? (
                        <div className="admin-notif-empty">
                          <strong>{a.notifications.emptyTitle}</strong>
                          <p>{a.notifications.emptyBody}</p>
                        </div>
                      ) : (
                        notifications.map((item) => {
                          const title =
                            lang === "ar"
                              ? item.titleAr || item.titleEn
                              : item.titleEn || item.titleAr;
                          const body =
                            lang === "ar"
                              ? item.bodyAr || item.bodyEn
                              : item.bodyEn || item.bodyAr;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              className={
                                item.isRead
                                  ? "admin-notif-item"
                                  : "admin-notif-item is-unread"
                              }
                              onClick={() => void handleMarkNotificationRead(item)}
                            >
                              <span className="admin-notif-item-icon">
                                <NotificationTypeIcon type={item.type} />
                              </span>
                              <div className="admin-notif-item-copy">
                                <div className="admin-notif-item-top">
                                  <strong>{title}</strong>
                                  {!item.isRead && (
                                    <span
                                      className="admin-notif-dot"
                                      aria-hidden="true"
                                    />
                                  )}
                                </div>
                                {body && <p>{body}</p>}
                                <time className="tabular-nums">
                                  {formatDateTime(item.createdAt, lang)}
                                </time>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {user && (
              <div className="admin-user-pill">
                <ShieldCheck size={14} aria-hidden="true" />
                <span dir="ltr">{user.email}</span>
              </div>
            )}
            <LanguageSwitcher />
            {user && (
              <button
                type="button"
                className="admin-ghost-btn"
                onClick={() => void signOutUser()}
                data-testid="admin-signout-btn"
              >
                <LogOut size={14} aria-hidden="true" />
                <span>{a.signOut}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="admin-main">
        {!authReady ? (
          <div className="admin-auth-card">
            <p className="eyebrow">
              <span /> {a.eyebrow}
            </p>
            <h1>...</h1>
          </div>
        ) : !user ? (
          <div className="admin-auth-card" data-testid="admin-signin-card">
            <p className="eyebrow">
              <span /> {a.eyebrow}
            </p>
            <h1>{a.signInTitle}</h1>
            <p className="admin-auth-body">{a.signInBody}</p>
            {renderAuthError()}
            <div className="admin-auth-actions">
              <button
                type="button"
                className="button button-dark"
                disabled={signingIn}
                onClick={() => void handleGoogleLogin()}
                data-testid="admin-google-signin-btn"
              >
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{signingIn ? a.signingIn : a.signInGoogle}</span>
              </button>
              <Link href="/" className="text-link">
                <ArrowLeft size={14} className="rtl-flip" aria-hidden="true" />
                <span>{a.backToStore}</span>
              </Link>
            </div>
          </div>
        ) : !isAdmin ? (
          <div className="admin-auth-card" data-testid="admin-unauthorized-card">
            <p className="eyebrow">
              <span /> {a.eyebrow}
            </p>
            <h1>{a.unauthorizedTitle}</h1>
            <p className="admin-auth-body">{a.unauthorizedBody}</p>
            <div className="admin-auth-account-meta">
              <div>
                <span>{a.signedInAs}:</span>{" "}
                <strong dir="ltr">{user.email}</strong>
              </div>
              <div>
                <span>{a.uidLabel}:</span>{" "}
                <code className="tabular-nums" dir="ltr">
                  {user.uid}
                </code>
              </div>
            </div>
            <div className="admin-auth-actions">
              <button
                type="button"
                className="button button-dark"
                disabled={signingIn}
                onClick={() => void handleGoogleLogin()}
              >
                <ShieldCheck size={15} aria-hidden="true" />
                <span>{a.switchAccount}</span>
              </button>
              <button
                type="button"
                className="admin-ghost-btn"
                onClick={() => void signOutUser()}
              >
                <LogOut size={15} aria-hidden="true" />
                <span>{a.signOut}</span>
              </button>
              <Link href="/" className="text-link">
                <ArrowLeft size={14} className="rtl-flip" aria-hidden="true" />
                <span>{a.backToStore}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="admin-workspace">
            <div className="admin-hero-head">
              <div>
                <p className="eyebrow">
                  <span /> {a.eyebrow}
                </p>
                <h1>
                  {a.titleLead} <em>{a.titleAccent}</em>
                </h1>
              </div>
              <p className="admin-hero-subtitle">{a.subtitle}</p>
            </div>

            <div className="admin-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "orders"}
                className={
                  activeTab === "orders" ? "admin-tab is-active" : "admin-tab"
                }
                onClick={() => setActiveTab("orders")}
                data-testid="admin-tab-orders"
              >
                <ShoppingBag size={15} aria-hidden="true" />
                <span>{a.tabs.orders}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "catalog"}
                className={
                  activeTab === "catalog" ? "admin-tab is-active" : "admin-tab"
                }
                onClick={() => setActiveTab("catalog")}
                data-testid="admin-tab-catalog"
              >
                <Package size={15} aria-hidden="true" />
                <span>{a.tabs.catalog}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "settings"}
                className={
                  activeTab === "settings" ? "admin-tab is-active" : "admin-tab"
                }
                onClick={() => setActiveTab("settings")}
                data-testid="admin-tab-settings"
              >
                <Settings size={15} aria-hidden="true" />
                <span>{a.tabs.settings}</span>
              </button>
            </div>

            {activeTab === "orders" && (
              <OrdersTab
                onFatalError={reportFatalFirestoreError}
                notifConfig={notifConfig}
              />
            )}
            {activeTab === "catalog" && (
              <CatalogTab
                onFatalError={reportFatalFirestoreError}
                notifConfig={notifConfig}
              />
            )}
            {activeTab === "settings" && (
              <SettingsTab
                onFatalError={reportFatalFirestoreError}
                notifConfig={notifConfig}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
