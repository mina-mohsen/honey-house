import { Product, Language } from './types';

export const WHATSAPP_NUMBER = '971568326116';
export const INSTAGRAM_URL = 'https://www.instagram.com/honeyhouse247/';

export interface ProductExtended extends Product {
  benefitsAr: string[];
  benefitsEn: string[];
}

export const PRODUCTS: ProductExtended[] = [
  {
    id: 'squeeze-honey',
    titleAr: 'عسل طبيعي (عبوة اسكويز)',
    titleEn: 'Natural Honey (Squeeze Bottle)',
    descriptionAr: 'عسلنا النقي في عبوة "اسكويز" العصرية. مثالية للاستخدام السريع، تمنحك تحكماً كامل بالكمية بدون تنقيط أو فوضى.',
    descriptionEn: 'Pure honey in a modern squeeze bottle. Perfect for quick use, giving you full control with no drips or mess.',
    image: 'https://imgur.com/vIdADYw.jpeg',
    benefitsAr: ['سهل الاستخدام', 'غني بالأنزيمات'],
    benefitsEn: ['Mess-free', 'Enzyme Rich'],
    prices: [
      { id: 'squeeze_1_4', sizeAr: '¼ كيلو', sizeEn: '¼ KG', price: 30 },
      { id: 'squeeze_1_2', sizeAr: '½ كيلو', sizeEn: '½ KG', price: 50 },
    ]
  },
  {
    id: 'clover-honey',
    titleAr: 'عسل نحل طبيعي بالشمع الفاخر',
    titleEn: 'Natural Honey with Premium Comb',
    descriptionAr: 'عسل طبيعي فاخر، يأتيكم مباشرة من المنحل مع الشمع، ليضمن لكم تجربة فريدة ونكهة غنية أصيلة.',
    descriptionEn: 'Luxurious natural honey, delivered directly from the apiary with comb, ensuring a unique and authentic flavor.',
    image: 'https://imgur.com/8ozxEOZ.jpeg',
    benefitsAr: ['مقوي للمناعة', 'مضاد حيوي طبيعي'],
    benefitsEn: ['Immunity Boost', 'Natural Antibiotic'],
    prices: [
      { id: 'clover_1_4', sizeAr: '¼ كيلو', sizeEn: '¼ KG', price: 25 },
      { id: 'clover_1_2', sizeAr: '½ كيلو', sizeEn: '½ KG', price: 45 },
      { id: 'clover_1', sizeAr: '1 كيلو', sizeEn: '1 KG', price: 85 },
    ]
  },
  {
    id: 'health-offer',
    titleAr: 'عرض الطاقة القصوى والصحة الشاملة',
    titleEn: 'Ultimate Energy & Holistic Health Offer',
    descriptionAr: 'مجموعة متكاملة لتعزيز طاقتك وصحتك العامة، تجمع بين نقاء العسل وفوائد اللقاح وغذاء الملكات.',
    descriptionEn: 'A complete package to boost your energy and overall health, combining pure honey, pollen, and royal jelly.',
    image: 'https://imgur.com/QCqn0kZ.jpeg',
    benefitsAr: ['طاقة فورية', 'تنشيط ذهني'],
    benefitsEn: ['Instant Energy', 'Mental Focus'],
    featuresAr: ['500 جم عسل برسيم نقي', '20 جم حبوب لقاح طبيعية', '10 جم غذاء ملكات النحل الأصلي'],
    featuresEn: ['500g Pure Clover Honey', '20g Natural Bee Pollen', '10g Original Royal Jelly'],
    prices: [
      { id: 'health_full', sizeAr: 'عرض كامل', sizeEn: 'Full Package', price: 100 }
    ]
  },
  {
    id: 'honeycomb',
    titleAr: 'شهد العسل الطبيعي',
    titleEn: 'Natural Honeycomb',
    descriptionAr: 'قرص العسل الطبيعي الذي يبنيه النحل من شمع العسل، ويحتوي على العسل الخام المختوم.',
    descriptionEn: 'Natural honeycomb built by bees from beeswax, containing sealed raw honey.',
    image: 'https://imgur.com/GNhW77E.jpeg',
    benefitsAr: ['صحي لللثة', 'خام وغير مصفى'],
    benefitsEn: ['Gum Health', 'Raw & Unfiltered'],
    prices: [
      { id: 'honeycomb_1_2', sizeAr: '½ كيلو', sizeEn: '½ KG', price: 50 },
      { id: 'honeycomb_1', sizeAr: '1 كيلو', sizeEn: '1 KG', price: 90 },
    ]
  },
  {
    id: 'royal-nuts',
    titleAr: 'عسل بالمكسرات الملكية',
    titleEn: 'Royal Nuts Honey',
    descriptionAr: 'طاقة طبيعية وقرمشة لا تقاوم! مزيج فاخر من العسل المصري الأصيل مع تشكيلة ملكية من المكسرات المحمصة.',
    descriptionEn: 'Natural energy and irresistible crunch! A luxurious blend of authentic honey with a royal selection of roasted nuts.',
    image: 'https://imgur.com/FSyDB82.jpeg',
    benefitsAr: ['بديل صحي للحلويات', 'غني بالأوميغا'],
    benefitsEn: ['Healthy Dessert', 'Omega Rich'],
    prices: [
      { id: 'royal_nuts_1_2', sizeAr: '½ كيلو', sizeEn: '½ KG', price: 70 },
      { id: 'royal_nuts_1', sizeAr: '1 كيلو', sizeEn: '1 KG', price: 130 },
    ]
  }
];

