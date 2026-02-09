import React, { useEffect, useMemo, useState } from 'react';
import { Language, CartItem } from './types';
import { PRODUCTS, TRANSLATIONS, WHATSAPP_NUMBER, INSTAGRAM_URL, FAQS, MOCK_REVIEWS } from './constants';

type ReviewObj = {
  ar: { name: string; comment: string };
  en: { name: string; comment: string };
  rating: number;
  createdAt?: string;
};

type SectionKey = 'ai' | 'products' | 'order' | 'reviews' | 'faq' | 'footer';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', location: '' });

  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const [serverReviews, setServerReviews] = useState<ReviewObj[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [addedNotify, setAddedNotify] = useState<string | null>(null);

  // Collapsible panels (Products + Reviews requested)
  const [openPanels, setOpenPanels] = useState<{ products: boolean; reviews: boolean }>({
    products: true,
    reviews: false,
  });

  const t = useMemo(() => TRANSLATIONS[lang], [lang]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // init cart + load reviews
  useEffect(() => {
    if (cart.length === 0) {
      setCart([{ id: 'init-1', productId: PRODUCTS[0].id, priceId: PRODUCTS[0].prices[0].id, quantity: 1 }]);
    }
    // Load reviews for everyone (requires /api/reviews on Vercel)
    void loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLanguage = () => setLang(prev => (prev === 'ar' ? 'en' : 'ar'));

  const addToBasket = (productId: string, priceId: string) => {
    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      priceId,
      quantity: 1,
    };

    if (cart.length === 1 && cart[0].id === 'init-1') {
      setCart([newItem]);
    } else {
      setCart(prev => [...prev, newItem]);
    }

    const prod = PRODUCTS.find(p => p.id === productId);
    setAddedNotify(lang === 'ar' ? `تمت إضافة ${prod?.titleAr} للسلة` : `Added ${prod?.titleEn} to basket`);
    setTimeout(() => setAddedNotify(null), 2200);
  };

  const removeProductLine = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartItem = (id: string, field: keyof CartItem, value: any) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id !== id) return item;

        const updated: any = { ...item, [field]: value };
        if (field === 'productId') {
          const product = PRODUCTS.find(p => p.id === value);
          updated.priceId = product ? product.prices[0].id : '';
        }
        return updated;
      })
    );
  };

  const totalOrderPrice = useMemo(() => {
    return cart.reduce((acc, item) => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      const priceObj = product?.prices.find(pr => pr.id === item.priceId);
      return acc + (priceObj ? priceObj.price * item.quantity : 0);
    }, 0);
  }, [cart]);

  const handleSendOrder = () => {
    if (!customer.name || !customer.phone || !customer.location || cart.length === 0) {
      alert(t.errorFields);
      return;
    }

    let summary = '';
    cart.forEach((item, index) => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      const priceObj = product?.prices.find(pr => pr.id === item.priceId);
      if (product && priceObj) {
        summary += `${index + 1}. ${lang === 'ar' ? product.titleAr : product.titleEn} (${lang === 'ar' ? priceObj.sizeAr : priceObj.sizeEn}) x ${item.quantity}\n`;
      }
    });

    const msg =
      `${t.whatsappOrderHeader}\n\n` +
      `${t.whatsappName} ${customer.name}\n` +
      `${t.whatsappPhone} ${customer.phone}\n` +
      `${t.whatsappLocation} ${customer.location}\n\n` +
      `${summary}\n` +
      `${t.whatsappTotal} ${totalOrderPrice} ${t.currency}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleAiConsult = async (customMsg?: string) => {
    const messageToUse = customMsg || aiMessage;
    if (!messageToUse.trim()) return;

    setIsAiThinking(true);
    setAiResponse('');

    try {
      const prompt = `
You are the Honey Sommelier for "Honey House" (premium Egyptian honey in UAE).
Respond in: ${lang === 'ar' ? 'Arabic (Egyptian-friendly)' : 'English'}.
User question: ${messageToUse}

Write a clear, detailed answer (8–14 short lines) and keep it easy to read:
- Start with a direct answer in 1–2 lines.
- Then bullet points for: (1) benefits/why, (2) how to use (steps + amounts if possible),
  (3) best match / recommendation, (4) cautions / who should avoid.
