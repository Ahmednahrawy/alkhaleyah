import type { Language } from "@/contexts/LanguageContext";
import datesImage from "@/assets/images/alkhaleyah_dates_1795293710764.jpg";
import honeyImage from "@/assets/images/alkhaleyah_honey_1795293711325.jpg";
import oliveOilImage from "@/assets/images/alkhaleyah_olive_oil_1795293711836.jpg";
import olivesImage from "@/assets/images/alkhaleyah_olives_1795293711340.jpg";

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
    image: honeyImage,
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
      imageAlt: "Raw golden honey in a glass jar with honeycomb and wooden dipper",
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
      imageAlt: "عسل طبيعي ذهبي في وعاء زجاجي مع قرص العسل",
    },
  },
  {
    slug: "grains-pulses",
    image: oliveOilImage,
    tone: "sand",
    en: {
      title: "Grains & pulses",
      titleLead: "Grains &",
      titleAccent: "pulses",
      eyebrow: "From the pantry",
      summary: "Familiar foundations for meals shared across the table.",
      detail:
        "Browse the grains and pulses category. Specific varieties, pack sizes, sourcing information, and availability can be added as Alkhaleyah's confirmed product list is provided.",
      imageAlt: "Cold-pressed extra virgin olive oil with fresh olive branches",
    },
    ar: {
      title: "الحبوب والبقوليات",
      titleLead: "الحبوب",
      titleAccent: "والبقوليات",
      eyebrow: "من خيرات المؤونة",
      summary: "أساسيات مألوفة لوجبات تُشارك حول المائدة.",
      detail:
        "تصفّح فئة الحبوب والبقوليات. يمكن إضافة الأصناف المحددة وأحجام العبوات ومعلومات المصدر والتوافر فور اعتماد قائمة منتجات الخلية الرسمية.",
      imageAlt: "زيت زيتون بكر ممتاز معصورة على البارد مع أغصان الزيتون",
    },
  },
  {
    slug: "spices-herbs",
    image: olivesImage,
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
      imageAlt: "Marinated green and dark olives with fresh olive leaves",
    },
    ar: {
      title: "التوابل والأعشاب",
      titleLead: "التوابل",
      titleAccent: "والأعشاب",
      eyebrow: "نكهةٌ أعمق",
      summary: "ألوان رفّ التوابل وطابعه الأصيل، مجموعةٌ في مكان واحد.",
      detail:
        "اكتشف فئة التوابل والأعشاب. لم يتم افتراض أسماء الأصناف أو مناشئها أو تفاصيل التعبئة؛ تواصل مع الخلية للتعرّف على التشكيلة المتوفرة حالياً.",
      imageAlt: "زيتون أخضر وأسود متبّل مع أوراق الزيتون الطازجة",
    },
  },
  {
    slug: "dates-dried-fruit",
    image: datesImage,
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
      imageAlt: "Plump Arabian Medjool and Sukkary dates in a stoneware bowl",
    },
    ar: {
      title: "التمور والفواكه المجففة",
      titleLead: "التمور والفواكه",
      titleAccent: "المجففة",
      eyebrow: "بطبيعتها في كل بيت",
      summary: "فئة مؤونة مثالية للضيافة والمشاركة والتقديم على المائدة.",
      detail:
        "استكشف فئة التمور والفواكه المجففة. يُرجى تأكيد الأصناف والدرجات والمصدر والتوافر مع شركة الخلية قبل الطلب.",
      imageAlt: "تمور فاخرة مرتّبة في طبق خزفي",
    },
  },
];

export function getRangeCopy(range: ProductRange, lang: Language): LocalizedRangeCopy {
  return range[lang];
}
