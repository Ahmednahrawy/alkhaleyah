export type ProductRange = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  image: string;
  detail: string;
  tone: string;
};

export const productRanges: ProductRange[] = [
  {
    slug: "pantry-staples",
    title: "Pantry staples",
    eyebrow: "Everyday essentials",
    summary: "A thoughtful home for the ingredients that make everyday cooking feel like home.",
    image: "/manus-storage/alkhaleyah-pantry-web_d41c78fb.jpg",
    detail: "Explore the pantry range and find the products that fit your kitchen, table, or business. For item-level availability and specifications, please contact Alkhaleyah directly.",
    tone: "sage",
  },
  {
    slug: "grains-pulses",
    title: "Grains & pulses",
    eyebrow: "From the pantry",
    summary: "Familiar foundations for meals shared across the table.",
    image: "/manus-storage/alkhaleyah-pantry-web_d41c78fb.jpg",
    detail: "Browse the grains and pulses category. Specific varieties, pack sizes, sourcing information, and availability can be added as Alkhaleyah's confirmed product list is provided.",
    tone: "sand",
  },
  {
    slug: "spices-herbs",
    title: "Spices & herbs",
    eyebrow: "A little more flavour",
    summary: "The colour and character of the spice shelf, gathered in one place.",
    image: "/manus-storage/alkhaleyah-spices-web_08376d5d.jpg",
    detail: "Discover the spices and herbs category. Product names, origins, formats, and pack details are intentionally not assumed; ask Alkhaleyah for the current range.",
    tone: "clay",
  },
  {
    slug: "dates-dried-fruit",
    title: "Dates & dried fruit",
    eyebrow: "Naturally at home",
    summary: "A pantry category made for snacking, sharing, and bringing to the table.",
    image: "/manus-storage/alkhaleyah-pantry-web_d41c78fb.jpg",
    detail: "Explore dates and dried fruit as a product category. Exact varieties, grades, origin, and availability should be confirmed with Alkhaleyah before ordering.",
    tone: "olive",
  },
];
