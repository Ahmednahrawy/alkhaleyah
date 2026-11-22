import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  findProductRange,
  getRangeCopy,
  productRanges,
  type ProductSubcategory,
} from "@/lib/catalog";
import { translations } from "@/lib/i18n";

function SubcategoryCard({
  categorySlug,
  subcategory,
  index,
}: {
  categorySlug: string;
  subcategory: ProductSubcategory;
  index: number;
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

  const handleAdd = () => {
    if (!variantId) return;
    addItem(categorySlug, subcategory.id, variantId, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2600);
  };

  const numLabel =
    lang === "ar"
      ? `٠${["١", "٢", "٣", "٤", "٥", "٦"][index] ?? index + 1}`
      : `0${index + 1}`;

  return (
    <article className="subcategory-card">
      <div className="subcategory-card-head">
        <span className="subcategory-num">{numLabel}</span>
        <h3>{subcategory[lang].name}</h3>
        <p>{subcategory[lang].note}</p>
      </div>

      <div className="subcategory-variants">
        <span className="inquiry-label">{p.selectSizeLabel}</span>
        <div className="variant-grid">
          {subcategory.variants.map((variant) => {
            const isSelected = variant.id === variantId;
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
                {variant[lang]}
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
          <span>{quantity}</span>
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

export default function ProductRange() {
  const [, params] = useRoute("/products/:slug");
  const { lang } = useLanguage();
  const t = translations[lang];
  const range = findProductRange(params?.slug);

  if (!range) {
    return (
      <div className="site-shell">
        <SiteHeader />
        <main className="not-found">
          <p className="eyebrow">
            <span /> {t.productDetail.notFoundEyebrow}
          </p>
          <h1>
            {t.productDetail.notFoundTitleLead}
            <br />
            <em>{t.productDetail.notFoundTitleAccent}</em>
          </h1>
          <p>{t.productDetail.notFoundBody}</p>
          <Link className="button button-dark" href="/#our-range">
            <ArrowLeft size={17} className="rtl-flip" />{" "}
            {t.productDetail.notFoundCta}
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const copy = getRangeCopy(range, lang);

  return (
    <div className="site-shell">
      <div className="announcement">
        <span className="announcement-dot" /> {t.announcement}
      </div>
      <SiteHeader />
      <main className="range-detail">
        <div className="detail-breadcrumb">
          <Link href="/#our-range">{t.productDetail.breadcrumbRoot}</Link>
          <span>/</span>
          <span>{copy.title}</span>
        </div>
        <div className="detail-layout">
          <div className="detail-copy">
            <p className="eyebrow">
              <span /> {copy.eyebrow}
            </p>
            <h1>
              {copy.titleLead}
              <br />
              <em>{copy.titleAccent}</em>
            </h1>
            <p className="detail-lede">{copy.summary}</p>
            <p className="detail-description">{copy.detail}</p>
            <div className="detail-actions">
              <a className="button button-dark" href="#varieties">
                {t.productDetail.browseVarietiesCta} <ArrowDown size={16} />
              </a>
              <Link
                className="text-link"
                href={`/?product=${range.slug}#contact`}
              >
                {t.productDetail.askCta}{" "}
                <ArrowRight size={15} className="rtl-flip" />
              </Link>
              <Link className="text-link" href="/#our-range">
                <ArrowLeft size={15} className="rtl-flip" />{" "}
                {t.productDetail.allCategories}
              </Link>
            </div>
            <p className="detail-disclaimer">{t.productDetail.disclaimer}</p>
          </div>
          <div className="detail-image">
            <img
              src={range.image}
              alt={copy.imageAlt}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <section className="subcategories-section" id="varieties">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span /> {t.productDetail.subcategoriesEyebrow}
              </p>
              <h2>
                {t.productDetail.subcategoriesTitleLead}
                <br />
                <em>{t.productDetail.subcategoriesTitleAccent}</em>
              </h2>
            </div>
            <div className="section-aside">
              <p>{t.productDetail.subcategoriesSubtitle}</p>
            </div>
          </div>

          <div className="subcategory-grid">
            {range.subcategories.map((subcategory, idx) => (
              <SubcategoryCard
                key={`${range.slug}-${subcategory.id}`}
                categorySlug={range.slug}
                subcategory={subcategory}
                index={idx}
              />
            ))}
          </div>
        </section>

        <section className="more-ranges">
          <div>
            <p className="eyebrow">
              <span /> {t.productDetail.moreEyebrow}
            </p>
            <h2>
              {t.productDetail.moreTitleLead}
              <br />
              <em>{t.productDetail.moreTitleAccent}</em>
            </h2>
          </div>
          <div className="more-range-links">
            {productRanges
              .filter((item) => item.slug !== range.slug)
              .map((item) => {
                const itemCopy = getRangeCopy(item, lang);
                return (
                  <Link key={item.slug} href={`/products/${item.slug}`}>
                    <span>{itemCopy.title}</span>
                    <ArrowRight size={17} className="rtl-flip" />
                  </Link>
                );
              })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
