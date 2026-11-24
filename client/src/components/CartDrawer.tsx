import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Minus,
  Plus,
  Send,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStore } from "@/contexts/StoreContext";
import {
  formatPrice,
  getRangeCopy,
  getSubcategoryImage,
} from "@/lib/catalog";
import { translations } from "@/lib/i18n";
import {
  createClientReferenceId,
  recordCartOrder,
  selectOrderForTracking,
} from "@/lib/orders";

type OrderType = "home" | "trade";

type ConfirmedOrderReceipt = {
  referenceId: string;
  orderType: OrderType;
  customerName: string;
  phone: string;
  email: string;
  notes: string;
  itemsSummary: string[];
  subtotal: number;
  summaryText: string;
};

export function CartDrawer() {
  const {
    items,
    totalCount,
    subtotal,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { lang } = useLanguage();
  const { findVariant } = useStore();
  const [location] = useLocation();
  const c = translations[lang].cart;

  const [orderType, setOrderType] = useState<OrderType>("home");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    contact?: string;
    email?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderRefId, setOrderRefId] = useState(() => createClientReferenceId());
  const [confirmedOrder, setConfirmedOrder] =
    useState<ConfirmedOrderReceipt | null>(null);

  useEffect(() => {
    if (items.length > 0 && confirmedOrder) {
      setConfirmedOrder(null);
      setOrderRefId(createClientReferenceId());
    }
  }, [items.length, confirmedOrder]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCart();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const resolvedItems = items
    .map((item) => {
      const resolved = findVariant(
        item.categorySlug,
        item.subcategoryId,
        item.variantId
      );
      if (!resolved.range || !resolved.subcategory || !resolved.variant) {
        return null;
      }
      return {
        item,
        range: resolved.range,
        rangeCopy: getRangeCopy(resolved.range, lang),
        subcategory: resolved.subcategory,
        variant: resolved.variant,
        lineTotal: resolved.variant.price * item.quantity,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const itemLines = resolvedItems.map((entry, idx) => {
    const numberLabel = `${idx + 1}.`;
    return `${numberLabel} ${entry.rangeCopy.title} — ${entry.subcategory[lang].name} (${entry.variant[lang]} × ${entry.item.quantity}) = ${formatPrice(entry.lineTotal, lang)}`;
  });

  const buildOrderSummaryText = (refId: string) =>
    [
      c.summaryGreeting,
      `${c.orderRefLabel}: ${refId}`,
      `${c.orderTypeLabel}: ${orderType === "trade" ? c.typeTrade : c.typeHome}`,
      "",
      ...itemLines,
      "",
      `${c.subtotalLabel}: ${formatPrice(subtotal, lang)}`,
      ...(name.trim() ? [`${c.nameLabel}: ${name.trim()}`] : []),
      ...(phone.trim() ? [`${c.phoneLabel}: ${phone.trim()}`] : []),
      ...(email.trim() ? [`${c.emailLabel}: ${email.trim()}`] : []),
      ...(notes.trim() ? [`${c.notesLabel}: ${notes.trim()}`] : []),
      c.noteConfirm,
    ].join("\n");

  const validateCheckout = () => {
    const nextErrors: {
      name?: string;
      contact?: string;
      email?: string;
    } = {};

    if (!name.trim()) {
      nextErrors.name = c.errors.nameRequired;
    }
    const phoneTrimmed = phone.trim();
    const emailTrimmed = email.trim();
    if (!phoneTrimmed && !emailTrimmed) {
      nextErrors.contact = c.errors.contactRequired;
    }
    if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      nextErrors.email = c.errors.emailInvalid;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (resolvedItems.length === 0 || submitting) return;
    if (!validateCheckout()) return;

    setSubmitting(true);
    const itemsSummary = resolvedItems.map(
      (entry) =>
        `${entry.rangeCopy.title} — ${entry.subcategory[lang].name} (${entry.variant[lang]} × ${entry.item.quantity})`
    );
    const currentSubtotal = subtotal;
    const summaryText = buildOrderSummaryText(orderRefId);

    try {
      const saved = await recordCartOrder({
        referenceId: orderRefId,
        orderType,
        customerName: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        itemsSummary,
        subtotal: currentSubtotal,
        notes: notes.trim(),
      });

      setConfirmedOrder({
        referenceId: saved.referenceId,
        orderType,
        customerName: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim(),
        itemsSummary,
        subtotal: currentSubtotal,
        summaryText,
      });
      setCopied(false);
      clearCart();
      setOrderRefId(createClientReferenceId());
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyConfirmed = async () => {
    if (!confirmedOrder) return;
    try {
      await navigator.clipboard.writeText(confirmedOrder.summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard API unavailable
    }
  };

  const handleTrackConfirmed = () => {
    if (!confirmedOrder) return;
    const refId = confirmedOrder.referenceId;
    closeCart();
    selectOrderForTracking(refId);
  };

  const handleContinueAfterConfirm = () => {
    setConfirmedOrder(null);
    closeCart();
  };

  return (
    <div
      className="cart-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCart();
      }}
    >
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <div className="cart-drawer-head">
          <div>
            <div className="cart-title-row">
              <h2 id="cart-drawer-title">{c.title}</h2>
              {totalCount > 0 && !confirmedOrder && (
                <span className="cart-count-tag">
                  {totalCount} {c.itemsCountSuffix}
                </span>
              )}
            </div>
            <p className="cart-subtitle">{c.subtitle}</p>
          </div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={closeCart}
            aria-label={c.closeAria}
          >
            <X size={20} />
          </button>
        </div>

        <div className="cart-drawer-body">
          {confirmedOrder ? (
            <div
              className="cart-confirmed-card"
              aria-live="polite"
              data-testid="cart-order-confirmed"
            >
              <div className="inquiry-success-head">
                <span className="inquiry-success-icon" aria-hidden="true">
                  <Check size={18} />
                </span>
                <div>
                  <h3>{c.confirmedTitle}</h3>
                  <p className="inquiry-ref">
                    {c.orderRefLabel}:{" "}
                    <strong className="tabular-nums" dir="ltr">
                      {confirmedOrder.referenceId}
                    </strong>
                  </p>
                </div>
              </div>
              <p className="inquiry-success-body">{c.confirmedBody}</p>

              <dl className="inquiry-summary-list">
                <div>
                  <dt>{c.orderTypeLabel}</dt>
                  <dd>
                    {confirmedOrder.orderType === "trade"
                      ? c.typeTrade
                      : c.typeHome}
                  </dd>
                </div>
                <div>
                  <dt>{c.nameLabel}</dt>
                  <dd>{confirmedOrder.customerName}</dd>
                </div>
                {confirmedOrder.phone && (
                  <div>
                    <dt>{c.phoneLabel}</dt>
                    <dd dir="ltr">{confirmedOrder.phone}</dd>
                  </div>
                )}
                {confirmedOrder.email && (
                  <div>
                    <dt>{c.emailLabel}</dt>
                    <dd dir="ltr">{confirmedOrder.email}</dd>
                  </div>
                )}
                <div>
                  <dt>{c.subtotalLabel}</dt>
                  <dd className="tabular-nums">
                    <strong>{formatPrice(confirmedOrder.subtotal, lang)}</strong>
                  </dd>
                </div>
              </dl>

              <ul className="tracking-items-list">
                {confirmedOrder.itemsSummary.map((line, idx) => (
                  <li key={`confirmed-item-${idx}`}>{line}</li>
                ))}
              </ul>

              <div className="cart-confirmed-actions">
                <button
                  type="button"
                  className="button button-dark cart-submit-btn"
                  onClick={handleTrackConfirmed}
                >
                  <ShoppingBag size={15} aria-hidden="true" />
                  <span>{c.trackOrderButton}</span>
                </button>
                <button
                  type="button"
                  className="button button-accent cart-copy-btn"
                  onClick={handleCopyConfirmed}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copied ? c.copied : c.copyOrder}</span>
                </button>
                <button
                  type="button"
                  className="text-link cart-continue-link"
                  onClick={handleContinueAfterConfirm}
                >
                  {c.confirmedContinueButton}
                </button>
              </div>
            </div>
          ) : resolvedItems.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon" aria-hidden="true">
                <ShoppingBag size={26} />
              </span>
              <h3>{c.emptyTitle}</h3>
              <p>{c.emptyBody}</p>
              {location === "/" ? (
                <a
                  href="#our-range"
                  className="button button-dark"
                  onClick={closeCart}
                >
                  {c.browseButton}
                </a>
              ) : (
                <Link
                  href="/#our-range"
                  className="button button-dark"
                  onClick={closeCart}
                >
                  {c.browseButton}
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {resolvedItems.map(
                  ({
                    item,
                    range,
                    rangeCopy,
                    subcategory,
                    variant,
                    lineTotal,
                  }) => (
                    <div key={item.key} className="cart-item">
                      <img
                        src={getSubcategoryImage(range, subcategory)}
                        alt={subcategory[lang].name}
                        className="cart-item-thumb"
                        referrerPolicy="no-referrer"
                      />
                      <div className="cart-item-info">
                        <span className="cart-item-category">
                          {rangeCopy.title}
                        </span>
                        <h3 className="cart-item-title">
                          {subcategory[lang].name}
                        </h3>
                        <div className="cart-item-meta-row">
                          <span className="cart-item-variant">
                            {variant[lang]} · {formatPrice(variant.price, lang)}
                          </span>
                          <strong className="cart-item-line-total">
                            {formatPrice(lineTotal, lang)}
                          </strong>
                        </div>
                        <div className="cart-item-controls">
                          <div className="qty-stepper">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.key, item.quantity - 1)
                              }
                              aria-label={c.decreaseAria}
                            >
                              <Minus size={13} />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.key, item.quantity + 1)
                              }
                              aria-label={c.increaseAria}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <button
                            type="button"
                            className="cart-remove-btn"
                            onClick={() => removeItem(item.key)}
                            aria-label={c.removeAria}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="cart-clear-row">
                <button
                  type="button"
                  className="cart-clear-btn"
                  onClick={clearCart}
                >
                  {c.clearCart}
                </button>
              </div>

              <div className="cart-customer-form">
                <p className="cart-section-label">{c.customerSectionTitle}</p>

                <div
                  className="inquiry-type-group"
                  role="radiogroup"
                  aria-label={c.orderTypeLabel}
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={orderType === "home"}
                    className={
                      orderType === "home"
                        ? "inquiry-type-btn is-selected"
                        : "inquiry-type-btn"
                    }
                    onClick={() => setOrderType("home")}
                  >
                    {c.typeHome}
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={orderType === "trade"}
                    className={
                      orderType === "trade"
                        ? "inquiry-type-btn is-selected"
                        : "inquiry-type-btn"
                    }
                    onClick={() => setOrderType("trade")}
                  >
                    {c.typeTrade}
                  </button>
                </div>

                <div className="cart-form-fields">
                  <label className="inquiry-field">
                    <span className="inquiry-label">{c.nameLabel}</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) {
                          setErrors((prev) => ({ ...prev, name: undefined }));
                        }
                      }}
                      placeholder={c.namePlaceholder}
                      autoComplete="name"
                    />
                    {errors.name && (
                      <span className="inquiry-error" role="alert">
                        {errors.name}
                      </span>
                    )}
                  </label>
                  <label className="inquiry-field">
                    <span className="inquiry-label">{c.phoneLabel}</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.contact) {
                          setErrors((prev) => ({
                            ...prev,
                            contact: undefined,
                          }));
                        }
                      }}
                      placeholder={c.phonePlaceholder}
                      autoComplete="tel"
                      dir="ltr"
                    />
                    {errors.contact && (
                      <span className="inquiry-error" role="alert">
                        {errors.contact}
                      </span>
                    )}
                  </label>
                  <label className="inquiry-field">
                    <span className="inquiry-label">{c.emailLabel}</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.contact || errors.email) {
                          setErrors((prev) => ({
                            ...prev,
                            contact: undefined,
                            email: undefined,
                          }));
                        }
                      }}
                      placeholder={c.emailPlaceholder}
                      autoComplete="email"
                      dir="ltr"
                    />
                    {errors.email && (
                      <span className="inquiry-error" role="alert">
                        {errors.email}
                      </span>
                    )}
                  </label>
                  <label className="inquiry-field">
                    <span className="inquiry-label">{c.notesLabel}</span>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={c.notesPlaceholder}
                    />
                  </label>
                </div>
                {(!name.trim() || (!phone.trim() && !email.trim())) && (
                  <p className="cart-contact-hint">{c.missingContactHint}</p>
                )}
              </div>
            </>
          )}
        </div>

        {resolvedItems.length > 0 && !confirmedOrder && (
          <div className="cart-drawer-foot">
            <div className="cart-subtotal-row">
              <span>{c.subtotalLabel}</span>
              <strong>{formatPrice(subtotal, lang)}</strong>
            </div>
            <button
              type="button"
              className="button button-dark cart-submit-btn"
              disabled={submitting}
              onClick={() => void handlePlaceOrder()}
              data-testid="cart-submit-order-btn"
            >
              <Send size={16} aria-hidden="true" />
              <span>
                {submitting ? c.submittingOrderButton : c.placeOrderButton}
              </span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
