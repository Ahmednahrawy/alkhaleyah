import { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Menu, X } from "lucide-react";

export function BrandMark() {
  return (
    <Link href="/" className="brand" aria-label="Alkhaleyah home">
      <span className="brand-symbol" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="brand-name">Alkhaleyah</span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <BrandMark />
        <button
          type="button"
          className="menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
          <a href="/#our-range" onClick={close}>Our range</a>
          <a href="/#our-story" onClick={close}>Our story</a>
          <a href="/#contact" className="nav-cta" onClick={close}>Get in touch <ArrowUpRight size={15} /></a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <BrandMark />
          <p className="footer-note">Food products for the everyday table.</p>
        </div>
        <div className="footer-links">
          <a href="/#our-range">Explore the range</a>
          <a href="/#our-story">About Alkhaleyah</a>
          <a href="/#contact">Enquiries</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Alkhaleyah</span>
        <span>Food products · Made for sharing</span>
      </div>
    </footer>
  );
}