export const TRANSLATIONS = {
  ar: {
    companyName: 'بيت العسل',
    navSelections: 'مختاراتنا الفاخرة',
    navAi: 'خبير العسل',
    navReviews: 'آراء العملاء',
    navOrder: 'اطلب الآن',
    navFaq: 'الأسئلة الشائعة',
    navContact: 'تواصل معنا',
    slogan: 'من بيتنا لبيتك... عسل طبيعي مضمون من المنحل مباشرة 🐝',
    deliveryNote: '🚚 يوجد توصيل لكل الإمارات',
    grandOpening: '🎉 بمناسبة الافتتاح... عروض خيالية 🎉',
    limitedTime: 'لفترة محدودة! لا تفوت الفرصة!',
    orderNow: '📦 اطلب الآن!',
    fillForm: 'املأ النموذج أدناه لإرسال طلبك مباشرة عبر واتساب.',
    nameLabel: 'اسم العميل:',
    namePlaceholder: 'الاسم كاملاً',
    phoneLabel: 'رقم الهاتف:',
    phonePlaceholder: '+971XXXXXXXX',
    locationLabel: 'موقع التوصيل:',
    locationPlaceholder: 'المدينة، المنطقة، العنوان بالتفصيل',
    productSelectLabel: 'اختر المنتج:',
    quantityLabel: 'الكمية:',
    total: 'الإجمالي:',
    currency: 'درهم',
    sendOrder: 'إرسال الطلب عبر واتساب',
    inquiry: 'استفسار عام عبر واتساب',
    addProduct: '+ أضف منتج آخر',
    remove: 'إزالة',
    chooseSize: 'اختر الحجم:',
    errorFields: 'الرجاء ملء جميع الحقول المطلوبة.',
    whyChooseUs: 'لماذا بيت العسل؟',
    natural: '100% طبيعي ونقي',
    labTested: 'مفحوص ومضمون',
    direct: 'من المنحل لبيتك',
    fastDelivery: 'توصيل سريع للإمارات',
    faqTitle: 'الأسئلة الشائعة',
    aiAssistantTitle: 'خبير العسل الذكي',
    aiAssistantDesc: 'اسألني أي شيء عن فوائد العسل أو اطلب نصيحة للاختيار!',
    aiPlaceholder: 'مثلاً: أحتاج عسل للمناعة...',
    aiThinking: 'جاري التفكير...',
    howItWorks: 'خطوات الطلب',
    step1Title: 'اختر',
    step1Desc: 'تصفح التشكيلة.',
    step2Title: 'اطلب',
    step2Desc: 'عبر واتساب.',
    step3Title: 'استلم',
    step3Desc: 'لباب بيتك.',
    tickerMsg1: '🚚 توصيل مجاني للطلبات فوق 200 درهم!',
    tickerMsg2: '🍯 عروض خاصة على عسل الشمع والمكسرات!',
    tickerMsg3: '✨ عسل نحل طبيعي 100% من المنحل مباشرة ✨',
    aiPrompt1: 'عسل للمناعة؟',
    aiPrompt2: 'أفضل عسل للأطفال؟',
    aiPrompt3: 'فوائد غذاء الملكات؟',
    reviewsTitle: 'آراء العملاء',
    leaveReview: 'أضف تقييمك',
    reviewSubmitted: 'تم إرسال تقييمك بنجاح! شكراً لك.',
    reviewError: 'حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى.',
    reviewNameLabel: 'اسمك:',
    reviewCommentLabel: 'تعليقك:',
    reviewRatingLabel: 'التقييم:',
    reviewSubmit: 'إرسال التقييم',
    reviewCancel: 'إلغاء',
    reviewLoading: 'جاري تحميل التقييمات...',
    reviewEmpty: 'لا توجد تقييمات بعد. كن أول من يقيّم!',
    reviewDate: 'التاريخ',
    reviewAverage: 'متوسط التقييم',
    reviewCount: 'عدد التقييمات',
    reviewSort: 'ترتيب حسب',
    reviewSortNewest: 'الأحدث',
    reviewSortHighest: 'الأعلى تقييماً',
    reviewSortLowest: 'الأقل تقييماً',
    whatsappReviewTemplate: 'مرحباً بيت العسل، أود مشاركة تقييمي: \nالتقييم: ⭐⭐⭐⭐⭐ \nالتعليق: ',
    whatsappOrderHeader: 'طلب جديد من موقع بيت العسل:',
    whatsappName: 'الاسم:',
    whatsappPhone: 'الهاتف:',
    whatsappLocation: 'الموقع:',
    whatsappTotal: 'الإجمالي:',
    contactUs: 'تواصل معنا',
    chatWhatsApp: 'تواصل عبر واتساب',
    followInstagram: 'تابعنا على انستجرام',
    copyright: 'جميع الحقوق محفوظة',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'الإنجليزية',
  },
  en: {
    companyName: 'Honey House',
    navSelections: 'Luxury Selections',
    navAi: 'AI Expert',
    navReviews: 'Reviews',
    navOrder: 'Order Now',
    navFaq: 'FAQ',
    navContact: 'Contact',
    slogan: 'From our home to yours... Guaranteed natural honey directly from the apiary 🐝',
    deliveryNote: '🚚 Delivery available to all Emirates',
    grandOpening: '🎉 Grand Opening Special Offers 🎉',
    limitedTime: 'Limited Time! Don\'t Miss the Opportunity!',
    orderNow: '📦 Order Now!',
    fillForm: 'Fill the form below to send your experience via WhatsApp.',
    nameLabel: 'Customer Name:',
    namePlaceholder: 'Full Name',
    phoneLabel: 'Phone Number:',
    phonePlaceholder: '+971XXXXXXXX',
    locationLabel: 'Delivery Location:',
    locationPlaceholder: 'City, Area, Detailed Address',
    productSelectLabel: 'Select Product:',
    quantityLabel: 'Quantity:',
    total: 'Total:',
    currency: 'AED',
    sendOrder: 'Send Order via WhatsApp',
    inquiry: 'General Inquiry via WhatsApp',
    addProduct: '+ Add Another Product',
    remove: 'Remove',
    chooseSize: 'Choose Size:',
    errorFields: 'Please fill all required fields.',
    whyChooseUs: 'Why Honey House?',
    natural: '100% Natural & Pure',
    labTested: 'Tested & Guaranteed',
    direct: 'Direct from Apiary',
    fastDelivery: 'Fast UAE Delivery',
    faqTitle: 'Frequently Asked Questions',
    aiAssistantTitle: 'AI Honey Sommelier',
    aiAssistantDesc: 'Ask me anything about honey benefits or get a recommendation!',
    aiPlaceholder: 'Ex: I need honey for energy...',
    aiThinking: 'Thinking...',
    howItWorks: 'Order Steps',
    step1Title: 'Select',
    step1Desc: 'Pick your honey.',
    step2Title: 'WhatsApp',
    step2Desc: 'Confirm order.',
    step3Title: 'Receive',
    step3Desc: 'Fast delivery.',
    tickerMsg1: '🚚 Free delivery on orders over 200 AED!',
    tickerMsg2: '🍯 Special offers on Comb & Nut honey!',
    tickerMsg3: '✨ 100% Natural honey direct from the apiary ✨',
    aiPrompt1: 'Immunity honey?',
    aiPrompt2: 'Best for kids?',
    aiPrompt3: 'Royal Jelly benefits?',
    reviewsTitle: 'Customer Reviews',
    leaveReview: 'Add Your Review',
    reviewSubmitted: 'Review submitted successfully! Thank you.',
    reviewError: 'Error submitting review. Please try again.',
    reviewNameLabel: 'Your Name:',
    reviewCommentLabel: 'Your Comment:',
    reviewRatingLabel: 'Rating:',
    reviewSubmit: 'Submit Review',
    reviewCancel: 'Cancel',
    reviewLoading: 'Loading reviews...',
    reviewEmpty: 'No reviews yet. Be the first to review!',
    reviewDate: 'Date',
    reviewAverage: 'Average Rating',
    reviewCount: 'Review Count',
    reviewSort: 'Sort by',
    reviewSortNewest: 'Newest',
    reviewSortHighest: 'Highest Rated',
    reviewSortLowest: 'Lowest Rated',
    whatsappReviewTemplate: 'Hello Honey House, I would like to share my review: \nRating: ⭐⭐⭐⭐⭐ \nComment: ',
    whatsappOrderHeader: 'New Order from Honey House:',
    whatsappName: 'Name:',
    whatsappPhone: 'Phone:',
    whatsappLocation: 'Location:',
    whatsappTotal: 'Total:',
    contactUs: 'Contact Us',
    chatWhatsApp: 'Chat on WhatsApp',
    followInstagram: 'Follow on Instagram',
    copyright: 'All rights reserved',
    language: 'Language',
    arabic: 'Arabic',
    english: 'English',
  }
};

