import type { Language } from "@/contexts/LanguageContext";
import blackHoneyImage from "@/assets/images/alkhaleyah_black_honey_1795340752261.jpg";
import datesImage from "@/assets/images/alkhaleyah_dates_1795293710764.jpg";
import dateSyrupImage from "@/assets/images/alkhaleyah_date_syrup_1795340751834.jpg";
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
    slug: "honey",
    image: honeyImage,
    tone: "sage",
    en: {
      title: "Natural honey",
      titleLead: "Natural",
      titleAccent: "honey",
      eyebrow: "From the hive",
      summary:
        "Raw golden honey gathered for morning tables, tea rituals, and everyday kitchens.",
      detail:
        "Explore Alkhaleyah's honey range and find the varieties and pack sizes that suit your home or business. For harvest details, availability, and wholesale supply, please contact us directly.",
      imageAlt: "Raw golden honey in a glass jar with honeycomb and wooden dipper",
    },
    ar: {
      title: "العسل الطبيعي",
      titleLead: "العسل",
      titleAccent: "الطبيعي",
      eyebrow: "من الخلية مباشرة",
      summary:
        "عسل ذهبي صافٍ لمائدة الصباح، ولحظات الضيافة، والاستخدام اليومي في المطبخ.",
      detail:
        "استكشف تشكيلة العسل لدى الخلية وتعرّف على الأصناف وأحجام العبوات المناسبة لبيتك أو أعمالك. للاستفسار عن المواسم والتوافر وطلبات الجملة، تواصل معنا مباشرةً.",
      imageAlt: "عسل طبيعي ذهبي في وعاء زجاجي مع قرص العسل",
    },
  },
  {
    slug: "black-honey",
    image: blackHoneyImage,
    tone: "clay",
    en: {
      title: "Black honey",
      titleLead: "Black",
      titleAccent: "honey",
      eyebrow: "Sugarcane molasses",
      summary:
        "Thick, dark sugarcane black honey with a deep, comforting sweetness for everyday tables.",
      detail:
        "Discover Alkhaleyah's black honey range, prepared to preserve its rich body and traditional flavour for breakfasts, tahini pairings, and trade supply. Contact us for pack sizes and current availability.",
      imageAlt: "Dark glossy black honey sugarcane molasses in a glass jar with wooden spoon",
    },
    ar: {
      title: "العسل الأسود",
      titleLead: "العسل",
      titleAccent: "الأسود",
      eyebrow: "غنيّ وطبيعي",
      summary:
        "عسل أسود صافٍ بقوامٍ غني ونكهة أصيلة لمائدة الفطور والوصفات التقليدية.",
      detail:
        "استكشف تشكيلة العسل الأسود لدى الخلية، المحضّر بعناية ليجمع بين الطعم الغني والقوام الأصيل للمطابخ اليومية وشركاء التجارة. تواصل معنا للتعرّف على الأحجام والتوافر.",
      imageAlt: "عسل أسود طبيعي غني في وعاء زجاجي مع ملعقة خشبية",
    },
  },
  {
    slug: "dates",
    image: datesImage,
    tone: "olive",
    en: {
      title: "Fine dates",
      titleLead: "Fine",
      titleAccent: "dates",
      eyebrow: "Naturally sweet",
      summary:
        "Carefully selected dates made for hospitality, sharing, and daily nourishment.",
      detail:
        "Discover Alkhaleyah's dates category for households, gifting, and trade partners. Exact cultivars, grades, origins, and seasonal availability are confirmed directly with our team.",
      imageAlt: "Plump Arabian Medjool and Sukkary dates in a stoneware bowl",
    },
    ar: {
      title: "التمور الفاخرة",
      titleLead: "التمور",
      titleAccent: "الفاخرة",
      eyebrow: "حلاوةٌ طبيعية",
      summary:
        "تمور منتقاة بعناية للضيافة والمشاركة والتغذية اليومية حول المائدة.",
      detail:
        "تعرّف على فئة التمور من الخلية للمنازل والهدايا وشركاء التجارة. تُؤكَّد الأصناف والدرجات والمصدر والتوافر الموسمي مباشرةً مع فريقنا.",
      imageAlt: "تمور فاخرة مرتّبة في طبق خزفي",
    },
  },
  {
    slug: "date-syrup",
    image: dateSyrupImage,
    tone: "sand",
    en: {
      title: "Date syrup",
      titleLead: "Date",
      titleAccent: "syrup",
      eyebrow: "Pressed from dates",
      summary:
        "Velvety, pure date syrup (dibs) crafted for drizzling, sweetening, and baking.",
      detail:
        "Explore Alkhaleyah's date syrup range—a naturally rich sweetener made from selected dates for homes, cafes, and foodservice partners. Reach out for bottle formats and wholesale details.",
      imageAlt: "Dark glossy date syrup bottle and pouring bowl beside ripe dates",
    },
    ar: {
      title: "دبس التمر",
      titleLead: "دبس",
      titleAccent: "التمر",
      eyebrow: "مستخلصٌ من التمر",
      summary:
        "دبس تمر طبيعي بقوامٍ مخملي وحلاوة نقية للتحلية والتقديم والحلويات.",
      detail:
        "تعرّف على دبس التمر من الخلية، المحضّر من أجود التمور ليمنح موائدك ووصفاتك حلاوةً طبيعية متوازنة. تواصل معنا للاستفسار عن أحجام العبوات وتفاصيل التوريد.",
      imageAlt: "عبوة دبس التمر الطبيعي وطبق تقديم بجانب حبات التمر",
    },
  },
  {
    slug: "olives",
    image: olivesImage,
    tone: "clay",
    en: {
      title: "Cured olives",
      titleLead: "Cured",
      titleAccent: "olives",
      eyebrow: "From the grove",
      summary:
        "Table olives prepared to bring depth, colour, and character to every spread.",
      detail:
        "Browse Alkhaleyah's olives range. Reach out to our team for current varieties, curing styles, jar and bulk formats, and trade availability.",
      imageAlt: "Marinated green and dark olives with fresh olive leaves",
    },
    ar: {
      title: "الزيتون",
      titleLead: "أصناف",
      titleAccent: "الزيتون",
      eyebrow: "من بساتين الزيتون",
      summary:
        "زيتون مائدة مُعدّ ليمنح أطباقك وموائدك نكهةً أصيلة وحضوراً مميزاً.",
      detail:
        "تصفّح تشكيلة الزيتون لدى الخلية. تواصل مع فريقنا للتعرّف على الأصناف المتاحة وطرق التحضير وأحجام العبوات وتوافر التوريد.",
      imageAlt: "زيتون أخضر وأسود متبّل مع أوراق الزيتون الطازجة",
    },
  },
  {
    slug: "olive-oil",
    image: oliveOilImage,
    tone: "sand",
    en: {
      title: "Olive oil",
      titleLead: "Olive",
      titleAccent: "oil",
      eyebrow: "Cold-pressed care",
      summary:
        "Rich, fragrant olive oil — a cornerstone for cooking, dressing, and dipping.",
      detail:
        "Explore Alkhaleyah's olive oil category for everyday kitchens and commercial partners. Contact us for harvest notes, bottle and tin formats, and current availability.",
      imageAlt: "Cold-pressed extra virgin olive oil with fresh olive branches",
    },
    ar: {
      title: "زيت الزيتون",
      titleLead: "زيت",
      titleAccent: "الزيتون",
      eyebrow: "عصرةٌ على البارد",
      summary:
        "زيت زيتون غنيّ بعبيره ونكهته — أساسٌ لا غنى عنه للطبخ والتتبيل والتقديم.",
      detail:
        "استكشف فئة زيت الزيتون لدى الخلية للمطابخ اليومية والشركاء التجاريين. تواصل معنا لمعرفة تفاصيل القطفة وأحجام العبوات والتوافر الحالي.",
      imageAlt: "زيت زيتون بكر ممتاز معصور على البارد مع أغصان الزيتون",
    },
  },
];

const legacySlugAliases: Record<string, string> = {
  "pantry-staples": "honey",
  "dates-dried-fruit": "dates",
  "spices-herbs": "olives",
  "grains-pulses": "olive-oil",
};

export function findProductRange(slug?: string): ProductRange | undefined {
  if (!slug) return undefined;
  const resolvedSlug = legacySlugAliases[slug] ?? slug;
  return productRanges.find((item) => item.slug === resolvedSlug);
}

export function getRangeCopy(range: ProductRange, lang: Language): LocalizedRangeCopy {
  return range[lang];
}
