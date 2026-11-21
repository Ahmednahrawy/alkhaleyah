import { ArrowDown, ArrowRight, ArrowUpRight, Leaf, Package, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { productRanges } from "@/lib/catalog";

export default function Home() {
  return (
    <div className="site-shell">
      <div className="announcement"><span className="announcement-dot" /> A food products company for everyday tables</div>
      <SiteHeader />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow light-eyebrow"><span /> A considered pantry</p>
            <h1 id="hero-title">Good food.<br /><em>Good company.</em></h1>
            <p className="hero-description">Explore the Alkhaleyah food range — familiar ingredients, gathered for the moments that bring us to the table.</p>
            <div className="hero-actions">
              <a className="button button-light" href="#our-range">Explore our range <ArrowRight size={17} /></a>
              <a className="text-link light-link" href="#our-story">Get to know us <ArrowDown size={15} /></a>
            </div>
            <div className="hero-caption"><span>01 / 04</span><span>From the pantry, to the table</span></div>
          </div>
          <div className="hero-image" role="img" aria-label="A still life of pantry ingredients, grains, spices, dates, and olive oil" />
          <div className="hero-vertical-label">ALKHALEYAH · FOOD PRODUCTS</div>
        </section>

        <section className="intro-strip" aria-label="Alkhaleyah at a glance">
          <p>Food, at the heart of every day.</p>
          <span className="intro-divider" />
          <p>For homes, kitchens, and trade.</p>
          <span className="intro-divider" />
          <p>Explore the range.</p>
        </section>

        <section className="range-section section-pad" id="our-range">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span /> Explore Alkhaleyah</p>
              <h2>A place for<br /><em>good things.</em></h2>
            </div>
            <div className="section-aside">
              <p>From pantry foundations to the finishing touch, find your way around our food categories.</p>
              <span className="handwritten-note">Find your favourite <ArrowDown size={16} /></span>
            </div>
          </div>
          <div className="range-grid">
            {productRanges.map((range, index) => (
              <Link key={range.slug} href={`/products/${range.slug}`} className={`range-card range-card-${range.tone}`}>
                <div className="range-image-wrap">
                  <img src={range.image} alt="" loading="lazy" />
                  <span className="range-index">0{index + 1}</span>
                  <span className="range-arrow" aria-hidden="true"><ArrowUpRight size={20} /></span>
                </div>
                <div className="range-card-copy">
                  <span className="range-eyebrow">{range.eyebrow}</span>
                  <h3>{range.title}</h3>
                  <p>{range.summary}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="range-footnote"><span className="footnote-line" /> Product availability and specifications are confirmed directly with Alkhaleyah.</div>
        </section>

        <section className="story-section" id="our-story">
          <div className="story-image" role="img" aria-label="A close-up of carefully arranged grains, herbs, and pantry ingredients" />
          <div className="story-copy">
            <p className="eyebrow light-eyebrow"><span /> The Alkhaleyah point of view</p>
            <h2>Made for the<br /><em>everyday table.</em></h2>
            <p className="story-body">Food has a way of bringing people together. Alkhaleyah is here to make finding the ingredients for those everyday moments feel simple — with a clear range of food products for customers and trade partners.</p>
            <a className="text-link light-link" href="#contact">A note from Alkhaleyah <ArrowRight size={16} /></a>
            <span className="story-stamp"><Leaf size={22} /><span>Food<br />& family</span></span>
          </div>
        </section>

        <section className="values-section section-pad">
          <div className="values-title">
            <p className="eyebrow"><span /> The way we see it</p>
            <h2>Simple things,<br /><em>thoughtfully chosen.</em></h2>
          </div>
          <div className="values-list">
            <article className="value-item"><span className="value-icon"><Package size={19} /></span><div><h3>A clear range</h3><p>Find your way through our food categories with ease.</p></div><span className="value-number">01</span></article>
            <article className="value-item"><span className="value-icon"><Leaf size={19} /></span><div><h3>Everyday ingredients</h3><p>Familiar food for the recipes and rituals you return to.</p></div><span className="value-number">02</span></article>
            <article className="value-item"><span className="value-icon"><Sparkles size={19} /></span><div><h3>Here to help</h3><p>Talk with us about product details, availability, or supply.</p></div><span className="value-number">03</span></article>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-inner">
            <div>
              <p className="eyebrow light-eyebrow"><span /> Let's talk food</p>
              <h2>Something on<br /><em>your mind?</em></h2>
            </div>
            <div className="contact-aside">
              <p>For product details, availability, or wholesale enquiries, we’d love to hear from you.</p>
              <p className="contact-note">Contact details can be added here when you share the email address, phone number, or enquiry channel you prefer.</p>
              <a className="button button-light" href="#our-range">Browse the food range <ArrowRight size={17} /></a>
            </div>
            <span className="contact-orbit" aria-hidden="true">A</span>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
