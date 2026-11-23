import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  findSubcategoryAndVariant,
  formatPrice,
  getRangeCopy,
} from "@/lib/catalog";
import { translations } from "@/lib/i18n";
import {
  createClientReferenceId,
  recordCartOrder,
  selectOrderForTracking,
} from "@/lib/orders";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type OrderType = "home" | "trade";

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
  const [location] = useLocation();
  const c = translations[lang].cart;

  const [orderType, setOrderType] = useState<OrderType>("home");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [orderRefId, setOrderRefId] = useState(() => createClientReferenceId());
  const [recordedRefId, setRecordedRefId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      setRecordedRefId(null);
      setOrderRefId(createClientReferenceId());
    }
  }, [items.length]);

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
      const resolved = findSubcategoryAndVariant(
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

  const whatsappMessage = [
    c.whatsappGreeting,
    `${c.orderRefLabel}: ${orderRefId}`,
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

  const whatsappUrl = buildWhatsAppUrl(whatsappMessage);

  const persistCartOrder = () => {
    if (resolvedItems.length === 0) return;
    setRecordedRefId(orderRefId);
    void recordCartOrder({
      referenceId: orderRefId,
      orderType,
      customerName: name,
      phone,
      email,
      itemsSummary: resolvedItems.map(
        (entry) =>
          `${entry.rangeCopy.title} — ${entry.subcategory[lang].name} (${entry.variant[lang]} × ${entry.item.quantity})`
      ),
      subtotal,
      notes,
    });
  };

  const handleCopyOrder = async () => {
    persistCartOrder();
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard API unavailable
    }
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
              {totalCount > 0 && (
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
          {resolvedItems.length === 0 ? (
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
                        src={range.image}
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
                      onChange={(e) => setName(e.target.value)}
                      placeholder={c.namePlaceholder}
                      autoComplete="name"
                    />
                  </label>
                  <label className="inquiry-field">
                    <span className="inquiry-label">{c.phoneLabel}</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={c.phonePlaceholder}
                      autoComplete="tel"
                      dir="ltr"
                    />
                  </label>
                  <label className="inquiry-field">
                    <span className="inquiry-label">{c.emailLabel}</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={c.emailPlaceholder}
                      autoComplete="email"
                      dir="ltr"
                    />
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
                {(!name.trim() || !phone.trim()) && (
                  <p className="cart-contact-hint">{c.missingContactHint}</p>
                )}
              </div>
            </>
          )}
        </div>

        {resolvedItems.length > 0 && (
          <div className="cart-drawer-foot">
            <div className="cart-subtotal-row">
              <span>{c.subtotalLabel}</span>
              <strong>{formatPrice(subtotal, lang)}</strong>
            </div>
            {recordedRefId && (
              <div className="cart-order-ref-banner" aria-live="polite">
                <div>
                  <span>{c.orderRefLabel}:</span>{" "}
                  <strong className="tabular-nums" dir="ltr">
                    {recordedRefId}
                  </strong>
                  <small>{c.orderSavedNote}</small>
                </div>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    closeCart();
                    selectOrderForTracking(recordedRefId);
                  }}
                >
                  {c.trackOrderButton}
                </button>
              </div>
            )}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-whatsapp cart-whatsapp-btn"
              onClick={persistCartOrder}
            >
              <MessageCircle size={17} />
              <span>{c.sendWhatsApp}</span>
              <ArrowUpRight size={15} className="rtl-flip" />
            </a>
            <button
              type="button"
              className="button button-dark cart-copy-btn"
              onClick={handleCopyOrder}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? c.copied : c.copyOrder}</span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
