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

export type ProductVariant = {
  id: string;
  en: string;
  ar: string;
};

export type ProductSubcategory = {
  id: string;
  en: {
    name: string;
    note: string;
  };
  ar: {
    name: string;
    note: string;
  };
  variants: ProductVariant[];
};

export type ProductRange = {
  slug: string;
  image: string;
  tone: string;
  en: LocalizedRangeCopy;
  ar: LocalizedRangeCopy;
  subcategories: ProductSubcategory[];
};

const WEIGHT_VARIANTS_DATES: ProductVariant[] = [
  { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم" },
  { id: "1kg", en: "1 kg", ar: "١ كجم" },
  { id: "3kg", en: "3 kg", ar: "٣ كجم" },
  { id: "5kg", en: "5 kg", ar: "٥ كجم" },
  { id: "10kg", en: "10 kg", ar: "١٠ كجم" },
];

const WEIGHT_VARIANTS_HONEY: ProductVariant[] = [
  { id: "0.25kg", en: "0.25 kg", ar: "٢٥٠ جم" },
  { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم" },
  { id: "1kg", en: "1 kg", ar: "١ كجم" },
  { id: "3kg", en: "3 kg", ar: "٣ كجم" },
];

const WEIGHT_VARIANTS_BLACK_HONEY: ProductVariant[] = [
  { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم" },
  { id: "1kg", en: "1 kg", ar: "١ كجم" },
  { id: "3kg", en: "3 kg", ar: "٣ كجم" },
  { id: "5kg", en: "5 kg", ar: "٥ كجم" },
];

const VOLUME_VARIANTS_OIL: ProductVariant[] = [
  { id: "0.5l", en: "0.5 liter", ar: "٠٫٥ لتر" },
  { id: "1l", en: "1 liter", ar: "١ لتر" },
];

const VOLUME_VARIANTS_SYRUP: ProductVariant[] = [
  { id: "0.5l", en: "0.5 liter", ar: "٠٫٥ لتر" },
  { id: "1l", en: "1 liter", ar: "١ لتر" },
  { id: "3l", en: "3 liter", ar: "٣ لتر" },
];

const WEIGHT_VARIANTS_OLIVES: ProductVariant[] = [
  { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم" },
  { id: "1kg", en: "1 kg", ar: "١ كجم" },
  { id: "3kg", en: "3 kg", ar: "٣ كجم" },
  { id: "5kg", en: "5 kg", ar: "٥ كجم" },
];

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
        "Explore Alkhaleyah's honey varieties below, select your preferred weight, and add items directly to your order cart.",
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
        "تصفّح أصناف العسل لدى الخلية بالأسفل، واختر الوزن المناسب وأضفه مباشرةً إلى سلة الطلب.",
      imageAlt: "عسل طبيعي ذهبي في وعاء زجاجي مع قرص العسل",
    },
    subcategories: [
      {
        id: "sidr-honey",
        en: {
          name: "Sidr Honey",
          note: "Rich amber floral aroma with a smooth, lingering finish.",
        },
        ar: {
          name: "عسل السدر",
          note: "نكهة غنية وعطرية مميزة وقوام ناعم مثالي للتقديم والضيافة.",
        },
        variants: WEIGHT_VARIANTS_HONEY,
      },
      {
        id: "mountain-wildflower",
        en: {
          name: "Mountain Wildflower Honey",
          note: "Balanced seasonal blossom harvest for daily table use.",
        },
        ar: {
          name: "عسل زهور الجبل",
          note: "عسل أزهار طبيعي متوازن المذاق لمائدة الفطور اليومية.",
        },
        variants: WEIGHT_VARIANTS_HONEY,
      },
      {
        id: "clover-honey",
        en: {
          name: "Clover Blossom Honey",
          note: "Light golden colour and delicate sweetness for tea and baking.",
        },
        ar: {
          name: "عسل زهرة البرسيم",
          note: "لون ذهبي فاتح وحلاوة لطيفة تناسب المشروبات والحلويات.",
        },
        variants: WEIGHT_VARIANTS_HONEY,
      },
      {
        id: "raw-honeycomb",
        en: {
          name: "Raw Honeycomb",
          note: "Unprocessed natural comb filled with pure golden honey.",
        },
        ar: {
          name: "عسل بالشمع (قرص العسل)",
          note: "شمع طبيعي خام مملوء بالعسل الذهبي الصافي.",
        },
        variants: [
          { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم" },
          { id: "1kg", en: "1 kg", ar: "١ كجم" },
        ],
      },
    ],
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
        "Choose from our traditional sugarcane black honey varieties and select home or bulk pack weights to add to your cart.",
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
        "اختر من أصناف العسل الأسود الصعيدي والتقليدي وحدّد الوزن المناسب لإضافته إلى سلة الطلب.",
      imageAlt: "عسل أسود طبيعي غني في وعاء زجاجي مع ملعقة خشبية",
    },
    subcategories: [
      {
        id: "upper-egypt-black-honey",
        en: {
          name: "Traditional Upper-Egypt Black Honey",
          note: "Pure slow-simmered sugarcane molasses with authentic depth.",
        },
        ar: {
          name: "عسل أسود صعيدي تقليدي",
          note: "قصب سكر مطهو ببطء على الطريقة الأصيلة بنكهة غنية وعميقة.",
        },
        variants: WEIGHT_VARIANTS_BLACK_HONEY,
      },
      {
        id: "extra-thick-black-honey",
        en: {
          name: "Rich Reserve Black Honey",
          note: "Extra-thick consistency suited for tahini pairings and breakfast spreads.",
        },
        ar: {
          name: "عسل أسود فاخر ثقيل القوام",
          note: "قوام كثيف ومتركّز مثالي للتقديم مع الطحينة والفطائر.",
        },
        variants: WEIGHT_VARIANTS_BLACK_HONEY,
      },
    ],
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
        "Browse our date cultivars below—available across home and wholesale weights from 0.5 kg up to 10 kg cartons.",
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
        "تصفّح أنواع التمور بالأسفل — متوفرة بأوزان متعددة تبدأ من ٠٫٥ كجم وحتى عبوات ١٠ كجم.",
      imageAlt: "تمور فاخرة مرتّبة في طبق خزفي",
    },
    subcategories: [
      {
        id: "medjool-dates",
        en: {
          name: "Medjool Dates",
          note: "Large, tender, caramel-rich dates ideal for gifting and hosting.",
        },
        ar: {
          name: "تمر المجدول",
          note: "حبات كبيرة وطريّة بمذاق يشبه الكراميل مثالية للضيافة والهدايا.",
        },
        variants: WEIGHT_VARIANTS_DATES,
      },
      {
        id: "sukkary-dates",
        en: {
          name: "Sukkary Dates",
          note: "Golden-amber, melt-in-the-mouth sweetness loved alongside Arabic coffee.",
        },
        ar: {
          name: "تمر السكري",
          note: "لون ذهبي وطعم حلو يذوب في الفم، الرفيق الأمثل للقهوة العربية.",
        },
        variants: WEIGHT_VARIANTS_DATES,
      },
      {
        id: "ajwa-dates",
        en: {
          name: "Ajwa Dates",
          note: "Dark, soft-textured classic dates with a subtle balanced sweetness.",
        },
        ar: {
          name: "تمر العجوة",
          note: "تمر داكن طريّ القوام بحلاوة متوازنة وقيمة تقليدية عريقة.",
        },
        variants: WEIGHT_VARIANTS_DATES,
      },
      {
        id: "siwi-dates",
        en: {
          name: "Siwi / Saidi Dates",
          note: "Firm-soft desert dates rich in natural flavour for everyday enjoyment.",
        },
        ar: {
          name: "تمر سيوي / صعيدي",
          note: "تمر واحات غني النكهة ومتوازن القوام للاستخدام اليومي.",
        },
        variants: WEIGHT_VARIANTS_DATES,
      },
    ],
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
        "Select from our pure date syrup varieties in kitchen and hospitality bottle sizes.",
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
        "اختر صنف دبس التمر والحجم المناسب لبيتك أو لمطبخك التجاري وأضفه إلى السلة.",
      imageAlt: "عبوة دبس التمر الطبيعي وطبق تقديم بجانب حبات التمر",
    },
    subcategories: [
      {
        id: "pure-date-dibs",
        en: {
          name: "Pure Cold-Pressed Date Syrup",
          note: "100% pure date extract with clean, rounded fruit sweetness.",
        },
        ar: {
          name: "دبس تمر طبيعي صافي",
          note: "مستخلص تمر نقي ١٠٠٪ بحلاوة فاكهية متوازنة وبدون إضافات.",
        },
        variants: VOLUME_VARIANTS_SYRUP,
      },
      {
        id: "dark-roast-dibs",
        en: {
          name: "Dark Reserve Date Syrup",
          note: "Deeper caramelized finish suited for desserts, marinades, and tahini.",
        },
        ar: {
          name: "دبس تمر داكن مركز",
          note: "نكهة أعمق ومتركّزة تناسب الحلويات والتتبيلات وتقديم الطحينة.",
        },
        variants: VOLUME_VARIANTS_SYRUP,
      },
    ],
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
        "Browse our cured olive selections and pick the ideal pack weight for home or kitchen supply.",
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
        "تصفّح أصناف الزيتون المحضّرة لدينا واختر الوزن المناسب لمائدتك أو لمطعمك.",
      imageAlt: "زيتون أخضر وأسود متبّل مع أوراق الزيتون الطازجة",
    },
    subcategories: [
      {
        id: "green-table-olives",
        en: {
          name: "Whole Green Olives",
          note: "Crisp, bright brine-cured green olives with subtle citrus notes.",
        },
        ar: {
          name: "زيتون أخضر مخلل",
          note: "زيتون أخضر مقرمش محضّر بالملح والليمون بنكهة منعشة.",
        },
        variants: WEIGHT_VARIANTS_OLIVES,
      },
      {
        id: "kalamata-black-olives",
        en: {
          name: "Kalamata & Black Olives",
          note: "Plump, deeply flavoured dark olives cured in traditional brine.",
        },
        ar: {
          name: "زيتون أسود / كالاماتا",
          note: "حبات ممتلئة غنية الطعم مُعدّة بالتخليل التقليدي.",
        },
        variants: WEIGHT_VARIANTS_OLIVES,
      },
      {
        id: "herb-marinated-olives",
        en: {
          name: "Herb & Olive-Oil Marinated Olives",
          note: "Finished with aromatic thyme, rosemary, and extra virgin olive oil.",
        },
        ar: {
          name: "زيتون متبّل بالأعشاب وزيت الزيتون",
          note: "متبّل بالزعتر البري والأعشاب العطرية وزيت الزيتون البكر.",
        },
        variants: WEIGHT_VARIANTS_OLIVES,
      },
    ],
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
        "Select your preferred olive oil press in 0.5 liter or 1 liter bottles and add to your cart.",
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
        "اختر صنف زيت الزيتون المفضل لديك بحجم ٠٫٥ لتر أو ١ لتر وأضفه مباشرةً إلى السلة.",
      imageAlt: "زيت زيتون بكر ممتاز معصور على البارد مع أغصان الزيتون",
    },
    subcategories: [
      {
        id: "extra-virgin-cold-press",
        en: {
          name: "Extra Virgin First Cold Press",
          note: "Low-acidity, vibrant green-gold oil ideal for dipping and salads.",
        },
        ar: {
          name: "زيت زيتون بكر ممتاز (عصرة أولى على البارد)",
          note: "زيت ذو حموضة منخفضة ونكهة عشبية طازجة مثالي للتقديم والسلطات.",
        },
        variants: VOLUME_VARIANTS_OIL,
      },
      {
        id: "early-harvest-unfiltered",
        en: {
          name: "Early Harvest Unfiltered",
          note: "Peppery, aromatic young-olive oil pressed within hours of picking.",
        },
        ar: {
          name: "زيت زيتون قطفة أولى غير مفلتر",
          note: "زيت موسمي غني بمضادات الأكسدة بنكهة قوية وعطرية.",
        },
        variants: VOLUME_VARIANTS_OIL,
      },
      {
        id: "culinary-virgin-oil",
        en: {
          name: "Everyday Virgin Olive Oil",
          note: "Smooth, balanced olive oil crafted for daily cooking and roasting.",
        },
        ar: {
          name: "زيت زيتون بكر للطبخ اليومي",
          note: "زيت متوازن وسلس يناسب الطهي اليومي والتتبيل.",
        },
        variants: VOLUME_VARIANTS_OIL,
      },
    ],
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

export function findSubcategoryAndVariant(
  categorySlug: string,
  subcategoryId: string,
  variantId: string
) {
  const range = findProductRange(categorySlug);
  const subcategory = range?.subcategories.find((sub) => sub.id === subcategoryId);
  const variant = subcategory?.variants.find((v) => v.id === variantId);
  return { range, subcategory, variant };
}
