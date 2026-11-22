import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Globe, Menu, ShoppingBag, X } from "lucide-react";
import brandLogo from "@/assets/images/alkhaleyah-logo.png";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";
import { buildWhatsAppUrl, WHATSAPP_DISPLAY } from "@/lib/whatsapp";

export function BrandMark() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <Link href="/" className="brand" aria-label={t.brandHomeAria}>
      <span className="brand-logo-wrap">
        <img
          src={brandLogo}
          alt={lang === "ar" ? t.brandName : ""}
          className="brand-logo"
          referrerPolicy="no-referrer"
        />
      </span>
      {lang === "en" && <span className="brand-name">{t.brandName}</span>}
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

export function CartButton({ onOpen }: { onOpen?: () => void }) {
  const { lang } = useLanguage();
  const { totalCount, openCart } = useCart();
  const t = translations[lang];

  return (
    <button
      type="button"
      className="cart-trigger"
      onClick={() => {
        onOpen?.();
        openCart();
      }}
      aria-label={t.nav.cartAria}
      data-testid="cart-button"
    >
      <ShoppingBag size={15} aria-hidden="true" />
      <span className="cart-trigger-label">{t.nav.cartLabel}</span>
      {totalCount > 0 && (
        <span className="cart-badge" aria-hidden="true">
          {totalCount}
        </span>
      )}
    </button>
  );
}

function SectionLink({
  hash,
  className,
  onNavigate,
  children,
}: {
  hash: string;
  className?: string;
  onNavigate?: () => void;
  children: React.ReactNode;
}) {
  const [location] = useLocation();

  if (location === "/") {
    return (
      <a href={`#${hash}`} className={className} onClick={onNavigate}>
        {children}
      </a>
    );
  }

  return (
    <Link href={`/#${hash}`} className={className} onClick={onNavigate}>
      {children}
    </Link>
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
          <CartButton onOpen={close} />
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
          <SectionLink hash="our-range" onNavigate={close}>
            {t.nav.ourRange}
          </SectionLink>
          <SectionLink hash="our-story" onNavigate={close}>
            {t.nav.ourStory}
          </SectionLink>
          <SectionLink hash="contact" className="nav-cta" onNavigate={close}>
            {t.nav.getInTouch} <ArrowUpRight size={15} className="rtl-flip" />
          </SectionLink>
          <div className="desktop-cart-wrap">
            <CartButton onOpen={close} />
          </div>
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
          <SectionLink hash="our-range">{t.footer.exploreRange}</SectionLink>
          <SectionLink hash="our-story">{t.footer.about}</SectionLink>
          <SectionLink hash="contact">{t.footer.enquiries}</SectionLink>
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
          >
            {WHATSAPP_DISPLAY}
          </a>
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
