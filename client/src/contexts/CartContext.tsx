import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { findSubcategoryAndVariant, type ProductRange } from "@/lib/catalog";

export type CartItem = {
  key: string;
  categorySlug: string;
  subcategoryId: string;
  variantId: string;
  quantity: number;
};

export type QuickAddTarget = {
  range: ProductRange;
  initialSubcategoryId?: string;
};

type CartContextValue = {
  items: CartItem[];
  totalCount: number;
  subtotal: number;
  isOpen: boolean;
  quickAddTarget: QuickAddTarget | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openQuickAdd: (range: ProductRange, initialSubcategoryId?: string) => void;
  closeQuickAdd: () => void;
  addItem: (
    categorySlug: string,
    subcategoryId: string,
    variantId: string,
    quantity?: number
  ) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "alkhaleyah-cart";

function buildCartKey(categorySlug: string, subcategoryId: string, variantId: string) {
  return `${categorySlug}::${subcategoryId}::${variantId}`;
}

function loadInitialCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is CartItem => {
      if (
        !entry ||
        typeof entry.categorySlug !== "string" ||
        typeof entry.subcategoryId !== "string" ||
        typeof entry.variantId !== "string" ||
        typeof entry.quantity !== "number" ||
        entry.quantity < 1
      ) {
        return false;
      }
      const resolved = findSubcategoryAndVariant(
        entry.categorySlug,
        entry.subcategoryId,
        entry.variantId
      );
      return Boolean(resolved.range && resolved.subcategory && resolved.variant);
    });
  } catch {
    return [];
  }
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadInitialCart);
  const [isOpen, setIsOpen] = useState(false);
  const [quickAddTarget, setQuickAddTarget] = useState<QuickAddTarget | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota or private-mode restrictions
    }
  }, [items]);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const resolved = findSubcategoryAndVariant(
      item.categorySlug,
      item.subcategoryId,
      item.variantId
    );
    const unitPrice = resolved.variant?.price ?? 0;
    return sum + unitPrice * item.quantity;
  }, 0);

  const openCart = () => {
    setQuickAddTarget(null);
    setIsOpen(true);
  };
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const openQuickAdd = (range: ProductRange, initialSubcategoryId?: string) => {
    setIsOpen(false);
    setQuickAddTarget({ range, initialSubcategoryId });
  };
  const closeQuickAdd = () => setQuickAddTarget(null);

  const addItem = (
    categorySlug: string,
    subcategoryId: string,
    variantId: string,
    quantity = 1
  ) => {
    const safeQty = Math.max(1, Math.floor(quantity));
    const key = buildCartKey(categorySlug, subcategoryId, variantId);
    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + safeQty }
            : item
        );
      }
      return [
        ...prev,
        {
          key,
          categorySlug,
          subcategoryId,
          variantId,
          quantity: safeQty,
        },
      ];
    });
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((item) => item.key !== key));
      return;
    }
    const safeQty = Math.floor(quantity);
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, quantity: safeQty } : item
      )
    );
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        subtotal,
        isOpen,
        quickAddTarget,
        openCart,
        closeCart,
        toggleCart,
        openQuickAdd,
        closeQuickAdd,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
