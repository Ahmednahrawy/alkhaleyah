import { describe, expect, it } from "vitest";
import {
  generateReferenceId,
  getOrderRecord,
  normalizeReferenceId,
  SAMPLE_ORDERS,
  saveOrderRecord,
} from "./orders";

describe("order tracking store", () => {
  it("provides pre-seeded sample orders across delivery stages", () => {
    expect(SAMPLE_ORDERS.length).toBeGreaterThanOrEqual(3);
    const sample = getOrderRecord("alk-1041");
    expect(sample).toBeDefined();
    expect(sample?.referenceId).toBe("ALK-1041");
    expect(sample?.status).toBe("preparing");
  });

  it("normalizes and persists newly submitted orders and inquiries", () => {
    const referenceId = generateReferenceId();
    expect(referenceId.startsWith("ALK-")).toBe(true);

    const saved = saveOrderRecord({
      referenceId: referenceId.toLowerCase(),
      kind: "order",
      orderType: "home",
      customerName: "Test Buyer",
      itemsSummary: ["Natural honey — Sidr Honey (1 kg × 1)"],
      subtotal: 1100,
      status: "received",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(saved.referenceId).toBe(normalizeReferenceId(referenceId));
    expect(getOrderRecord(referenceId.toLowerCase())?.customerName).toBe(
      "Test Buyer"
    );
  });
});
