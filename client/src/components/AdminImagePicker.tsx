import { useMemo, useState, type ChangeEvent } from "react";
import { Image as ImageIcon, RotateCcw, Upload } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";
import {
  getCatalogImagePresets,
  processImageFileToDataUrl,
  resolveCatalogImageValue,
} from "@/lib/imageUtils";

export function AdminImagePicker({
  label,
  value,
  defaultSrc,
  onChange,
  testIdPrefix = "admin-image",
}: {
  label: string;
  value: string;
  defaultSrc: string;
  onChange: (nextValue: string) => void;
  testIdPrefix?: string;
}) {
  const { lang } = useLanguage();
  const a = translations[lang].admin.catalog;
  const presets = useMemo(() => getCatalogImagePresets(), []);

  const [showPresets, setShowPresets] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const previewSrc = resolveCatalogImageValue(value, defaultSrc);
  const isCustom = Boolean(value.trim());
  const isDataUrl = value.trim().startsWith("data:image/");
  const isPreset = value.trim().startsWith("preset:");

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setLocalError(null);
    setProcessing(true);
    try {
      const compressed = await processImageFileToDataUrl(file);
      onChange(compressed);
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

  const textInputValue = isDataUrl || isPreset ? "" : value;
  const textPlaceholder = isDataUrl
    ? a.uploadedPhotoLabel
    : a.pictureUrlPlaceholder;

  return (
    <div className="admin-image-picker">
      <div className="admin-image-picker-head">
        <span className="inquiry-label">{label}</span>
        <span
          className={
            isCustom
              ? "admin-badge admin-badge-visible"
              : "admin-badge"
          }
        >
          {isCustom ? a.pictureCustomBadge : a.pictureDefaultBadge}
        </span>
      </div>

      <div className="admin-image-picker-row">
        <div className="admin-image-preview">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt={label}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="admin-image-preview-empty" aria-hidden="true">
              <ImageIcon size={22} />
            </div>
          )}
        </div>

        <div className="admin-image-controls">
          <div className="admin-image-actions">
            <label className="admin-ghost-btn admin-upload-label">
              <Upload size={14} aria-hidden="true" />
              <span>{processing ? a.uploadingPicture : a.uploadPictureBtn}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                onChange={handleFileChange}
                disabled={processing}
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
                  onChange("");
                }}
                data-testid={`${testIdPrefix}-reset-btn`}
              >
                <RotateCcw size={14} aria-hidden="true" />
                <span>{a.useDefaultPictureBtn}</span>
              </button>
            )}
          </div>

          <input
            type="url"
            value={textInputValue}
            onChange={(e) => {
              setLocalError(null);
              onChange(e.target.value);
            }}
            placeholder={textPlaceholder}
            dir="ltr"
            className="admin-image-url-input"
            data-testid={`${testIdPrefix}-url-input`}
          />

          {localError && (
            <p className="inquiry-error" role="alert">
              {localError}
            </p>
          )}
        </div>
      </div>

      {showPresets && (
        <div className="admin-preset-grid" role="list">
          {presets.map((preset) => {
            const isSelected = value.trim() === preset.token;
            return (
              <button
                key={preset.id}
                type="button"
                className={
                  isSelected
                    ? "admin-preset-option is-selected"
                    : "admin-preset-option"
                }
                onClick={() => {
                  setLocalError(null);
                  onChange(preset.token);
                  setShowPresets(false);
                }}
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
