import { useEffect, useState, type FormEvent } from "react";
import { Check, Copy, Send, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStore } from "@/contexts/StoreContext";
import { getRangeCopy } from "@/lib/catalog";
import { translations } from "@/lib/i18n";
import {
  createClientReferenceId,
  recordInquiryOrder,
  selectOrderForTracking,
  type TrackedOrder,
} from "@/lib/orders";

type InquiryType = "home" | "trade";

type SubmittedSummary = {
  referenceId: string;
  inquiryType: InquiryType;
  products: string[];
  name: string;
  email: string;
  phone: string;
  message: string;
};

export function ContactInquiryForm() {
  const { lang } = useLanguage();
  const { ranges, findRange } = useStore();
  const { totalCount, openCart } = useCart();
  const f = translations[lang].contactSection.form;

  const [inquiryType, setInquiryType] = useState<InquiryType>("home");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{
    products?: string;
    name?: string;
    contact?: string;
    email?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedSummary | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productParam = params.get("product");
    if (!productParam) return;
    const matched = findRange(productParam);
    if (matched) {
      setSelectedSlugs((prev) =>
        prev.includes(matched.slug) ? prev : [...prev, matched.slug]
      );
    }
  }, [findRange]);

  const toggleProduct = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
    setErrors((prev) => ({ ...prev, products: undefined }));
  };

  const validate = () => {
    const nextErrors: {
      products?: string;
      name?: string;
      contact?: string;
      email?: string;
    } = {};

    if (selectedSlugs.length === 0) {
      nextErrors.products = f.errors.productsRequired;
    }
    if (!name.trim()) {
      nextErrors.name = f.errors.nameRequired;
    }

    const phoneTrimmed = phone.trim();
    const emailTrimmed = email.trim();

    if (!phoneTrimmed && !emailTrimmed) {
      nextErrors.contact = f.errors.contactRequired;
    }
    if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      nextErrors.email = f.errors.emailInvalid;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildSummaryText = (summary: SubmittedSummary) => {
    const productNames = summary.products
      .map((slug) => {
        const range = findRange(slug);
        return range ? getRangeCopy(range, lang).title : slug;
      })
      .join(", ");

    return [
      f.summaryGreeting,
      `${f.referenceLabel}: ${summary.referenceId}`,
      `${f.inquiryTypeLabel}: ${
        summary.inquiryType === "trade" ? f.typeTrade : f.typeHome
      }`,
      `${f.selectedProductsLabel}: ${productNames}`,
      `${f.nameLabel}: ${summary.name}`,
      ...(summary.phone ? [`${f.phoneLabel}: ${summary.phone}`] : []),
      ...(summary.email ? [`${f.emailLabel}: ${summary.email}`] : []),
      ...(summary.message ? [`${f.notesLabel}: ${summary.message}`] : []),
    ].join("\n");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    let referenceId = createClientReferenceId();

    const payload = {
      referenceId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      inquiryType,
      products: selectedSlugs,
      message: message.trim(),
    };

    try {
      const endpoint = `${import.meta.env.BASE_URL}api/inquiries`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          referenceId?: string;
          order?: TrackedOrder;
        };
        if (data.referenceId) {
          referenceId = data.referenceId;
        }
      }
    } catch {
      // Static hosting falls back gracefully to Firestore + local confirmation.
    } finally {
      setSubmitting(false);
    }

    const itemsSummary = selectedSlugs.map((slug) => {
      const range = findRange(slug);
      return range ? range[lang].title : slug;
    });

    await recordInquiryOrder({
      referenceId,
      orderType: inquiryType,
      customerName: payload.name,
      phone: payload.phone,
      email: payload.email,
      itemsSummary,
      notes: payload.message,
    });

    setSubmitted({
      referenceId,
      inquiryType,
      products: selectedSlugs,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: payload.message,
    });
    setCopied(false);
  };

  const handleCopySummary = async () => {
    if (!submitted) return;
    try {
      await navigator.clipboard.writeText(buildSummaryText(submitted));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API unavailable
    }
  };

  const handleReset = () => {
    setSubmitted(null);
    setSelectedSlugs([]);
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setErrors({});
    setCopied(false);
  };

  if (submitted) {
    const selectedTitles = submitted.products.map((slug) => {
      const range = findRange(slug);
      return range ? getRangeCopy(range, lang).title : slug;
    });

    return (
      <div className="inquiry-card inquiry-success" aria-live="polite">
        <div className="inquiry-success-head">
          <span className="inquiry-success-icon" aria-hidden="true">
            <Check size={18} />
          </span>
          <div>
            <h3>{f.successTitle}</h3>
            <p className="inquiry-ref">
              {f.referenceLabel}:{" "}
              <strong className="tabular-nums" dir="ltr">
                {submitted.referenceId}
              </strong>
            </p>
          </div>
        </div>
        <p className="inquiry-success-body">{f.successBody}</p>
        <dl className="inquiry-summary-list">
          <div>
            <dt>{f.inquiryTypeLabel}</dt>
            <dd>
              {submitted.inquiryType === "trade" ? f.typeTrade : f.typeHome}
            </dd>
          </div>
          <div>
            <dt>{f.selectedProductsLabel}</dt>
            <dd>{selectedTitles.join(" · ")}</dd>
          </div>
          <div>
            <dt>{f.nameLabel}</dt>
            <dd>{submitted.name}</dd>
          </div>
          {submitted.phone && (
            <div>
              <dt>{f.phoneLabel}</dt>
              <dd dir="ltr">{submitted.phone}</dd>
            </div>
          )}
          {submitted.email && (
            <div>
              <dt>{f.emailLabel}</dt>
              <dd dir="ltr">{submitted.email}</dd>
            </div>
          )}
          {submitted.message && (
            <div>
              <dt>{f.notesLabel}</dt>
              <dd>{submitted.message}</dd>
            </div>
          )}
        </dl>
        <div className="inquiry-success-actions">
          <button
            type="button"
            className="button button-dark"
            onClick={() => selectOrderForTracking(submitted.referenceId)}
          >
            {f.trackOrderButton}
          </button>
          <button
            type="button"
            className="button button-accent"
            onClick={handleCopySummary}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? f.copiedButton : f.copyButton}
          </button>
          <button
            type="button"
            className="text-link"
            onClick={handleReset}
          >
            {f.resetButton}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="inquiry-card" onSubmit={handleSubmit} noValidate>
      {totalCount > 0 && (
        <div className="inquiry-cart-banner">
          <div className="inquiry-cart-banner-text">
            <ShoppingBag size={15} aria-hidden="true" />
            <span>
              {f.cartBannerCountPrefix} <strong>{totalCount}</strong>{" "}
              {f.cartBannerCountSuffix}
            </span>
          </div>
          <button
            type="button"
            className="inquiry-cart-banner-btn"
            onClick={openCart}
          >
            {f.cartBannerButton}
          </button>
        </div>
      )}
      <div className="inquiry-group">
        <span className="inquiry-label">{f.inquiryTypeLabel}</span>
        <div
          className="inquiry-type-group"
          role="radiogroup"
          aria-label={f.inquiryTypeLabel}
        >
          <button
            type="button"
            role="radio"
            aria-checked={inquiryType === "home"}
            className={
              inquiryType === "home"
                ? "inquiry-type-btn is-selected"
                : "inquiry-type-btn"
            }
            onClick={() => setInquiryType("home")}
          >
            {f.typeHome}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={inquiryType === "trade"}
            className={
              inquiryType === "trade"
                ? "inquiry-type-btn is-selected"
                : "inquiry-type-btn"
            }
            onClick={() => setInquiryType("trade")}
          >
            {f.typeTrade}
          </button>
        </div>
      </div>

      <div className="inquiry-group">
        <div className="inquiry-label-row">
          <span className="inquiry-label">{f.productsLabel}</span>
          <span className="inquiry-hint">{f.productsHint}</span>
        </div>
        <div className="inquiry-products-grid">
          {ranges.map((range) => {
            const copy = getRangeCopy(range, lang);
            const checked = selectedSlugs.includes(range.slug);
            return (
              <label
                key={range.slug}
                className={
                  checked
                    ? "inquiry-product-option is-checked"
                    : "inquiry-product-option"
                }
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleProduct(range.slug)}
                />
                <span className="inquiry-check" aria-hidden="true">
                  {checked && <Check size={12} />}
                </span>
                <span className="inquiry-product-name">{copy.title}</span>
              </label>
            );
          })}
        </div>
        {errors.products && (
          <p className="inquiry-error" role="alert">
            {errors.products}
          </p>
        )}
      </div>

      <label className="inquiry-field">
        <span className="inquiry-label">{f.nameLabel}</span>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          placeholder={f.namePlaceholder}
          autoComplete="name"
          required
        />
        {errors.name && (
          <span className="inquiry-error" role="alert">
            {errors.name}
          </span>
        )}
      </label>

      <div className="inquiry-fields-row">
        <label className="inquiry-field">
          <span className="inquiry-label">{f.phoneLabel}</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.contact) {
                setErrors((prev) => ({ ...prev, contact: undefined }));
              }
            }}
            placeholder={f.phonePlaceholder}
            autoComplete="tel"
            dir="ltr"
          />
          {errors.contact && (
            <span className="inquiry-error" role="alert">
              {errors.contact}
            </span>
          )}
        </label>

        <label className="inquiry-field">
          <span className="inquiry-label">{f.emailLabel}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.contact || errors.email) {
                setErrors((prev) => ({
                  ...prev,
                  contact: undefined,
                  email: undefined,
                }));
              }
            }}
            placeholder={f.emailPlaceholder}
            autoComplete="email"
            dir="ltr"
          />
          {errors.email && (
            <span className="inquiry-error" role="alert">
              {errors.email}
            </span>
          )}
        </label>
      </div>

      <label className="inquiry-field">
        <span className="inquiry-label">{f.notesLabel}</span>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={f.notesPlaceholder}
        />
      </label>

      <button
        type="submit"
        className="button button-dark inquiry-submit"
        disabled={submitting}
      >
        <Send size={16} aria-hidden="true" />
        {submitting ? f.submittingButton : f.submitButton}
      </button>
    </form>
  );
}
