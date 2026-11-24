import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Package,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { SubcategoryCard } from "@/components/SubcategoryCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStore } from "@/contexts/StoreContext";
import {
  getRangeCopy,
  matchesSubcategoryFilters,
  type PriceFilterId,
  type WeightFilterId,
} from "@/lib/catalog";
import { translations } from "@/lib/i18n";

const PRICE_FILTER_IDS: PriceFilterId[] = [
  "all",
  "under-250",
  "250-600",
  "600-1500",
  "over-1500",
];

const WEIGHT_FILTER_IDS: WeightFilterId[] = [
  "all",
  "small-pack",
  "1kg",
  "3-5kg",
  "10kg",
  "bottles",
];

export default function ProductRange() {
  const [, params] = useRoute("/products/:slug");
  const { lang } = useLanguage();
  const { ranges, findRange, storeSettings } = useStore();
  const t = translations[lang];
  const range = findRange(params?.slug);
  const [priceFilter, setPriceFilter] = useState<PriceFilterId>("all");
  const [weightFilter, setWeightFilter] = useState<WeightFilterId>("all");

  const hasActiveFilters = priceFilter !== "all" || weightFilter !== "all";

  const visibleSubcategories = useMemo(() => {
    if (!range) return [];
    return range.subcategories.filter((sub) =>
      matchesSubcategoryFilters(sub, priceFilter, weightFilter)
    );
  }, [range, priceFilter, weightFilter]);

  const resetFilters = () => {
    setPriceFilter("all");
    setWeightFilter("all");
  };

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
  const announcementText =
    lang === "ar" ? storeSettings.announcementAr : storeSettings.announcementEn;

  return (
    <div className="site-shell">
      <div className="announcement">{announcementText}</div>
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

          <div className="range-filters-bar">
            <div className="range-filters-controls">
              <div className="filter-select-group">
                <label htmlFor="detail-price-filter" className="filter-label">
                  <SlidersHorizontal size={13} aria-hidden="true" />
                  <span>{t.rangeSection.filters.priceLabel}</span>
                </label>
                <select
                  id="detail-price-filter"
                  value={priceFilter}
                  onChange={(e) =>
                    setPriceFilter(e.target.value as PriceFilterId)
                  }
                  className="filter-select"
                >
                  {PRICE_FILTER_IDS.map((id) => (
                    <option key={id} value={id}>
                      {t.rangeSection.filters.priceOptions[id]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-select-group">
                <label htmlFor="detail-weight-filter" className="filter-label">
                  <Package size={13} aria-hidden="true" />
                  <span>{t.rangeSection.filters.weightLabel}</span>
                </label>
                <select
                  id="detail-weight-filter"
                  value={weightFilter}
                  onChange={(e) =>
                    setWeightFilter(e.target.value as WeightFilterId)
                  }
                  className="filter-select"
                >
                  {WEIGHT_FILTER_IDS.map((id) => (
                    <option key={id} value={id}>
                      {t.rangeSection.filters.weightOptions[id]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="range-filters-summary">
              <span className="range-filters-count tabular-nums">
                {t.rangeSection.filters.showingPrefix}{" "}
                <strong>{visibleSubcategories.length}</strong>{" "}
                {visibleSubcategories.length === 1
                  ? t.rangeSection.filters.resultsSingle
                  : t.rangeSection.filters.resultsPlural}
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="filter-reset-btn"
                  onClick={resetFilters}
                >
                  <RotateCcw size={13} aria-hidden="true" />
                  <span>{t.rangeSection.filters.resetButton}</span>
                </button>
              )}
            </div>
          </div>

          {visibleSubcategories.length === 0 ? (
            <div className="filter-empty-state">
              <h3>{t.rangeSection.filters.noMatchesTitle}</h3>
              <p>{t.rangeSection.filters.noMatchesBody}</p>
              <button
                type="button"
                className="button button-dark"
                onClick={resetFilters}
              >
                <RotateCcw size={15} aria-hidden="true" />
                <span>{t.rangeSection.filters.resetButton}</span>
              </button>
            </div>
          ) : (
            <div
              className="subcategory-grid"
              data-count={visibleSubcategories.length}
            >
              {visibleSubcategories.map((subcategory) => (
                <SubcategoryCard
                  key={`${range.slug}-${subcategory.id}`}
                  categorySlug={range.slug}
                  rangeImage={range.image}
                  subcategory={subcategory}
                  activePriceFilter={priceFilter}
                  activeWeightFilter={weightFilter}
                />
              ))}
            </div>
          )}
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
            {ranges
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
