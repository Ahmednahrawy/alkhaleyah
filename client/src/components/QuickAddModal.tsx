import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStore } from "@/contexts/StoreContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
  formatPrice,
  getRangeCopy,
  getSubcategoryImage,
  getSubcategoryMinPrice,
} from "@/lib/catalog";
import { translations } from "@/lib/i18n";

export function QuickAddModal() {
  const { lang } = useLanguage();
  const { findRange } = useStore();
  const { quickAddTarget, closeQuickAdd, addItem, openCart } = useCart();
  const { hasItem, toggleItem } = useWishlist();
  const q = translations[lang].quickAdd;
  const r = translations[lang].rangeSection;
  const w = translations[lang].wishlist;

  const [selectedSubId, setSelectedSubId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const range = quickAddTarget
    ? (findRange(quickAddTarget.range.slug) ?? quickAddTarget.range)
    : null;
  const initialSubId = quickAddTarget?.initialSubcategoryId;

  useEffect(() => {
    if (!range) return;
    const matchedSub =
      (initialSubId &&
        range.subcategories.find((sub) => sub.id === initialSubId)) ||
      range.subcategories[0];
    setSelectedSubId(matchedSub?.id ?? "");
    setSelectedVariantId(matchedSub?.variants[0]?.id ?? "");
    setQuantity(1);
    setJustAdded(false);
  }, [range, initialSubId]);

  useEffect(() => {
    if (!range) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeQuickAdd();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [range, closeQuickAdd]);

  if (!range) return null;

  const rangeCopy = getRangeCopy(range, lang);
  const currentSub =
    range.subcategories.find((sub) => sub.id === selectedSubId) ??
    range.subcategories[0];
  const currentVariant =
    currentSub?.variants.find((v) => v.id === selectedVariantId) ??
    currentSub?.variants[0];
  const lineTotal = (currentVariant?.price ?? 0) * quantity;
  const isCurrentSaved = currentSub
    ? hasItem(range.slug, currentSub.id)
    : false;

  const handleSelectSub = (subId: string) => {
    setSelectedSubId(subId);
    const nextSub = range.subcategories.find((sub) => sub.id === subId);
    if (nextSub) {
      const keepSameVariant = nextSub.variants.some(
        (v) => v.id === selectedVariantId
      );
      if (!keepSameVariant) {
        setSelectedVariantId(nextSub.variants[0]?.id ?? "");
      }
    }
    setJustAdded(false);
  };

  const handleAdd = () => {
    if (!currentSub || !currentVariant) return;
    addItem(range.slug, currentSub.id, currentVariant.id, quantity);
    setJustAdded(true);
  };

  const handleViewCart = () => {
    closeQuickAdd();
    openCart();
  };

  return (
    <div
      className="quick-add-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeQuickAdd();
      }}
    >
      <div
        className="quick-add-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-title"
      >
        <div className="quick-add-head">
          <div className="quick-add-category-row">
            <img
              src={getSubcategoryImage(range, currentSub)}
              alt={currentSub ? currentSub[lang].name : rangeCopy.title}
              className="quick-add-thumb"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="quick-add-eyebrow">{rangeCopy.title}</span>
              <h2 id="quick-add-title">{q.title}</h2>
            </div>
          </div>
          <div className="quick-add-head-actions">
            {currentSub && (
              <button
                type="button"
                className={
                  isCurrentSaved
                    ? "wishlist-heart-btn is-saved"
                    : "wishlist-heart-btn"
                }
                onClick={() =>
                  toggleItem(range.slug, currentSub.id, currentVariant?.id)
                }
                aria-pressed={isCurrentSaved}
                aria-label={isCurrentSaved ? w.removeAria : w.addAria}
              >
                <Heart
                  size={17}
                  fill={isCurrentSaved ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              </button>
            )}
            <button
              type="button"
              className="cart-close-btn"
              onClick={closeQuickAdd}
              aria-label={q.closeAria}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="quick-add-body">
          <div className="quick-add-group">
            <span className="inquiry-label">{q.varietyLabel}</span>
            <div className="quick-add-sub-list">
              {range.subcategories.map((sub) => {
                const isSelected = sub.id === currentSub?.id;
                const minPrice = getSubcategoryMinPrice(sub);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    className={
                      isSelected
                        ? "quick-add-sub-btn is-selected"
                        : "quick-add-sub-btn"
                    }
                    onClick={() => handleSelectSub(sub.id)}
                  >
                    <img
                      src={getSubcategoryImage(range, sub)}
                      alt=""
                      className="quick-add-sub-thumb"
                      referrerPolicy="no-referrer"
                    />
                    <div className="quick-add-sub-copy">
                      <div className="quick-add-sub-top">
                        <strong>{sub[lang].name}</strong>
                        <em className="quick-add-sub-price tabular-nums">
                          {r.fromPricePrefix} {formatPrice(minPrice, lang)}
                        </em>
                      </div>
                      <span>{sub[lang].note}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {currentSub && (
            <div className="quick-add-group">
              <span className="inquiry-label">{q.sizeLabel}</span>
              <div className="variant-grid">
                {currentSub.variants.map((variant) => {
                  const isSelected = variant.id === currentVariant?.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      className={
                        isSelected ? "variant-chip is-selected" : "variant-chip"
                      }
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setJustAdded(false);
                      }}
                    >
                      <span>{variant[lang]}</span>
                      <span className="variant-chip-sep">·</span>
                      <strong>{formatPrice(variant.price, lang)}</strong>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="quick-add-qty-row">
            <div className="quick-add-qty-group">
              <span className="inquiry-label">{q.quantityLabel}</span>
              <div className="qty-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  aria-label="-"
                >
                  <Minus size={14} />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  aria-label="+"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="quick-add-total-box">
              <span className="inquiry-label">{q.totalLabel}</span>
              <strong className="quick-add-total-price">
                {formatPrice(lineTotal, lang)}
              </strong>
            </div>
          </div>
        </div>

        <div className="quick-add-foot">
          <button
            type="button"
            className="button button-dark quick-add-submit"
            onClick={handleAdd}
          >
            {justAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
            <span>{justAdded ? q.addedToCart : q.addToCart}</span>
          </button>
          {justAdded ? (
            <button
              type="button"
              className="button button-whatsapp"
              onClick={handleViewCart}
            >
              <ShoppingBag size={15} />
              <span>{q.viewCart}</span>
            </button>
          ) : (
            <Link
              href={`/products/${range.slug}`}
              className="text-link"
              onClick={closeQuickAdd}
            >
              {q.viewFullRange} <ArrowRight size={14} className="rtl-flip" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
