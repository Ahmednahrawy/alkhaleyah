import { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Globe, Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";

export function BrandMark() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <Link href="/" className="brand" aria-label={t.brandHomeAria}>
      <span className="brand-symbol" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="brand-name">{t.brandName}</span>
    </Link>
  );
}

export function LanguageSwitcher() {
  const { lang, toggleLang } = useLanguage();
  const t = translations[lang];

  return (
    <button
      type="button"
      className="lang-switch"
      onClick={toggleLang}
      aria-label={t.nav.switchLangAria}
      data-testid="language-switcher"
    >
      <Globe size={14} aria-hidden="true" />
      <span>{t.nav.switchLangLabel}</span>
    </button>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();
  const t = translations[lang];
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <BrandMark />
        <div className="header-controls">
          <div className="mobile-lang-wrap">
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            className="menu-toggle"
            aria-label={open ? t.nav.closeMenuAria : t.nav.openMenuAria}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <nav
          className={open ? "main-nav is-open" : "main-nav"}
          aria-label={t.nav.mainAria}
        >
          <a href="/#our-range" onClick={close}>
            {t.nav.ourRange}
          </a>
          <a href="/#our-story" onClick={close}>
            {t.nav.ourStory}
          </a>
          <a href="/#contact" className="nav-cta" onClick={close}>
            {t.nav.getInTouch} <ArrowUpRight size={15} className="rtl-flip" />
          </a>
          <div className="desktop-lang-wrap">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <BrandMark />
          <p className="footer-note">{t.footer.note}</p>
        </div>
        <div className="footer-links">
          <a href="/#our-range">{t.footer.exploreRange}</a>
          <a href="/#our-story">{t.footer.about}</a>
          <a href="/#contact">{t.footer.enquiries}</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {t.brandName}
        </span>
        <span>{t.footer.tagline}</span>
      </div>
    </footer>
  );
}
