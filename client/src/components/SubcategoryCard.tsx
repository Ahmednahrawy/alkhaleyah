import { useEffect, useState } from "react";
import { ArrowRight, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  formatPrice,
  getSubcategoryMinPrice,
  type ProductSubcategory,
} from "@/lib/catalog";
import { translations } from "@/lib/i18n";

export function SubcategoryCard({
  categorySlug,
  subcategory,
}: {
  categorySlug: string;
  subcategory: ProductSubcategory;
}) {
  const { lang } = useLanguage();
  const { addItem, openCart } = useCart();
  const p = translations[lang].productDetail;

  const [variantId, setVariantId] = useState(
    subcategory.variants[0]?.id ?? ""
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setVariantId(subcategory.variants[0]?.id ?? "");
    setQuantity(1);
    setJustAdded(false);
  }, [categorySlug, subcategory]);

  const currentVariant =
    subcategory.variants.find((v) => v.id === variantId) ??
    subcategory.variants[0];
  const minPrice = getSubcategoryMinPrice(subcategory);
  const lineTotal = (currentVariant?.price ?? 0) * quantity;

  const handleAdd = () => {
    if (!currentVariant) return;
    addItem(categorySlug, subcategory.id, currentVariant.id, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2600);
  };

  return (
    <article
      className="subcategory-card"
      id={`variety-${subcategory.id}`}
    >
      <div className="subcategory-card-head">
        <span className="subcategory-starting-price">
          {p.fromPricePrefix} {formatPrice(minPrice, lang)}
        </span>
        <h3>{subcategory[lang].name}</h3>
        <p>{subcategory[lang].note}</p>
      </div>

      <div className="subcategory-variants">
        <span className="inquiry-label">{p.selectSizeLabel}</span>
        <div className="variant-grid">
          {subcategory.variants.map((variant) => {
            const isSelected = variant.id === currentVariant?.id;
            return (
              <button
                key={variant.id}
                type="button"
                className={
                  isSelected ? "variant-chip is-selected" : "variant-chip"
                }
                onClick={() => {
                  setVariantId(variant.id);
                  setJustAdded(false);
                }}
              >
                <span>{variant[lang]}</span>
                <span className="variant-chip-sep">·</span>
                <strong className="tabular-nums">
                  {formatPrice(variant.price, lang)}
                </strong>
              </button>
            );
          })}
        </div>
      </div>

      <div className="subcategory-actions">
        <div className="qty-stepper" aria-label={p.quantityLabel}>
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            aria-label="-"
          >
            <Minus size={13} />
          </button>
          <span className="tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((prev) => prev + 1)}
            aria-label="+"
          >
            <Plus size={13} />
          </button>
        </div>

        <button
          type="button"
          className={
            justAdded
              ? "button button-whatsapp subcategory-add-btn"
              : "button button-dark subcategory-add-btn"
          }
          onClick={handleAdd}
        >
          {justAdded ? <Check size={15} /> : <ShoppingBag size={15} />}
          <span>{justAdded ? p.addedToCart : p.addToCart}</span>
          <span className="subcategory-btn-price tabular-nums">
            · {formatPrice(lineTotal, lang)}
          </span>
        </button>

        {justAdded && (
          <button
            type="button"
            className="text-link subcategory-view-cart"
            onClick={openCart}
          >
            {p.viewCart} <ArrowRight size={13} className="rtl-flip" />
          </button>
        )}
      </div>
    </article>
  );
}
