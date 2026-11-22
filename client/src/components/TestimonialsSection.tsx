import { useState } from "react";
import { Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";

type TestimonialFilter = "all" | "honey" | "dates";

export function TestimonialsSection() {
  const { lang } = useLanguage();
  const t = translations[lang].testimonialsSection;
  const [filter, setFilter] = useState<TestimonialFilter>("all");

  const visibleItems =
    filter === "all"
      ? t.items
      : t.items.filter((item) => item.focus.includes(filter));

  return (
    <section
      className="testimonials-section section-pad"
      id="testimonials"
      aria-labelledby="testimonials-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <span /> {t.eyebrow}
          </p>
          <h2 id="testimonials-title">
            {t.titleLead}
            <br />
            <em>{t.titleAccent}</em>
          </h2>
        </div>
        <div className="section-aside">
          <p>{t.asideBody}</p>
          <div className="testimonials-filters" role="group" aria-label={t.eyebrow}>
            {(["all", "honey", "dates"] as const).map((key) => (
              <button
                key={key}
                type="button"
                className={
                  filter === key
                    ? "testimonial-filter is-active"
                    : "testimonial-filter"
                }
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
              >
                {t.filters[key]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="testimonials-grid"
        data-count={visibleItems.length}
      >
        {visibleItems.map((item) => (
          <article key={item.id} className="testimonial-card">
            <div className="testimonial-top">
              <span className="testimonial-category">
                <Quote size={14} aria-hidden="true" />
                {item.category}
              </span>
              <span className="testimonial-num">{item.num}</span>
            </div>
            <blockquote className="testimonial-quote">{item.quote}</blockquote>
            <footer className="testimonial-author">
              <strong>{item.author}</strong>
              <span>{item.role}</span>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
