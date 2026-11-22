import type { Language } from "@/contexts/LanguageContext";

type CopyShape = {
  brandName: string;
  brandHomeAria: string;
  announcement: string;
  nav: {
    mainAria: string;
    openMenuAria: string;
    closeMenuAria: string;
    ourRange: string;
    ourStory: string;
    getInTouch: string;
    switchLangLabel: string;
    switchLangAria: string;
  };
  footer: {
    note: string;
    exploreRange: string;
    about: string;
    enquiries: string;
    tagline: string;
  };
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    captionCount: string;
    captionText: string;
    imageAria: string;
    verticalLabel: string;
  };
  introStrip: [string, string, string];
  rangeSection: {
    ariaLabel: string;
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    asideBody: string;
    asideNote: string;
    footnote: string;
  };
  storySection: {
    imageAria: string;
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    body: string;
    cta: string;
    stampLine1: string;
    stampLine2: string;
  };
  valuesSection: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    items: [
      { title: string; body: string; num: string },
      { title: string; body: string; num: string },
      { title: string; body: string; num: string },
    ];
  };
  contactSection: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    body: string;
    note: string;
    cta: string;
    orbitChar: string;
  };
  productDetail: {
    breadcrumbRoot: string;
    askCta: string;
    allCategories: string;
    disclaimer: string;
    moreEyebrow: string;
    moreTitleLead: string;
    moreTitleAccent: string;
    notFoundEyebrow: string;
    notFoundTitleLead: string;
    notFoundTitleAccent: string;
    notFoundBody: string;
    notFoundCta: string;
  };
  notFoundPage: {
    title: string;
    description: string;
    goHome: string;
  };
};

