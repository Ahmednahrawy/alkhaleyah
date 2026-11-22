import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useRoute } from "wouter";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { SubcategoryCard } from "@/components/SubcategoryCard";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  findProductRange,
  getRangeCopy,
  productRanges,
} from "@/lib/catalog";
import { translations } from "@/lib/i18n";

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
      <div className="announcement">{t.announcement}</div>
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
            {range.subcategories.map((subcategory) => (
              <SubcategoryCard
                key={`${range.slug}-${subcategory.id}`}
                categorySlug={range.slug}
                subcategory={subcategory}
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
