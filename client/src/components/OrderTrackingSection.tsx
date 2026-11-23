import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Check,
  ClipboardCheck,
  MessageCircle,
  Package,
  Search,
  Truck,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/catalog";
import { translations } from "@/lib/i18n";
import {
  getSavedLocalOrders,
  lookupTrackedOrder,
  normalizeReferenceId,
  ORDER_STATUS_SEQUENCE,
  ORDERS_UPDATED_EVENT,
  SAMPLE_ORDERS,
  TRACK_ORDER_EVENT,
  type OrderStatusStep,
  type TrackedOrder,
} from "@/lib/orders";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

function formatOrderDate(iso: string, lang: "en" | "ar") {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StepIcon({
  step,
  completed,
}: {
  step: OrderStatusStep;
  completed: boolean;
}) {
  if (completed) return <Check size={15} aria-hidden="true" />;
  switch (step) {
    case "received":
      return <ClipboardCheck size={15} aria-hidden="true" />;
    case "confirmed":
      return <Check size={15} aria-hidden="true" />;
    case "preparing":
      return <Package size={15} aria-hidden="true" />;
    case "dispatched":
      return <Truck size={15} aria-hidden="true" />;
    case "delivered":
    default:
      return <Check size={15} aria-hidden="true" />;
  }
}

export function OrderTrackingSection() {
  const { lang } = useLanguage();
  const tr = translations[lang].tracking;

  const [queryId, setQueryId] = useState(SAMPLE_ORDERS[0].referenceId);
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(
    SAMPLE_ORDERS[0]
  );
  const [notFoundId, setNotFoundId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState<TrackedOrder[]>(() =>
    getSavedLocalOrders()
  );

  const performLookup = useCallback(async (rawId: string) => {
    const normalized = normalizeReferenceId(rawId);
    if (!normalized) return;

    setQueryId(normalized);
    setLoading(true);
    setNotFoundId(null);

    try {
      const result = await lookupTrackedOrder(normalized);
      if (result) {
        setTrackedOrder(result);
        setNotFoundId(null);
      } else {
        setTrackedOrder(null);
        setNotFoundId(normalized);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleOrdersUpdated = () => {
      setRecentOrders(getSavedLocalOrders());
    };
    const handleTrackEvent = (e: Event) => {
      const custom = e as CustomEvent<{ referenceId?: string }>;
      if (custom.detail?.referenceId) {
        void performLookup(custom.detail.referenceId);
      }
    };

    window.addEventListener(ORDERS_UPDATED_EVENT, handleOrdersUpdated);
    window.addEventListener(TRACK_ORDER_EVENT, handleTrackEvent);
    return () => {
      window.removeEventListener(ORDERS_UPDATED_EVENT, handleOrdersUpdated);
      window.removeEventListener(TRACK_ORDER_EVENT, handleTrackEvent);
    };
  }, [performLookup]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void performLookup(queryId);
  };

  const currentStepIndex = trackedOrder
    ? Math.max(0, ORDER_STATUS_SEQUENCE.indexOf(trackedOrder.status))
    : -1;

  const whatsappInquiryUrl = buildWhatsAppUrl(
    `${tr.askWhatsAppMessagePrefix} ${notFoundId || trackedOrder?.referenceId || queryId}`
  );

  return (
    <section
      className="tracking-section section-pad"
      id="order-tracking"
      aria-labelledby="order-tracking-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <span /> {tr.eyebrow}
          </p>
          <h2 id="order-tracking-title">
            {tr.titleLead}
            <br />
            <em>{tr.titleAccent}</em>
          </h2>
        </div>
        <div className="section-aside">
          <p>{tr.asideBody}</p>
        </div>
      </div>

      <div className="tracking-card">
        <form className="tracking-search-form" onSubmit={handleSubmit}>
          <label className="tracking-input-group">
            <span className="inquiry-label">{tr.inputLabel}</span>
            <div className="tracking-input-row">
              <div className="tracking-input-wrap">
                <Search
                  size={16}
                  className="tracking-input-icon"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={queryId}
                  onChange={(e) => setQueryId(e.target.value)}
                  placeholder={tr.inputPlaceholder}
                  className="tracking-input tabular-nums"
                  dir="ltr"
                  data-testid="tracking-id-input"
                />
              </div>
              <button
                type="submit"
                className="button button-dark tracking-submit-btn"
                disabled={loading || !queryId.trim()}
                data-testid="tracking-submit-btn"
              >
                {loading ? tr.checkingButton : tr.submitButton}
              </button>
            </div>
          </label>

          <div className="tracking-quick-ids">
            {recentOrders.length > 0 && (
              <div className="tracking-quick-group">
                <span className="tracking-quick-label">{tr.recentLabel}</span>
                <div className="tracking-quick-list">
                  {recentOrders.slice(0, 4).map((item) => (
                    <button
                      key={item.referenceId}
                      type="button"
                      className={
                        trackedOrder?.referenceId === item.referenceId
                          ? "tracking-id-btn is-active tabular-nums"
                          : "tracking-id-btn tabular-nums"
                      }
                      onClick={() => void performLookup(item.referenceId)}
                    >
                      {item.referenceId}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="tracking-quick-group">
              <span className="tracking-quick-label">{tr.sampleLabel}</span>
              <div className="tracking-quick-list">
                {SAMPLE_ORDERS.map((sample) => (
                  <button
                    key={sample.referenceId}
                    type="button"
                    className={
                      trackedOrder?.referenceId === sample.referenceId
                        ? "tracking-id-btn is-active tabular-nums"
                        : "tracking-id-btn tabular-nums"
                    }
                    onClick={() => void performLookup(sample.referenceId)}
                  >
                    {sample.referenceId}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {notFoundId && (
          <div className="tracking-not-found" role="status" aria-live="polite">
            <h3>{tr.notFoundTitle}</h3>
            <p>{tr.notFoundBody}</p>
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-whatsapp"
            >
              <MessageCircle size={16} aria-hidden="true" />
              <span>{tr.askWhatsAppButton}</span>
            </a>
          </div>
        )}

        {trackedOrder && (
          <div className="tracking-result" aria-live="polite">
            <div className="tracking-meta-grid">
              <div className="tracking-meta-cell">
                <span className="tracking-meta-label">{tr.orderIdLabel}</span>
                <strong className="tracking-meta-value tabular-nums" dir="ltr">
                  {trackedOrder.referenceId}
                </strong>
                {trackedOrder.isSample && (
                  <span className="tracking-sample-note">{tr.sampleBadge}</span>
                )}
              </div>
              <div className="tracking-meta-cell">
                <span className="tracking-meta-label">{tr.typeLabel}</span>
                <strong className="tracking-meta-value">
                  {trackedOrder.kind === "inquiry"
                    ? tr.typeInquiry
                    : tr.typeOrder}{" "}
                  ·{" "}
                  {trackedOrder.orderType === "trade"
                    ? tr.channelTrade
                    : tr.channelHome}
                </strong>
              </div>
              <div className="tracking-meta-cell">
                <span className="tracking-meta-label">{tr.customerLabel}</span>
                <strong className="tracking-meta-value">
                  {trackedOrder.customerName}
                </strong>
              </div>
              <div className="tracking-meta-cell">
                <span className="tracking-meta-label">{tr.updatedLabel}</span>
                <strong className="tracking-meta-value tabular-nums">
                  {formatOrderDate(trackedOrder.updatedAt, lang)}
                </strong>
              </div>
            </div>

            <ol className="tracking-steps">
              {ORDER_STATUS_SEQUENCE.map((step, index) => {
                const isDone = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const stepCopy = tr.steps[step];
                return (
                  <li
                    key={step}
                    className={
                      isCurrent
                        ? "tracking-step is-current"
                        : isDone
                          ? "tracking-step is-done"
                          : "tracking-step"
                    }
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    <span className="tracking-step-node">
                      <StepIcon step={step} completed={isDone} />
                    </span>
                    <div className="tracking-step-copy">
                      <strong>{stepCopy.label}</strong>
                      <p>{stepCopy.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="tracking-details-foot">
              <div className="tracking-items-block">
                <span className="tracking-meta-label">{tr.itemsLabel}</span>
                <ul className="tracking-items-list">
                  {trackedOrder.itemsSummary.map((line, idx) => (
                    <li key={`${trackedOrder.referenceId}-${idx}`}>{line}</li>
                  ))}
                </ul>
              </div>
              <div className="tracking-foot-right">
                {typeof trackedOrder.subtotal === "number" && (
                  <div className="tracking-subtotal-box">
                    <span className="tracking-meta-label">
                      {tr.subtotalLabel}
                    </span>
                    <strong className="tabular-nums">
                      {formatPrice(trackedOrder.subtotal, lang)}
                    </strong>
                  </div>
                )}
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  <MessageCircle size={15} aria-hidden="true" />
                  <span>{tr.askWhatsAppButton}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
