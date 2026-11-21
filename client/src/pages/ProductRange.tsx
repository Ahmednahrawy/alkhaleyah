import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useRoute } from "wouter";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { productRanges } from "@/lib/catalog";

export default function ProductRange() {
  const [, params] = useRoute("/products/:slug");
  const range = productRanges.find((item) => item.slug === params?.slug);

  if (!range) {
    return (
      <div className="site-shell">
        <SiteHeader />
        <main className="not-found"><p className="eyebrow"><span /> Alkhaleyah product range</p><h1>That range<br /><em>isn't here.</em></h1><p>Head back to explore the categories we have listed.</p><Link className="button button-dark" href="/#our-range"><ArrowLeft size={17} /> Return to our range</Link></main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="site-shell">
      <div className="announcement"><span className="announcement-dot" /> A food products company for everyday tables</div>
      <SiteHeader />
      <main className="range-detail">
        <div className="detail-breadcrumb"><Link href="/#our-range">Our range</Link><span>/</span><span>{range.title}</span></div>
        <div className="detail-layout">
          <div className="detail-copy">
            <p className="eyebrow"><span /> {range.eyebrow}</p>
            <h1>{range.title.split(" ").slice(0, -1).join(" ")}<br /><em>{range.title.split(" ").slice(-1)}</em></h1>
            <p className="detail-lede">{range.summary}</p>
            <p className="detail-description">{range.detail}</p>
            <div className="detail-actions"><Link className="button button-dark" href="/#contact">Ask about this range <ArrowRight size={17} /></Link><Link className="text-link" href="/#our-range"><ArrowLeft size={15} /> All categories</Link></div>
            <p className="detail-disclaimer">Product names, pack sizes, and availability should be confirmed with Alkhaleyah.</p>
          </div>
          <div className="detail-image"><img src={range.image} alt={`${range.title} food ingredients arranged on a table`} /></div>
        </div>
        <section className="more-ranges"><div><p className="eyebrow"><span /> Keep exploring</p><h2>More from<br /><em>the pantry.</em></h2></div><div className="more-range-links">{productRanges.filter((item) => item.slug !== range.slug).map((item) => <Link key={item.slug} href={`/products/${item.slug}`}><span>{item.title}</span><ArrowRight size={17} /></Link>)}</div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