export const FAQS = [
  {
    ar: { 
      q: 'هل العسل طبيعي 100%؟', 
      a: 'نعم، عسلنا نقي ومباشر من المناحل المصرية بدون أي إضافات أو معالجات حرارية. يتم فحصه مخبرياً لضمان الجودة والنقاء.' 
    },
    en: { 
      q: 'Is the honey 100% natural?', 
      a: 'Yes, our honey is pure and direct from Egyptian apiaries without any additives or heat treatments. It is laboratory tested to ensure quality and purity.' 
    }
  },
  {
    ar: { 
      q: 'كم يستغرق التوصيل؟', 
      a: 'التوصيل متاح لكل إمارات الدولة خلال 24-48 ساعة كحد أقصى. الطلبات قبل الساعة 2 ظهراً يتم توصيلها في نفس اليوم.' 
    },
    en: { 
      q: 'How long does delivery take?', 
      a: 'Delivery is available to all Emirates within 24-48 hours maximum. Orders before 2 PM are delivered on the same day.' 
    }
  },
  {
    ar: { 
      q: 'كيف يمكنني تخزين العسل؟', 
      a: 'يُحفظ العسل في درجة حرارة الغرفة بعيداً عن أشعة الشمس المباشرة. لا ينصح بوضعه في الثلاجة لأن البرودة قد تسبب تبلور العسل.' 
    },
    en: { 
      q: 'How should I store honey?', 
      a: 'Store at room temperature away from direct sunlight. Refrigeration is not recommended as cold temperatures may cause honey to crystallize.' 
    }
  },
  {
    ar: { 
      q: 'هل يوجد توصيل مجاني؟', 
      a: 'نعم، يوجد توصيل مجاني للطلبات التي تزيد عن 200 درهم إماراتي لجميع أنحاء الإمارات.' 
    },
    en: { 
      q: 'Is there free delivery?', 
      a: 'Yes, free delivery is available for orders over 200 AED to all Emirates.' 
    }
  },
  {
    ar: { 
      q: 'كيف يمكنني طلب المنتجات؟', 
      a: 'يمكنك الطلب مباشرة عبر الواتساب على الرقم الموجود في الموقع، أو من خلال النموذج الموجود في صفحة "اطلب الآن".' 
    },
    en: { 
      q: 'How can I order products?', 
      a: 'You can order directly via WhatsApp using the number on the website, or through the form on the "Order Now" page.' 
    }
  },
  {
    ar: { 
      q: 'هل يمكنني استرجاع أو استبدال المنتجات؟', 
      a: 'نعم، في حال وجود أي مشكلة في المنتج يمكنك التواصل معنا خلال 48 ساعة من الاستلام لاستبدال أو استرجاع المنتج.' 
    },
    en: { 
      q: 'Can I return or exchange products?', 
      a: 'Yes, if there is any issue with the product, you can contact us within 48 hours of delivery for replacement or return.' 
    }
  }
];

