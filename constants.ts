
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
    reviewsTitle: 'رأي عملائنا',
    leaveReview: 'شاركنا تجربتك',
    whatsappReviewTemplate: 'مرحباً بيت العسل، أود مشاركة تقييمي: \nالتقييم: ⭐⭐⭐⭐⭐ \nالتعليق: ',
    whatsappOrderHeader: 'طلب جديد من موقع بيت العسل:',
    whatsappName: 'الاسم:',
    whatsappPhone: 'الهاتف:',
    whatsappLocation: 'الموقع:',
    whatsappTotal: 'الإجمالي:',
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
    limitedTime: 'Limited Time! Don’t Miss the Opportunity!',
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
    reviewsTitle: 'What Our Community Says',
    leaveReview: 'Share Your Experience',
    whatsappReviewTemplate: 'Hello Honey House, I would like to share my review: \nRating: ⭐⭐⭐⭐⭐ \nComment: ',
    whatsappOrderHeader: 'New Order from Honey House:',
    whatsappName: 'Name:',
    whatsappPhone: 'Phone:',
    whatsappLocation: 'Location:',
    whatsappTotal: 'Total:',
  }
};

export const FAQS = [
  {
    ar: { q: 'هل العسل طبيعي 100%؟', a: 'نعم، عسلنا نقي ومباشر من المناحل المصرية بدون أي إضافات أو معالجات حرارية.' },
    en: { q: 'Is the honey 100% natural?', a: 'Yes, our honey is pure and direct from Egyptian apiaries without any additives or heat treatments.' }
  },
  {
    ar: { q: 'كم يستغرق التوصيل؟', a: 'التوصيل متاح لكل إمارات الدولة خلال 24-48 ساعة كحد أقصى.' },
    en: { q: 'How long does delivery take?', a: 'Delivery is available to all Emirates within 24-48 hours maximum.' }
  },
  {
    ar: { q: 'كيف يمكنني تخزين العسل؟', a: 'يُحفظ العسل في درجة حرارة الغرفة بعيداً عن أشعة الشمس المباشرة. لا ينصح بوضعه في الثلاجة.' },
    en: { q: 'How should I store honey?', a: 'Store at room temperature away from direct sunlight. Refrigeration is not recommended.' }
  }
];

export const MOCK_REVIEWS = [
  { 
    ar: { name: 'نانسي', comment: 'حقيقى عسل طبيعى 💯 جربت محلات وسوبر ماركت كتير وأنواع مختلفة ما لاقيت ذى جرب وإعرف الفرق الله يوفقكم ويبارك فيكم 💪👍' }, 
    en: { name: 'Nancy', comment: 'Truly natural honey 💯 I\'ve tried many shops and supermarkets and different types, but I haven\'t found anything like this. Try it and know the difference. May God grant you success and bless you 💪👍' }, 
    rating: 5 
  },
  { 
    ar: { name: 'توني', comment: 'انا عاوز ااكد انا كمان على جوده العسل حقيقي حاجه عظمة 👌❤️' }, 
    en: { name: 'Tony', comment: 'I want to confirm the quality of the honey, truly something great! Masterpiece quality 👌❤️' }, 
    rating: 5 
  },
  { 
    ar: { name: 'كيرلس', comment: 'حقيقي العسل اكتر من رائع (عن تجربة) 😍😍' }, 
    en: { name: 'Kyrollos', comment: 'Truly the honey is more than wonderful (from my experience) 😍😍' }, 
    rating: 5 
  },
  { 
    ar: { name: 'ايهاب أسعد', comment: 'بجد ربنا يبارك العسل حلو اوي ربنا يبارك و يزيدك و تبقي من كبار تجار العسل في الامارات' }, 
    en: { name: 'Ehab Asaad', comment: 'Truly God bless, the honey is very good. May you become one of the top honey traders in the UAE.' }, 
    rating: 5 
  },
  { 
    ar: { name: 'إريني', comment: 'عاوزة اشكرك جدا على العسل.. بجد تحفة.. و بالذات اللي بغذاء الملكات.. ربنا يباركلك 🙏🙏🙏' }, 
    en: { name: 'Eriny', comment: 'I want to thank you very much for the honey.. truly a masterpiece.. especially the one with royal jelly.. God bless you 🙏🙏🙏' }, 
    rating: 5 
  },
  { 
    ar: { name: 'مريم عادل', comment: 'العسل تحفففففه و الشمع كنت بقولك مش عايزاه ده طلع تحفه احنا تقريبا خلصناه 😂' }, 
    en: { name: 'Mariam Adel', comment: 'The honey is a masterpiece! And the comb I thought I didn\'t want turned out amazing, we\'ve almost finished it! 😂' }, 
    rating: 5 
  },
];
