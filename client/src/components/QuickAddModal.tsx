import { useEffect, useState } from "react";
import { ArrowRight, Check, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getRangeCopy, type ProductRange } from "@/lib/catalog";
import { translations } from "@/lib/i18n";

export function QuickAddModal({
  range,
  onClose,
}: {
  range: ProductRange | null;
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const { addItem, openCart } = useCart();
  const q = translations[lang].quickAdd;

  const [selectedSubId, setSelectedSubId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!range) return;
    const firstSub = range.subcategories[0];
    setSelectedSubId(firstSub?.id ?? "");
    setSelectedVariantId(firstSub?.variants[0]?.id ?? "");
    setQuantity(1);
    setJustAdded(false);
  }, [range]);

  useEffect(() => {
    if (!range) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [range, onClose]);

  if (!range) return null;

  const rangeCopy = getRangeCopy(range, lang);
  const currentSub =
    range.subcategories.find((sub) => sub.id === selectedSubId) ??
    range.subcategories[0];

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
    if (!currentSub || !selectedVariantId) return;
    addItem(range.slug, currentSub.id, selectedVariantId, quantity);
    setJustAdded(true);
  };

  const handleViewCart = () => {
    onClose();
    openCart();
  };

  return (
    <div
      className="quick-add-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
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
              src={range.image}
              alt={rangeCopy.title}
              className="quick-add-thumb"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="quick-add-eyebrow">{rangeCopy.title}</span>
              <h2 id="quick-add-title">{q.title}</h2>
            </div>
          </div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={onClose}
            aria-label={q.closeAria}
          >
            <X size={20} />
          </button>
        </div>

        <div className="quick-add-body">
          <div className="quick-add-group">
            <span className="inquiry-label">{q.varietyLabel}</span>
            <div className="quick-add-sub-list">
              {range.subcategories.map((sub) => {
                const isSelected = sub.id === currentSub?.id;
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
                    <strong>{sub[lang].name}</strong>
                    <span>{sub[lang].note}</span>
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
                  const isSelected = variant.id === selectedVariantId;
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
                      {variant[lang]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="quick-add-qty-row">
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
              onClick={onClose}
            >
              {q.viewFullRange} <ArrowRight size={14} className="rtl-flip" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