export const MOCK_REVIEWS = [
  { 
    id: 'review_1',
    name: 'نانسي',
    comment: 'حقيقى عسل طبيعى 💯 جربت محلات وسوبر ماركت كتير وأنواع مختلفة ما لاقيت ذى جرب وإعرف الفرق الله يوفقكم ويبارك فيكم 💪👍',
    rating: 5,
    date: '2024-12-15T10:30:00Z',
    lang: 'ar'
  },
  { 
    id: 'review_2',
    name: 'توني',
    comment: 'انا عاوز ااكد انا كمان على جوده العسل حقيقي حاجه عظمة 👌❤️',
    rating: 5,
    date: '2024-12-10T14:20:00Z',
    lang: 'ar'
  },
  { 
    id: 'review_3',
    name: 'كيرلس',
    comment: 'حقيقي العسل اكتر من رائع (عن تجربة) 😍😍',
    rating: 5,
    date: '2024-12-05T09:15:00Z',
    lang: 'ar'
  },
  { 
    id: 'review_4',
    name: 'ايهاب أسعد',
    comment: 'بجد ربنا يبارك العسل حلو اوي ربنا يبارك و يزيدك و تبقي من كبار تجار العسل في الامارات',
    rating: 5,
    date: '2024-11-28T16:45:00Z',
    lang: 'ar'
  },
  { 
    id: 'review_5',
    name: 'إريني',
    comment: 'عاوزة اشكرك جدا على العسل.. بجد تحفة.. و بالذات اللي بغذاء الملكات.. ربنا يباركلك 🙏🙏🙏',
    rating: 5,
    date: '2024-11-20T11:10:00Z',
    lang: 'ar'
  },
  { 
    id: 'review_6',
    name: 'مريم عادل',
    comment: 'العسل تحفففففه و الشمع كنت بقولك مش عايزاه ده طلع تحفه احنا تقريبا خلصناه 😂',
    rating: 5,
    date: '2024-11-15T13:25:00Z',
    lang: 'ar'
  },
  { 
    id: 'review_7',
    name: 'Sarah Ahmed',
    comment: 'Best honey I\'ve ever tasted! Pure, natural, and delivered so fast. Will definitely order again!',
    rating: 5,
    date: '2024-11-10T10:00:00Z',
    lang: 'en'
  },
  { 
    id: 'review_8',
    name: 'Mohammed Ali',
    comment: 'Excellent quality honey. The comb honey is amazing! Thank you for the fast delivery.',
    rating: 5,
    date: '2024-11-05T15:30:00Z',
    lang: 'en'
  }
];

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com/api' 
    : 'http://localhost:3000/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// Review Configuration
