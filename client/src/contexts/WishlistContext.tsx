import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { findProductRange } from "@/lib/catalog";

export type WishlistItem = {
  key: string;
  categorySlug: string;
  subcategoryId: string;
  preferredVariantId?: string;
  addedAt: number;
};

type WishlistContextValue = {
  items: WishlistItem[];
  totalCount: number;
  isOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlistDrawer: () => void;
  hasItem: (categorySlug: string, subcategoryId: string) => boolean;
  toggleItem: (
    categorySlug: string,
    subcategoryId: string,
    preferredVariantId?: string
  ) => void;
  removeItem: (key: string) => void;
  clearWishlist: () => void;
};

const STORAGE_KEY = "alkhaleyah-wishlist";

export function buildWishlistKey(categorySlug: string, subcategoryId: string) {
  return `${categorySlug}::${subcategoryId}`;
}

function loadInitialWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const valid: WishlistItem[] = [];

    for (const entry of parsed) {
      if (
        !entry ||
        typeof entry.categorySlug !== "string" ||
        typeof entry.subcategoryId !== "string"
      ) {
        continue;
      }
      const range = findProductRange(entry.categorySlug);
      const sub = range?.subcategories.find(
        (item) => item.id === entry.subcategoryId
      );
      if (!range || !sub) continue;

      const key = buildWishlistKey(range.slug, sub.id);
      if (seen.has(key)) continue;
      seen.add(key);

      valid.push({
        key,
        categorySlug: range.slug,
        subcategoryId: sub.id,
        preferredVariantId:
          typeof entry.preferredVariantId === "string" &&
          sub.variants.some((v) => v.id === entry.preferredVariantId)
            ? entry.preferredVariantId
            : sub.variants[0]?.id,
        addedAt: typeof entry.addedAt === "number" ? entry.addedAt : Date.now(),
      });
    }

    return valid;
  } catch {
    return [];
  }
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(loadInitialWishlist);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota or private-mode restrictions
    }
  }, [items]);

  const openWishlist = () => setIsOpen(true);
  const closeWishlist = () => setIsOpen(false);
  const toggleWishlistDrawer = () => setIsOpen((prev) => !prev);

  const hasItem = (categorySlug: string, subcategoryId: string) => {
    const key = buildWishlistKey(categorySlug, subcategoryId);
    return items.some((item) => item.key === key);
  };

  const toggleItem = (
    categorySlug: string,
    subcategoryId: string,
    preferredVariantId?: string
  ) => {
    const key = buildWishlistKey(categorySlug, subcategoryId);
    setItems((prev) => {
      const exists = prev.some((item) => item.key === key);
      if (exists) {
        return prev.filter((item) => item.key !== key);
      }
      return [
        {
          key,
          categorySlug,
          subcategoryId,
          preferredVariantId,
          addedAt: Date.now(),
        },
        ...prev,
      ];
    });
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const clearWishlist = () => setItems([]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalCount: items.length,
        isOpen,
        openWishlist,
        closeWishlist,
        toggleWishlistDrawer,
        hasItem,
        toggleItem,
        removeItem,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }
  return ctx;
}
