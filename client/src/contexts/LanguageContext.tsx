import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "ar";

interface LanguageContextValue {
  lang: Language;
  dir: "ltr" | "rtl";
  isRtl: boolean;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

const STORAGE_KEY = "alkhaleyah-lang";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";

  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get("lang");
  if (queryLang === "ar" || queryLang === "en") {
    return queryLang;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ar" || saved === "en") {
      return saved;
    }
  } catch {
    // localStorage unavailable
  }

  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLanguage);

  const dir = lang === "ar" ? "rtl" : "ltr";
  const isRtl = lang === "ar";

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;

    document.title =
      lang === "ar"
        ? "الخلية | منتجات غذائية لمائدة كل يوم"
        : "Alkhaleyah | Food Products for Everyday Tables";

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        lang === "ar"
          ? "اكتشف منتجات الخلية الغذائية وتصفّح تشكيلة مدروسة للمطابخ اليومية والعملاء وشركاء التجارة."
          : "Discover Alkhaleyah's food products and explore a considered range for everyday kitchens, customers, and trade partners."
      );
    }

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage unavailable
    }
  }, [lang, dir]);

  const setLang = (next: Language) => {
    setLangState(next);
  };

  const toggleLang = () => {
    setLangState((prev) => (prev === "en" ? "ar" : "en"));
  };

  return (
    <LanguageContext.Provider value={{ lang, dir, isRtl, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
