import type { Language } from "@/contexts/LanguageContext";

export type LocalizedRangeCopy = {
  title: string;
  titleLead: string;
  titleAccent: string;
  eyebrow: string;
  summary: string;
  detail: string;
  imageAlt: string;
};

export type ProductRange = {
  slug: string;
  image: string;
  tone: string;
  en: LocalizedRangeCopy;
  ar: LocalizedRangeCopy;
};

export const productRanges: ProductRange[] = [
  {
    slug: "pantry-staples",
    image: "/manus-storage/alkhaleyah-pantry-web_d41c78fb.jpg",
    tone: "sage",
    en: {
      title: "Pantry staples",
      titleLead: "Pantry",
      titleAccent: "staples",
      eyebrow: "Everyday essentials",
      summary:
        "A thoughtful home for the ingredients that make everyday cooking feel like home.",
      detail:
        "Explore the pantry range and find the products that fit your kitchen, table, or business. For item-level availability and specifications, please contact Alkhaleyah directly.",
      imageAlt: "Pantry staples food ingredients arranged on a table",
    },
    ar: {
      title: "أساسيات المؤونة",
      titleLead: "أساسيات",
      titleAccent: "المؤونة",
      eyebrow: "ضرورات كل يوم",
      summary:
        "موطنٌ مدروس للمكوّنات التي تمنح طبخك اليومي دفء البيت.",
      detail:
        "استكشف تشكيلة أساسيات المؤونة واعثر على المنتجات التي تناسب مطبخك أو مائدتك أو أعمالك. للاستفسار عن توافر الأصناف ومواصفاتها، يُرجى التواصل مع شركة الخلية مباشرةً.",
      imageAlt: "مكوّنات أساسيات المؤونة مرتّبة على مائدة",
    },
  },
  {
    slug: "grains-pulses",
    image: "/manus-storage/alkhaleyah-pantry-web_d41c78fb.jpg",
    tone: "sand",
    en: {
      title: "Grains & pulses",
      titleLead: "Grains &",
      titleAccent: "pulses",
      eyebrow: "From the pantry",
      summary: "Familiar foundations for meals shared across the table.",
      detail:
        "Browse the grains and pulses category. Specific varieties, pack sizes, sourcing information, and availability can be added as Alkhaleyah's confirmed product list is provided.",
      imageAlt: "Grains and pulses arranged on a table",
    },
    ar: {
      title: "الحبوب والبقوليات",
      titleLead: "الحبوب",
      titleAccent: "والبقوليات",
      eyebrow: "من خيرات المؤونة",
      summary: "أساسيات مألوفة لوجبات تُشارك حول المائدة.",
      detail:
        "تصفّح فئة الحبوب والبقوليات. يمكن إضافة الأصناف المحددة وأحجام العبوات ومعلومات المصدر والتوافر فور اعتماد قائمة منتجات الخلية الرسمية.",
      imageAlt: "الحبوب والبقوليات مرتّبة على مائدة",
    },
  },
  {
    slug: "spices-herbs",
    image: "/manus-storage/alkhaleyah-spices-web_08376d5d.jpg",
    tone: "clay",
    en: {
      title: "Spices & herbs",
      titleLead: "Spices &",
      titleAccent: "herbs",
      eyebrow: "A little more flavour",
      summary:
        "The colour and character of the spice shelf, gathered in one place.",
      detail:
        "Discover the spices and herbs category. Product names, origins, formats, and pack details are intentionally not assumed; ask Alkhaleyah for the current range.",
      imageAlt: "Spices and herbs arranged on a table",
    },
    ar: {
      title: "التوابل والأعشاب",
      titleLead: "التوابل",
      titleAccent: "والأعشاب",
      eyebrow: "نكهةٌ أعمق",
      summary: "ألوان رفّ التوابل وطابعه الأصيل، مجموعةٌ في مكان واحد.",
      detail:
        "اكتشف فئة التوابل والأعشاب. لم يتم افتراض أسماء الأصناف أو مناشئها أو تفاصيل التعبئة؛ تواصل مع الخلية للتعرّف على التشكيلة المتوفرة حالياً.",
      imageAlt: "التوابل والأعشاب مرتّبة على مائدة",
    },
  },
  {
    slug: "dates-dried-fruit",
    image: "/manus-storage/alkhaleyah-pantry-web_d41c78fb.jpg",
    tone: "olive",
    en: {
      title: "Dates & dried fruit",
      titleLead: "Dates &",
      titleAccent: "dried fruit",
      eyebrow: "Naturally at home",
      summary:
        "A pantry category made for snacking, sharing, and bringing to the table.",
      detail:
        "Explore dates and dried fruit as a product category. Exact varieties, grades, origin, and availability should be confirmed with Alkhaleyah before ordering.",
      imageAlt: "Dates and dried fruit arranged on a table",
    },
    ar: {
      title: "التمور والفواكه المجففة",
      titleLead: "التمور والفواكه",
      titleAccent: "المجففة",
      eyebrow: "بطبيعتها في كل بيت",
      summary: "فئة مؤونة مثالية للضيافة والمشاركة والتقديم على المائدة.",
      detail:
        "استكشف فئة التمور والفواكه المجففة. يُرجى تأكيد الأصناف والدرجات والمصدر والتوافر مع شركة الخلية قبل الطلب.",
      imageAlt: "التمور والفواكه المجففة مرتّبة على مائدة",
    },
  },
];

export function getRangeCopy(range: ProductRange, lang: Language): LocalizedRangeCopy {
  return range[lang];
}
