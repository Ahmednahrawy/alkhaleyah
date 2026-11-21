import { ArrowDown, ArrowRight, ArrowUpRight, Leaf, Package, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { productRanges } from "@/lib/catalog";
import { useLocale } from "@/contexts/LocaleContext";

export default function Home() {
  const { locale } = useLocale();
  const ar = locale === "ar";
  return (
    <div className="site-shell">
      <div className="announcement"><span className="announcement-dot" /> {ar ? "شركة منتجات غذائية لموائد كل يوم" : "A food products company for everyday tables"}</div>
      <SiteHeader />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow light-eyebrow"><span /> {ar ? "مؤونة مختارة بعناية" : "A considered pantry"}</p>
            <h1 id="hero-title">{ar ? <>طعام طيب.<br /><em>ولمّة أحلى.</em></> : <>Good food.<br /><em>Good company.</em></>}</h1>
            <p className="hero-description">{ar ? "اكتشفوا مجموعة الخالقية من المنتجات الغذائية — مكونات مألوفة ولحظات جميلة تجمعنا حول المائدة." : "Explore the Alkhaleyah food range — familiar ingredients, gathered for the moments that bring us to the table."}</p>
            <div className="hero-actions">
              <a className="button button-light" href="#our-range">{ar ? "اكتشفوا منتجاتنا" : "Explore our range"} <ArrowRight size={17} /></a>
              <a className="text-link light-link" href="#our-story">{ar ? "تعرّفوا علينا" : "Get to know us"} <ArrowDown size={15} /></a>
            </div>
            <div className="hero-caption"><span>01 / 04</span><span>{ar ? "من المطبخ إلى المائدة" : "From the pantry, to the table"}</span></div>
          </div>
          <div className="hero-image" role="img" aria-label={ar ? "مكونات غذائية وحبوب وتوابل وتمر وزيت زيتون" : "A still life of pantry ingredients, grains, spices, dates, and olive oil"} />
          <div className="hero-vertical-label">ALKHALEYAH · FOOD PRODUCTS</div>
        </section>

        <section className="intro-strip" aria-label={ar ? "نبذة عن الخالقية" : "Alkhaleyah at a glance"}>
          <p>{ar ? "الغذاء في قلب كل يوم." : "Food, at the heart of every day."}</p><span className="intro-divider" />
          <p>{ar ? "للبيوت والمطابخ والأعمال." : "For homes, kitchens, and trade."}</p><span className="intro-divider" />
          <p>{ar ? "اكتشفوا مجموعتنا." : "Explore the range."}</p>
        </section>

        <section className="range-section section-pad" id="our-range">
          <div className="section-heading">
            <div><p className="eyebrow"><span /> {ar ? "اكتشفوا الخالقية" : "Explore Alkhaleyah"}</p><h2>{ar ? <>كل ما هو<br /><em>طيب وأصيل.</em></> : <>A place for<br /><em>good things.</em></>}</h2></div>
            <div className="section-aside"><p>{ar ? "من أساسيات المطبخ إلى اللمسات الأخيرة، اكتشفوا فئات منتجاتنا الغذائية." : "From pantry foundations to the finishing touch, find your way around our food categories."}</p><span className="handwritten-note">{ar ? "اختاروا ما تحبون" : "Find your favourite"} <ArrowDown size={16} /></span></div>
          </div>
          <div className="range-grid">
            {productRanges.map((range, index) => (
              <Link key={range.slug} href={`/products/${range.slug}`} className={`range-card range-card-${range.tone}`}>
                <div className="range-image-wrap"><img src={range.image} alt="" loading="lazy" /><span className="range-index">0{index + 1}</span><span className="range-arrow" aria-hidden="true"><ArrowUpRight size={20} /></span></div>
                <div className="range-card-copy"><span className="range-eyebrow">{ar ? range.eyebrowAr : range.eyebrow}</span><h3>{ar ? range.titleAr : range.title}</h3><p>{ar ? range.summaryAr : range.summary}</p></div>
              </Link>
            ))}
          </div>
          <div className="range-footnote"><span className="footnote-line" /> {ar ? "يُرجى التواصل مع الخالقية لتأكيد توافر المنتجات ومواصفاتها." : "Product availability and specifications are confirmed directly with Alkhaleyah."}</div>
        </section>

        <section className="story-section" id="our-story">
          <div className="story-image" role="img" aria-label={ar ? "حبوب وأعشاب ومكونات مختارة بعناية" : "A close-up of carefully arranged grains, herbs, and pantry ingredients"} />
          <div className="story-copy"><p className="eyebrow light-eyebrow"><span /> {ar ? "رؤية الخالقية" : "The Alkhaleyah point of view"}</p>
            <h2>{ar ? <>لأجل مائدة<br /><em>كل يوم.</em></> : <>Made for the<br /><em>everyday table.</em></>}</h2>
            <p className="story-body">{ar ? "للطعام قدرة على جمع الناس. هنا في الخالقية، نسهّل عليكم اختيار مكونات لحظاتكم اليومية، مع مجموعة واضحة من المنتجات الغذائية للعملاء وشركاء التوريد." : "Food has a way of bringing people together. Alkhaleyah is here to make finding the ingredients for those everyday moments feel simple — with a clear range of food products for customers and trade partners."}</p>
            <a className="text-link light-link" href="#contact">{ar ? "رسالة من الخالقية" : "A note from Alkhaleyah"} <ArrowRight size={16} /></a>
            <span className="story-stamp"><Leaf size={22} /><span>{ar ? <>طعام<br />وعائلة</> : <>Food<br />& family</>}</span></span>
          </div>
        </section>

        <section className="values-section section-pad">
          <div className="values-title"><p className="eyebrow"><span /> {ar ? "هكذا نراها" : "The way we see it"}</p><h2>{ar ? <>أشياء بسيطة،<br /><em>اختيرت بعناية.</em></> : <>Simple things,<br /><em>thoughtfully chosen.</em></>}</h2></div>
          <div className="values-list">
            <article className="value-item"><span className="value-icon"><Package size={19} /></span><div><h3>{ar ? "مجموعة واضحة" : "A clear range"}</h3><p>{ar ? "تعرّفوا بسهولة على فئات منتجاتنا الغذائية." : "Find your way through our food categories with ease."}</p></div><span className="value-number">01</span></article>
            <article className="value-item"><span className="value-icon"><Leaf size={19} /></span><div><h3>{ar ? "مكونات يومية" : "Everyday ingredients"}</h3><p>{ar ? "مذاقات مألوفة لوصفاتكم وعاداتكم المحببة." : "Familiar food for the recipes and rituals you return to."}</p></div><span className="value-number">02</span></article>
            <article className="value-item"><span className="value-icon"><Sparkles size={19} /></span><div><h3>{ar ? "نسعد بمساعدتكم" : "Here to help"}</h3><p>{ar ? "تحدثوا معنا عن المنتجات أو التوافر أو التوريد." : "Talk with us about product details, availability, or supply."}</p></div><span className="value-number">03</span></article>
          </div>
        </section>

        <section className="contact-section" id="contact"><div className="contact-inner"><div><p className="eyebrow light-eyebrow"><span /> {ar ? "لنتحدث عن الطعام" : "Let's talk food"}</p><h2>{ar ? <>هل لديكم<br /><em>استفسار؟</em></> : <>Something on<br /><em>your mind?</em></>}</h2></div>
          <div className="contact-aside"><p>{ar ? "للاستفسار عن المنتجات أو التوافر أو البيع بالجملة، يسعدنا تواصلكم معنا." : "For product details, availability, or wholesale enquiries, we’d love to hear from you."}</p><p className="contact-note">{ar ? "يمكن إضافة بيانات التواصل عند تحديد البريد أو الهاتف أو قناة الاستفسار المناسبة." : "Contact details can be added here when you share the email address, phone number, or enquiry channel you prefer."}</p><a className="button button-light" href="#our-range">{ar ? "تصفحوا المنتجات" : "Browse the food range"} <ArrowRight size={17} /></a></div><span className="contact-orbit" aria-hidden="true">A</span>
        </div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
