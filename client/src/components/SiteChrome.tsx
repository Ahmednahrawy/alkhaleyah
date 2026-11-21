import { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { publicPath } from "@/lib/publicPath";

export function BrandMark() {
  const { locale } = useLocale();
  return (
    <Link href="/" className="brand" aria-label={locale === "ar" ? "الخالقية - الصفحة الرئيسية" : "Alkhaleyah home"}>
      <span className="brand-symbol" aria-hidden="true"><span /><span /><span /></span>
      <span className="brand-name">Alkhaleyah</span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { locale, toggleLocale } = useLocale();
  const close = () => setOpen(false);
  const ar = locale === "ar";

  return (
    <header className="site-header">
      <div className="header-inner">
        <BrandMark />
        <div className="header-actions">
          <button type="button" className="language-toggle" onClick={toggleLocale} aria-label={ar ? "Switch language to English" : "تغيير اللغة إلى العربية"} lang={ar ? "en" : "ar"}>
            {ar ? "English" : "العربية"}
          </button>
          <button type="button" className="menu-toggle" aria-label={open ? (ar ? "إغلاق القائمة" : "Close navigation") : (ar ? "فتح القائمة" : "Open navigation")} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <nav className={open ? "main-nav is-open" : "main-nav"} aria-label={ar ? "التنقل الرئيسي" : "Main navigation"}>
          <a href={publicPath("#our-range")} onClick={close}>{ar ? "منتجاتنا" : "Our range"}</a>
          <a href={publicPath("#our-story")} onClick={close}>{ar ? "قصتنا" : "Our story"}</a>
          <a href={publicPath("#contact")} className="nav-cta" onClick={close}>{ar ? "تواصل معنا" : "Get in touch"} <ArrowUpRight size={15} /></a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { locale } = useLocale();
  const ar = locale === "ar";
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <BrandMark />
          <p className="footer-note">{ar ? "منتجات غذائية لمائدة كل يوم." : "Food products for the everyday table."}</p>
        </div>
        <div className="footer-links">
          <a href={publicPath("#our-range")}>{ar ? "اكتشفوا المنتجات" : "Explore the range"}</a>
          <a href={publicPath("#our-story")}>{ar ? "عن الخالقية" : "About Alkhaleyah"}</a>
          <a href={publicPath("#contact")}>{ar ? "للاستفسارات" : "Enquiries"}</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Alkhaleyah</span>
        <span>{ar ? "منتجات غذائية · صُنعت لتُشارك" : "Food products · Made for sharing"}</span>
      </div>
    </footer>
  );
}
