import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Check,
  Edit3,
  Eye,
  EyeOff,
  LogOut,
  MessageCircle,
  Package,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Link } from "wouter";
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
  productRanges as baseProductRanges,
  type ProductSubcategory,
  type ProductVariant,
} from "@/lib/catalog";
import {
  db,
  handleFirestoreError,
  OperationType,
  OWNER_ADMIN_EMAIL,
} from "@/lib/firebase";
import { translations } from "@/lib/i18n";
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
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
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
  variants: ProductVariant[];
};

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

function sanitizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function buildAdminWhatsAppReplyUrl(
  rawPhone: string,
  referenceId: string,
  customerName: string,
  lang: "en" | "ar"
): string | null {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length < 7) return null;
  const greeting =
    lang === "ar"
      ? `مرحباً ${customerName}، بخصوص طلبك من الخلية رقم (${referenceId}):`
      : `Hello ${customerName}, following up regarding your Alkhaleyah order (${referenceId}):`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(greeting)}`;
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

type FatalErrorReporter = (
  error: unknown,
  op: OperationType,
  path: string | null
) => void;

function OrdersTab({ onFatalError }: { onFatalError: FatalErrorReporter }) {
  const { lang } = useLanguage();
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
            customerName: String(data.customerName || "Customer"),
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
    referenceId: string,
    nextStatus: OrderStatusStep
  ) => {
    setSavingOrderId(referenceId);
    const path = `orders/${referenceId}`;
    try {
      await updateDoc(doc(db, "orders", referenceId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
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
            const replyUrl = contact?.phone
              ? buildAdminWhatsAppReplyUrl(
                  contact.phone,
                  order.referenceId,
                  contact.fullName || order.customerName,
                  lang
                )
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
                            onClick={() =>
                              void handleStatusChange(order.referenceId, step)
                            }
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
                    {replyUrl && (
                      <a
                        href={replyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-whatsapp admin-action-btn"
                      >
                        <MessageCircle size={14} aria-hidden="true" />
                        <span>{a.orders.whatsappReply}</span>
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

function CatalogTab({ onFatalError }: { onFatalError: FatalErrorReporter }) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const { allRangesWithHidden, overridesByKey } = useStore();
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

  const activeRange =
    allRangesWithHidden.find((r) => r.slug === selectedCategory) ??
    allRangesWithHidden[0];

  const baseRange = baseProductRanges.find((r) => r.slug === selectedCategory);
  const baseSubIds = useMemo(
    () => new Set(baseRange?.subcategories.map((s) => s.id) ?? []),
    [baseRange]
  );

  const startEdit = (sub: ProductSubcategory) => {
    setCreatingNew(false);
    setErrorMessage(null);
    setStatusMessage(null);
    const key = buildCatalogOverrideKey(selectedCategory, sub.id);
    setEditingKey(key);
    setDraft({
      subcategoryId: sub.id,
      nameEn: sub.en.name,
      nameAr: sub.ar.name,
      noteEn: sub.en.note,
      noteAr: sub.ar.note,
      isActive: !(key in overridesByKey) || overridesByKey[key].isActive,
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
        variants: cleanVariants,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      });
      setStatusMessage(a.savedToast);
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
          const isBuiltIn = baseSubIds.has(sub.id);
          const isEditing = editingKey === key && !creatingNew;
          const isVisible = !override || override.isActive;

          return (
            <article key={key} className="admin-variety-card">
              <div className="admin-variety-head">
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

function SettingsTab({ onFatalError }: { onFatalError: FatalErrorReporter }) {
  const { lang } = useLanguage();
  const { user, isOwnerAdmin } = useAuth();
  const { storeSettings } = useStore();
  const s = translations[lang].admin.settings;

  const [whatsappNumber, setWhatsappNumber] = useState(
    storeSettings.whatsappNumber
  );
  const [whatsappDisplay, setWhatsappDisplay] = useState(
    storeSettings.whatsappDisplay
  );
  const [announcementEn, setAnnouncementEn] = useState(
    storeSettings.announcementEn
  );
  const [announcementAr, setAnnouncementAr] = useState(
    storeSettings.announcementAr
  );
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const [admins, setAdmins] = useState<AdminAccountEntry[]>([]);
  const [newUid, setNewUid] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [savingAdmin, setSavingAdmin] = useState(false);

  useEffect(() => {
    setWhatsappNumber(storeSettings.whatsappNumber);
    setWhatsappDisplay(storeSettings.whatsappDisplay);
    setAnnouncementEn(storeSettings.announcementEn);
    setAnnouncementAr(storeSettings.announcementAr);
  }, [storeSettings]);

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
    const cleanDigits = whatsappNumber.replace(/\D/g, "").slice(0, 24);
    const cleanDisplay = whatsappDisplay.trim().slice(0, 32);
    if (cleanDigits.length < 6 || cleanDisplay.length < 6) return;

    setSavingSettings(true);
    setSavedToast(false);
    try {
      await setDoc(doc(db, "storeSettings", "public"), {
        whatsappNumber: cleanDigits,
        whatsappDisplay: cleanDisplay,
        announcementEn: announcementEn.trim().slice(0, 160),
        announcementAr: announcementAr.trim().slice(0, 160),
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch (error) {
      onFatalError(error, OperationType.WRITE, "storeSettings/public");
    } finally {
      setSavingSettings(false);
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
    } catch (error) {
      onFatalError(error, OperationType.DELETE, `admins/${uid}`);
    }
  };

  return (
    <div className="admin-tab-panel admin-settings-grid">
      <form className="admin-settings-card" onSubmit={handleSaveSettings}>
        <h3>{s.sectionTitle}</h3>
        <p className="admin-settings-lead">{s.sectionBody}</p>

        <div className="admin-editor-grid">
          <label className="inquiry-field">
            <span className="inquiry-label">{s.whatsappNumberLabel}</span>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              dir="ltr"
              required
            />
          </label>
          <label className="inquiry-field">
            <span className="inquiry-label">{s.whatsappDisplayLabel}</span>
            <input
              type="text"
              value={whatsappDisplay}
              onChange={(e) => setWhatsappDisplay(e.target.value)}
              dir="ltr"
              required
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
            <span>{savingSettings ? s.savingSettingsBtn : s.saveSettingsBtn}</span>
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
  );
}

export default function AdminDashboard() {
  const { lang } = useLanguage();
  const { user, authReady, isAdmin, signInWithGoogle, signOutUser } = useAuth();
  const a = translations[lang].admin;

  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<Error | null>(null);

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

  if (fatalError) {
    throw fatalError;
  }

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      setAuthError(a.signInFailed);
    } finally {
      setSigningIn(false);
    }
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
            {authError && (
              <p className="inquiry-error" role="alert">
                {authError}
              </p>
            )}
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
            <p className="admin-auth-body">
              {a.unauthorizedBody} ({a.signedInAs}:{" "}
              <strong dir="ltr">{user.email}</strong>)
            </p>
            <div className="admin-auth-actions">
              <button
                type="button"
                className="button button-dark"
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
              <OrdersTab onFatalError={reportFatalFirestoreError} />
            )}
            {activeTab === "catalog" && (
              <CatalogTab onFatalError={reportFatalFirestoreError} />
            )}
            {activeTab === "settings" && (
              <SettingsTab onFatalError={reportFatalFirestoreError} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