export const REVIEW_CONFIG = {
  MAX_REVIEWS_PER_PAGE: 10,
  MIN_REVIEW_LENGTH: 10,
  MAX_REVIEW_LENGTH: 500,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  RATING_OPTIONS: [1, 2, 3, 4, 5],
};

// Social Media Links
export const SOCIAL_LINKS = {
  WHATSAPP: `https://wa.me/${WHATSAPP_NUMBER}`,
  INSTAGRAM: INSTAGRAM_URL,
  FACEBOOK: 'https://www.facebook.com/honeyhouse247',
  TIKTOK: 'https://www.tiktok.com/@honeyhouse247',
  YOUTUBE: 'https://www.youtube.com/@honeyhouse247',
};

// Delivery Information
export const DELIVERY_INFO = {
  FREE_THRESHOLD: 200,
  MIN_DELIVERY_TIME: 24,
  MAX_DELIVERY_TIME: 48,
  DELIVERY_AREAS: [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah',
    'Al Ain'
  ],
};

// Payment Methods
export const PAYMENT_METHODS = [
  {
    id: 'cod',
    nameAr: 'الدفع عند الاستلام',
    nameEn: 'Cash on Delivery',
    icon: '💰'
  },
  {
    id: 'bank_transfer',
    nameAr: 'تحويل بنكي',
    nameEn: 'Bank Transfer',
    icon: '🏦'
  }
];

