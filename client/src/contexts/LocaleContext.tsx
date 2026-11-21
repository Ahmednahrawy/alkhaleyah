import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "en" | "ar";
type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; toggleLocale: () => void };

const LocaleContext = createContext<LocaleContextValue | null>(null);

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem("alkhaleyah-locale");
    if (saved === "ar" || saved === "en") return saved;
  } catch { /* storage may be unavailable */ }
  return "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem("alkhaleyah-locale", locale); } catch { /* storage may be unavailable */ }
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, toggleLocale: () => setLocale((current) => current === "en" ? "ar" : "en") }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider");
  return value;
}