- End with a one-line takeaway.

Rules:
- Professional, warm, helpful. Avoid very long paragraphs.
- If the question is medical: add a short safety note (not a replacement for a doctor).
`;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await response.json();
      setAiResponse(data.reply || '');
    } catch (e) {
      setAiResponse('Error connecting to AI.');
    } finally {
      setIsAiThinking(false);
    }
  };

  const loadReviews = async () => {
    // Fallback local reviews (old behavior) — only used if API is missing
    const localKey = 'honey_house_reviews_v3';
    const localFallback = () => {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as ReviewObj[];
          setServerReviews(parsed);
        } catch (e) {}
      }
    };

    try {
      const res = await fetch('/api/reviews', { method: 'GET' });
      if (!res.ok) throw new Error('reviews api not ok');
      const data = await res.json();
      const list = (data?.reviews || []) as ReviewObj[];
      setServerReviews(list);
      // keep a copy locally too (offline-friendly)
      localStorage.setItem(localKey, JSON.stringify(list));
    } catch (e) {
      localFallback();
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;

    const reviewObj: ReviewObj = {
      ar: { name: newReview.name, comment: newReview.comment },
      en: { name: newReview.name, comment: newReview.comment },
      rating: newReview.rating,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update (instant UI)
    setServerReviews(prev => [reviewObj, ...prev]);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewObj),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'failed');

      // Server returns the final list (recommended)
      if (Array.isArray(data?.reviews)) {
        setServerReviews(data.reviews as ReviewObj[]);
        localStorage.setItem('honey_house_reviews_v3', JSON.stringify(data.reviews));
      }
    } catch (err) {
      // keep it locally if server failed (still better than losing)
      const key = 'honey_house_reviews_v3';
      const current = (() => {
        try {
          return JSON.parse(localStorage.getItem(key) || '[]') as ReviewObj[];
        } catch {
          return [] as ReviewObj[];
        }
      })();
      const merged = [reviewObj, ...current];
      localStorage.setItem(key, JSON.stringify(merged));
      setServerReviews(merged);
    }

    setNewReview({ name: '', rating: 5, comment: '' });
    setShowReviewForm(false);
  };

  const scrollToSection = (key: SectionKey) => {
    const idMap: Record<SectionKey, string> = {
      ai: 'ai-assistant',
      products: 'products-grid',
      order: 'order-form',
      reviews: 'reviews-section',
      faq: 'faq-section',
      footer: 'footer-section',
    };
    const el = document.getElementById(idMap[key]);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const allReviewsDisplay = useMemo(() => {
    // show real reviews first then mock
    return [...serverReviews, ...MOCK_REVIEWS];
  }, [serverReviews]);

  const reviewsStats = useMemo(() => {
    const real = serverReviews;
    const count = real.length;
    const avg = count === 0 ? 0 : real.reduce((s, r) => s + (r.rating || 0), 0) / count;
    return { count, avg: Math.round(avg * 10) / 10 };
  }, [serverReviews]);

  const togglePanel = (panel: 'products' | 'reviews') => {
    setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
    // when opening, scroll to it for better UX on mobile
    setTimeout(() => {
      if (panel === 'products') scrollToSection('products');
      if (panel === 'reviews') scrollToSection('reviews');
    }, 50);
  };

  const promoText = lang === 'ar'
    ? '🚚 توصيل مجاني فوق 200 درهم — لفترة محدودة!'
    : '🚚 Free delivery over AED 200 — Limited time!';

  return (
    <div className="min-h-screen text-slate-900 bg-[#FEFBF6] selection:bg-amber-200 antialiased font-primary">
      {addedNotify && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-amber-600 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-full font-black shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-3 text-sm sm:text-base">
          <span className="text-lg">✅</span> {addedNotify}
        </div>
      )}

      {/* Promo ticker (more visible) */}
      <div className="bg-amber-600 text-white py-3 border-b border-amber-700 relative z-[60] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-3">
          <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full font-black text-xs sm:text-sm promo-glow">
            <span className="text-base">🔥</span> {promoText}
          </span>
          <div className="ml-auto w-full overflow-hidden">
            <div className="animate-marquee flex gap-10 whitespace-nowrap text-xs sm:text-sm font-black opacity-95">
              <span className="promo-shine">{t.tickerMsg1}</span>
              <span className="promo-shine">{t.tickerMsg2}</span>
              <span className="promo-shine">{t.tickerMsg3}</span>
              <span className="promo-shine">{t.tickerMsg1}</span>
              <span className="promo-shine">{t.tickerMsg2}</span>
              <span className="promo-shine">{t.tickerMsg3}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header + nav */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-3xl border-b border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-500 rounded-xl flex items-center justify-center p-1 shadow-lg overflow-hidden">
              <img src="https://imgur.com/doKxqHM.jpeg" alt="Logo" className="w-full h-full object-cover rounded-lg scale-125" />
            </div>
            <span className="text-lg sm:text-xl font-black text-amber-950">{t.companyName}</span>
          </button>

          {/* Bigger, clearer nav on mobile */}
          <nav className="flex items-center gap-2 py-1">
            <NavBtn icon="✨" label={t.navAi} onClick={() => scrollToSection('ai')} />
            <NavBtn icon="🍯" label={t.navSelections} onClick={() => togglePanel('products')} />
            <NavBtn icon="⭐" label={`${t.navReviews}${reviewsStats.count ? ` (${reviewsStats.count})` : ''}`} onClick={() => togglePanel('reviews')} />
            <NavBtn icon="📦" label={t.navOrder} onClick={() => scrollToSection('order')} highlight />
            <NavBtn icon="❓" label={t.navFaq} onClick={() => scrollToSection('faq')} />
          </nav>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button
              onClick={toggleLanguage}
              className="bg-amber-50 text-amber-950 py-2.5 px-4 rounded-xl text-xs font-black border border-amber-100 hover:bg-amber-100 transition-colors uppercase"
            >
              {lang === 'ar' ? 'EN' : 'AR'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 sm:mt-12">
        {/* Hero */}
        <section className="text-center mb-12 sm:mb-16 relative">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-amber-950 mb-5 sm:mb-6 tracking-tighter leading-none">{t.companyName}</h1>
          <p className="text-base sm:text-lg md:text-2xl text-amber-800/70 font-medium italic mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">"{t.slogan}"</p>

          <div className="bg-amber-100 border-r-4 border-amber-500 text-amber-900 p-4 sm:p-6 rounded-2xl shadow-md text-center mb-4 inline-block w-full max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-black">{t.grandOpening}</h2>
            <p className="text-base sm:text-xl font-bold mt-2">{t.limitedTime}</p>
          </div>

          <div className="max-w-2xl mx-auto mt-4 flex items-center justify-center gap-3 flex-wrap">
            <span className="text-xs sm:text-sm font-black bg-white border border-amber-200 text-amber-900 px-4 py-2 rounded-full shadow-sm">
              {lang === 'ar' ? '✅ أسعار واضحة + طلب سريع' : '✅ Clear pricing + fast order'}
            </span>
            <span className="text-xs sm:text-sm font-black bg-white border border-amber-200 text-amber-900 px-4 py-2 rounded-full shadow-sm">
              {lang === 'ar' ? '🚚 توصيل سريع داخل الإمارات' : '🚚 Fast delivery in UAE'}
            </span>
            <span className="text-xs sm:text-sm font-black bg-white border border-amber-200 text-amber-900 px-4 py-2 rounded-full shadow-sm">
              {lang === 'ar' ? '⭐ تقييمات حقيقية' : '⭐ Real reviews'}
            </span>
          </div>
        </section>

        {/* AI Assistant */}
        <section id="ai-assistant" className="scroll-mt-32 mb-16 sm:mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 bg-amber-950 text-amber-50 p-6 sm:p-8 md:p-10 rounded-3xl sm:rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-lg">✨</div>
                  <h3 className="text-2xl sm:text-3xl font-black">{t.aiAssistantTitle}</h3>
                </div>
                <p className="opacity-80 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-xl leading-relaxed">{t.aiAssistantDesc}</p>

                <div className="flex flex-col sm:flex-row gap-3 bg-white/10 p-2 sm:p-3 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10">
                  <input
                    type="text"
                    value={aiMessage}
                    onChange={e => setAiMessage(e.target.value)}
                    placeholder={t.aiPlaceholder}
                    className="flex-grow bg-transparent px-4 sm:px-5 py-3 sm:py-4 outline-none text-white placeholder:text-white/30 text-base sm:text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && handleAiConsult()}
                  />
                  <button
                    onClick={() => handleAiConsult()}
                    disabled={isAiThinking}
                    className="bg-amber-500 text-amber-950 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-black hover:bg-white transition-all disabled:opacity-50 shrink-0"
                  >
                    {isAiThinking ? (
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-amber-950 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-amber-950 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-amber-950 rounded-full animate-bounce delay-150"></div>
                      </div>
                    ) : (lang === 'ar' ? 'استشر الخبير' : 'Consult Expert')}
                  </button>
                </div>

                {aiResponse && (
                  <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-amber-500/10 rounded-2xl sm:rounded-3xl border border-amber-500/20 text-sm sm:text-base italic animate-in fade-in slide-in-from-top-4 max-h-64 overflow-auto">
                    <pre className="whitespace-pre-wrap font-sans">"{aiResponse}"</pre>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <MiniStat icon="⭐" val={reviewsStats.avg ? String(reviewsStats.avg) : '—'} label={lang === 'ar' ? 'متوسط التقييم' : 'Avg Rating'} onClick={() => togglePanel('reviews')} />
              <MiniStat icon="👥" val={reviewsStats.count ? String(reviewsStats.count) : '0'} label={lang === 'ar' ? 'عدد المقيمين' : 'Reviewers'} onClick={() => togglePanel('reviews')} />
              <MiniStat icon="🚛" val="24h-48h" label={lang === 'ar' ? 'توصيل' : 'Delivery'} />
              <MiniStat icon="✅" val="100%" label={lang === 'ar' ? 'طبيعي' : 'Natural'} />
            </div>
          </div>
        </section>

        {/* Products in collapsible panel */}
        <section id="products-grid" className="mb-10 sm:mb-14 scroll-mt-32">
          <CollapsibleHeader
            title={t.navSelections}
            subtitle={t.deliveryNote}
            open={openPanels.products}
            onToggle={() => togglePanel('products')}
            icon="🍯"
          />
          {openPanels.products && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
              {PRODUCTS.map(p => (
                <HtmlStyleProductCard
                  key={p.id}
                  product={p}
                  lang={lang}
                  currency={t.currency}
                  onAdd={addToBasket}
                  t={t}
                />
              ))}
            </div>
          )}
        </section>

        {/* Order Form */}
        <section id="order-form" className="bg-white p-6 sm:p-10 md:p-16 rounded-3xl sm:rounded-[3rem] shadow-2xl border border-amber-100/50 max-w-5xl mx-auto mb-14 sm:mb-20 relative scroll-mt-32">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-950 mb-3 sm:mb-4">{t.orderNow}</h2>
            <p className="text-amber-700/60 text-sm sm:text-lg">{t.fillForm}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mb-8 sm:mb-10">
            <InputGroup label={t.nameLabel} placeholder={t.namePlaceholder} value={customer.name} onChange={v => setCustomer({ ...customer, name: v })} />
            <InputGroup label={t.phoneLabel} placeholder={t.phonePlaceholder} value={customer.phone} onChange={v => setCustomer({ ...customer, phone: v })} />
          </div>
          <InputGroup label={t.locationLabel} placeholder={t.locationPlaceholder} value={customer.location} onChange={v => setCustomer({ ...customer, location: v })} />

          <div className="mt-10 sm:mt-16 bg-slate-50 p-5 sm:p-8 rounded-3xl sm:rounded-[3.5rem] border border-slate-100 space-y-5 sm:space-y-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6 px-2 sm:px-4">
              <h4 className="font-black text-amber-900 uppercase tracking-widest text-xs sm:text-sm">{lang === 'ar' ? 'سلة المشتريات' : 'Basket'}</h4>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">{cart.length} {lang === 'ar' ? 'منتجات' : 'Items'}</span>
            </div>

            {cart.map(item => (
              <CartRow
                key={item.id}
                item={item}
                lang={lang}
                onUpdate={updateCartItem}
                onRemove={() => removeProductLine(item.id)}
                isOnly={cart.length === 1}
                t={t}
              />
            ))}

            <button onClick={() => togglePanel('products')} className="w-full py-4 sm:py-5 rounded-2xl border-2 border-dashed border-amber-300 text-amber-800 font-black hover:bg-amber-100 transition-all text-sm flex items-center justify-center gap-2">
              <span className="text-xl">+</span> {t.addProduct}
            </button>
          </div>

          <div className="mt-10 sm:mt-16 flex flex-col items-center">
            <div className="text-4xl sm:text-6xl font-black text-amber-600 mb-8 sm:mb-12 flex items-baseline gap-3">
              <span className="text-xs sm:text-base opacity-40 uppercase tracking-widest font-bold">{t.total}</span>
              {totalOrderPrice} <span className="text-sm sm:text-lg font-black">{t.currency}</span>
            </div>
            <button onClick={handleSendOrder} className="w-full max-w-xl bg-amber-500 text-white font-black py-5 sm:py-7 rounded-3xl sm:rounded-[2.5rem] text-lg sm:text-2xl shadow-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-4">
              <span className="text-2xl sm:text-3xl">📲</span> {t.sendOrder}
            </button>
          </div>
        </section>

        {/* Reviews in collapsible panel */}
        <section id="reviews-section" className="mb-14 sm:mb-20 scroll-mt-32">
          <CollapsibleHeader
            title={t.reviewsTitle}
            subtitle={lang === 'ar'
              ? `متوسط ${reviewsStats.avg || '—'} ⭐ — عدد المقيمين: ${reviewsStats.count}`
              : `Avg ${reviewsStats.avg || '—'} ⭐ — Reviewers: ${reviewsStats.count}`
            }
            open={openPanels.reviews}
            onToggle={() => togglePanel('reviews')}
            icon="⭐"
            rightActions={openPanels.reviews ? (
              <button onClick={() => setShowReviewForm(!showReviewForm)} className="bg-amber-950 text-white px-6 py-3 rounded-2xl font-black hover:bg-amber-800 transition-colors flex items-center gap-2 shrink-0 text-sm sm:text-base">
                <span>{t.leaveReview}</span>
                <span className="text-lg">✨</span>
              </button>
            ) : null}
          />

          {openPanels.reviews && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
              {showReviewForm && (
                <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border-2 border-amber-100 shadow-xl mb-10">
                  <form onSubmit={submitReview} className="space-y-6">
                    <InputGroup label={t.nameLabel} placeholder={t.namePlaceholder} value={newReview.name} onChange={(v: string) => setNewReview({ ...newReview, name: v })} />
                    <div>
                      <label className="text-[10px] font-black text-amber-900/30 uppercase tracking-[0.3em] px-2 mb-2 block">{lang === 'ar' ? 'التقييم' : 'Rating'}</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className={`text-3xl transition-transform hover:scale-125 ${newReview.rating >= star ? 'text-amber-400' : 'text-slate-200'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-amber-900/30 uppercase tracking-[0.3em] px-2">{lang === 'ar' ? 'التعليق' : 'Comment'}</label>
                      <textarea
                        value={newReview.comment}
                        onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                        className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-8 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 font-bold text-base"
                        rows={4}
                        required
                        placeholder={lang === 'ar' ? 'اكتب رأيك هنا...' : 'Write your review here...'}
                      />
                      <p className="text-xs text-amber-900/50 font-bold">
                        {lang === 'ar'
                          ? 'ملحوظة: التقييمات العامة تحتاج API (/api/reviews) على Vercel عشان تتشارك بين كل الزوار.'
                          : 'Note: Public reviews require an API (/api/reviews) on Vercel to be shared across all visitors.'}
                      </p>
                    </div>

                    <button type="submit" className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black text-base hover:bg-amber-600 transition-colors shadow-lg">
                      {lang === 'ar' ? 'نشر التقييم' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {allReviewsDisplay.map((r: any, i: number) => (
                  <div key={i} className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-50 shadow-sm relative group hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(r.rating)].map((_, j) => <span key={j} className="text-amber-400 text-lg">★</span>)}
                      </div>
                      {r?.createdAt && (
                        <span className="text-[10px] font-black text-amber-900/35 uppercase tracking-widest">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <p className="text-amber-950/80 italic text-base mb-6 leading-relaxed">"{lang === 'ar' ? r.ar.comment : r.en.comment}"</p>

                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-amber-100 rounded-full flex items-center justify-center text-lg font-black text-amber-600 uppercase">
                        {r.en.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-amber-950">{lang === 'ar' ? r.ar.name : r.en.name}</p>
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{lang === 'ar' ? 'عميل' : 'Customer'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* FAQ */}
        <section id="faq-section" className="mb-14 sm:mb-20 scroll-mt-32">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-amber-950 mb-10 sm:mb-12 text-center">{t.faqTitle}</h2>
            <div className="space-y-4">
              {FAQS.map((f, i) => <FaqMini key={i} q={lang === 'ar' ? f.ar.q : f.en.q} a={lang === 'ar' ? f.ar.a : f.en.a} />)}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="footer-section" className="mb-16 sm:mb-24 scroll-mt-32">
          <div className="bg-amber-100/30 p-6 sm:p-10 md:p-16 rounded-3xl sm:rounded-[3rem] border border-amber-100/50 flex flex-col md:flex-row justify-between items-center gap-10 md:gap-16 text-center md:text-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-950 mb-6">{t.whyChooseUs}</h2>
              <div className="grid grid-cols-2 gap-6">
                <FooterBadge icon="🌿" label={t.natural} />
                <FooterBadge icon="🛡️" label={t.labTested} />
                <FooterBadge icon="🏘️" label={t.direct} />
                <FooterBadge icon="🚀" label={t.fastDelivery} />
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-8">
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-amber-900/40 uppercase tracking-widest mb-1">{t.navContact}</p>
                  <p className="text-xl font-black text-amber-950">+971 56 832 6116</p>
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-2xl sm:text-3xl shadow-xl">🍯</div>
              </div>

              <div className="flex gap-4">
                <a href={INSTAGRAM_URL} target="_blank" className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl flex items-center justify-center font-black shadow-sm hover:-translate-y-1 transition-all border border-amber-100 text-sm">IG</a>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.401.832 2.903 1.274 4.437 1.275 5.398 0 9.791-4.393 9.793-9.793.001-2.615-1.017-5.074-2.868-6.925-1.851-1.851-4.312-2.868-6.927-2.868-5.398 0-9.791-4.393-9.793 9.793-.001 1.729.453 3.419 1.312 4.908l-.949 3.468 3.555-.933zm11.751-7.258c-.324-.162-1.916-.945-2.213-1.053-.297-.108-.513-.162-.729.162-.216.324-.838 1.053-1.026 1.269-.188.216-.378.243-.702.081-.324-.162-1.369-.505-2.61-1.611-.963-.859-1.613-1.921-1.802-2.245-.189-.324-.02-.5-.182-.661-.146-.145-.324-.378-.486-.567-.162-.189-.216-.324-.324-.541-.108-.216-.054-.405-.027-.567.027-.162.216-.513.324-.675.108-.162.144-.27.216-.432.072-.162.036-.306.018-.405-.018-.099-.216-.522-.296-.716-.078-.189-.157-.163-.216-.166-.056-.003-.12-.003-.184-.003-.065 0-.17.024-.259.121-.089.097-.339.332-.339.81s.348.939.397 1.003c.049.065.685 1.046 1.66 1.467.232.1.413.16.554.204.232.074.444.063.611.038.186-.028.572-.234.653-.461.081-.226.081-.421.056-.461-.026-.041-.097-.066-.421-.228z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { animation: marquee 22s linear infinite; }
        [dir="rtl"] .animate-marquee { animation: marquee-rtl 22s linear infinite; }
        @keyframes marquee-rtl { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .promo-glow { box-shadow: 0 0 0 rgba(255,255,255,0); animation: glow 1.4s ease-in-out infinite; }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 0 rgba(255,255,255,0); filter: brightness(1); }
          50% { box-shadow: 0 0 24px rgba(255,255,255,.25); filter: brightness(1.08); }
        }
        .promo-shine { animation: shine 2.2s ease-in-out infinite; }
        @keyframes shine {
          0%, 100% { opacity: .85; }
          50% { opacity: 1; text-shadow: 0 0 16px rgba(255,255,255,.35); }
        }

        .product-image-container { height: 220px; display: flex; align-items: center; justify-content: center; padding: 1rem; background-color: #fff; }
        @media (min-width: 640px) { .product-image-container { height: 260px; } }
        @media (min-width: 1024px) { .product-image-container { height: 310px; } }
      `}</style>
    </div>
  );
};

const NavBtn = ({ icon, label, onClick, highlight }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl text-[12px] sm:text-[13px] font-black transition-all hover:scale-[1.03] shrink-0 ${
      highlight
        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
        : 'text-amber-950/80 hover:text-amber-950 hover:bg-amber-50 border border-transparent hover:border-amber-100'
    }`}
  >
    <span className="text-base">{icon}</span>
    <span className="whitespace-nowrap uppercase tracking-tight">{label}</span>
  </button>
);

const CollapsibleHeader = ({
  title,
  subtitle,
  open,
  onToggle,
  icon,
  rightActions,
}: {
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  icon: string;
  rightActions?: React.ReactNode;
}) => (
  <div className="bg-white border border-amber-100/70 rounded-3xl shadow-sm px-5 sm:px-7 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center gap-4">
    <button onClick={onToggle} className="flex items-start sm:items-center gap-4 text-start w-full">
      <div className="w-11 h-11 bg-amber-100 rounded-2xl flex items-center justify-center text-xl shrink-0">{icon}</div>
      <div className="flex-1">
        <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
          {title}
          <span className={`text-xs font-black px-2 py-1 rounded-full ${open ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-900'}`}>
            {open ? 'OPEN' : 'VIEW'}
          </span>
        </h2>
        {subtitle && <p className="text-amber-700/60 font-medium text-sm sm:text-base mt-1">{subtitle}</p>}
      </div>

      <span className={`ml-auto w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center transition-transform duration-300 ${open ? 'rotate-180 bg-amber-500 text-white' : 'text-amber-500'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M19 9l-7 7-7-7" /></svg>
      </span>
    </button>

    {rightActions && (
      <div className="sm:ml-auto flex justify-end">
        {rightActions}
      </div>
    )}
  </div>
);

const HtmlStyleProductCard = ({ product, lang, currency, onAdd, t }: any) => {
  const [sizeIdx, setSizeIdx] = useState(0);
  const currentPrice = product.prices[sizeIdx];

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col transition-transform duration-300 hover:scale-[1.01] border border-amber-50">
      <div className="product-image-container">
        <img src={product.image} alt={product.titleEn} className="max-w-full max-h-full object-contain" />
      </div>
      <div className="p-5 sm:p-6 md:p-7 flex-grow flex flex-col">
        <h3 className="text-xl sm:text-2xl font-bold text-[#6B4226] mb-2 leading-tight">
          {lang === 'ar' ? product.titleAr : product.titleEn}
        </h3>
        <p className="text-[#A16207] mb-5 sm:mb-6 flex-grow text-sm leading-relaxed">
          {lang === 'ar' ? product.descriptionAr : product.descriptionEn}
        </p>

        <div className="mb-5 sm:mb-6">
          <p className="text-base sm:text-lg text-[#6B4226] mb-3 font-bold">{t.chooseSize}</p>
          <div className="flex flex-wrap gap-2">
            {product.prices.map((p: any, i: number) => (
              <button
                key={p.id}
                onClick={() => setSizeIdx(i)}
                className={`border-2 rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold transition-all ${
                  sizeIdx === i
                    ? 'bg-[#6B4226] text-white border-[#6B4226]'
                    : 'border-gray-200 text-gray-500 hover:border-amber-500'
                }`}
              >
                {lang === 'ar' ? p.sizeAr : p.sizeEn}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mt-auto border-t border-amber-50 pt-5 sm:pt-6">
          <p className="text-3xl sm:text-4xl font-black text-[#D97706] mb-5 sm:mb-6">
            {currentPrice.price} {currency}
          </p>
          <button
            onClick={() => onAdd(product.id, currentPrice.id)}
            className="w-full bg-[#FBBF24] hover:bg-[#F59E0B] text-amber-950 font-black py-3.5 sm:py-4 px-6 sm:px-8 rounded-full shadow-lg transform active:scale-95 transition-all text-base sm:text-lg flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🛒</span>
            {lang === 'ar' ? 'أضف للسلة' : 'Add to Basket'}
          </button>
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ icon, val, label, onClick }: any) => (
  <button
    onClick={onClick}
    className="bg-white p-4 sm:p-6 rounded-3xl border border-amber-100 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 group shrink-0"
  >
    <span className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</span>
    <span className="text-xl sm:text-2xl font-black text-amber-950 leading-none">{val}</span>
    <span className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest mt-2">{label}</span>
  </button>
);

const FaqMini = ({ q, a }: any) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-3xl border border-amber-50 overflow-hidden shadow-sm">
      <button onClick={() => setOpen(!open)} className="w-full p-5 sm:p-8 text-start font-black text-amber-950 text-base sm:text-lg flex justify-between items-center group">
        <span>{q}</span>
        <span className={`w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center transition-transform duration-500 ${open ? 'rotate-180 bg-amber-500 text-white' : 'text-amber-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M19 9l-7 7-7-7" /></svg>
        </span>
      </button>
      <div className={`transition-all duration-500 overflow-hidden ${open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 text-sm sm:text-lg text-amber-800/60 leading-relaxed border-t border-amber-50 pt-5 sm:pt-6">{a}</div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, placeholder, value, onChange }: any) => (
  <div className="space-y-3 sm:space-y-4">
    <label className="text-[10px] font-black text-amber-900/30 uppercase tracking-[0.3em] px-2">{label}</label>
    <input
      type="text"
      required
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-8 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 font-bold text-base sm:text-lg"
      placeholder={placeholder}
    />
  </div>
);

const FooterBadge = ({ icon, label }: any) => (
  <div className="flex flex-col gap-2">
    <span className="text-3xl">{icon}</span>
    <span className="text-xs font-black text-amber-900/60 uppercase tracking-widest">{label}</span>
  </div>
);

const CartRow = ({ item, lang, onUpdate, onRemove, isOnly, t }: any) => {
  const prod = PRODUCTS.find(p => p.id === item.productId);
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-amber-100/50">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-50 rounded-2xl flex items-center justify-center p-2 shrink-0">
        <img src={prod?.image} alt="Cart item" className="w-full h-full object-contain" />
      </div>

      <div className="flex-grow text-center sm:text-start">
        <p className="font-black text-amber-950 text-base sm:text-lg mb-1">{lang === 'ar' ? prod?.titleAr : prod?.titleEn}</p>
        <select
          value={item.priceId}
          onChange={e => onUpdate(item.id, 'priceId', e.target.value)}
          className="bg-amber-50 px-3 py-2 rounded-xl text-xs font-black text-amber-700 outline-none border border-amber-100 w-full sm:w-auto"
        >
          {prod?.prices.map(pr => (
            <option key={pr.id} value={pr.id}>
              {lang === 'ar' ? pr.sizeAr : pr.sizeEn} ({pr.price} {t.currency})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center bg-slate-100 rounded-2xl px-2 py-1 shrink-0">
        <button onClick={() => onUpdate(item.id, 'quantity', Math.max(1, item.quantity - 1))} className="w-10 h-10 flex items-center justify-center text-amber-900 font-black text-xl hover:text-amber-500 transition-colors">-</button>
        <span className="w-10 text-center font-black text-lg">{item.quantity}</span>
        <button onClick={() => onUpdate(item.id, 'quantity', item.quantity + 1)} className="w-10 h-10 flex items-center justify-center text-amber-900 font-black text-xl hover:text-amber-500 transition-colors">+</button>
      </div>

      {!isOnly && (
        <button onClick={onRemove} className="text-red-400 p-3 hover:bg-red-50 rounded-2xl shrink-0 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
      )}
    </div>
  );
};

export default App;
