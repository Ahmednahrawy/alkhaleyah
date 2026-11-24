import { useEffect, useState } from "react";
import { Check, Heart, ShoppingBag, Trash2, X } from "lucide-react";
import { Link, useLocation } from "wouter";
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

export function WishlistDrawer() {
  const { items, totalCount, isOpen, closeWishlist, removeItem, clearWishlist } =
    useWishlist();
  const { addItem, openCart } = useCart();
  const { lang } = useLanguage();
  const { findRange } = useStore();
  const [location] = useLocation();
  const w = translations[lang].wishlist;
  const r = translations[lang].rangeSection;

  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [addedKey, setAddedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeWishlist();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeWishlist]);

  if (!isOpen) return null;

  const resolvedItems = items
    .map((entry) => {
      const range = findRange(entry.categorySlug);
      const subcategory = range?.subcategories.find(
        (sub) => sub.id === entry.subcategoryId
      );
      if (!range || !subcategory) return null;
      return {
        entry,
        range,
        rangeCopy: getRangeCopy(range, lang),
        subcategory,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div
      className="cart-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeWishlist();
      }}
    >
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlist-drawer-title"
      >
        <div className="cart-drawer-head">
          <div>
            <div className="cart-title-row">
              <h2 id="wishlist-drawer-title">{w.drawerTitle}</h2>
              {totalCount > 0 && (
                <span className="cart-count-tag">
                  {totalCount} {w.itemsCountSuffix}
                </span>
              )}
            </div>
            <p className="cart-subtitle">{w.drawerSubtitle}</p>
          </div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={closeWishlist}
            aria-label={w.closeAria}
          >
            <X size={20} />
          </button>
        </div>

        <div className="cart-drawer-body">
          {resolvedItems.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon" aria-hidden="true">
                <Heart size={26} />
              </span>
              <h3>{w.emptyTitle}</h3>
              <p>{w.emptyBody}</p>
              {location === "/" ? (
                <a
                  href="#our-range"
                  className="button button-dark"
                  onClick={closeWishlist}
                >
                  {w.browseButton}
                </a>
              ) : (
                <Link
                  href="/#our-range"
                  className="button button-dark"
                  onClick={closeWishlist}
                >
                  {w.browseButton}
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {resolvedItems.map(
                  ({ entry, range, rangeCopy, subcategory }) => {
                    const activeVariantId =
                      selectedVariants[entry.key] ??
                      entry.preferredVariantId ??
                      subcategory.variants[0]?.id ??
                      "";
                    const activeVariant =
                      subcategory.variants.find(
                        (v) => v.id === activeVariantId
                      ) ?? subcategory.variants[0];
                    const minPrice = getSubcategoryMinPrice(subcategory);
                    const isJustAdded = addedKey === entry.key;

                    return (
                      <div key={entry.key} className="wishlist-item">
                        <div className="wishlist-item-top">
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
                            <Link
                              href={`/products/${range.slug}#variety-${subcategory.id}`}
                              className="wishlist-item-title-link"
                              onClick={closeWishlist}
                            >
                              <h3 className="cart-item-title">
                                {subcategory[lang].name}
                              </h3>
                            </Link>
                            <span className="cart-item-variant tabular-nums">
                              {r.fromPricePrefix} {formatPrice(minPrice, lang)}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="cart-remove-btn"
                            onClick={() => removeItem(entry.key)}
                            aria-label={w.removeAria}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="wishlist-item-controls">
                          <label className="wishlist-size-select-wrap">
                            <span className="sr-only">{w.selectSizeLabel}</span>
                            <select
                              value={activeVariant?.id ?? ""}
                              onChange={(e) => {
                                setSelectedVariants((prev) => ({
                                  ...prev,
                                  [entry.key]: e.target.value,
                                }));
                                if (addedKey === entry.key) setAddedKey(null);
                              }}
                              className="wishlist-size-select"
                              aria-label={w.selectSizeLabel}
                            >
                              {subcategory.variants.map((variant) => (
                                <option key={variant.id} value={variant.id}>
                                  {variant[lang]} —{" "}
                                  {formatPrice(variant.price, lang)}
                                </option>
                              ))}
                            </select>
                          </label>

                          <button
                            type="button"
                            className={
                              isJustAdded
                                ? "button button-accent wishlist-add-btn"
                                : "button button-dark wishlist-add-btn"
                            }
                            onClick={() => {
                              if (!activeVariant) return;
                              addItem(
                                range.slug,
                                subcategory.id,
                                activeVariant.id,
                                1
                              );
                              setAddedKey(entry.key);
                            }}
                          >
                            {isJustAdded ? (
                              <Check size={14} />
                            ) : (
                              <ShoppingBag size={14} />
                            )}
                            <span>
                              {isJustAdded ? w.addedToCart : w.addToCart}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="cart-clear-row">
                <button
                  type="button"
                  className="cart-clear-btn"
                  onClick={clearWishlist}
                >
                  {w.clearAll}
                </button>
              </div>
            </>
          )}
        </div>

        {resolvedItems.length > 0 && addedKey && (
          <div className="cart-drawer-foot">
            <button
              type="button"
              className="button button-accent cart-submit-btn"
              onClick={() => {
                closeWishlist();
                openCart();
              }}
            >
              <ShoppingBag size={16} />
              <span>{w.viewCart}</span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