export const translations: Record<Language, CopyShape> = {
  en: {
    brandName: "Alkhaleyah",
    brandHomeAria: "Alkhaleyah home",
    announcement: "A food products company for everyday tables",
    nav: {
      mainAria: "Main navigation",
      openMenuAria: "Open navigation",
      closeMenuAria: "Close navigation",
      ourRange: "Our range",
      ourStory: "Our story",
      getInTouch: "Get in touch",
      switchLangLabel: "العربية",
      switchLangAria: "Switch language to Arabic",
    },
    footer: {
      note: "Food products for the everyday table.",
      exploreRange: "Explore the range",
      about: "About Alkhaleyah",
      enquiries: "Enquiries",
      tagline: "Food products · Made for sharing",
    },
    hero: {
      eyebrow: "A considered pantry",
      titleLead: "Good food.",
      titleAccent: "Good company.",
      description:
        "Explore the Alkhaleyah food range — familiar ingredients, gathered for the moments that bring us to the table.",
      ctaPrimary: "Explore our range",
      ctaSecondary: "Get to know us",
      captionCount: "01 / 06",
      captionText: "From the pantry, to the table",
      imageAria:
        "A still life of raw golden honey, dates, cured olives, and extra virgin olive oil",
      verticalLabel: "ALKHALEYAH · FOOD PRODUCTS",
    },
    introStrip: [
      "Food, at the heart of every day.",
      "For homes, kitchens, and trade.",
      "Explore the range.",
    ],
    rangeSection: {
      ariaLabel: "Alkhaleyah at a glance",
      eyebrow: "Explore Alkhaleyah",
      titleLead: "A place for",
      titleAccent: "good things.",
      asideBody:
        "From pantry foundations to the finishing touch, find your way around our food categories.",
      asideNote: "Find your favourite",
      footnote:
        "Product availability and specifications are confirmed directly with Alkhaleyah.",
    },
    storySection: {
      imageAria:
        "A close-up of cold-pressed extra virgin olive oil with fresh olive branches",
      eyebrow: "The Alkhaleyah point of view",
      titleLead: "Made for the",
      titleAccent: "everyday table.",
      body: "Food has a way of bringing people together. Alkhaleyah is here to make finding the ingredients for those everyday moments feel simple — with a clear range of food products for customers and trade partners.",
      cta: "A note from Alkhaleyah",
      stampLine1: "Food",
      stampLine2: "& family",
    },
    valuesSection: {
      eyebrow: "The way we see it",
      titleLead: "Simple things,",
      titleAccent: "thoughtfully chosen.",
      items: [
        {
          title: "A clear range",
          body: "Find your way through our food categories with ease.",
          num: "01",
        },
        {
          title: "Everyday ingredients",
          body: "Familiar food for the recipes and rituals you return to.",
          num: "02",
        },
        {
          title: "Here to help",
          body: "Talk with us about product details, availability, or supply.",
          num: "03",
        },
      ],
    },
    contactSection: {
      eyebrow: "Let's talk food",
      titleLead: "Something on",
      titleAccent: "your mind?",
      body: "For product details, availability, or wholesale enquiries, we’d love to hear from you.",
      note: "Contact details can be added here when you share the email address, phone number, or enquiry channel you prefer.",
      cta: "Browse the food range",
      orbitChar: "A",
    },
    productDetail: {
      breadcrumbRoot: "Our range",
      askCta: "Ask about this range",
      allCategories: "All categories",
      disclaimer:
        "Product names, pack sizes, and availability should be confirmed with Alkhaleyah.",
      moreEyebrow: "Keep exploring",
      moreTitleLead: "More from",
      moreTitleAccent: "the pantry.",
      notFoundEyebrow: "Alkhaleyah product range",
      notFoundTitleLead: "That range",
      notFoundTitleAccent: "isn't here.",
      notFoundBody: "Head back to explore the categories we have listed.",
      notFoundCta: "Return to our range",
    },
    notFoundPage: {
      title: "Page Not Found",
      description:
        "Sorry, the page you are looking for doesn't exist. It may have been moved or deleted.",
      goHome: "Go Home",
    },
  },
  ar: {
    brandName: "الخلية",
    brandHomeAria: "الصفحة الرئيسية للخلية",
    announcement: "شركة منتجات غذائية لمائدة كل يوم",
    nav: {
      mainAria: "التنقل الرئيسي",
      openMenuAria: "فتح القائمة",
      closeMenuAria: "إغلاق القائمة",
      ourRange: "منتجاتنا",
      ourStory: "قصتنا",
      getInTouch: "تواصل معنا",
      switchLangLabel: "English",
      switchLangAria: "التبديل إلى اللغة الإنجليزية",
    },
    footer: {
      note: "منتجات غذائية لمائدة كل يوم.",
      exploreRange: "استكشف التشكيلة",
      about: "عن الخلية",
      enquiries: "الاستفسارات",
      tagline: "منتجات غذائية · صُنعت للمشاركة",
    },
    hero: {
      eyebrow: "مؤونة مختارة بعناية",
      titleLead: "طعامٌ طيّب.",
      titleAccent: "ورفقةٌ أطيب.",
      description:
        "استكشف تشكيلة الخلية الغذائية — مكوّنات مألوفة، جمعناها للحظات التي تجمعنا حول المائدة.",
      ctaPrimary: "استكشف منتجاتنا",
      ctaSecondary: "تعرّف علينا",
      captionCount: "٠١ / ٠٦",
      captionText: "من المؤونة، إلى المائدة",
      imageAria:
        "مشهد لمكوّنات المائدة من العسل الطبيعي والتمور والزيتون وزيت الزيتون البكر",
      verticalLabel: "الخلية · منتجات غذائية",
    },
    introStrip: [
      "الغذاء، في قلب كل يوم.",
      "للمنازل، والمطابخ، والشركاء.",
      "استكشف التشكيلة.",
    ],
    rangeSection: {
      ariaLabel: "لمحة عن الخلية",
      eyebrow: "استكشف الخلية",
      titleLead: "مكانٌ",
      titleAccent: "للخيرات الطيبة.",
      asideBody:
        "من أساسيات المؤونة إلى اللمسة الأخيرة، تصفّح فئات منتجاتنا الغذائية بسهولة.",
      asideNote: "اختر ما يناسبك",
      footnote:
        "تُؤكَّد تفاصيل التوافر والمواصفات مباشرةً مع شركة الخلية.",
    },
    storySection: {
      imageAria: "لقطة مقرّبة لزيت الزيتون البكر الممتاز مع أغصان الزيتون",
      eyebrow: "رؤية الخلية",
      titleLead: "صُنع لمائدة",
      titleAccent: "كل يوم.",
      body: "للطعام طريقةٌ فريدة في جمع الناس. تأتي الخلية لتجعل العثور على مكوّنات هذه اللحظات اليومية أمراً بسيطاً — عبر تشكيلة واضحة من المنتجات الغذائية للعملاء وشركاء التجارة.",
      cta: "رسالة من الخلية",
      stampLine1: "طعام",
      stampLine2: "وعائلة",
    },
    valuesSection: {
      eyebrow: "منهجنا",
      titleLead: "أشياء بسيطة،",
      titleAccent: "مختارة بعناية.",
      items: [
        {
          title: "تشكيلة واضحة",
          body: "تصفّح فئات منتجاتنا الغذائية بكل يسر ووضوح.",
          num: "٠١",
        },
        {
          title: "مكوّنات يومية",
          body: "أغذية مألوفة للوصفات والطقوس التي تعود إليها دائماً.",
          num: "٠٢",
        },
        {
          title: "دائماً في خدمتك",
          body: "تواصل معنا للاستفسار عن تفاصيل المنتجات أو التوافر أو التوريد.",
          num: "٠٣",
        },
      ],
    },
    contactSection: {
      eyebrow: "لنتحدّث عن الطعام",
      titleLead: "هل لديك",
      titleAccent: "استفسار؟",
      body: "للاستفسار عن تفاصيل المنتجات، أو التوافر، أو طلبات الجملة، يسعدنا تواصلك معنا.",
      note: "يمكن إضافة بيانات التواصل هنا عند مشاركة البريد الإلكتروني أو رقم الهاتف أو قناة الاستفسار المفضلة لديك.",
      cta: "تصفّح التشكيلة الغذائية",
      orbitChar: "خ",
    },
    productDetail: {
      breadcrumbRoot: "منتجاتنا",
      askCta: "اسأل عن هذه الفئة",
      allCategories: "جميع الفئات",
      disclaimer:
        "تُؤكَّد أسماء المنتجات وأحجام العبوات وتوافرها مباشرةً مع شركة الخلية.",
      moreEyebrow: "واصل الاستكشاف",
      moreTitleLead: "المزيد من",
      moreTitleAccent: "المؤونة.",
      notFoundEyebrow: "تشكيلة منتجات الخلية",
      notFoundTitleLead: "هذه الفئة",
      notFoundTitleAccent: "غير متوفرة.",
      notFoundBody: "عُد لتصفّح الفئات الغذائية المدرجة لدينا.",
      notFoundCta: "العودة إلى منتجاتنا",
    },
    notFoundPage: {
      title: "الصفحة غير موجودة",
      description:
        "عذراً، الصفحة التي تبحث عنها غير موجودة. ربما تم نقلها أو حذفها.",
      goHome: "العودة للرئيسية",
    },
  },
};
