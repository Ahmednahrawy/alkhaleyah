import { describe, expect, it } from "vitest";
import {
  getCatalogImagePresets,
  MAX_IMAGE_DATA_URL_LENGTH,
  resolveCatalogImageValue,
  validateCatalogImageValue,
} from "../client/src/lib/imageUtils";

describe("catalog image utilities", () => {
  it("builds presets for built-in categories and varieties", () => {
    const presets = getCatalogImagePresets();
    expect(presets.length).toBeGreaterThanOrEqual(24);
    expect(presets.some((p) => p.token === "preset:sidr-honey")).toBe(true);
    expect(presets.some((p) => p.token === "preset:range-honey")).toBe(true);
  });

  it("validates empty, preset tokens, https URLs, and compressed data URIs", () => {
    expect(validateCatalogImageValue("")).toEqual({ valid: true, normalized: "" });
    expect(validateCatalogImageValue("preset:sidr-honey")).toEqual({
      valid: true,
      normalized: "preset:sidr-honey",
    });
    expect(
      validateCatalogImageValue("https://example.com/photos/sidr-honey.jpg")
    ).toEqual({
      valid: true,
      normalized: "https://example.com/photos/sidr-honey.jpg",
    });
    expect(
      validateCatalogImageValue("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ==")
    ).toEqual({
      valid: true,
      normalized: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ==",
    });
  });

  it("rejects unsafe protocols, oversized data URIs, and invalid formats", () => {
    expect(validateCatalogImageValue("http://example.com/photo.jpg").valid).toBe(
      false
    );
    expect(validateCatalogImageValue("javascript:alert(1)").valid).toBe(false);
    expect(validateCatalogImageValue("data:text/html;base64,PGgxPkZha2U=").valid).toBe(
      false
    );
    const oversized = `data:image/jpeg;base64,${"A".repeat(
      MAX_IMAGE_DATA_URL_LENGTH + 10
    )}`;
    const result = validateCatalogImageValue(oversized);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("size");
  });

  it("resolves preset tokens and falls back safely when empty or unknown", () => {
    const fallback = "/fallback.jpg";
    expect(resolveCatalogImageValue("", fallback)).toBe(fallback);
    expect(resolveCatalogImageValue("preset:unknown-id", fallback)).toBe(
      fallback
    );
    const resolvedPreset = resolveCatalogImageValue(
      "preset:sidr-honey",
      fallback
    );
    expect(resolvedPreset).not.toBe(fallback);
    expect(resolvedPreset.length).toBeGreaterThan(0);
    expect(
      resolveCatalogImageValue("https://cdn.example.com/a.jpg", fallback)
    ).toBe("https://cdn.example.com/a.jpg");
  });
});
