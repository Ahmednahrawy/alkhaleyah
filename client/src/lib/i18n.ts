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
    trackOrder: string;
    getInTouch: string;
    wishlistLabel: string;
    wishlistAria: string;
    cartLabel: string;
    cartAria: string;
    searchPlaceholder: string;
    searchAria: string;
    searchToggleAria: string;
    searchClearAria: string;
    searchNoResults: string;
    searchQuickAddLabel: string;
    searchFromPrefix: string;
    switchLangLabel: string;
    switchLangAria: string;
  };
  footer: {
    note: string;
    exploreRange: string;
    about: string;
    trackOrder: string;
    enquiries: string;
    adminPortal: string;
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
    varietiesCountSuffix: string;
    fromPricePrefix: string;
    allCategoriesTab: string;
    viewAllCategories: string;
    quickAdd: string;
    viewCategory: string;
    footnote: string;
    filters: {
      priceLabel: string;
      weightLabel: string;
      resetButton: string;
      showingPrefix: string;
      resultsSingle: string;
      resultsPlural: string;
      noMatchesTitle: string;
      noMatchesBody: string;
      priceOptions: {
        all: string;
        "under-250": string;
        "250-600": string;
        "600-1500": string;
        "over-1500": string;
      };
      weightOptions: {
        all: string;
        "small-pack": string;
        "1kg": string;
        "3-5kg": string;
        "10kg": string;
        bottles: string;
      };
    };
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
  testimonialsSection: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    asideBody: string;
    filters: {
      all: string;
      honey: string;
      dates: string;
    };
    items: Array<{
      id: string;
      num: string;
      category: string;
      focus: Array<"honey" | "dates">;
      quote: string;
      author: string;
      role: string;
    }>;
  };
  tracking: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    asideBody: string;
    inputLabel: string;
    inputPlaceholder: string;
    submitButton: string;
    checkingButton: string;
    recentLabel: string;
    sampleLabel: string;
    orderIdLabel: string;
    typeLabel: string;
    typeInquiry: string;
    typeOrder: string;
    channelHome: string;
    channelTrade: string;
    customerLabel: string;
    itemsLabel: string;
    subtotalLabel: string;
    updatedLabel: string;
    sampleBadge: string;
    notFoundTitle: string;
    notFoundBody: string;
    askWhatsAppButton: string;
    askWhatsAppMessagePrefix: string;
    steps: {
      received: { label: string; detail: string };
      confirmed: { label: string; detail: string };
      preparing: { label: string; detail: string };
      dispatched: { label: string; detail: string };
      delivered: { label: string; detail: string };
    };
  };
  contactSection: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    body: string;
    note: string;
    whatsappDirectLabel: string;
    cta: string;
    orbitChar: string;
    form: {
      inquiryTypeLabel: string;
      typeHome: string;
      typeTrade: string;
      productsLabel: string;
      productsHint: string;
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      phoneLabel: string;
      phonePlaceholder: string;
      notesLabel: string;
      notesPlaceholder: string;
      submitButton: string;
      submittingButton: string;
      errors: {
        productsRequired: string;
        nameRequired: string;
        contactRequired: string;
        emailInvalid: string;
      };
      successTitle: string;
      successBody: string;
      whatsappGreeting: string;
      whatsappSendButton: string;
      referenceLabel: string;
      selectedProductsLabel: string;
      copyButton: string;
      copiedButton: string;
      trackOrderButton: string;
      resetButton: string;
      cartBannerCountPrefix: string;
      cartBannerCountSuffix: string;
      cartBannerButton: string;
    };
  };
  productDetail: {
    breadcrumbRoot: string;
    askCta: string;
    browseVarietiesCta: string;
    allCategories: string;
    disclaimer: string;
    subcategoriesEyebrow: string;
    subcategoriesTitleLead: string;
    subcategoriesTitleAccent: string;
    subcategoriesSubtitle: string;
    selectSizeLabel: string;
    quantityLabel: string;
    priceLabel: string;
    fromPricePrefix: string;
    addToCart: string;
    addedToCart: string;
    viewCart: string;
    moreEyebrow: string;
    moreTitleLead: string;
    moreTitleAccent: string;
    notFoundEyebrow: string;
    notFoundTitleLead: string;
    notFoundTitleAccent: string;
    notFoundBody: string;
    notFoundCta: string;
  };
  quickAdd: {
    title: string;
    varietyLabel: string;
    sizeLabel: string;
    quantityLabel: string;
    totalLabel: string;
    addToCart: string;
    addedToCart: string;
    viewCart: string;
    viewFullRange: string;
    closeAria: string;
  };
  wishlist: {
    drawerTitle: string;
    drawerSubtitle: string;
    itemsCountSuffix: string;
    addAria: string;
    removeAria: string;
    savedLabel: string;
    saveLabel: string;
    emptyTitle: string;
    emptyBody: string;
    browseButton: string;
    selectSizeLabel: string;
    addToCart: string;
    addedToCart: string;
    viewCart: string;
    clearAll: string;
    closeAria: string;
  };
  cart: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    browseButton: string;
    itemsCountSuffix: string;
    unitPriceLabel: string;
    subtotalLabel: string;
    totalOrderLabel: string;
    decreaseAria: string;
    increaseAria: string;
    removeAria: string;
    clearCart: string;
    customerSectionTitle: string;
    orderTypeLabel: string;
    typeHome: string;
    typeTrade: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    orderRefLabel: string;
    orderSavedNote: string;
    trackOrderButton: string;
    sendWhatsApp: string;
    copyOrder: string;
    copied: string;
    whatsappGreeting: string;
    noteConfirm: string;
    missingContactHint: string;
    closeAria: string;
  };
  notFoundPage: {
    title: string;
    description: string;
    goHome: string;
  };
  admin: {
    backToStore: string;
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    subtitle: string;
    signInTitle: string;
    signInBody: string;
    signInGoogle: string;
    signingIn: string;
    signInFailed: string;
    signInUnauthorizedDomain: string;
    signInAuthorizedDomainsLink: string;
    signInPopupBlocked: string;
    signInPopupClosed: string;
    signInOperationNotAllowed: string;
    signInWithRedirectFallback: string;
    signInErrorCodeLabel: string;
    unauthorizedTitle: string;
    unauthorizedBody: string;
    signedInAs: string;
    uidLabel: string;
    switchAccount: string;
    signOut: string;
    tabs: {
      orders: string;
      catalog: string;
      settings: string;
    };
    metrics: {
      totalOrders: string;
      newRequests: string;
      inProgress: string;
      delivered: string;
    };
    orders: {
      searchPlaceholder: string;
      statusFilterAll: string;
      emptyTitle: string;
      emptyBody: string;
      contactLabel: string;
      notesLabel: string;
      whatsappReply: string;
      statusLabel: string;
      updatingStatus: string;
      deleteOrder: string;
      confirmDelete: string;
      cancelDelete: string;
      noPiiNote: string;
    };
    catalog: {
      categoryLabel: string;
      addNewBtn: string;
      newFormTitle: string;
      varietyIdLabel: string;
      varietyIdPlaceholder: string;
      nameEnLabel: string;
      nameArLabel: string;
      noteEnLabel: string;
      noteArLabel: string;
      visibilityLabel: string;
      visibleStatus: string;
      hiddenStatus: string;
      variantsLabel: string;
      addVariantBtn: string;
      variantIdLabel: string;
      variantEnLabel: string;
      variantArLabel: string;
      variantPriceLabel: string;
      saveBtn: string;
      savingBtn: string;
      savedToast: string;
      resetDefaultBtn: string;
      cancelBtn: string;
      customBadge: string;
      overrideBadge: string;
      validationError: string;
    };
    settings: {
      sectionTitle: string;
      sectionBody: string;
      whatsappNumberLabel: string;
      whatsappDisplayLabel: string;
      announcementEnLabel: string;
      announcementArLabel: string;
      saveSettingsBtn: string;
      savingSettingsBtn: string;
      savedSettingsToast: string;
      adminsTitle: string;
      adminsBody: string;
      adminUidLabel: string;
      adminUidPlaceholder: string;
      adminEmailLabel: string;
      addAdminBtn: string;
      removeAdminBtn: string;
      ownerBadge: string;
    };
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
      trackOrder: "Track order",
      getInTouch: "Get in touch",
      wishlistLabel: "Saved",
      wishlistAria: "Open wishlist",
      cartLabel: "Cart",
      cartAria: "Open order cart",
      searchPlaceholder: "Search honey, dates, olive oil...",
      searchAria: "Search products",
      searchToggleAria: "Toggle product search",
      searchClearAria: "Clear search",
      searchNoResults: "No matching products found. Try honey, dates, olives, or oil.",
      searchQuickAddLabel: "Add",
      searchFromPrefix: "From",
      switchLangLabel: "العربية",
      switchLangAria: "Switch language to Arabic",
    },
    footer: {
      note: "Food products for the everyday table.",
      exploreRange: "Explore the range",
      about: "About Alkhaleyah",
      trackOrder: "Track order",
      enquiries: "Enquiries",
      adminPortal: "Admin",
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
      varietiesCountSuffix: "varieties",
      fromPricePrefix: "From",
      allCategoriesTab: "All categories",
      viewAllCategories: "Show all categories",
      quickAdd: "Add to cart",
      viewCategory: "Varieties",
      footnote:
        "All listed prices are in Egyptian Pounds (EGP). Delivery fees are confirmed directly with Alkhaleyah.",
      filters: {
        priceLabel: "Price range",
        weightLabel: "Weight / size",
        resetButton: "Reset filters",
        showingPrefix: "Showing",
        resultsSingle: "matching variety",
        resultsPlural: "matching varieties",
        noMatchesTitle: "No varieties match this filter combination",
        noMatchesBody:
          "Try widening the price range or choosing another weight category to see available items.",
        priceOptions: {
          all: "All prices",
          "under-250": "Up to 250 EGP",
          "250-600": "250 – 600 EGP",
          "600-1500": "600 – 1,500 EGP",
          "over-1500": "Over 1,500 EGP",
        },
        weightOptions: {
          all: "All weights & sizes",
          "small-pack": "Small packs (0.25 – 0.5 kg)",
          "1kg": "Standard (1 kg)",
          "3-5kg": "Family packs (3 – 5 kg)",
          "10kg": "Bulk cartons (10 kg)",
          bottles: "Bottles (0.5 – 3 liter)",
        },
      },
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
    testimonialsSection: {
      eyebrow: "From our tables",
      titleLead: "Trusted for",
      titleAccent: "pure quality.",
      asideBody:
        "Words from homes and hospitality partners who keep Alkhaleyah honey and dates in their kitchen.",
      filters: {
        all: "All",
        honey: "Honey",
        dates: "Dates",
      },
      items: [
        {
          id: "honey-quality",
          num: "01",
          category: "Natural honey",
          focus: ["honey"],
          quote:
            "“The natural honey has an unmistakable floral depth and clean finish — thick, aromatic, and clearly unblended. It has become a daily staple on our breakfast table.”",
          author: "Nadia Al-Mansoor",
          role: "Home cook · Riyadh",
        },
        {
          id: "dates-quality",
          num: "02",
          category: "Fine dates",
          focus: ["dates"],
          quote:
            "“Every box of dates arrives plump, glossy, and evenly graded — tender without being overly sweet. Guests always ask where we sourced them.”",
          author: "Tariq Haddad",
          role: "Hospitality host · Amman",
        },
        {
          id: "honey-and-dates",
          num: "03",
          category: "Honey & dates",
          focus: ["honey", "dates"],
          quote:
            "“Consistency matters when supplying our kitchen. Alkhaleyah’s honey holds its natural clarity and their dates stay fresh and soft — reliable quality in every batch.”",
          author: "Salma Kareem",
          role: "Café & pantry buyer · Dubai",
        },
      ],
    },
    tracking: {
      eyebrow: "Order status",
      titleLead: "Track your",
      titleAccent: "order or inquiry.",
      asideBody:
        "Enter your Alkhaleyah reference ID (from a WhatsApp cart order or product inquiry) to check current progress.",
      inputLabel: "Order or inquiry ID",
      inputPlaceholder: "e.g. ALK-1041",
      submitButton: "Check status",
      checkingButton: "Checking...",
      recentLabel: "Your recent IDs:",
      sampleLabel: "Sample orders:",
      orderIdLabel: "Reference ID",
      typeLabel: "Request type",
      typeInquiry: "Product inquiry",
      typeOrder: "WhatsApp order",
      channelHome: "Personal / Home",
      channelTrade: "Wholesale / Trade",
      customerLabel: "Customer",
      itemsLabel: "Items",
      subtotalLabel: "Estimated total",
      updatedLabel: "Last update",
      sampleBadge: "Demo status",
      notFoundTitle: "Reference ID not found",
      notFoundBody:
        "Double-check your reference (for example ALK-1041), or message our team directly on WhatsApp for live order updates.",
      askWhatsAppButton: "Ask about this ID on WhatsApp",
      askWhatsAppMessagePrefix: "Hello Alkhaleyah, could you please share an update on my reference ID:",
      steps: {
        received: {
          label: "Received",
          detail: "Logged in our system and awaiting WhatsApp confirmation.",
        },
        confirmed: {
          label: "Confirmed",
          detail: "Pack sizes, availability, and delivery slot confirmed.",
        },
        preparing: {
          label: "Preparing",
          detail: "Freshly packed and sealed for dispatch.",
        },
        dispatched: {
          label: "Out for delivery",
          detail: "With our courier team on the way to you.",
        },
        delivered: {
          label: "Delivered",
          detail: "Handed over safely. Thank you for choosing Alkhaleyah.",
        },
      },
    },
    contactSection: {
      eyebrow: "Let's talk food",
      titleLead: "Something on",
      titleAccent: "your mind?",
      body: "For product details, availability, or wholesale enquiries, select the products you are interested in and send your inquiry directly to our WhatsApp.",
      note: "Whether for your home table or commercial supply, we confirm pack sizes, availability, and pricing directly on WhatsApp.",
      whatsappDirectLabel: "Direct WhatsApp",
      cta: "Browse the food range",
      orbitChar: "A",
      form: {
        inquiryTypeLabel: "Enquiry type",
        typeHome: "Personal / Home",
        typeTrade: "Wholesale / Trade",
        productsLabel: "Select products",
        productsHint: "Choose one or more",
        nameLabel: "Full name",
        namePlaceholder: "Your name",
        emailLabel: "Email (optional)",
        emailPlaceholder: "name@example.com",
        phoneLabel: "Phone / WhatsApp",
        phonePlaceholder: "+20 10X XXX XXXX",
        notesLabel: "Order details or questions",
        notesPlaceholder: "Pack sizes, estimated quantities, or any questions...",
        submitButton: "Prepare WhatsApp order",
        submittingButton: "Preparing...",
        errors: {
          productsRequired: "Please select at least one product.",
          nameRequired: "Please enter your name.",
          contactRequired: "Please enter a phone number or email address.",
          emailInvalid: "Please enter a valid email address.",
        },
        successTitle: "Ready to send on WhatsApp",
        successBody:
          "Your inquiry summary is prepared below. Tap the WhatsApp button to send it directly to our team.",
        whatsappGreeting: "Hello Alkhaleyah, I would like to send an order / inquiry:",
        whatsappSendButton: "Send via WhatsApp",
        referenceLabel: "Reference",
        selectedProductsLabel: "Selected products",
        copyButton: "Copy summary",
        copiedButton: "Copied",
        trackOrderButton: "Track status",
        resetButton: "Send another inquiry",
        cartBannerCountPrefix: "You currently have",
        cartBannerCountSuffix: "item(s) in your order cart.",
        cartBannerButton: "Open cart",
      },
    },
    productDetail: {
      breadcrumbRoot: "Our range",
      askCta: "Ask about this range",
      browseVarietiesCta: "Choose varieties & sizes",
      allCategories: "All categories",
      disclaimer:
        "All listed prices are in Egyptian Pounds (EGP) and confirmed upon order.",
      subcategoriesEyebrow: "Select varieties & weights",
      subcategoriesTitleLead: "Available",
      subcategoriesTitleAccent: "varieties.",
      subcategoriesSubtitle:
        "Pick the variety, select your preferred pack weight or bottle volume, and add directly to your order cart.",
      selectSizeLabel: "Pack size & price",
      quantityLabel: "Quantity",
      priceLabel: "Total",
      fromPricePrefix: "From",
      addToCart: "Add to cart",
      addedToCart: "Added to cart",
      viewCart: "View cart",
      moreEyebrow: "Keep exploring",
      moreTitleLead: "More from",
      moreTitleAccent: "the pantry.",
      notFoundEyebrow: "Alkhaleyah product range",
      notFoundTitleLead: "That range",
      notFoundTitleAccent: "isn't here.",
      notFoundBody: "Head back to explore the categories we have listed.",
      notFoundCta: "Return to our range",
    },
    quickAdd: {
      title: "Select variety & pack size",
      varietyLabel: "Variety",
      sizeLabel: "Weight / Volume & Price",
      quantityLabel: "Quantity",
      totalLabel: "Total",
      addToCart: "Add to cart",
      addedToCart: "Added to cart",
      viewCart: "Open cart",
      viewFullRange: "Explore full category",
      closeAria: "Close product selector",
    },
    wishlist: {
      drawerTitle: "Saved wishlist",
      drawerSubtitle: "Products you hearted for later viewing and ordering.",
      itemsCountSuffix: "saved",
      addAria: "Save to wishlist",
      removeAria: "Remove from wishlist",
      savedLabel: "Saved",
      saveLabel: "Save",
      emptyTitle: "No saved products yet",
      emptyBody:
        "Tap the heart icon on any variety while browsing to keep your favourites handy here.",
      browseButton: "Browse products",
      selectSizeLabel: "Choose pack size",
      addToCart: "Add to cart",
      addedToCart: "Added",
      viewCart: "Open cart",
      clearAll: "Clear wishlist",
      closeAria: "Close wishlist",
    },
    cart: {
      title: "Your order cart",
      subtitle: "Review your selected varieties and send your order directly via WhatsApp.",
      emptyTitle: "Your cart is empty",
      emptyBody:
        "Choose a product category, pick your preferred variety and weight or volume, and add items to prepare your WhatsApp order.",
      browseButton: "Browse our range",
      itemsCountSuffix: "items",
      unitPriceLabel: "Unit price",
      subtotalLabel: "Order subtotal",
      totalOrderLabel: "Total",
      decreaseAria: "Decrease quantity",
      increaseAria: "Increase quantity",
      removeAria: "Remove item",
      clearCart: "Clear cart",
      customerSectionTitle: "Your details for order confirmation",
      orderTypeLabel: "Order type",
      typeHome: "Personal / Home",
      typeTrade: "Wholesale / Trade",
      nameLabel: "Full name",
      namePlaceholder: "Your name",
      phoneLabel: "Phone / WhatsApp",
      phonePlaceholder: "+20 10X XXX XXXX",
      emailLabel: "Email (optional)",
      emailPlaceholder: "name@example.com",
      notesLabel: "Delivery area or notes (optional)",
      notesPlaceholder: "City, delivery notes, or any extra requests...",
      orderRefLabel: "Order reference",
      orderSavedNote: "Saved for order tracking.",
      trackOrderButton: "Track order",
      sendWhatsApp: "Send order via WhatsApp",
      copyOrder: "Copy order",
      copied: "Copied",
      whatsappGreeting: "Hello Alkhaleyah, I would like to place an order:",
      noteConfirm: "Delivery details will be confirmed directly on WhatsApp.",
      missingContactHint: "Adding your name and phone helps our team confirm faster.",
      closeAria: "Close order cart",
    },
    notFoundPage: {
      title: "Page Not Found",
      description:
        "Sorry, the page you are looking for doesn't exist. It may have been moved or deleted.",
      goHome: "Go Home",
    },
    admin: {
      backToStore: "Back to storefront",
      eyebrow: "Private workspace",
      titleLead: "Alkhaleyah",
      titleAccent: "admin dashboard.",
      subtitle:
        "Manage live order progress, customer inquiries, product varieties, EGP pricing, and store contact details.",
      signInTitle: "Sign in to manage Alkhaleyah",
      signInBody:
        "This private area is restricted to authorized Alkhaleyah administrators. Sign in with your verified Google account to continue.",
      signInGoogle: "Sign in with Google",
      signingIn: "Signing in...",
      signInFailed: "Google sign-in could not be completed. Please try again.",
      signInUnauthorizedDomain:
        "This website domain is not yet listed in Firebase Authentication. Open Firebase Console below, click Domains → Authorized domains → Add domain, and enter:",
      signInAuthorizedDomainsLink: "Open Firebase Authorized Domains",
      signInPopupBlocked:
        "Your browser blocked the Google sign-in popup. Allow popups for this site or continue using full-page redirect sign-in.",
      signInPopupClosed:
        "The Google sign-in window was closed before signing in. Please try again.",
      signInOperationNotAllowed:
        "Google sign-in is not enabled in Firebase Authentication. Enable Google under Sign-in method in Firebase Console.",
      signInWithRedirectFallback: "Continue via full-page Google sign-in",
      signInErrorCodeLabel: "Error code",
      unauthorizedTitle: "Access restricted",
      unauthorizedBody:
        "This Google account does not have administrator permission for Alkhaleyah. Sign in with the owner admin account or ask the owner to authorize your Firebase UID.",
      signedInAs: "Signed in as",
      uidLabel: "User UID",
      switchAccount: "Switch Google account",
      signOut: "Sign out",
      tabs: {
        orders: "Orders & inquiries",
        catalog: "Catalog & prices",
        settings: "Store settings",
      },
      metrics: {
        totalOrders: "Total records",
        newRequests: "New received",
        inProgress: "In fulfilment",
        delivered: "Delivered",
      },
      orders: {
        searchPlaceholder: "Search ALK reference ID or customer...",
        statusFilterAll: "All statuses",
        emptyTitle: "No matching orders yet",
        emptyBody:
          "Customer orders sent via WhatsApp checkout or the inquiry form will appear here automatically.",
        contactLabel: "Customer contact",
        notesLabel: "Notes",
        whatsappReply: "Message on WhatsApp",
        statusLabel: "Progress status",
        updatingStatus: "Saving...",
        deleteOrder: "Delete",
        confirmDelete: "Confirm delete",
        cancelDelete: "Cancel",
        noPiiNote: "No private contact details attached.",
      },
      catalog: {
        categoryLabel: "Product category",
        addNewBtn: "Add variety",
        newFormTitle: "Add new variety",
        varietyIdLabel: "Variety ID slug",
        varietyIdPlaceholder: "e.g. citrus-honey",
        nameEnLabel: "Name (English)",
        nameArLabel: "Name (Arabic)",
        noteEnLabel: "Description (English)",
        noteArLabel: "Description (Arabic)",
        visibilityLabel: "Visibility",
        visibleStatus: "Visible on store",
        hiddenStatus: "Hidden",
        variantsLabel: "Pack sizes & EGP prices",
        addVariantBtn: "Add pack size",
        variantIdLabel: "Size key (e.g. 1kg, 0.5l)",
        variantEnLabel: "English label",
        variantArLabel: "Arabic label",
        variantPriceLabel: "Price (EGP)",
        saveBtn: "Save variety",
        savingBtn: "Saving...",
        savedToast: "Saved to catalog",
        resetDefaultBtn: "Reset to default",
        cancelBtn: "Cancel",
        customBadge: "Custom variety",
        overrideBadge: "Edited",
        validationError:
          "Please fill English & Arabic names and at least one valid pack size with a price.",
      },
      settings: {
        sectionTitle: "Storefront contact & announcement",
        sectionBody:
          "Changes saved here update the WhatsApp checkout destination and top announcement banner across the storefront.",
        whatsappNumberLabel: "WhatsApp digits (for wa.me link)",
        whatsappDisplayLabel: "WhatsApp display format",
        announcementEnLabel: "Announcement bar (English)",
        announcementArLabel: "Announcement bar (Arabic)",
        saveSettingsBtn: "Save settings",
        savingSettingsBtn: "Saving...",
        savedSettingsToast: "Store settings saved",
        adminsTitle: "Authorized admin accounts",
        adminsBody:
          "Only the owner admin can authorize additional team Firebase UIDs to access this dashboard.",
        adminUidLabel: "User Firebase UID",
        adminUidPlaceholder: "Paste Firebase Auth UID",
        adminEmailLabel: "Team member email",
        addAdminBtn: "Grant admin access",
        removeAdminBtn: "Revoke",
        ownerBadge: "Owner admin",
      },
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
      trackOrder: "تتبع الطلب",
      getInTouch: "تواصل معنا",
      wishlistLabel: "المفضلة",
      wishlistAria: "فتح قائمة المفضلة",
      cartLabel: "السلة",
      cartAria: "فتح سلة الطلب",
      searchPlaceholder: "ابحث عن العسل، التمور، زيت الزيتون...",
      searchAria: "البحث في المنتجات",
      searchToggleAria: "فتح شريط البحث",
      searchClearAria: "مسح البحث",
      searchNoResults: "لا توجد نتائج مطابقة. جرّب البحث عن العسل أو التمر أو الزيتون.",
      searchQuickAddLabel: "أضف",
      searchFromPrefix: "يبدأ من",
      switchLangLabel: "English",
      switchLangAria: "التبديل إلى اللغة الإنجليزية",
    },
    footer: {
      note: "منتجات غذائية لمائدة كل يوم.",
      exploreRange: "استكشف التشكيلة",
      about: "عن الخلية",
      trackOrder: "تتبع الطلب",
      enquiries: "الاستفسارات",
      adminPortal: "الإدارة",
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
      varietiesCountSuffix: "أصناف",
      fromPricePrefix: "يبدأ من",
      allCategoriesTab: "جميع الفئات",
      viewAllCategories: "عرض كل الفئات",
      quickAdd: "أضف للسلة",
      viewCategory: "الأصناف",
      footnote:
        "جميع الأسعار بالجنيه المصري (ج.م)، وتُؤكَّد تفاصيل التوصيل مباشرةً مع شركة الخلية.",
      filters: {
        priceLabel: "نطاق السعر",
        weightLabel: "الوزن / الحجم",
        resetButton: "إعادة ضبط الفلاتر",
        showingPrefix: "عرض",
        resultsSingle: "صنف مطابق",
        resultsPlural: "أصناف مطابقة",
        noMatchesTitle: "لا توجد أصناف مطابقة لهذا التحديد",
        noMatchesBody:
          "جرّب توسيع نطاق السعر أو اختيار وزن مختلف لعرض المنتجات المتوفرة.",
        priceOptions: {
          all: "جميع الأسعار",
          "under-250": "حتى ٢٥٠ ج.م",
          "250-600": "٢٥٠ – ٦٠٠ ج.م",
          "600-1500": "٦٠٠ – ١٬٥٠٠ ج.م",
          "over-1500": "أكثر من ١٬٥٠٠ ج.م",
        },
        weightOptions: {
          all: "جميع الأوزان والأحجام",
          "small-pack": "عبوات صغيرة (٢٥٠ – ٥٠٠ جم)",
          "1kg": "عبوة قياسية (١ كجم)",
          "3-5kg": "عبوات عائلية (٣ – ٥ كجم)",
          "10kg": "كرتون جملة (١٠ كجم)",
          bottles: "زجاجات (٠٫٥ – ٣ لتر)",
        },
      },
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
    testimonialsSection: {
      eyebrow: "من موائد عملائنا",
      titleLead: "ثقةٌ تُبنى",
      titleAccent: "بجودة الأصل.",
      asideBody:
        "آراء صادقة من عملاء المنازل وشركاء الضيافة حول جودة العسل والتمور من الخلية.",
      filters: {
        all: "الكل",
        honey: "العسل",
        dates: "التمور",
      },
      items: [
        {
          id: "honey-quality",
          num: "٠١",
          category: "العسل الطبيعي",
          focus: ["honey"],
          quote:
            "«للعسل الطبيعي عمقٌ زهري واضح ونكهة صافية لا تُخطئها الحواس — كثيف القوام، عطِر، وأصبح جزءاً أساسياً من مائدة الفطور كل صباح.»",
          author: "نادية المنصور",
          role: "عميلة منزلية · الرياض",
        },
        {
          id: "dates-quality",
          num: "٠٢",
          category: "التمور الفاخرة",
          focus: ["dates"],
          quote:
            "«تصلنا التمور في كل مرة طازجة، لامعة الحبات، ومفرزة بعناية؛ طراوتها متوازنة وحلاوتها لطيفة تليق بمجالس الضيافة.»",
          author: "طارق حداد",
          role: "مضيف ومهتم بالضيافة · عمّان",
        },
        {
          id: "honey-and-dates",
          num: "٠٣",
          category: "العسل والتمور",
          focus: ["honey", "dates"],
          quote:
            "«ثبات الجودة هو ما نبحث عنه في مطبخنا. عسل الخلية يحافظ على صفائه الطبيعي وتمورهم تحتفظ بطراوتها في كل دفعة نطلبها.»",
          author: "سلمى كريم",
          role: "مسؤولة مشتريات مقهى ومؤونة · دبي",
        },
      ],
    },
    tracking: {
      eyebrow: "متابعة الطلب",
      titleLead: "تتبع حالة",
      titleAccent: "طلبك أو استفسارك.",
      asideBody:
        "أدخل رقم المرجع الخاص بطلب الخلية (من سلة الواتساب أو نموذج الاستفسار) للاطلاع على حالته الحالية.",
      inputLabel: "رقم الطلب أو الاستفسار",
      inputPlaceholder: "مثال: ALK-1041",
      submitButton: "عرض الحالة",
      checkingButton: "جاري التحقق...",
      recentLabel: "طلباتك الأخيرة:",
      sampleLabel: "أمثلة تجريبية:",
      orderIdLabel: "رقم المرجع",
      typeLabel: "نوع الطلب",
      typeInquiry: "استفسار منتجات",
      typeOrder: "طلب عبر واتساب",
      channelHome: "طلب منزلي / شخصي",
      channelTrade: "طلب جملة / شركاء",
      customerLabel: "العميل",
      itemsLabel: "المنتجات",
      subtotalLabel: "الإجمالي التقديري",
      updatedLabel: "آخر تحديث",
      sampleBadge: "حالة تجريبية",
      notFoundTitle: "لم يتم العثور على رقم المرجع",
      notFoundBody:
        "تأكد من كتابة رقم الطلب بشكل صحيح (مثل ALK-1041)، أو تواصل معنا مباشرةً عبر واتساب لمتابعة طلبك.",
      askWhatsAppButton: "استفسر عن هذا الطلب عبر واتساب",
      askWhatsAppMessagePrefix: "مرحباً الخلية، أرغب في متابعة حالة الطلب رقم:",
      steps: {
        received: {
          label: "تم الاستلام",
          detail: "تم تسجيل الطلب وبانتظار تأكيده عبر واتساب.",
        },
        confirmed: {
          label: "تم التأكيد",
          detail: "تمت مراجعة الأوزان والتوافر وتحديد موعد التسليم.",
        },
        preparing: {
          label: "جاري التجهيز",
          detail: "يتم تعبئة وتغليف الأصناف بعناية تمهيداً للشحن.",
        },
        dispatched: {
          label: "في الطريق للتسليم",
          detail: "الشحنة مع مندوب التوصيل وفي طريقها إليك.",
        },
        delivered: {
          label: "تم التسليم",
          detail: "تم تسليم الطلب بنجاح. نسعد دائماً بخدمتك.",
        },
      },
    },
    contactSection: {
      eyebrow: "لنتحدّث عن الطعام",
      titleLead: "هل لديك",
      titleAccent: "استفسار؟",
      body: "للاستفسار عن تفاصيل المنتجات أو التوافر أو طلبات الجملة، اختر المنتجات التي تهمّك وأرسل طلبك مباشرةً إلى واتساب الخلية.",
      note: "سواءً لمائدة منزلك أو لتوريد الأعمال، نؤكّد معك أحجام العبوات والتوافر والأسعار مباشرةً عبر واتساب.",
      whatsappDirectLabel: "واتساب مباشر",
      cta: "تصفّح التشكيلة الغذائية",
      orbitChar: "خ",
      form: {
        inquiryTypeLabel: "نوع الاستفسار",
        typeHome: "طلب منزلي / شخصي",
        typeTrade: "طلب جملة / شركاء",
        productsLabel: "اختر المنتجات",
        productsHint: "يمكن اختيار أكثر من منتج",
        nameLabel: "الاسم الكامل",
        namePlaceholder: "اكتب اسمك",
        emailLabel: "البريد الإلكتروني (اختياري)",
        emailPlaceholder: "name@example.com",
        phoneLabel: "رقم الهاتف / واتساب",
        phonePlaceholder: "+20 10X XXX XXXX",
        notesLabel: "تفاصيل الطلب أو الاستفسار",
        notesPlaceholder: "أحجام العبوات، الكميات التقديرية، أو أي استفسارات أخرى...",
        submitButton: "تجهيز الطلب للواتساب",
        submittingButton: "جاري التجهيز...",
        errors: {
          productsRequired: "يُرجى اختيار منتج واحد على الأقل.",
          nameRequired: "يُرجى إدخال الاسم الكامل.",
          contactRequired: "يُرجى إدخال رقم الهاتف أو البريد الإلكتروني.",
          emailInvalid: "يُرجى إدخال بريد إلكتروني صحيح.",
        },
        successTitle: "الطلب جاهز للإرسال عبر واتساب",
        successBody:
          "تم تجهيز ملخص طلبك بالأسفل. اضغط على زر واتساب لإرساله مباشرةً إلى فريقنا.",
        whatsappGreeting: "مرحباً الخلية، أود إرسال طلب / استفسار جديد:",
        whatsappSendButton: "إرسال الطلب عبر واتساب",
        referenceLabel: "المرجع",
        selectedProductsLabel: "المنتجات المختارة",
        copyButton: "نسخ الملخص",
        copiedButton: "تم النسخ",
        trackOrderButton: "تتبع الحالة",
        resetButton: "إرسال استفسار آخر",
        cartBannerCountPrefix: "لديك حالياً",
        cartBannerCountSuffix: "منتج/منتجات في سلة الطلب.",
        cartBannerButton: "عرض السلة",
      },
    },
    productDetail: {
      breadcrumbRoot: "منتجاتنا",
      askCta: "اسأل عن هذه الفئة",
      browseVarietiesCta: "اختر الصنف والحجم",
      allCategories: "جميع الفئات",
      disclaimer:
        "جميع الأسعار المعروضة بالجنيه المصري (ج.م) وتُؤكَّد عند استلام الطلب.",
      subcategoriesEyebrow: "اختر الأصناف والأوزان",
      subcategoriesTitleLead: "الأصناف",
      subcategoriesTitleAccent: "المتوفرة.",
      subcategoriesSubtitle:
        "اختر الصنف المناسب وحدّد الوزن أو السعة المطلوبة وأضفها مباشرةً إلى سلة الطلب.",
      selectSizeLabel: "حجم العبوة والسعر",
      quantityLabel: "الكمية",
      priceLabel: "الإجمالي",
      fromPricePrefix: "يبدأ من",
      addToCart: "أضف إلى السلة",
      addedToCart: "تمت الإضافة",
      viewCart: "عرض السلة",
      moreEyebrow: "واصل الاستكشاف",
      moreTitleLead: "المزيد من",
      moreTitleAccent: "المؤونة.",
      notFoundEyebrow: "تشكيلة منتجات الخلية",
      notFoundTitleLead: "هذه الفئة",
      notFoundTitleAccent: "غير متوفرة.",
      notFoundBody: "عُد لتصفّح الفئات الغذائية المدرجة لدينا.",
      notFoundCta: "العودة إلى منتجاتنا",
    },
    quickAdd: {
      title: "اختر الصنف وحجم العبوة",
      varietyLabel: "الصنف",
      sizeLabel: "الوزن / الحجم والسعر",
      quantityLabel: "الكمية",
      totalLabel: "الإجمالي",
      addToCart: "أضف إلى السلة",
      addedToCart: "تمت الإضافة",
      viewCart: "افتح السلة",
      viewFullRange: "استعرض الفئة كاملة",
      closeAria: "إغلاق نافذة الاختيار",
    },
    wishlist: {
      drawerTitle: "قائمة المفضلة",
      drawerSubtitle: "المنتجات التي حفظتها للرجوع إليها والطلب لاحقاً.",
      itemsCountSuffix: "محفوظ",
      addAria: "إضافة إلى المفضلة",
      removeAria: "إزالة من المفضلة",
      savedLabel: "في المفضلة",
      saveLabel: "حفظ",
      emptyTitle: "لا توجد منتجات محفوظة بعد",
      emptyBody:
        "اضغط على أيقونة القلب بجانب أي صنف أثناء التصفح لحفظ منتجاتك المفضلة هنا.",
      browseButton: "تصفّح المنتجات",
      selectSizeLabel: "اختر حجم العبوة",
      addToCart: "أضف للسلة",
      addedToCart: "تمت الإضافة",
      viewCart: "افتح السلة",
      clearAll: "مسح المفضلة",
      closeAria: "إغلاق المفضلة",
    },
    cart: {
      title: "سلة الطلب",
      subtitle: "راجع الأصناف والأحجام المختارة وأرسل طلبك مباشرةً عبر واتساب.",
      emptyTitle: "سلة الطلب فارغة",
      emptyBody:
        "تصفّح فئات المنتجات واختر الصنف والوزن أو الحجم المناسب لإضافته وتجهيز طلبك عبر واتساب.",
      browseButton: "استكشف المنتجات",
      itemsCountSuffix: "منتجات",
      unitPriceLabel: "سعر الوحدة",
      subtotalLabel: "إجمالي الطلب",
      totalOrderLabel: "الإجمالي",
      decreaseAria: "إنقاص الكمية",
      increaseAria: "زيادة الكمية",
      removeAria: "حذف الصنف",
      clearCart: "تفريغ السلة",
      customerSectionTitle: "بياناتك لتأكيد الطلب",
      orderTypeLabel: "نوع الطلب",
      typeHome: "طلب منزلي / شخصي",
      typeTrade: "طلب جملة / شركاء",
      nameLabel: "الاسم الكامل",
      namePlaceholder: "اكتب اسمك",
      phoneLabel: "رقم الهاتف / واتساب",
      phonePlaceholder: "+20 10X XXX XXXX",
      emailLabel: "البريد الإلكتروني (اختياري)",
      emailPlaceholder: "name@example.com",
      notesLabel: "العنوان أو ملاحظات إضافية (اختياري)",
      notesPlaceholder: "المدينة، تفاصيل التوصيل، أو أي ملاحظات أخرى...",
      orderRefLabel: "رقم مرجع الطلب",
      orderSavedNote: "تم الحفظ لتتبع حالة الطلب.",
      trackOrderButton: "تتبع الطلب",
      sendWhatsApp: "إرسال الطلب عبر واتساب",
      copyOrder: "نسخ الطلب",
      copied: "تم النسخ",
      whatsappGreeting: "مرحباً الخلية، أود إرسال هذا الطلب:",
      noteConfirm: "سيتم تأكيد تفاصيل التوصيل مباشرةً عبر واتساب.",
      missingContactHint: "إضافة الاسم ورقم الهاتف يساعدنا على تأكيد طلبك بشكل أسرع.",
      closeAria: "إغلاق سلة الطلب",
    },
    notFoundPage: {
      title: "الصفحة غير موجودة",
      description:
        "عذراً، الصفحة التي تبحث عنها غير موجودة. ربما تم نقلها أو حذفها.",
      goHome: "العودة للرئيسية",
    },
    admin: {
      backToStore: "العودة للمتجر",
      eyebrow: "لوحة تحكم خاصة",
      titleLead: "إدارة متجر",
      titleAccent: "الخلية.",
      subtitle:
        "تابع حالات الطلبات والاستفسارات، وحدّث الأصناف والأسعار بالجنيه المصري وإعدادات المتجر مباشرة.",
      signInTitle: "تسجيل الدخول لإدارة الخلية",
      signInBody:
        "هذه اللوحة مخصّصة لمديري متجر الخلية المصرح لهم فقط. سجّل الدخول بحساب Google الموثّق للمتابعة.",
      signInGoogle: "تسجيل الدخول عبر Google",
      signingIn: "جاري تسجيل الدخول...",
      signInFailed: "تعذّر إتمام تسجيل الدخول عبر Google. يُرجى المحاولة مرة أخرى.",
      signInUnauthorizedDomain:
        "نطاق هذا الموقع غير مُضاف بعد في Firebase Authentication. افتح الرابط بالأسفل، ثم اختر Domains ← Authorized domains ← Add domain وأضف النطاق التالي:",
      signInAuthorizedDomainsLink: "فتح إعدادات النطاقات المصرح بها في Firebase",
      signInPopupBlocked:
        "قام المتصفح بحظر نافذة تسجيل الدخول المنبثقة. اسمح بالنوافذ المنبثقة لهذا الموقع أو استخدم خيار تسجيل الدخول بصفحة كاملة.",
      signInPopupClosed:
        "تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية. يُرجى المحاولة مرة أخرى.",
      signInOperationNotAllowed:
        "خيار تسجيل الدخول عبر Google غير مفعّل في Firebase Authentication. فعّله من لوحة Firebase Console.",
      signInWithRedirectFallback: "المتابعة عبر صفحة تسجيل الدخول الكاملة",
      signInErrorCodeLabel: "رمز الخطأ",
      unauthorizedTitle: "وصول غير مصرح به",
      unauthorizedBody:
        "هذا الحساب لا يملك صلاحية إدارة متجر الخلية. سجّل الدخول بحساب المالك المعتمد أو اطلب من المالك إضافة معرّف UID الخاص بك.",
      signedInAs: "مسجّل الدخول بحساب",
      uidLabel: "معرّف المستخدم UID",
      switchAccount: "تبديل حساب Google",
      signOut: "تسجيل الخروج",
      tabs: {
        orders: "الطلبات والاستفسارات",
        catalog: "المنتجات والأسعار",
        settings: "إعدادات المتجر",
      },
      metrics: {
        totalOrders: "إجمالي السجلات",
        newRequests: "طلبات جديدة",
        inProgress: "قيد التجهيز والشحن",
        delivered: "تم تسليمها",
      },
      orders: {
        searchPlaceholder: "ابحث برقم المرجع ALK أو اسم العميل...",
        statusFilterAll: "جميع الحالات",
        emptyTitle: "لا توجد طلبات مطابقة بعد",
        emptyBody:
          "ستظهر هنا تلقائياً جميع الطلبات المرسلة عبر سلة الواتساب أو نموذج الاستفسار.",
        contactLabel: "بيانات التواصل",
        notesLabel: "ملاحظات",
        whatsappReply: "مراسلة عبر واتساب",
        statusLabel: "تحديث مرحلة التنفيذ",
        updatingStatus: "جاري الحفظ...",
        deleteOrder: "حذف",
        confirmDelete: "تأكيد الحذف",
        cancelDelete: "إلغاء",
        noPiiNote: "لا توجد بيانات تواصل إضافية.",
      },
      catalog: {
        categoryLabel: "فئة المنتجات",
        addNewBtn: "إضافة صنف جديد",
        newFormTitle: "إضافة صنف جديد",
        varietyIdLabel: "معرّف الصنف (بالإنجليزية)",
        varietyIdPlaceholder: "مثال: citrus-honey",
        nameEnLabel: "الاسم (بالإنجليزية)",
        nameArLabel: "الاسم (بالعربية)",
        noteEnLabel: "الوصف (بالإنجليزية)",
        noteArLabel: "الوصف (بالعربية)",
        visibilityLabel: "الظهور في المتجر",
        visibleStatus: "ظاهر للعملاء",
        hiddenStatus: "مخفي",
        variantsLabel: "الأحجام والأسعار (ج.م)",
        addVariantBtn: "إضافة حجم جديد",
        variantIdLabel: "المعرّف (مثل 1kg أو 0.5l)",
        variantEnLabel: "التسمية بالإنجليزية",
        variantArLabel: "التسمية بالعربية",
        variantPriceLabel: "السعر (ج.م)",
        saveBtn: "حفظ التغييرات",
        savingBtn: "جاري الحفظ...",
        savedToast: "تم الحفظ في الكتالوج",
        resetDefaultBtn: "استعادة الافتراضي",
        cancelBtn: "إلغاء",
        customBadge: "صنف مضاف",
        overrideBadge: "معدّل",
        validationError:
          "يُرجى إدخال الاسم بالعربية والإنجليزية وإضافة حجم واحد بسعر صحيح على الأقل.",
      },
      settings: {
        sectionTitle: "بيانات الواتساب والشريط العلوي",
        sectionBody:
          "تحدّث هذه الإعدادات رقم الواتساب المعتمد في السلة والروابط، ونص الشريط العلوي في المتجر.",
        whatsappNumberLabel: "رقم الواتساب (للرابط wa.me)",
        whatsappDisplayLabel: "صيغة عرض الرقم",
        announcementEnLabel: "نص الشريط العلوي (بالإنجليزية)",
        announcementArLabel: "نص الشريط العلوي (بالعربية)",
        saveSettingsBtn: "حفظ الإعدادات",
        savingSettingsBtn: "جاري الحفظ...",
        savedSettingsToast: "تم حفظ إعدادات المتجر",
        adminsTitle: "حسابات الإدارة المصرح لها",
        adminsBody:
          "يمكن لمالك المتجر فقط إضافة أو إزالة معرّفات Firebase UID للمديرين الإضافيين.",
        adminUidLabel: "معرّف Firebase UID",
        adminUidPlaceholder: "ألصق معرّف المستخدم UID",
        adminEmailLabel: "البريد الإلكتروني للعضو",
        addAdminBtn: "منح صلاحية الإدارة",
        removeAdminBtn: "إزالة الصلاحية",
        ownerBadge: "المالك الرئيسي",
      },
    },
  },
};
