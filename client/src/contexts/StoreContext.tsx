import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import {
  getSubcategoryMinPrice,
  productRanges as baseProductRanges,
  type CatalogSearchResult,
  type ProductRange,
  type ProductSubcategory,
  type ProductVariant,
} from "@/lib/catalog";
import { db } from "@/lib/firebase";
import { translations } from "@/lib/i18n";
import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/lib/whatsapp";

export type CatalogOverrideDoc = {
  productKey: string;
  categorySlug: string;
  subcategoryId: string;
  nameEn: string;
  nameAr: string;
  noteEn: string;
  noteAr: string;
  isActive: boolean;
  variants: ProductVariant[];
};

export type StoreSettingsState = {
  whatsappNumber: string;
  whatsappDisplay: string;
  announcementEn: string;
  announcementAr: string;
};

type StoreContextValue = {
  ranges: ProductRange[];
  allRangesWithHidden: ProductRange[];
  overridesByKey: Record<string, CatalogOverrideDoc>;
  storeSettings: StoreSettingsState;
  findRange: (slug?: string) => ProductRange | undefined;
  findVariant: (
    categorySlug: string,
    subcategoryId: string,
    variantId: string
  ) => {
    range: ProductRange | undefined;
    subcategory: ProductSubcategory | undefined;
    variant: ProductVariant | undefined;
  };
  searchRanges: (query: string) => CatalogSearchResult[];
  allSubcategoryEntries: CatalogSearchResult[];
  buildStoreWhatsAppUrl: (message?: string) => string;
};

const DEFAULT_SETTINGS: StoreSettingsState = {
  whatsappNumber: WHATSAPP_NUMBER,
  whatsappDisplay: WHATSAPP_DISPLAY,
  announcementEn: translations.en.announcement,
  announcementAr: translations.ar.announcement,
};

const legacySlugAliases: Record<string, string> = {
  "pantry-staples": "honey",
  "dates-dried-fruit": "dates",
  "spices-herbs": "olives",
  "grains-pulses": "olive-oil",
};

export function buildCatalogOverrideKey(
  categorySlug: string,
  subcategoryId: string
): string {
  return `${categorySlug}__${subcategoryId}`;
}

