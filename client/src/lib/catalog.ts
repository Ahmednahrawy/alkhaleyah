import type { Language } from "@/contexts/LanguageContext";
import blackHoneyImage from "@/assets/images/alkhaleyah_black_honey_1795340752261.jpg";
import datesImage from "@/assets/images/alkhaleyah_dates_1795293710764.jpg";
import dateSyrupImage from "@/assets/images/alkhaleyah_date_syrup_1795340751834.jpg";
import honeyImage from "@/assets/images/alkhaleyah_honey_1795293711325.jpg";
import oliveOilImage from "@/assets/images/alkhaleyah_olive_oil_1795293711836.jpg";
import olivesImage from "@/assets/images/alkhaleyah_olives_1795293711340.jpg";
import sidrHoneyImage from "@/assets/images/sidr_honey_1795501103022.jpg";
import wildflowerHoneyImage from "@/assets/images/wildflower_honey_1795501104242.jpg";
import cloverHoneyImage from "@/assets/images/clover_honey_1795501104442.jpg";
import rawHoneycombImage from "@/assets/images/raw_honeycomb_1795501104238.jpg";
import egyptianBlackHoneyImage from "@/assets/images/egyptian_black_honey_1795501104833.jpg";
import reserveBlackHoneyImage from "@/assets/images/reserve_black_honey_1795501104897.jpg";
import medjoolDatesImage from "@/assets/images/medjool_dates_1795501105565.jpg";
import sukkaryDatesImage from "@/assets/images/sukkary_dates_1795501106482.jpg";
import ajwaDatesImage from "@/assets/images/ajwa_dates_1795501106086.jpg";
import siwiDatesImage from "@/assets/images/siwi_dates_1795501106483.jpg";
import pureDateSyrupImage from "@/assets/images/pure_date_syrup_1795501106289.jpg";
import darkDateSyrupImage from "@/assets/images/dark_date_syrup_1795501107596.jpg";
import greenTableOlivesImage from "@/assets/images/green_table_olives_1795501229234.jpg";
import kalamataBlackOlivesImage from "@/assets/images/kalamata_black_olives_1795501230291.jpg";
import herbMarinatedOlivesImage from "@/assets/images/herb_marinated_olives_1795501230745.jpg";
import extraVirginOilImage from "@/assets/images/extra_virgin_oil_1795501230937.jpg";
import earlyHarvestOilImage from "@/assets/images/early_harvest_oil_1795501230810.jpg";
import everydayOliveOilImage from "@/assets/images/everyday_olive_oil_1795501231465.jpg";

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
  price: number;
};

