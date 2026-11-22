import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Leaf,
  Package,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { getRangeCopy, productRanges } from "@/lib/catalog";
import { translations } from "@/lib/i18n";

export default function Home() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="site-shell">
      <div className="announcement">
        <span className="announcement-dot" /> {t.announcement}
      </div>
      <SiteHeader />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow light-eyebrow">
              <span /> {t.hero.eyebrow}
            </p>
            <h1 id="hero-title">
              {t.hero.titleLead}
              <br />
              <em>{t.hero.titleAccent}</em>
            </h1>
            <p className="hero-description">{t.hero.description}</p>
            <div className="hero-actions">
              <a className="button button-light" href="#our-range">
                {t.hero.ctaPrimary} <ArrowRight size={17} className="rtl-flip" />
              </a>
              <a className="text-link light-link" href="#our-story">
                {t.hero.ctaSecondary} <ArrowDown size={15} />
              </a>
            </div>
            <div className="hero-caption">
              <span>{t.hero.captionCount}</span>
              <span>{t.hero.captionText}</span>
            </div>
          </div>
          <div
            className="hero-image"
            role="img"
            aria-label={t.hero.imageAria}
          />
          <div className="hero-vertical-label">{t.hero.verticalLabel}</div>
        </section>

        <section className="intro-strip" aria-label={t.rangeSection.ariaLabel}>
          <p>{t.introStrip[0]}</p>
          <span className="intro-divider" />
          <p>{t.introStrip[1]}</p>
          <span className="intro-divider" />
          <p>{t.introStrip[2]}</p>
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
              <span className="handwritten-note">
                {t.rangeSection.asideNote} <ArrowDown size={16} />
              </span>
            </div>
          </div>
          <div className="range-grid">
            {productRanges.map((range, index) => {
              const copy = getRangeCopy(range, lang);
              const indexLabel =
                lang === "ar"
                  ? `٠${["١", "٢", "٣", "٤", "٥", "٦"][index] ?? index + 1}`
                  : `0${index + 1}`;
              return (
                <Link
                  key={range.slug}
                  href={`/products/${range.slug}`}
                  className={`range-card range-card-${range.tone}`}
                >
                  <div className="range-image-wrap">
                    <img
                      src={range.image}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <span className="range-index">{indexLabel}</span>
                    <span className="range-arrow" aria-hidden="true">
                      <ArrowUpRight size={20} className="rtl-flip" />
                    </span>
                  </div>
                  <div className="range-card-copy">
                    <span className="range-eyebrow">{copy.eyebrow}</span>
                    <h3>{copy.title}</h3>
                    <p>{copy.summary}</p>
                  </div>
                </Link>
              );
            })}
          </div>
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
            <p className="eyebrow light-eyebrow">
              <span /> {t.storySection.eyebrow}
            </p>
            <h2>
              {t.storySection.titleLead}
              <br />
              <em>{t.storySection.titleAccent}</em>
            </h2>
            <p className="story-body">{t.storySection.body}</p>
            <a className="text-link light-link" href="#contact">
              {t.storySection.cta} <ArrowRight size={16} className="rtl-flip" />
            </a>
            <span className="story-stamp">
              <Leaf size={22} />
              <span>
                {t.storySection.stampLine1}
                <br />
                {t.storySection.stampLine2}
              </span>
            </span>
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
              <span className="value-number">
                {t.valuesSection.items[0].num}
              </span>
            </article>
            <article className="value-item">
              <span className="value-icon">
                <Leaf size={19} />
              </span>
              <div>
                <h3>{t.valuesSection.items[1].title}</h3>
                <p>{t.valuesSection.items[1].body}</p>
              </div>
              <span className="value-number">
                {t.valuesSection.items[1].num}
              </span>
            </article>
            <article className="value-item">
              <span className="value-icon">
                <Sparkles size={19} />
              </span>
              <div>
                <h3>{t.valuesSection.items[2].title}</h3>
                <p>{t.valuesSection.items[2].body}</p>
              </div>
              <span className="value-number">
                {t.valuesSection.items[2].num}
              </span>
            </article>
          </div>
        </section>

        <TestimonialsSection />

        <section className="contact-section" id="contact">
          <div className="contact-inner">
            <div>
              <p className="eyebrow light-eyebrow">
                <span /> {t.contactSection.eyebrow}
              </p>
              <h2>
                {t.contactSection.titleLead}
                <br />
                <em>{t.contactSection.titleAccent}</em>
              </h2>
            </div>
            <div className="contact-aside">
              <p>{t.contactSection.body}</p>
              <p className="contact-note">{t.contactSection.note}</p>
              <a className="button button-light" href="#our-range">
                {t.contactSection.cta}{" "}
                <ArrowRight size={17} className="rtl-flip" />
              </a>
            </div>
            <span className="contact-orbit" aria-hidden="true">
              {t.contactSection.orbitChar}
            </span>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