function mergeCatalog(
  overrides: Record<string, CatalogOverrideDoc>,
  includeHidden: boolean
): ProductRange[] {
  return baseProductRanges.map((baseRange) => {
    const baseSubIds = new Set(baseRange.subcategories.map((sub) => sub.id));
    const mergedSubs: ProductSubcategory[] = [];

    for (const sub of baseRange.subcategories) {
      const key = buildCatalogOverrideKey(baseRange.slug, sub.id);
      const override = overrides[key];
      if (!override) {
        mergedSubs.push(sub);
        continue;
      }
      if (!includeHidden && !override.isActive) {
        continue;
      }
      mergedSubs.push({
        id: sub.id,
        en: {
          name: override.nameEn || sub.en.name,
          note: override.noteEn ?? sub.en.note,
        },
        ar: {
          name: override.nameAr || sub.ar.name,
          note: override.noteAr ?? sub.ar.note,
        },
        variants:
          override.variants.length > 0 ? override.variants : sub.variants,
      });
    }

    for (const override of Object.values(overrides)) {
      if (
        override.categorySlug !== baseRange.slug ||
        baseSubIds.has(override.subcategoryId)
      ) {
        continue;
      }
      if (!includeHidden && !override.isActive) {
        continue;
      }
      mergedSubs.push({
        id: override.subcategoryId,
        en: {
          name: override.nameEn,
          note: override.noteEn,
        },
        ar: {
          name: override.nameAr,
          note: override.noteAr,
        },
        variants: override.variants,
      });
    }

    return {
      ...baseRange,
      subcategories: mergedSubs,
    };
  });
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [overridesByKey, setOverridesByKey] = useState<
    Record<string, CatalogOverrideDoc>
  >({});
  const [storeSettings, setStoreSettings] =
    useState<StoreSettingsState>(DEFAULT_SETTINGS);

  useEffect(() => {
    const unsubCatalog = onSnapshot(
      collection(db, "catalogOverrides"),
      (snapshot) => {
        const next: Record<string, CatalogOverrideDoc> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (
            data &&
            typeof data.categorySlug === "string" &&
            typeof data.subcategoryId === "string" &&
            Array.isArray(data.variants)
          ) {
            const validVariants: ProductVariant[] = data.variants
              .filter(
                (v): v is ProductVariant =>
                  Boolean(v) &&
                  typeof v.id === "string" &&
                  typeof v.en === "string" &&
                  typeof v.ar === "string" &&
                  typeof v.price === "number" &&
                  Number.isFinite(v.price) &&
                  v.price >= 0
              )
              .map((v) => ({
                id: v.id,
                en: v.en,
                ar: v.ar,
                price: v.price,
              }));
            if (validVariants.length > 0) {
              const key = buildCatalogOverrideKey(
                data.categorySlug,
                data.subcategoryId
              );
              next[key] = {
                productKey: key,
                categorySlug: data.categorySlug,
                subcategoryId: data.subcategoryId,
                nameEn: String(data.nameEn || ""),
                nameAr: String(data.nameAr || ""),
                noteEn: String(data.noteEn || ""),
                noteAr: String(data.noteAr || ""),
                isActive: data.isActive !== false,
                variants: validVariants,
              };
            }
          }
        });
        setOverridesByKey(next);
      },
      (error) => {
        console.warn("Catalog overrides listener:", error);
      }
    );

    const unsubSettings = onSnapshot(
      doc(db, "storeSettings", "public"),
      (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        setStoreSettings({
          whatsappNumber:
            typeof data.whatsappNumber === "string" &&
            data.whatsappNumber.trim()
              ? data.whatsappNumber.replace(/\D/g, "") || WHATSAPP_NUMBER
              : WHATSAPP_NUMBER,
          whatsappDisplay:
            typeof data.whatsappDisplay === "string" &&
            data.whatsappDisplay.trim()
              ? data.whatsappDisplay.trim()
              : WHATSAPP_DISPLAY,
          announcementEn:
            typeof data.announcementEn === "string" &&
            data.announcementEn.trim()
              ? data.announcementEn.trim()
              : translations.en.announcement,
          announcementAr:
            typeof data.announcementAr === "string" &&
            data.announcementAr.trim()
              ? data.announcementAr.trim()
              : translations.ar.announcement,
        });
      },
      (error) => {
        console.warn("Store settings listener:", error);
      }
    );

    return () => {
      unsubCatalog();
      unsubSettings();
    };
  }, []);

  const ranges = useMemo(
    () => mergeCatalog(overridesByKey, false),
    [overridesByKey]
  );

  const allRangesWithHidden = useMemo(
    () => mergeCatalog(overridesByKey, true),
    [overridesByKey]
  );

  const findRange = (slug?: string) => {
    if (!slug) return undefined;
    const resolved = legacySlugAliases[slug] ?? slug;
    return ranges.find((item) => item.slug === resolved);
  };

  const findVariant = (
    categorySlug: string,
    subcategoryId: string,
    variantId: string
  ) => {
    const range = findRange(categorySlug);
    const subcategory = range?.subcategories.find(
      (sub) => sub.id === subcategoryId
    );
    const variant = subcategory?.variants.find((v) => v.id === variantId);
    return { range, subcategory, variant };
  };

  const allSubcategoryEntries = useMemo<CatalogSearchResult[]>(
    () =>
      ranges.flatMap((range) =>
        range.subcategories.map((subcategory) => ({
          range,
          subcategory,
          minPrice: getSubcategoryMinPrice(subcategory),
        }))
      ),
    [ranges]
  );

  const searchRanges = (query: string): CatalogSearchResult[] => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    const results: CatalogSearchResult[] = [];

    for (const range of ranges) {
      for (const subcategory of range.subcategories) {
        const searchable = [
          range.slug,
          range.en.title,
          range.en.eyebrow,
          range.en.summary,
          range.ar.title,
          range.ar.eyebrow,
          range.ar.summary,
          subcategory.en.name,
          subcategory.en.note,
          subcategory.ar.name,
          subcategory.ar.note,
          ...subcategory.variants.map((v) => `${v.en} ${v.ar}`),
        ]
          .join(" ")
          .toLowerCase();

        if (tokens.every((token) => searchable.includes(token))) {
          results.push({
            range,
            subcategory,
            minPrice: getSubcategoryMinPrice(subcategory),
          });
        }
      }
    }
    return results;
  };

  const buildStoreWhatsAppUrl = (message?: string) => {
    const digits = storeSettings.whatsappNumber.replace(/\D/g, "") || WHATSAPP_NUMBER;
    const base = `https://wa.me/${digits}`;
    if (!message) return base;
    return `${base}?text=${encodeURIComponent(message)}`;
  };

  return (
    <StoreContext.Provider
      value={{
        ranges,
        allRangesWithHidden,
        overridesByKey,
        storeSettings,
        findRange,
        findVariant,
        searchRanges,
        allSubcategoryEntries,
        buildStoreWhatsAppUrl,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return ctx;
}