export type ProductSubcategory = {
  id: string;
  image?: string;
  images?: string[];
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
  images?: string[];
  tone: string;
  en: LocalizedRangeCopy;
  ar: LocalizedRangeCopy;
  subcategories: ProductSubcategory[];
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
        image: sidrHoneyImage,
        en: {
          name: "Sidr Honey",
          note: "Rich amber floral aroma with a smooth, lingering finish.",
        },
        ar: {
          name: "عسل السدر",
          note: "نكهة غنية وعطرية مميزة وقوام ناعم مثالي للتقديم والضيافة.",
        },
        variants: [
          { id: "0.25kg", en: "0.25 kg", ar: "٢٥٠ جم", price: 320 },
          { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم", price: 590 },
          { id: "1kg", en: "1 kg", ar: "١ كجم", price: 1100 },
          { id: "3kg", en: "3 kg", ar: "٣ كجم", price: 3100 },
        ],
      },
      {
        id: "mountain-wildflower",
        image: wildflowerHoneyImage,
        en: {
          name: "Mountain Wildflower Honey",
          note: "Balanced seasonal blossom harvest for daily table use.",
        },
        ar: {
          name: "عسل زهور الجبل",
          note: "عسل أزهار طبيعي متوازن المذاق لمائدة الفطور اليومية.",
        },
        variants: [
          { id: "0.25kg", en: "0.25 kg", ar: "٢٥٠ جم", price: 220 },
          { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم", price: 410 },
          { id: "1kg", en: "1 kg", ar: "١ كجم", price: 760 },
          { id: "3kg", en: "3 kg", ar: "٣ كجم", price: 2150 },
        ],
      },
      {
        id: "clover-honey",
        image: cloverHoneyImage,
        en: {
          name: "Clover Blossom Honey",
          note: "Light golden colour and delicate sweetness for tea and baking.",
        },
        ar: {
          name: "عسل زهرة البرسيم",
          note: "لون ذهبي فاتح وحلاوة لطيفة تناسب المشروبات والحلويات.",
        },
        variants: [
          { id: "0.25kg", en: "0.25 kg", ar: "٢٥٠ جم", price: 140 },
          { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم", price: 250 },
          { id: "1kg", en: "1 kg", ar: "١ كجم", price: 460 },
          { id: "3kg", en: "3 kg", ar: "٣ كجم", price: 1290 },
        ],
      },
      {
        id: "raw-honeycomb",
        image: rawHoneycombImage,
        en: {
          name: "Raw Honeycomb",
          note: "Unprocessed natural comb filled with pure golden honey.",
        },
        ar: {
          name: "عسل بالشمع (قرص العسل)",
          note: "شمع طبيعي خام مملوء بالعسل الذهبي الصافي.",
        },
        variants: [
          { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم", price: 480 },
          { id: "1kg", en: "1 kg", ar: "١ كجم", price: 890 },
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
        image: egyptianBlackHoneyImage,
        en: {
          name: "Traditional Upper-Egypt Black Honey",
          note: "Pure slow-simmered sugarcane molasses with authentic depth.",
        },
        ar: {
          name: "عسل أسود صعيدي تقليدي",
          note: "قصب سكر مطهو ببطء على الطريقة الأصيلة بنكهة غنية وعميقة.",
        },
        variants: [
          { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم", price: 75 },
          { id: "1kg", en: "1 kg", ar: "١ كجم", price: 135 },
          { id: "3kg", en: "3 kg", ar: "٣ كجم", price: 380 },
          { id: "5kg", en: "5 kg", ar: "٥ كجم", price: 610 },
        ],
      },
      {
        id: "extra-thick-black-honey",
        image: reserveBlackHoneyImage,
        en: {
          name: "Rich Reserve Black Honey",
          note: "Extra-thick consistency suited for tahini pairings and breakfast spreads.",
        },
        ar: {
          name: "عسل أسود فاخر ثقيل القوام",
          note: "قوام كثيف ومتركّز مثالي للتقديم مع الطحينة والفطائر.",
        },
        variants: [
          { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم", price: 95 },
          { id: "1kg", en: "1 kg", ar: "١ كجم", price: 175 },
          { id: "3kg", en: "3 kg", ar: "٣ كجم", price: 490 },
          { id: "5kg", en: "5 kg", ar: "٥ كجم", price: 780 },
        ],
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
        image: medjoolDatesImage,
        en: {
          name: "Medjool Dates",
          note: "Large, tender, caramel-rich dates ideal for gifting and hosting.",
        },
        ar: {
          name: "تمر المجدول",
          note: "حبات كبيرة وطريّة بمذاق يشبه الكراميل مثالية للضيافة والهدايا.",
        },
        variants: [
          { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم", price: 190 },
          { id: "1kg", en: "1 kg", ar: "١ كجم", price: 360 },
          { id: "3kg", en: "3 kg", ar: "٣ كجم", price: 1020 },
          { id: "5kg", en: "5 kg", ar: "٥ كجم", price: 1650 },
          { id: "10kg", en: "10 kg", ar: "١٠ كجم", price: 3150 },
        ],
      },
      {
        id: "sukkary-dates",
        image: sukkaryDatesImage,
        en: {
          name: "Sukkary Dates",
          note: "Golden-amber, melt-in-the-mouth sweetness loved alongside Arabic coffee.",
        },
        ar: {
          name: "تمر السكري",
          note: "لون ذهبي وطعم حلو يذوب في الفم، الرفيق الأمثل للقهوة العربية.",
        },
        variants: [
          { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم", price: 150 },
          { id: "1kg", en: "1 kg", ar: "١ كجم", price: 280 },
          { id: "3kg", en: "3 kg", ar: "٣ كجم", price: 790 },
          { id: "5kg", en: "5 kg", ar: "٥ كجم", price: 1280 },
          { id: "10kg", en: "10 kg", ar: "١٠ كجم", price: 2450 },
        ],
      },
      {
        id: "ajwa-dates",
        image: ajwaDatesImage,
        en: {
          name: "Ajwa Dates",
          note: "Dark, soft-textured classic dates with a subtle balanced sweetness.",
        },
        ar: {
          name: "تمر العجوة",
          note: "تمر داكن طريّ القوام بحلاوة متوازنة وقيمة تقليدية عريقة.",
        },
        variants: [
          { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم", price: 240 },
          { id: "1kg", en: "1 kg", ar: "١ كجم", price: 450 },
          { id: "3kg", en: "3 kg", ar: "٣ كجم", price: 1280 },
          { id: "5kg", en: "5 kg", ar: "٥ كجم", price: 2050 },
          { id: "10kg", en: "10 kg", ar: "١٠ كجم", price: 3950 },
        ],
      },
      {
        id: "siwi-dates",
        image: siwiDatesImage,
        en: {
          name: "Siwi / Saidi Dates",
          note: "Firm-soft desert dates rich in natural flavour for everyday enjoyment.",
        },
        ar: {
          name: "تمر سيوي / صعيدي",
          note: "تمر واحات غني النكهة ومتوازن القوام للاستخدام اليومي.",
        },
        variants: [
          { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم", price: 90 },
          { id: "1kg", en: "1 kg", ar: "١ كجم", price: 165 },
          { id: "3kg", en: "3 kg", ar: "٣ كجم", price: 470 },
          { id: "5kg", en: "5 kg", ar: "٥ كجم", price: 750 },
          { id: "10kg", en: "10 kg", ar: "١٠ كجم", price: 1420 },
        ],
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
        image: pureDateSyrupImage,
        en: {
          name: "Pure Cold-Pressed Date Syrup",
          note: "100% pure date extract with clean, rounded fruit sweetness.",
        },
        ar: {
          name: "دبس تمر طبيعي صافي",
          note: "مستخلص تمر نقي ١٠٠٪ بحلاوة فاكهية متوازنة وبدون إضافات.",
        },
        variants: [
          { id: "0.5l", en: "0.5 liter", ar: "٠٫٥ لتر", price: 120 },
          { id: "1l", en: "1 liter", ar: "١ لتر", price: 220 },
          { id: "3l", en: "3 liter", ar: "٣ لتر", price: 620 },
        ],
      },
      {
        id: "dark-roast-dibs",
        image: darkDateSyrupImage,
        en: {
          name: "Dark Reserve Date Syrup",
          note: "Deeper caramelized finish suited for desserts, marinades, and tahini.",
        },
        ar: {
          name: "دبس تمر داكن مركز",
          note: "نكهة أعمق ومتركّزة تناسب الحلويات والتتبيلات وتقديم الطحينة.",
        },
        variants: [
          { id: "0.5l", en: "0.5 liter", ar: "٠٫٥ لتر", price: 140 },
          { id: "1l", en: "1 liter", ar: "١ لتر", price: 255 },
          { id: "3l", en: "3 liter", ar: "٣ لتر", price: 710 },
        ],
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
        image: greenTableOlivesImage,
        en: {
          name: "Whole Green Olives",
          note: "Crisp, bright brine-cured green olives with subtle citrus notes.",
        },
        ar: {
          name: "زيتون أخضر مخلل",
          note: "زيتون أخضر مقرمش محضّر بالملح والليمون بنكهة منعشة.",
        },
        variants: [
          { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم", price: 95 },
          { id: "1kg", en: "1 kg", ar: "١ كجم", price: 175 },
          { id: "3kg", en: "3 kg", ar: "٣ كجم", price: 490 },
          { id: "5kg", en: "5 kg", ar: "٥ كجم", price: 790 },
        ],
      },
      {
        id: "kalamata-black-olives",
        image: kalamataBlackOlivesImage,
        en: {
          name: "Kalamata & Black Olives",
          note: "Plump, deeply flavoured dark olives cured in traditional brine.",
        },
        ar: {
          name: "زيتون أسود / كالاماتا",
          note: "حبات ممتلئة غنية الطعم مُعدّة بالتخليل التقليدي.",
        },
        variants: [
          { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم", price: 125 },
          { id: "1kg", en: "1 kg", ar: "١ كجم", price: 230 },
          { id: "3kg", en: "3 kg", ar: "٣ كجم", price: 650 },
          { id: "5kg", en: "5 kg", ar: "٥ كجم", price: 1040 },
        ],
      },
      {
        id: "herb-marinated-olives",
        image: herbMarinatedOlivesImage,
        en: {
          name: "Herb & Olive-Oil Marinated Olives",
          note: "Finished with aromatic thyme, rosemary, and extra virgin olive oil.",
        },
        ar: {
          name: "زيتون متبّل بالأعشاب وزيت الزيتون",
          note: "متبّل بالزعتر البري والأعشاب العطرية وزيت الزيتون البكر.",
        },
        variants: [
          { id: "0.5kg", en: "0.5 kg", ar: "٠٫٥ كجم", price: 135 },
          { id: "1kg", en: "1 kg", ar: "١ كجم", price: 250 },
          { id: "3kg", en: "3 kg", ar: "٣ كجم", price: 700 },
          { id: "5kg", en: "5 kg", ar: "٥ كجم", price: 1120 },
        ],
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
        image: extraVirginOilImage,
        en: {
          name: "Extra Virgin First Cold Press",
          note: "Low-acidity, vibrant green-gold oil ideal for dipping and salads.",
        },
        ar: {
          name: "زيت زيتون بكر ممتاز (عصرة أولى على البارد)",
          note: "زيت ذو حموضة منخفضة ونكهة عشبية طازجة مثالي للتقديم والسلطات.",
        },
        variants: [
          { id: "0.5l", en: "0.5 liter", ar: "٠٫٥ لتر", price: 340 },
          { id: "1l", en: "1 liter", ar: "١ لتر", price: 640 },
        ],
      },
      {
        id: "early-harvest-unfiltered",
        image: earlyHarvestOilImage,
        en: {
          name: "Early Harvest Unfiltered",
          note: "Peppery, aromatic young-olive oil pressed within hours of picking.",
        },
        ar: {
          name: "زيت زيتون قطفة أولى غير مفلتر",
          note: "زيت موسمي غني بمضادات الأكسدة بنكهة قوية وعطرية.",
        },
        variants: [
          { id: "0.5l", en: "0.5 liter", ar: "٠٫٥ لتر", price: 390 },
          { id: "1l", en: "1 liter", ar: "١ لتر", price: 740 },
        ],
      },
      {
        id: "culinary-virgin-oil",
        image: everydayOliveOilImage,
        en: {
          name: "Everyday Virgin Olive Oil",
          note: "Smooth, balanced olive oil crafted for daily cooking and roasting.",
        },
        ar: {
          name: "زيت زيتون بكر للطبخ اليومي",
          note: "زيت متوازن وسلس يناسب الطهي اليومي والتتبيل.",
        },
        variants: [
          { id: "0.5l", en: "0.5 liter", ar: "٠٫٥ لتر", price: 275 },
          { id: "1l", en: "1 liter", ar: "١ لتر", price: 520 },
        ],
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

export function getSubcategoryImage(
  range: ProductRange,
  subcategory?: ProductSubcategory | null
): string {
  return subcategory?.images?.[0] || subcategory?.image || range.images?.[0] || range.image;
}

export function getRangeImages(range: ProductRange): string[] {
  const list = range.images?.filter(Boolean) ?? [];
  if (list.length > 0) return list;
  return range.image ? [range.image] : [];
}

export function getSubcategoryImages(
  range: ProductRange,
  subcategory?: ProductSubcategory | null
): string[] {
  const list = subcategory?.images?.filter(Boolean) ?? [];
  if (list.length > 0) return list;
  const single = subcategory?.image || range.images?.[0] || range.image;
  return single ? [single] : [];
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

export function formatPrice(amount: number, lang: Language): string {
  const formatted = amount.toLocaleString(lang === "ar" ? "ar-EG" : "en-US");
  return lang === "ar" ? `${formatted} ج.م` : `${formatted} EGP`;
}

export function getSubcategoryMinPrice(subcategory: ProductSubcategory): number {
  return Math.min(...subcategory.variants.map((v) => v.price));
}

export function getRangeMinPrice(range: ProductRange): number {
  return Math.min(
    ...range.subcategories.flatMap((sub) => sub.variants.map((v) => v.price))
  );
}

export type PriceFilterId =
  | "all"
  | "under-250"
  | "250-600"
  | "600-1500"
  | "over-1500";

export type WeightFilterId =
  | "all"
  | "small-pack"
  | "1kg"
  | "3-5kg"
  | "10kg"
  | "bottles";

export function variantMatchesPrice(
  price: number,
  priceFilter: PriceFilterId
): boolean {
  switch (priceFilter) {
    case "under-250":
      return price <= 250;
    case "250-600":
      return price > 250 && price <= 600;
    case "600-1500":
      return price > 600 && price <= 1500;
    case "over-1500":
      return price > 1500;
    case "all":
    default:
      return true;
  }
}

export function variantMatchesWeight(
  variantId: string,
  weightFilter: WeightFilterId
): boolean {
  switch (weightFilter) {
    case "small-pack":
      return variantId === "0.25kg" || variantId === "0.5kg";
    case "1kg":
      return variantId === "1kg";
    case "3-5kg":
      return variantId === "3kg" || variantId === "5kg";
    case "10kg":
      return variantId === "10kg";
    case "bottles":
      return variantId === "0.5l" || variantId === "1l" || variantId === "3l";
    case "all":
    default:
      return true;
  }
}

export function getMatchingVariants(
  subcategory: ProductSubcategory,
  priceFilter: PriceFilterId,
  weightFilter: WeightFilterId
): ProductVariant[] {
  return subcategory.variants.filter(
    (v) =>
      variantMatchesPrice(v.price, priceFilter) &&
      variantMatchesWeight(v.id, weightFilter)
  );
}

export function matchesSubcategoryFilters(
  subcategory: ProductSubcategory,
  priceFilter: PriceFilterId,
  weightFilter: WeightFilterId
): boolean {
  return getMatchingVariants(subcategory, priceFilter, weightFilter).length > 0;
}

export type CatalogSearchResult = {
  range: ProductRange;
  subcategory: ProductSubcategory;
  minPrice: number;
};

export function getAllSubcategoryEntries(): CatalogSearchResult[] {
  return productRanges.flatMap((range) =>
    range.subcategories.map((subcategory) => ({
      range,
      subcategory,
      minPrice: getSubcategoryMinPrice(subcategory),
    }))
  );
}

export function searchCatalog(query: string): CatalogSearchResult[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const results: CatalogSearchResult[] = [];

  for (const range of productRanges) {
    for (const subcategory of range.subcategories) {
      const searchable = [
        range.slug,
        range.en.title,
        range.en.eyebrow,
        range.en.summary,
        range.ar.title,
        range.ar.eyebrow,
        range.ar.summary,
        subcategory.en.name,
        subcategory.en.note,
        subcategory.ar.name,
        subcategory.ar.note,
        ...subcategory.variants.map((v) => `${v.en} ${v.ar}`),
      ]
        .join(" ")
        .toLowerCase();

      const matches = tokens.every((token) => searchable.includes(token));
      if (matches) {
        results.push({
          range,
          subcategory,
          minPrice: getSubcategoryMinPrice(subcategory),
        });
      }
    }
  }

  return results;
}
