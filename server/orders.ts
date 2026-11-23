export type OrderStatusStep =
  | "received"
  | "confirmed"
  | "preparing"
  | "dispatched"
  | "delivered";

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

const orderStore = new Map<string, TrackedOrder>(
  SAMPLE_ORDERS.map((order) => [order.referenceId.toUpperCase(), order])
);

export function normalizeReferenceId(rawId: string): string {
  return rawId.trim().toUpperCase();
}

export function generateReferenceId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `ALK-${timestamp}${suffix}`;
}

export function saveOrderRecord(order: TrackedOrder): TrackedOrder {
  const normalizedId = normalizeReferenceId(order.referenceId);
  const record: TrackedOrder = {
    ...order,
    referenceId: normalizedId,
  };
  orderStore.set(normalizedId, record);
  return record;
}

export function getOrderRecord(referenceId: string): TrackedOrder | undefined {
  const normalizedId = normalizeReferenceId(referenceId);
  if (!normalizedId) return undefined;
  return orderStore.get(normalizedId);
}
