import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Leaf,
  MessageCircle,
  Package,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ContactInquiryForm } from "@/components/ContactInquiryForm";
import { SubcategoryCard } from "@/components/SubcategoryCard";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  formatPrice,
  getRangeCopy,
  getRangeMinPrice,
  productRanges,
} from "@/lib/catalog";
import { translations } from "@/lib/i18n";
import { buildWhatsAppUrl, WHATSAPP_DISPLAY } from "@/lib/whatsapp";

export default function Home() {
  const { lang } = useLanguage();
  const { openQuickAdd } = useCart();
  const t = translations[lang];
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const selectedRange =
    activeCategory === "all"
      ? null
      : productRanges.find((item) => item.slug === activeCategory) ?? null;

  return (
    <div className="site-shell">
      <div className="announcement">{t.announcement}</div>
      <SiteHeader />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> {t.hero.eyebrow}
            </p>
            <h1 id="hero-title">
              {t.hero.titleLead}
              <br />
              <em>{t.hero.titleAccent}</em>
            </h1>
            <p className="hero-description">{t.hero.description}</p>
            <div className="hero-actions">
              <a className="button button-dark" href="#our-range">
                {t.hero.ctaPrimary} <ArrowRight size={17} className="rtl-flip" />
              </a>
              <a className="text-link" href="#our-story">
                {t.hero.ctaSecondary} <ArrowDown size={15} />
              </a>
            </div>
          </div>
          <div
            className="hero-image"
            role="img"
            aria-label={t.hero.imageAria}
          />
        </section>

        <section className="range-section section-pad" id="our-range">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span /> {t.rangeSection.eyebrow}
              </p>
              <h2>
                {t.rangeSection.titleLead}
                <br />
                <em>{t.rangeSection.titleAccent}</em>
              </h2>
            </div>
            <div className="section-aside">
              <p>{t.rangeSection.asideBody}</p>
            </div>
          </div>

          <div
            className="category-tabs"
            role="tablist"
            aria-label={t.rangeSection.ariaLabel}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "all"}
              className={
                activeCategory === "all"
                  ? "category-tab is-active"
                  : "category-tab"
              }
              onClick={() => setActiveCategory("all")}
            >
              {t.rangeSection.allCategoriesTab}
            </button>
            {productRanges.map((range) => {
              const copy = getRangeCopy(range, lang);
              const isSelected = activeCategory === range.slug;
              return (
                <button
                  key={range.slug}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={
                    isSelected ? "category-tab is-active" : "category-tab"
                  }
                  onClick={() => setActiveCategory(range.slug)}
                >
                  {copy.title}
                </button>
              );
            })}
          </div>

          {selectedRange ? (
            <div className="home-selected-range">
              <div className="home-selected-range-bar">
                <div className="home-selected-range-info">
                  <img
                    src={selectedRange.image}
                    alt={getRangeCopy(selectedRange, lang).imageAlt}
                    className="home-selected-range-thumb"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3>{getRangeCopy(selectedRange, lang).title}</h3>
                    <p>{getRangeCopy(selectedRange, lang).detail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-link home-show-all-btn"
                  onClick={() => setActiveCategory("all")}
                >
                  {t.rangeSection.viewAllCategories}
                </button>
              </div>

              <div className="subcategory-grid">
                {selectedRange.subcategories.map((subcategory) => (
                  <SubcategoryCard
                    key={`${selectedRange.slug}-${subcategory.id}`}
                    categorySlug={selectedRange.slug}
                    subcategory={subcategory}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="range-grid">
              {productRanges.map((range) => {
                const copy = getRangeCopy(range, lang);
                const minPrice = getRangeMinPrice(range);
                return (
                  <article
                    key={range.slug}
                    className={`range-card range-card-${range.tone}`}
                  >
                    <Link
                      href={`/products/${range.slug}`}
                      className="range-card-link"
                    >
                      <div className="range-image-wrap">
                        <img
                          src={range.image}
                          alt={copy.imageAlt}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <span className="range-arrow" aria-hidden="true">
                          <ArrowUpRight size={18} className="rtl-flip" />
                        </span>
                      </div>
                      <div className="range-card-copy">
                        <span className="range-meta tabular-nums">
                          {range.subcategories.length}{" "}
                          {t.rangeSection.varietiesCountSuffix} ·{" "}
                          {t.rangeSection.fromPricePrefix}{" "}
                          {formatPrice(minPrice, lang)}
                        </span>
                        <h3>{copy.title}</h3>
                        <p>{copy.summary}</p>
                      </div>
                    </Link>
                    <div className="range-card-actions">
                      <button
                        type="button"
                        className="range-quick-add"
                        onClick={() => openQuickAdd(range)}
                      >
                        <ShoppingBag size={14} aria-hidden="true" />
                        <span>{t.rangeSection.quickAdd}</span>
                      </button>
                      <Link
                        href={`/products/${range.slug}`}
                        className="range-explore-link"
                      >
                        <span>{t.rangeSection.viewCategory}</span>
                        <ArrowRight size={13} className="rtl-flip" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="range-footnote">
            <span className="footnote-line" /> {t.rangeSection.footnote}
          </div>
        </section>

        <section className="story-section" id="our-story">
          <div
            className="story-image"
            role="img"
            aria-label={t.storySection.imageAria}
          />
          <div className="story-copy">
            <p className="eyebrow">
              <span /> {t.storySection.eyebrow}
            </p>
            <h2>
              {t.storySection.titleLead}
              <br />
              <em>{t.storySection.titleAccent}</em>
            </h2>
            <p className="story-body">{t.storySection.body}</p>
            <a className="text-link" href="#contact">
              {t.storySection.cta}{" "}
              <ArrowRight size={16} className="rtl-flip" />
            </a>
          </div>
        </section>

        <section className="values-section section-pad">
          <div className="values-title">
            <p className="eyebrow">
              <span /> {t.valuesSection.eyebrow}
            </p>
            <h2>
              {t.valuesSection.titleLead}
              <br />
              <em>{t.valuesSection.titleAccent}</em>
            </h2>
          </div>
          <div className="values-list">
            <article className="value-item">
              <span className="value-icon">
                <Package size={19} />
              </span>
              <div>
                <h3>{t.valuesSection.items[0].title}</h3>
                <p>{t.valuesSection.items[0].body}</p>
              </div>
            </article>
            <article className="value-item">
              <span className="value-icon">
                <Leaf size={19} />
              </span>
              <div>
                <h3>{t.valuesSection.items[1].title}</h3>
                <p>{t.valuesSection.items[1].body}</p>
              </div>
            </article>
            <article className="value-item">
              <span className="value-icon">
                <Sparkles size={19} />
              </span>
              <div>
                <h3>{t.valuesSection.items[2].title}</h3>
                <p>{t.valuesSection.items[2].body}</p>
              </div>
            </article>
          </div>
        </section>

        <TestimonialsSection />

        <section className="contact-section" id="contact">
          <div className="contact-inner">
            <div className="contact-copy-col">
              <p className="eyebrow light-eyebrow">
                <span /> {t.contactSection.eyebrow}
              </p>
              <h2>
                {t.contactSection.titleLead}
                <br />
                <em>{t.contactSection.titleAccent}</em>
              </h2>
              <p className="contact-lead">{t.contactSection.body}</p>
              <p className="contact-note">{t.contactSection.note}</p>
              <div className="contact-direct-links">
                <a
                  className="contact-whatsapp-link"
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={17} aria-hidden="true" />
                  <span>{t.contactSection.whatsappDirectLabel}:</span>
                  <strong dir="ltr">{WHATSAPP_DISPLAY}</strong>
                </a>
                <a className="text-link light-link" href="#our-range">
                  {t.contactSection.cta}{" "}
                  <ArrowRight size={15} className="rtl-flip" />
                </a>
              </div>
            </div>
            <div className="contact-aside">
              <ContactInquiryForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
