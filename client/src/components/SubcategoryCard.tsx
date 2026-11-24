import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { DynamicImageSlider } from "@/components/DynamicImageSlider";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStore } from "@/contexts/StoreContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
  formatPrice,
  getMatchingVariants,
  getSubcategoryMinPrice,
  variantMatchesPrice,
  variantMatchesWeight,
  type PriceFilterId,
  type ProductSubcategory,
  type WeightFilterId,
} from "@/lib/catalog";
import { translations } from "@/lib/i18n";

export function SubcategoryCard({
  categorySlug,
  categoryLabel,
  rangeImage,
  subcategory,
  activePriceFilter = "all",
  activeWeightFilter = "all",
}: {
  categorySlug: string;
  categoryLabel?: string;
  rangeImage?: string;
  subcategory: ProductSubcategory;
  activePriceFilter?: PriceFilterId;
  activeWeightFilter?: WeightFilterId;
}) {
  const { lang } = useLanguage();
  const { findRange } = useStore();
  const { addItem, openCart } = useCart();
  const { hasItem, toggleItem } = useWishlist();
  const p = translations[lang].productDetail;
  const w = translations[lang].wishlist;

  const hasActiveFilter =
    activePriceFilter !== "all" || activeWeightFilter !== "all";

  const matchingVariants = useMemo(
    () =>
      getMatchingVariants(subcategory, activePriceFilter, activeWeightFilter),
    [subcategory, activePriceFilter, activeWeightFilter]
  );

  const preferredVariantId =
    matchingVariants[0]?.id ?? subcategory.variants[0]?.id ?? "";

  const [variantId, setVariantId] = useState(preferredVariantId);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const fallbackRange = findRange(categorySlug);
  const cardImages = useMemo(() => {
    const fromSub = subcategory.images?.filter(Boolean) ?? [];
    if (fromSub.length > 0) return fromSub;
    const single = subcategory.image || rangeImage || fallbackRange?.image;
    return single ? [single] : [];
  }, [subcategory, rangeImage, fallbackRange]);

  useEffect(() => {
    setVariantId(preferredVariantId);
    setQuantity(1);
    setJustAdded(false);
  }, [categorySlug, subcategory, preferredVariantId]);

  const currentVariant =
    subcategory.variants.find((v) => v.id === variantId) ??
    matchingVariants[0] ??
    subcategory.variants[0];
  const minPrice = getSubcategoryMinPrice(subcategory);
  const lineTotal = (currentVariant?.price ?? 0) * quantity;
  const isSaved = hasItem(categorySlug, subcategory.id);

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
      <div className="subcategory-card-media">
        <DynamicImageSlider
          images={cardImages}
          alt={subcategory[lang].name}
          loading="lazy"
        />
      </div>

      <div className="subcategory-card-body">
        <div className="subcategory-card-head">
          <div className="subcategory-card-top">
            <span className="subcategory-starting-price tabular-nums">
              {categoryLabel ? `${categoryLabel} · ` : ""}
              {p.fromPricePrefix} {formatPrice(minPrice, lang)}
            </span>
            <button
              type="button"
              className={
                isSaved ? "wishlist-heart-btn is-saved" : "wishlist-heart-btn"
              }
              onClick={() =>
                toggleItem(categorySlug, subcategory.id, currentVariant?.id)
              }
              aria-pressed={isSaved}
              aria-label={isSaved ? w.removeAria : w.addAria}
              data-testid={`wishlist-toggle-${subcategory.id}`}
            >
              <Heart
                size={16}
                fill={isSaved ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>
          </div>
          <h3>{subcategory[lang].name}</h3>
          <p>{subcategory[lang].note}</p>
        </div>

        <div className="subcategory-variants">
          <span className="inquiry-label">{p.selectSizeLabel}</span>
          <div className="variant-grid">
            {subcategory.variants.map((variant) => {
              const isSelected = variant.id === currentVariant?.id;
              const matchesFilter =
                !hasActiveFilter ||
                (variantMatchesPrice(variant.price, activePriceFilter) &&
                  variantMatchesWeight(variant.id, activeWeightFilter));
              return (
                <button
                  key={variant.id}
                  type="button"
                  className={[
                    "variant-chip",
                    isSelected ? "is-selected" : "",
                    !matchesFilter ? "is-dimmed" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
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
      </div>
    </article>
  );
}
