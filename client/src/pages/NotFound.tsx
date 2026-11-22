import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";

// Render for unknown client routes without escaping a repository subpath on static hosts.
export default function NotFound() {
  const { lang } = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);

    return () => robots.remove();
  }, []);

  return (
    <div className="site-shell">
      <div className="announcement">
        <span className="announcement-dot" /> {t.announcement}
      </div>
      <SiteHeader />
      <main className="not-found">
        <p className="eyebrow">
          <span /> 404
        </p>
        <h1>
          {t.notFoundPage.title}
        </h1>
        <p>{t.notFoundPage.description}</p>
        <Link className="button button-dark" href="/">
          <ArrowLeft size={17} className="rtl-flip" /> {t.notFoundPage.goHome}
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
