import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { findProductRange } from "@/lib/catalog";
import { db } from "@/lib/firebase";

export type OrderStatusStep =
  | "received"
  | "confirmed"
  | "preparing"
  | "dispatched"
  | "delivered";

export const ORDER_STATUS_SEQUENCE: OrderStatusStep[] = [
  "received",
  "confirmed",
  "preparing",
  "dispatched",
  "delivered",
];

export type TrackedOrder = {
  referenceId: string;
  kind: "inquiry" | "order";
  orderType: "home" | "trade";
  customerName: string;
  itemsSummary: string[];
  subtotal?: number;
  status: OrderStatusStep;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  isSample?: boolean;
};

export const SAMPLE_ORDERS: TrackedOrder[] = [
  {
    referenceId: "ALK-1041",
    kind: "order",
    orderType: "home",
    customerName: "Nadia M.",
    itemsSummary: [
      "Fine dates — Medjool Dates (3 kg × 1)",
      "Natural honey — Sidr Honey (1 kg × 1)",
    ],
    subtotal: 2120,
    status: "preparing",
    createdAt: "2026-11-22T09:15:00.000Z",
    updatedAt: "2026-11-23T08:40:00.000Z",
    isSample: true,
  },
  {
    referenceId: "ALK-1042",
    kind: "order",
    orderType: "home",
    customerName: "Tariq H.",
    itemsSummary: [
      "Olive oil — Extra Virgin First Cold Press (1 liter × 2)",
      "Fine dates — Sukkary Dates (5 kg × 1)",
    ],
    subtotal: 2560,
    status: "dispatched",
    createdAt: "2026-11-21T14:20:00.000Z",
    updatedAt: "2026-11-23T10:10:00.000Z",
    isSample: true,
  },
  {
    referenceId: "ALK-1043",
    kind: "inquiry",
    orderType: "trade",
    customerName: "Salma K.",
    itemsSummary: ["Natural honey", "Fine dates", "Olive oil"],
    status: "delivered",
    createdAt: "2026-11-18T11:00:00.000Z",
    updatedAt: "2026-11-20T16:30:00.000Z",
    isSample: true,
  },
];

const ORDERS_STORAGE_KEY = "alkhaleyah-orders";
export const ORDERS_UPDATED_EVENT = "alkhaleyah-orders-updated";
export const TRACK_ORDER_EVENT = "alkhaleyah-track-order";

export function normalizeReferenceId(raw: string): string {
  return raw.trim().toUpperCase();
}

export function isValidReferenceId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{4,64}$/.test(id);
}

export function createClientReferenceId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `ALK-${timestamp}${suffix}`;
}

export function timestampToIso(value: unknown, fallback = new Date().toISOString()): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return fallback;
}

export function getSavedLocalOrders(): TrackedOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is TrackedOrder =>
        Boolean(entry) &&
        typeof entry.referenceId === "string" &&
        typeof entry.status === "string" &&
        Array.isArray(entry.itemsSummary)
    );
  } catch {
    return [];
  }
}

export function saveOrderLocally(order: TrackedOrder): TrackedOrder {
  const normalized: TrackedOrder = {
    ...order,
    referenceId: normalizeReferenceId(order.referenceId),
  };
  if (typeof window !== "undefined") {
    try {
      const existing = getSavedLocalOrders().filter(
        (item) =>
          normalizeReferenceId(item.referenceId) !== normalized.referenceId
      );
      const next = [normalized, ...existing].slice(0, 12);
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(ORDERS_UPDATED_EVENT));
    } catch {
      // Ignore storage errors
    }
  }
  return normalized;
}

