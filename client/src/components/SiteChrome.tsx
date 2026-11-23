import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowUpRight,
  Globe,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import brandLogo from "@/assets/images/alkhaleyah-logo.png";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
  formatPrice,
  getRangeCopy,
  searchCatalog,
} from "@/lib/catalog";
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

export function WishlistButton({ onOpen }: { onOpen?: () => void }) {
  const { lang } = useLanguage();
  const { totalCount, openWishlist } = useWishlist();
  const t = translations[lang];

  return (
    <button
      type="button"
      className="cart-trigger wishlist-trigger"
      onClick={() => {
        onOpen?.();
        openWishlist();
      }}
      aria-label={t.nav.wishlistAria}
      data-testid="wishlist-button"
    >
      <Heart size={15} aria-hidden="true" />
      <span className="cart-trigger-label">{t.nav.wishlistLabel}</span>
      {totalCount > 0 && (
        <span className="cart-badge" aria-hidden="true">
          {totalCount}
        </span>
      )}
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

function HeaderSearch({
  query,
  setQuery,
  isFocused,
  setIsFocused,
  onAfterSelect,
  inputRef,
}: {
  query: string;
  setQuery: (val: string) => void;
  isFocused: boolean;
  setIsFocused: (val: boolean) => void;
  onAfterSelect?: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const { lang } = useLanguage();
  const { openQuickAdd } = useCart();
  const [, setLocation] = useLocation();
  const n = translations[lang].nav;

  const trimmed = query.trim();
  const results = trimmed ? searchCatalog(trimmed) : [];
  const showDropdown = isFocused && trimmed.length > 0;

  const handleNavigate = (href: string) => {
    setIsFocused(false);
    setQuery("");
    onAfterSelect?.();
    setLocation(href);
  };

  return (
    <div className="header-search-box">
      <div className="header-search-field">
        <Search size={15} className="header-search-icon" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsFocused(false);
            } else if (e.key === "Enter" && results.length > 0) {
              e.preventDefault();
              const top = results[0];
              handleNavigate(
                `/products/${top.range.slug}#variety-${top.subcategory.id}`
              );
            }
          }}
          placeholder={n.searchPlaceholder}
          aria-label={n.searchAria}
          className="header-search-input"
          data-testid="header-search-input"
        />
        {query && (
          <button
            type="button"
            className="header-search-clear"
            onClick={() => setQuery("")}
            aria-label={n.searchClearAria}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          className="header-search-results"
          role="region"
          aria-live="polite"
        >
          {results.length === 0 ? (
            <p className="header-search-empty">{n.searchNoResults}</p>
          ) : (
            <ul className="header-search-list">
              {results.slice(0, 7).map(({ range, subcategory, minPrice }) => {
                const rangeCopy = getRangeCopy(range, lang);
                const href = `/products/${range.slug}#variety-${subcategory.id}`;
                return (
                  <li
                    key={`${range.slug}-${subcategory.id}`}
                    className="header-search-item"
                  >
                    <Link
                      href={href}
                      className="header-search-item-link"
                      onClick={() => {
                        setIsFocused(false);
                        setQuery("");
                        onAfterSelect?.();
                      }}
                    >
                      <img
                        src={range.image}
                        alt=""
                        className="header-search-thumb"
                        referrerPolicy="no-referrer"
                      />
                      <div className="header-search-item-text">
                        <span className="header-search-cat">
                          {rangeCopy.title}
                        </span>
                        <strong>{subcategory[lang].name}</strong>
                        <span className="header-search-price">
                          {n.searchFromPrefix} {formatPrice(minPrice, lang)}
                        </span>
                      </div>
                    </Link>
                    <button
                      type="button"
                      className="header-search-add-btn"
                      onClick={() => {
                        setIsFocused(false);
                        onAfterSelect?.();
                        openQuickAdd(range, subcategory.id);
                      }}
                    >
                      <ShoppingBag size={13} aria-hidden="true" />
                      <span>{n.searchQuickAddLabel}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const { lang } = useLanguage();
  const t = translations[lang];
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen) {
      requestAnimationFrame(() => mobileInputRef.current?.focus());
    }
  }, [mobileSearchOpen]);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="header-inner">
        <BrandMark />

        <div className="desktop-search-wrap">
          <HeaderSearch
            query={searchQuery}
            setQuery={setSearchQuery}
            isFocused={searchFocused}
            setIsFocused={setSearchFocused}
          />
        </div>

        <div className="header-controls">
          <button
            type="button"
            className="mobile-search-toggle"
            aria-label={t.nav.searchToggleAria}
            aria-expanded={mobileSearchOpen}
            onClick={() => {
              setMobileSearchOpen((prev) => !prev);
              setOpen(false);
            }}
          >
            {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
          <WishlistButton onOpen={closeMenu} />
          <CartButton onOpen={closeMenu} />
          <div className="mobile-lang-wrap">
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            className="menu-toggle"
            aria-label={open ? t.nav.closeMenuAria : t.nav.openMenuAria}
            aria-expanded={open}
            onClick={() => {
              setOpen(!open);
              setMobileSearchOpen(false);
            }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <nav
          className={open ? "main-nav is-open" : "main-nav"}
          aria-label={t.nav.mainAria}
        >
          <SectionLink hash="our-range" onNavigate={closeMenu}>
            {t.nav.ourRange}
          </SectionLink>
          <SectionLink hash="our-story" onNavigate={closeMenu}>
            {t.nav.ourStory}
          </SectionLink>
          <SectionLink hash="order-tracking" onNavigate={closeMenu}>
            {t.nav.trackOrder}
          </SectionLink>
          <SectionLink hash="contact" className="nav-cta" onNavigate={closeMenu}>
            {t.nav.getInTouch} <ArrowUpRight size={15} className="rtl-flip" />
          </SectionLink>
          <div className="desktop-cart-wrap">
            <WishlistButton onOpen={closeMenu} />
          </div>
          <div className="desktop-cart-wrap">
            <CartButton onOpen={closeMenu} />
          </div>
          <div className="desktop-lang-wrap">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>

      {mobileSearchOpen && (
        <div className="mobile-search-bar">
          <HeaderSearch
            query={searchQuery}
            setQuery={setSearchQuery}
            isFocused={searchFocused}
            setIsFocused={setSearchFocused}
            inputRef={mobileInputRef}
            onAfterSelect={() => setMobileSearchOpen(false)}
          />
        </div>
      )}
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
          <SectionLink hash="order-tracking">{t.footer.trackOrder}</SectionLink>
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
