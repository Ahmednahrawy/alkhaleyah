import { useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Plus,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import { DynamicImageSlider } from "@/components/DynamicImageSlider";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";
import {
  getCatalogImagePresets,
  MAX_GALLERY_ITEM_DATA_URL_LENGTH,
  MAX_IMAGES_PER_ITEM,
  processImageFileToDataUrl,
  resolveCatalogImageValue,
  validateCatalogImageGallery,
  validateCatalogImageValue,
} from "@/lib/imageUtils";

export function AdminImagePicker({
  label,
  values,
  defaultSrc,
  defaultImages,
  onChange,
  maxImages = MAX_IMAGES_PER_ITEM,
  testIdPrefix = "admin-image",
}: {
  label: string;
  values: string[];
  defaultSrc: string;
  defaultImages?: string[];
  onChange: (nextValues: string[]) => void;
  maxImages?: number;
  testIdPrefix?: string;
}) {
  const { lang } = useLanguage();
  const a = translations[lang].admin.catalog;
  const presets = useMemo(() => getCatalogImagePresets(), []);

  const [showPresets, setShowPresets] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const previewImages = useMemo(() => {
    const resolved = values
      .map((val) => resolveCatalogImageValue(val, ""))
      .filter(Boolean);
    if (resolved.length > 0) return resolved;
    const defaults = defaultImages?.filter(Boolean) ?? [];
    if (defaults.length > 0) return defaults;
    return defaultSrc ? [defaultSrc] : [];
  }, [values, defaultSrc, defaultImages]);

  const isCustom = values.length > 0;
  const remainingSlots = Math.max(0, maxImages - values.length);

  const tryCommitValues = (candidate: string[]): boolean => {
    const validation = validateCatalogImageGallery(candidate);
    if (!validation.valid) {
      if (validation.reason === "count") {
        setLocalError(a.maxPicturesError);
      } else if (validation.reason === "size") {
        setLocalError(a.pictureTooLargeError);
      } else {
        setLocalError(a.pictureInvalidError);
      }
      return false;
    }
    setLocalError(null);
    onChange(validation.normalized);
    return true;
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (fileList.length === 0) return;

    if (remainingSlots <= 0) {
      setLocalError(a.maxPicturesError);
      return;
    }

    const overflowed = fileList.length > remainingSlots;
    const filesToProcess = fileList.slice(0, remainingSlots);

    setLocalError(null);
    setProcessing(true);
    try {
      const encoded: string[] = [];
      for (const file of filesToProcess) {
        const compressed = await processImageFileToDataUrl(file);
        encoded.push(compressed);
      }
      const nextValues = [...values, ...encoded];
      if (tryCommitValues(nextValues) && overflowed) {
        setLocalError(a.maxPicturesError);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "image-too-large") {
        setLocalError(a.pictureTooLargeError);
      } else {
        setLocalError(a.pictureInvalidError);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (remainingSlots <= 0) {
      setLocalError(a.maxPicturesError);
      return;
    }

    if (!trimmed.startsWith("https://")) {
      setLocalError(a.pictureInvalidError);
      return;
    }

    const singleCheck = validateCatalogImageValue(
      trimmed,
      MAX_GALLERY_ITEM_DATA_URL_LENGTH
    );
    if (!singleCheck.valid) {
      setLocalError(
        singleCheck.reason === "size"
          ? a.pictureTooLargeError
          : a.pictureInvalidError
      );
      return;
    }

    if (tryCommitValues([...values, singleCheck.normalized])) {
      setUrlInput("");
    }
  };

  const handleUrlKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddUrl();
    }
  };

  const handleTogglePreset = (token: string) => {
    if (values.includes(token)) {
      setLocalError(null);
      onChange(values.filter((item) => item !== token));
      return;
    }
    if (remainingSlots <= 0) {
      setLocalError(a.maxPicturesError);
      return;
    }
    tryCommitValues([...values, token]);
  };

  const handleMove = (index: number, delta: -1 | 1) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= values.length) return;
    const next = [...values];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    setLocalError(null);
    onChange(next);
  };

  const handleRemove = (index: number) => {
    setLocalError(null);
    onChange(values.filter((_, idx) => idx !== index));
  };

  return (
    <div className="admin-image-picker">
      <div className="admin-image-picker-head">
        <span className="inquiry-label">{label}</span>
        <span
          className={
            isCustom ? "admin-badge admin-badge-visible" : "admin-badge"
          }
        >
          {isCustom
            ? `${a.pictureCustomBadge} (${values.length}/${maxImages})`
            : a.pictureDefaultBadge}
        </span>
      </div>

      <div className="admin-image-picker-row">
        <div className="admin-image-preview">
          <DynamicImageSlider
            images={previewImages}
            alt={label}
            loading="eager"
            showControls={previewImages.length > 1}
          />
        </div>

        <div className="admin-image-controls">
          <div className="admin-image-actions">
            <label className="admin-ghost-btn admin-upload-label">
              <Upload size={14} aria-hidden="true" />
              <span>{processing ? a.uploadingPicture : a.uploadPictureBtn}</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/*"
                onChange={handleFileChange}
                disabled={processing || remainingSlots <= 0}
                className="sr-only"
                data-testid={`${testIdPrefix}-upload-input`}
              />
            </label>

            <button
              type="button"
              className="admin-ghost-btn"
              onClick={() => setShowPresets((prev) => !prev)}
              data-testid={`${testIdPrefix}-presets-toggle`}
            >
              <ImageIcon size={14} aria-hidden="true" />
              <span>{showPresets ? a.hidePresetsBtn : a.choosePresetBtn}</span>
            </button>

            {isCustom && (
              <button
                type="button"
                className="admin-ghost-btn"
                onClick={() => {
                  setLocalError(null);
                  setUrlInput("");
                  onChange([]);
                }}
                data-testid={`${testIdPrefix}-reset-btn`}
              >
                <RotateCcw size={14} aria-hidden="true" />
                <span>{a.useDefaultPictureBtn}</span>
              </button>
            )}
          </div>

          <div className="admin-image-url-row">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => {
                setLocalError(null);
                setUrlInput(e.target.value);
              }}
              onKeyDown={handleUrlKeyDown}
              placeholder={a.pictureUrlPlaceholder}
              dir="ltr"
              className="admin-image-url-input"
              data-testid={`${testIdPrefix}-url-input`}
            />
            <button
              type="button"
              className="admin-ghost-btn"
              onClick={handleAddUrl}
              disabled={!urlInput.trim() || remainingSlots <= 0}
              data-testid={`${testIdPrefix}-add-url-btn`}
            >
              <Plus size={14} aria-hidden="true" />
              <span>{a.addUrlBtn}</span>
            </button>
          </div>

          <p className="admin-variety-note">{a.pictureGalleryHint}</p>

          {localError && (
            <p className="inquiry-error" role="alert">
              {localError}
            </p>
          )}
        </div>
      </div>

      {values.length > 0 && (
        <div
          className="admin-gallery-strip"
          role="list"
          data-testid={`${testIdPrefix}-gallery-strip`}
        >
          {values.map((val, index) => {
            const thumbSrc = resolveCatalogImageValue(val, defaultSrc);
            return (
              <div
                key={`${val.slice(0, 32)}-${index}`}
                className="admin-gallery-item"
                role="listitem"
              >
                <div className="admin-gallery-thumb-box">
                  <img
                    src={thumbSrc}
                    alt={`${label} ${index + 1}`}
                    referrerPolicy="no-referrer"
                  />
                  <span className="admin-gallery-index tabular-nums">
                    {index + 1}
                  </span>
                </div>
                <div className="admin-gallery-item-actions">
                  <button
                    type="button"
                    className="admin-gallery-icon-btn"
                    disabled={index === 0}
                    onClick={() => handleMove(index, -1)}
                    aria-label={a.movePictureLeftAria}
                  >
                    <ChevronLeft size={13} className="rtl-flip" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="admin-gallery-icon-btn"
                    disabled={index === values.length - 1}
                    onClick={() => handleMove(index, 1)}
                    aria-label={a.movePictureRightAria}
                  >
                    <ChevronRight size={13} className="rtl-flip" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="admin-gallery-icon-btn is-danger"
                    onClick={() => handleRemove(index)}
                    aria-label={a.removePictureAria}
                    data-testid={`${testIdPrefix}-remove-${index}`}
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showPresets && (
        <div className="admin-preset-grid" role="list">
          {presets.map((preset) => {
            const isSelected = values.includes(preset.token);
            return (
              <button
                key={preset.id}
                type="button"
                className={
                  isSelected
                    ? "admin-preset-option is-selected"
                    : "admin-preset-option"
                }
                onClick={() => handleTogglePreset(preset.token)}
                title={lang === "ar" ? preset.labelAr : preset.labelEn}
              >
                <img
                  src={preset.src}
                  alt={lang === "ar" ? preset.labelAr : preset.labelEn}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <span>{lang === "ar" ? preset.labelAr : preset.labelEn}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