// Company Information
export const COMPANY_INFO = {
  NAME_AR: 'بيت العسل',
  NAME_EN: 'Honey House',
  EMAIL: 'info@honeyhouse247.com',
  PHONE: '+971568326116',
  ADDRESS_AR: 'دبي، الإمارات العربية المتحدة',
  ADDRESS_EN: 'Dubai, United Arab Emirates',
  WORKING_HOURS_AR: 'السبت إلى الخميس: 9 صباحاً - 9 مساءً',
  WORKING_HOURS_EN: 'Saturday to Thursday: 9 AM - 9 PM',
};

// Product Categories
export const PRODUCT_CATEGORIES = [
  {
    id: 'pure-honey',
    nameAr: 'عسل نقي',
    nameEn: 'Pure Honey',
    icon: '🍯'
  },
  {
    id: 'honey-comb',
    nameAr: 'عسل بالشمع',
    nameEn: 'Honey with Comb',
    icon: '🧊'
  },
  {
    id: 'special-offers',
    nameAr: 'عروض خاصة',
    nameEn: 'Special Offers',
    icon: '🎁'
  },
  {
    id: 'honey-products',
    nameAr: 'منتجات العسل',
    nameEn: 'Honey Products',
    icon: '🛍️'
  }
];

// Features/Benefits of Honey
export const HONEY_BENEFITS = {
  ar: [
    'مضاد طبيعي للبكتيريا',
    'غني بمضادات الأكسدة',
    'يساعد في التئام الجروح',
    'مهدئ للسعال',
    'مصدر للطاقة الطبيعية',
    'يحسن الهضم',
    'يقوي المناعة',
    'مفيد للبشرة والشعر'
  ],
  en: [
    'Natural antibacterial',
    'Rich in antioxidants',
    'Helps wound healing',
    'Soothes cough',
    'Source of natural energy',
    'Improves digestion',
    'Boosts immunity',
    'Good for skin and hair'
  ]
};