async function saveOrderToFirestore(
  order: TrackedOrder,
  privateContact: {
    fullName: string;
    phone: string;
    email: string;
    notes: string;
  }
): Promise<void> {
  const refId = normalizeReferenceId(order.referenceId);
  if (!isValidReferenceId(refId)) return;

  const safeSummary = order.itemsSummary
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 30);
  if (safeSummary.length === 0) return;

  const orderDoc: Record<string, unknown> = {
    referenceId: refId,
    kind: order.kind,
    orderType: order.orderType,
    customerName: (order.customerName.trim() || "Customer").slice(0, 80),
    itemsSummary: safeSummary,
    status: "received",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (
    typeof order.subtotal === "number" &&
    Number.isFinite(order.subtotal) &&
    order.subtotal >= 0 &&
    order.subtotal <= 10000000
  ) {
    orderDoc.subtotal = order.subtotal;
  }

  try {
    const orderRef = doc(db, "orders", refId);
    await setDoc(orderRef, orderDoc);
    const contactRef = doc(db, "orders", refId, "private", "contact");
    await setDoc(contactRef, {
      fullName: privateContact.fullName.trim().slice(0, 120),
      phone: privateContact.phone.trim().slice(0, 40),
      email: privateContact.email.trim().slice(0, 180),
      notes: privateContact.notes.trim().slice(0, 2000),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // Graceful fallback when running offline or in test environments
    console.warn("Firestore order sync warning:", error);
  }
}

export async function recordCartOrder(input: {
  referenceId: string;
  orderType: "home" | "trade";
  customerName: string;
  phone: string;
  email: string;
  itemsSummary: string[];
  subtotal: number;
  notes: string;
}): Promise<TrackedOrder> {
  const now = new Date().toISOString();
  let finalRecord: TrackedOrder = {
    referenceId: normalizeReferenceId(input.referenceId),
    kind: "order",
    orderType: input.orderType,
    customerName: input.customerName.trim() || "WhatsApp customer",
    itemsSummary: input.itemsSummary,
    subtotal: input.subtotal,
    status: "received",
    createdAt: now,
    updatedAt: now,
    notes: input.notes.trim() || undefined,
  };

  saveOrderLocally(finalRecord);

  try {
    const endpoint = `${import.meta.env.BASE_URL}api/orders`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referenceId: finalRecord.referenceId,
        orderType: input.orderType,
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        email: input.email.trim(),
        items: input.itemsSummary,
        subtotal: input.subtotal,
        notes: input.notes.trim(),
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { order?: TrackedOrder };
      if (data.order?.referenceId) {
        finalRecord = saveOrderLocally(data.order);
      }
    }
  } catch {
    // Graceful fallback when running on static hosting
  }

  await saveOrderToFirestore(finalRecord, {
    fullName: input.customerName.trim() || finalRecord.customerName,
    phone: input.phone,
    email: input.email,
    notes: input.notes,
  });

  return finalRecord;
}

export async function recordInquiryOrder(input: {
  referenceId: string;
  orderType: "home" | "trade";
  customerName: string;
  phone: string;
  email: string;
  itemsSummary: string[];
  notes: string;
}): Promise<TrackedOrder> {
  const now = new Date().toISOString();
  const record: TrackedOrder = {
    referenceId: normalizeReferenceId(input.referenceId),
    kind: "inquiry",
    orderType: input.orderType,
    customerName: input.customerName.trim() || "Customer",
    itemsSummary: input.itemsSummary,
    status: "received",
    createdAt: now,
    updatedAt: now,
    notes: input.notes.trim() || undefined,
  };

  saveOrderLocally(record);

  await saveOrderToFirestore(record, {
    fullName: input.customerName,
    phone: input.phone,
    email: input.email,
    notes: input.notes,
  });

  return record;
}

export async function lookupTrackedOrder(
  rawReferenceId: string
): Promise<TrackedOrder | null> {
  const normalizedId = normalizeReferenceId(rawReferenceId);
  if (!normalizedId) return null;

  if (isValidReferenceId(normalizedId)) {
    try {
      const snap = await getDoc(doc(db, "orders", normalizedId));
      if (snap.exists()) {
        const data = snap.data();
        const status = ORDER_STATUS_SEQUENCE.includes(data.status as OrderStatusStep)
          ? (data.status as OrderStatusStep)
          : "received";
        return {
          referenceId: String(data.referenceId || normalizedId),
          kind: data.kind === "inquiry" ? "inquiry" : "order",
          orderType: data.orderType === "trade" ? "trade" : "home",
          customerName: String(data.customerName || "Customer"),
          itemsSummary: Array.isArray(data.itemsSummary)
            ? data.itemsSummary.map((line) => String(line))
            : [],
          subtotal:
            typeof data.subtotal === "number" ? data.subtotal : undefined,
          status,
          createdAt: timestampToIso(data.createdAt),
          updatedAt: timestampToIso(data.updatedAt),
          isSample: data.isSample === true ? true : undefined,
        };
      }
    } catch {
      // Fallback to Express API / localStorage / sample orders
    }
  }

  try {
    const endpoint = `${import.meta.env.BASE_URL}api/orders/${encodeURIComponent(
      normalizedId
    )}`;
    const res = await fetch(endpoint);
    if (res.ok) {
      const data = (await res.json()) as { ok?: boolean; order?: TrackedOrder };
      if (data.ok && data.order) {
        return data.order;
      }
    }
  } catch {
    // Fallback to localStorage + sample records
  }

  const localMatch = getSavedLocalOrders().find(
    (item) => normalizeReferenceId(item.referenceId) === normalizedId
  );
  if (localMatch) return localMatch;

  const sampleMatch = SAMPLE_ORDERS.find(
    (item) => normalizeReferenceId(item.referenceId) === normalizedId
  );
  return sampleMatch ?? null;
}

export function selectOrderForTracking(referenceId: string) {
  const normalized = normalizeReferenceId(referenceId);
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(TRACK_ORDER_EVENT, { detail: { referenceId: normalized } })
  );
  const section = document.getElementById("order-tracking");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

export function mapProductSlugsToTitles(
  slugs: string[],
  lang: "en" | "ar"
): string[] {
  return slugs.map((slug) => {
    const range = findProductRange(slug);
    return range ? range[lang].title : slug;
  });
}
