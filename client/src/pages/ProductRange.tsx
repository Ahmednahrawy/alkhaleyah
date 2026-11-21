import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useRoute } from "wouter";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { productRanges } from "@/lib/catalog";
import { useLocale } from "@/contexts/LocaleContext";

export default function ProductRange() {
  const [, params] = useRoute("/products/:slug");
  const { locale } = useLocale();
  const ar = locale === "ar";
  const range = productRanges.find((item) => item.slug === params?.slug);
  if (!range) {
    return <div className="site-shell"><SiteHeader /><main className="not-found"><p className="eyebrow"><span /> {ar ? "منتجات الخالقية" : "Alkhaleyah product range"}</p><h1>{ar ? <>هذه الفئة<br /><em>غير متاحة.</em></> : <>That range<br /><em>isn't here.</em></>}</h1><p>{ar ? "عودوا لاستكشاف الفئات المتاحة لدينا." : "Head back to explore the categories we have listed."}</p><Link className="button button-dark" href="/#our-range"><ArrowLeft size={17} /> {ar ? "العودة إلى المنتجات" : "Return to our range"}</Link></main><SiteFooter /></div>;
  }

  const title = ar ? range.titleAr : range.title;
  const eyebrow = ar ? range.eyebrowAr : range.eyebrow;
  const summary = ar ? range.summaryAr : range.summary;
  const detail = ar ? range.detailAr : range.detail;
  return (
    <div className="site-shell">
      <div className="announcement"><span className="announcement-dot" /> {ar ? "شركة منتجات غذائية لموائد كل يوم" : "A food products company for everyday tables"}</div>
      <SiteHeader />
      <main className="range-detail">
        <div className="detail-breadcrumb"><Link href="/#our-range">{ar ? "منتجاتنا" : "Our range"}</Link><span>/</span><span>{title}</span></div>
        <div className="detail-layout">
          <div className="detail-copy">
            <p className="eyebrow"><span /> {eyebrow}</p>
            <h1>{title}</h1>
            <p className="detail-lede">{summary}</p>
            <p className="detail-description">{detail}</p>
            <div className="detail-actions"><Link className="button button-dark" href="/#contact">{ar ? "استفسروا عن هذه الفئة" : "Ask about this range"} <ArrowRight size={17} /></Link><Link className="text-link" href="/#our-range"><ArrowLeft size={15} /> {ar ? "كل الفئات" : "All categories"}</Link></div>
            <p className="detail-disclaimer">{ar ? "يرجى تأكيد أسماء المنتجات وأحجام العبوات والتوافر مع الخالقية." : "Product names, pack sizes, and availability should be confirmed with Alkhaleyah."}</p>
          </div>
          <div className="detail-image"><img src={range.image} alt={ar ? `مكونات غذائية من فئة ${title} مرتبة على مائدة` : `${title} food ingredients arranged on a table`} /></div>
        </div>
        <section className="more-ranges"><div><p className="eyebrow"><span /> {ar ? "تابعوا الاستكشاف" : "Keep exploring"}</p><h2>{ar ? <>المزيد من<br /><em>خيرات المطبخ.</em></> : <>More from<br /><em>the pantry.</em></>}</h2></div><div className="more-range-links">{productRanges.filter((item) => item.slug !== range.slug).map((item) => <Link key={item.slug} href={`/products/${item.slug}`}><span>{ar ? item.titleAr : item.title}</span><ArrowRight size={17} /></Link>)}</div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
