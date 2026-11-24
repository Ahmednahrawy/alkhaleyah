import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight, Leaf } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";

export function DynamicImageSlider({
  images,
  alt,
  loading = "lazy",
  className = "",
  intervalMs = 3800,
  showControls = true,
}: {
  images: string[];
  alt: string;
  loading?: "lazy" | "eager";
  className?: string;
  intervalMs?: number;
  showControls?: boolean;
}) {
  const { lang } = useLanguage();
  const a = translations[lang].admin.catalog;

  const imagesKey = images.join("|");
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setFailedUrls([]);
    setActiveIndex(0);
  }, [imagesKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const activeImages = useMemo(() => {
    const failedSet = new Set(failedUrls);
    return images.filter((src) => Boolean(src) && !failedSet.has(src));
  }, [images, failedUrls]);

  const safeIndex =
    activeImages.length > 0 ? activeIndex % activeImages.length : 0;

  useEffect(() => {
    if (
      activeImages.length <= 1 ||
      isHovered ||
      isFocused ||
      prefersReducedMotion
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % activeImages.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [activeImages.length, isHovered, isFocused, prefersReducedMotion, intervalMs]);

  const handleStep = (delta: number, e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeImages.length <= 1) return;
    setActiveIndex(
      (prev) => (prev + delta + activeImages.length) % activeImages.length
    );
  };

  const handleSelectIndex = (
    idx: number,
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex(idx);
  };

  const rootClassName = ["dynamic-slider", className].filter(Boolean).join(" ");

  if (activeImages.length === 0) {
    return (
      <div className={`${rootClassName} is-empty`}>
        <div className="dynamic-slider-fallback" aria-hidden="true">
          <Leaf size={26} />
        </div>
      </div>
    );
  }

  const hasMultiple = activeImages.length > 1;

  return (
    <div
      className={rootClassName}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsFocused(false);
        }
      }}
    >
      <div className="dynamic-slider-viewport" dir="ltr">
        <div
          className="dynamic-slider-track"
          style={{ transform: `translateX(-${safeIndex * 100}%)` }}
        >
          {activeImages.map((src, idx) => (
            <div
              key={`${src.slice(0, 48)}-${idx}`}
              className="dynamic-slider-slide"
              aria-hidden={idx !== safeIndex}
            >
              <img
                src={src}
                alt={idx === safeIndex ? alt : ""}
                loading={idx === 0 ? loading : "lazy"}
                referrerPolicy="no-referrer"
                draggable={false}
                onError={() =>
                  setFailedUrls((prev) =>
                    prev.includes(src) ? prev : [...prev, src]
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>

      {hasMultiple && showControls && (
        <>
          <button
            type="button"
            className="dynamic-slider-nav is-prev"
            onClick={(e) => handleStep(-1, e)}
            aria-label={a.prevSlideAria}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="dynamic-slider-nav is-next"
            onClick={(e) => handleStep(1, e)}
            aria-label={a.nextSlideAria}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>

          <div className="dynamic-slider-bars" role="group" aria-label={alt}>
            {activeImages.map((_, idx) => (
              <button
                key={`slide-bar-${idx}`}
                type="button"
                className={
                  idx === safeIndex
                    ? "dynamic-slider-bar is-active"
                    : "dynamic-slider-bar"
                }
                onClick={(e) => handleSelectIndex(idx, e)}
                aria-label={`${idx + 1} / ${activeImages.length}`}
                aria-pressed={idx === safeIndex}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
