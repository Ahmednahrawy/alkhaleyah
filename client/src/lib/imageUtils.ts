import { productRanges, type ProductRange } from "@/lib/catalog";

export const MAX_IMAGES_PER_ITEM = 6;
export const MAX_IMAGE_DATA_URL_LENGTH = 200000;
export const MAX_GALLERY_ITEM_DATA_URL_LENGTH = 140000;
export const MAX_COMBINED_GALLERY_CHARS = 700000;
export const MAX_IMAGE_HTTPS_URL_LENGTH = 2048;

export type CatalogImagePreset = {
  id: string;
  token: string;
  src: string;
  labelEn: string;
  labelAr: string;
};

export function getCatalogImagePresets(): CatalogImagePreset[] {
  const presets: CatalogImagePreset[] = [];
  const seenSrc = new Set<string>();

  for (const range of productRanges) {
    if (range.image && !seenSrc.has(range.image)) {
      seenSrc.add(range.image);
      presets.push({
        id: `range-${range.slug}`,
        token: `preset:range-${range.slug}`,
        src: range.image,
        labelEn: range.en.title,
        labelAr: range.ar.title,
      });
    }
    for (const sub of range.subcategories) {
      if (sub.image && !seenSrc.has(sub.image)) {
        seenSrc.add(sub.image);
        presets.push({
          id: sub.id,
          token: `preset:${sub.id}`,
          src: sub.image,
          labelEn: sub.en.name,
          labelAr: sub.ar.name,
        });
      }
    }
  }

  return presets;
}

const PRESETS_BY_TOKEN = new Map<string, string>(
  getCatalogImagePresets().map((preset) => [preset.token, preset.src])
);

const PRESET_TOKEN_REGEX = /^preset:[a-zA-Z0-9_-]{2,64}$/;
const HTTPS_URL_REGEX = /^https:\/\/[^\s]+$/;
const DATA_IMAGE_REGEX =
  /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/;

export function resolveCatalogImageValue(
  rawValue: string | undefined,
  fallbackSrc: string
): string {
  const trimmed = rawValue?.trim() ?? "";
  if (!trimmed) return fallbackSrc;
  if (trimmed.startsWith("preset:")) {
    return PRESETS_BY_TOKEN.get(trimmed) ?? fallbackSrc;
  }
  if (HTTPS_URL_REGEX.test(trimmed) || DATA_IMAGE_REGEX.test(trimmed)) {
    return trimmed;
  }
  return fallbackSrc;
}

export function resolveCatalogImageGallery(
  rawUrls: string[] | undefined,
  rawSingleUrl: string | undefined,
  fallbackSrc: string
): string[] {
  const rawList =
    Array.isArray(rawUrls) && rawUrls.length > 0
      ? rawUrls
      : rawSingleUrl?.trim()
        ? [rawSingleUrl.trim()]
        : [];

  if (rawList.length === 0) {
    return fallbackSrc ? [fallbackSrc] : [];
  }

  const resolved: string[] = [];
  const seen = new Set<string>();
  for (const item of rawList.slice(0, MAX_IMAGES_PER_ITEM)) {
    const src = resolveCatalogImageValue(item, "");
    if (src && !seen.has(src)) {
      seen.add(src);
      resolved.push(src);
    }
  }

  if (resolved.length === 0 && fallbackSrc) {
    return [fallbackSrc];
  }
  return resolved;
}

export function validateCatalogImageValue(
  rawValue: string,
  maxDataLength = MAX_IMAGE_DATA_URL_LENGTH
): {
  valid: boolean;
  normalized: string;
  reason?: "url" | "size";
} {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return { valid: true, normalized: "" };
  }
  if (PRESET_TOKEN_REGEX.test(trimmed)) {
    return { valid: true, normalized: trimmed };
  }
  if (trimmed.startsWith("data:image/")) {
    if (trimmed.length > maxDataLength) {
      return { valid: false, normalized: trimmed, reason: "size" };
    }
    if (DATA_IMAGE_REGEX.test(trimmed)) {
      return { valid: true, normalized: trimmed };
    }
    return { valid: false, normalized: trimmed, reason: "url" };
  }
  if (trimmed.length > MAX_IMAGE_HTTPS_URL_LENGTH) {
    return { valid: false, normalized: trimmed, reason: "size" };
  }
  if (HTTPS_URL_REGEX.test(trimmed)) {
    return { valid: true, normalized: trimmed };
  }
  return { valid: false, normalized: trimmed, reason: "url" };
}

export function validateCatalogImageGallery(rawValues: string[]): {
  valid: boolean;
  normalized: string[];
  reason?: "url" | "size" | "count";
} {
  if (rawValues.length > MAX_IMAGES_PER_ITEM) {
    return { valid: false, normalized: [], reason: "count" };
  }

  const normalized: string[] = [];
  const seen = new Set<string>();
  let totalChars = 0;

  for (const raw of rawValues) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const itemCheck = validateCatalogImageValue(
      trimmed,
      MAX_GALLERY_ITEM_DATA_URL_LENGTH
    );
    if (!itemCheck.valid) {
      return { valid: false, normalized: [], reason: itemCheck.reason ?? "url" };
    }
    if (!seen.has(itemCheck.normalized)) {
      seen.add(itemCheck.normalized);
      totalChars += itemCheck.normalized.length;
      if (totalChars > MAX_COMBINED_GALLERY_CHARS) {
        return { valid: false, normalized: [], reason: "size" };
      }
      normalized.push(itemCheck.normalized);
    }
  }

  return { valid: true, normalized };
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode selected image"));
    img.src = src;
  });
}

function renderCompressedJpeg(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
  quality: number
): string {
  const naturalW = img.naturalWidth || img.width || maxWidth;
  const naturalH = img.naturalHeight || img.height || maxHeight;
  const scale = Math.min(maxWidth / naturalW, maxHeight / naturalH, 1);
  const targetW = Math.max(1, Math.round(naturalW * scale));
  const targetH = Math.max(1, Math.round(naturalH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable");
  }
  ctx.fillStyle = "#f7faf6";
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(img, 0, 0, targetW, targetH);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function processImageFileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("invalid-image-type");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("image-too-large");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageElement(objectUrl);
    const attempts: Array<[number, number, number]> = [
      [680, 510, 0.78],
      [580, 435, 0.68],
      [480, 360, 0.58],
      [400, 300, 0.48],
    ];

    for (const [w, h, q] of attempts) {
      const candidate = renderCompressedJpeg(img, w, h, q);
      if (
        candidate.length <= MAX_GALLERY_ITEM_DATA_URL_LENGTH - 5000 &&
        DATA_IMAGE_REGEX.test(candidate)
      ) {
        return candidate;
      }
    }
    throw new Error("image-too-large");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function getDefaultRangeCoverImage(
  baseRanges: ProductRange[],
  categorySlug: string
): string {
  return baseRanges.find((r) => r.slug === categorySlug)?.image ?? "";
}
