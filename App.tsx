
import React, { useState, useEffect, useMemo } from 'react';
import { Language, CartItem } from './types';
import { PRODUCTS, TRANSLATIONS, WHATSAPP_NUMBER, INSTAGRAM_URL, FAQS, MOCK_REVIEWS } from './constants';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  // Fix: Corrected the generic type syntax and closing bracket for useState
  const [lang, setLang] = useState<Language>('ar');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', location: '' });
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const [localReviews, setLocalReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [addedNotify, setAddedNotify] = useState<string | null>(null);

  const t = useMemo(() => TRANSLATIONS[lang], [lang]);

  useEffect(() => {
    const saved = localStorage.getItem('honey_house_reviews_v2');
    if (saved) {
      try { setLocalReviews(JSON.parse(saved)); } catch (e) {}
    }
    if (cart.length === 0) {
      setCart([{ id: 'init-1', productId: PRODUCTS[0].id, priceId: PRODUCTS[0].prices[0].id, quantity: 1 }]);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => setLang(prev => (prev === 'ar' ? 'en' : 'ar'));

  const addToBasket = (productId: string, priceId: string) => {
    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      priceId,
      quantity: 1
    };
    if (cart.length === 1 && cart[0].id === 'init-1' && cart[0].quantity === 1 && cart[0].productId === PRODUCTS[0].id) {
       setCart([newItem]);
    } else {
       setCart([...cart, newItem]);
    }
    const prod = PRODUCTS.find(p => p.id === productId);
    setAddedNotify(lang === 'ar' ? `تمت إضافة ${prod?.titleAr} للسلة` : `Added ${prod?.titleEn} to basket`);
    setTimeout(() => setAddedNotify(null), 3000);
  };

  const removeProductLine = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartItem = (id: string, field: keyof CartItem, value: any) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'productId') {
          const product = PRODUCTS.find(p => p.id === value);
          updated.priceId = product ? product.prices[0].id : '';
        }
        return updated;
      }
      return item;
    }));
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
    const msg = `${t.whatsappOrderHeader}\n\n${t.whatsappName} ${customer.name}\n${t.whatsappPhone} ${customer.phone}\n${t.whatsappLocation} ${customer.location}\n\n${summary}\n${t.whatsappTotal} ${totalOrderPrice} ${t.currency}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

const handleAiConsult = async (customMsg?: string) => {
  const messageToUse = customMsg || aiMessage;
  if (!messageToUse.trim()) return;

  setIsAiThinking(true);
  setAiResponse('');

  try {
    const response = await fetch(
      'https://honey-house.vercel.app/api/gemini',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `You are the Honey Sommelier for 'Honey House'.
User language: ${lang}.
Context: Premium Egyptian honey products.
User question: ${messageToUse}.
Provide a very short, professional, and helpful response.`,
        }),
      }
    );

    const data = await response.json();
    setAiResponse(data.reply || '');
  } catch (e) {
    setAiResponse('Error connecting to AI.');
  } finally {
    setIsAiThinking(false);
  }
};

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    const reviewObj = {
      ar: { name: newReview.name, comment: newReview.comment },
      en: { name: newReview.name, comment: newReview.comment },
      rating: newReview.rating
    };
    const updated = [reviewObj, ...localReviews];
    setLocalReviews(updated);
    localStorage.setItem('honey_house_reviews_v2', JSON.stringify(updated));
    setNewReview({ name: '', rating: 5, comment: '' });
    setShowReviewForm(false);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const allReviewsDisplay = useMemo(() => {
    return [...localReviews, ...MOCK_REVIEWS];
  }, [localReviews]);

  return (
    <div className="min-h-screen text-slate-900 bg-[#FEFBF6] selection:bg-amber-200 antialiased font-primary">
      {addedNotify && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-amber-600 text-white px-8 py-4 rounded-full font-black shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-3">
          <span className="text-xl">✅</span> {addedNotify}
        </div>
      )}

      {/* Ticker */}
      <div className="bg-amber-500 text-white py-2 text-xs md:text-sm font-bold border-b border-amber-600 relative z-[60] overflow-hidden">
         <div className="animate-marquee flex gap-12 whitespace-nowrap">
            <span>{t.tickerMsg1}</span><span>{t.tickerMsg2}</span><span>{t.tickerMsg3}</span>
            <span>{t.tickerMsg1}</span><span>{t.tickerMsg2}</span><span>{t.tickerMsg3}</span>
         </div>
      </div>

      {/* Direct Nav */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-3xl border-b border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
             <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center p-1 shadow-lg overflow-hidden">
               <img src="https://imgur.com/doKxqHM.jpeg" alt="Logo" className="w-full h-full object-cover rounded-lg scale-125" />
             </div>
             <span className="text-xl font-black text-amber-950">{t.companyName}</span>
          </button>

          <nav className="flex items-center gap-1 md:gap-2 py-1">
            <NavBtn icon="✨" label={t.navAi} onClick={() => scrollToSection('ai-assistant')} />
            <NavBtn icon="🍯" label={t.navSelections} onClick={() => scrollToSection('products-grid')} />
            <NavBtn icon="⭐" label={t.navReviews} onClick={() => scrollToSection('reviews-section')} />
            <NavBtn icon="📦" label={t.navOrder} onClick={() => scrollToSection('order-form')} highlight />
            <NavBtn icon="❓" label={t.navFaq} onClick={() => scrollToSection('faq-section')} />
          </nav>

          <div className="flex items-center gap-2 ml-auto shrink-0">
             <button onClick={toggleLanguage} className="bg-amber-50 text-amber-950 py-2 px-4 rounded-xl text-[10px] font-black border border-amber-100 hover:bg-amber-100 transition-colors uppercase">
               {lang === 'ar' ? 'EN' : 'AR'}
             </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        {/* Hero */}
        <section className="text-center mb-16 relative">
          <h1 className="text-5xl md:text-8xl font-black text-amber-950 mb-6 tracking-tighter leading-none">{t.companyName}</h1>
          <p className="text-xl md:text-2xl text-amber-800/70 font-medium italic mb-10 max-w-2xl mx-auto leading-relaxed">"{t.slogan}"</p>
          <div className="bg-amber-100 border-r-4 border-amber-500 text-amber-800 p-6 rounded-2xl shadow-md text-center mb-10 inline-block w-full max-w-2xl mx-auto">
              <h2 className="text-2xl font-black">{t.grandOpening}</h2>
              <p className="text-xl font-bold mt-2">{t.limitedTime}</p>
          </div>
        </section>

        {/* AI Assistant - NOW FIRST */}
        <section id="ai-assistant" className="scroll-mt-32 mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 bg-amber-950 text-amber-50 p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">✨</div>
                    <h3 className="text-3xl font-black">{t.aiAssistantTitle}</h3>
                  </div>
                  <p className="opacity-70 text-lg mb-10 max-w-xl leading-relaxed">{t.aiAssistantDesc}</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 bg-white/10 p-3 rounded-3xl backdrop-blur-xl border border-white/10">
                     <input 
                      type="text" value={aiMessage} onChange={e => setAiMessage(e.target.value)}
                      placeholder={t.aiPlaceholder} className="flex-grow bg-transparent px-5 py-4 outline-none text-white placeholder:text-white/30 text-lg"
                      onKeyPress={(e) => e.key === 'Enter' && handleAiConsult()}
                     />
                     <button onClick={() => handleAiConsult()} disabled={isAiThinking} className="bg-amber-500 text-amber-950 px-8 py-4 rounded-2xl font-black hover:bg-white transition-all disabled:opacity-50 shrink-0">
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
                    <div className="mt-8 p-6 bg-amber-500/10 rounded-3xl border border-amber-500/20 text-lg italic animate-in fade-in slide-in-from-top-4">
                      "{aiResponse}"
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <MiniStat icon="⭐" val="4.9" label={lang === 'ar' ? 'تقييمنا' : 'Rating'} onClick={() => scrollToSection('reviews-section')} />
                <MiniStat icon="🚛" val="24h" label={lang === 'ar' ? 'توصيل' : 'Delivery'} />
                <MiniStat icon="💎" val="100%" label={lang === 'ar' ? 'طبيعي' : 'Natural'} />
                <MiniStat icon="✅" val="CERT" label={lang === 'ar' ? 'مضمون' : 'Certified'} />
             </div>
          </div>
        </section>

        {/* Products Grid - HTML VERSION STYLE */}
        <section id="products-grid" className="mb-24 scroll-mt-32">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-amber-950 mb-2">{t.navSelections}</h2>
            <p className="text-amber-700/60 font-medium">{t.deliveryNote}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        </section>

        {/* Order Form */}
        <section id="order-form" className="bg-white p-10 md:p-20 rounded-[4rem] shadow-2xl border border-amber-100/50 max-w-5xl mx-auto mb-24 relative scroll-mt-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-amber-950 mb-4">{t.orderNow}</h2>
            <p className="text-amber-700/60 text-lg">{t.fillForm}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            <InputGroup label={t.nameLabel} placeholder={t.namePlaceholder} value={customer.name} onChange={v => setCustomer({...customer, name: v})} />
            <InputGroup label={t.phoneLabel} placeholder={t.phonePlaceholder} value={customer.phone} onChange={v => setCustomer({...customer, phone: v})} />
          </div>
          <InputGroup label={t.locationLabel} placeholder={t.locationPlaceholder} value={customer.location} onChange={v => setCustomer({...customer, location: v})} />

          <div className="mt-16 bg-slate-50 p-8 rounded-[3.5rem] border border-slate-100 space-y-6">
            <div className="flex justify-between items-center mb-6 px-4">
               <h4 className="font-black text-amber-900 uppercase tracking-widest text-sm">{lang === 'ar' ? 'سلة المشتريات' : 'Basket'}</h4>
               <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">{cart.length} {lang === 'ar' ? 'منتجات' : 'Items'}</span>
            </div>
            {cart.map(item => <CartRow key={item.id} item={item} lang={lang} onUpdate={updateCartItem} onRemove={() => removeProductLine(item.id)} isOnly={cart.length === 1} t={t} />)}
            <button onClick={() => scrollToSection('products-grid')} className="w-full py-5 rounded-2xl border-2 border-dashed border-amber-300 text-amber-800 font-black hover:bg-amber-100 transition-all text-sm flex items-center justify-center gap-2">
              <span className="text-xl">+</span> {t.addProduct}
            </button>
          </div>

          <div className="mt-16 flex flex-col items-center">
             <div className="text-6xl font-black text-amber-600 mb-12 flex items-baseline gap-3">
               <span className="text-base opacity-40 uppercase tracking-widest font-bold">{t.total}</span>
               {totalOrderPrice} <span className="text-lg font-black">{t.currency}</span>
             </div>
             <button onClick={handleSendOrder} className="w-full max-w-xl bg-amber-500 text-white font-black py-7 rounded-[2.5rem] text-2xl shadow-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-4">
                <span className="text-3xl">📲</span> {t.sendOrder}
             </button>
          </div>
        </section>

        {/* Reviews - DIRECT SYSTEM */}
        <section id="reviews-section" className="mb-24 scroll-mt-32">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
             <div className="text-center md:text-start">
               <h2 className="text-4xl font-black text-amber-950">{t.reviewsTitle}</h2>
               <p className="text-amber-700/60 font-medium text-lg mt-2">{lang === 'ar' ? 'آراء عملاء بيت العسل الموثقة' : 'Verified reviews from our community'}</p>
             </div>
             <button onClick={() => setShowReviewForm(!showReviewForm)} className="bg-amber-950 text-white px-8 py-4 rounded-2xl font-black hover:bg-amber-800 transition-colors flex items-center gap-2 shrink-0">
               <span>{t.leaveReview}</span>
               <span className="text-xl">✨</span>
             </button>
          </div>

          {showReviewForm && (
            <div className="max-w-xl mx-auto bg-white p-8 rounded-[3rem] border-2 border-amber-100 shadow-xl mb-12 animate-in slide-in-from-top-4 fade-in duration-300">
               <form onSubmit={submitReview} className="space-y-6">
                  <InputGroup label={t.nameLabel} placeholder={t.namePlaceholder} value={newReview.name} onChange={v => setNewReview({...newReview, name: v})} />
                  <div>
                    <label className="text-[10px] font-black text-amber-900/30 uppercase tracking-[0.3em] px-2 mb-2 block">{lang === 'ar' ? 'التقييم' : 'Rating'}</label>
                    <div className="flex gap-2">
                       {[1,2,3,4,5].map(star => (
                         <button type="button" key={star} onClick={() => setNewReview({...newReview, rating: star})} className={`text-3xl transition-transform hover:scale-125 ${newReview.rating >= star ? 'text-amber-400' : 'text-slate-200'}`}>★</button>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-amber-900/30 uppercase tracking-[0.3em] px-2">{lang === 'ar' ? 'التعليق' : 'Comment'}</label>
                    <textarea value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl border border-slate-100 focus:ring-8 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 font-bold" rows={4} required placeholder={lang === 'ar' ? 'اكتب رأيك هنا...' : 'Write your review here...'} />
                  </div>
                  <button type="submit" className="w-full bg-amber-500 text-white py-5 rounded-2xl font-black text-lg hover:bg-amber-600 transition-colors shadow-lg">
                    {lang === 'ar' ? 'نشر التقييم' : 'Submit Review'}
                  </button>
               </form>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {allReviewsDisplay.map((r, i) => (
               <div key={i} className="bg-white p-10 rounded-[3rem] border border-amber-50 shadow-sm relative group hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(r.rating)].map((_, i) => <span key={i} className="text-amber-400 text-xl">★</span>)}
                  </div>
                  <p className="text-amber-950/80 italic text-lg mb-8 leading-relaxed">"{lang === 'ar' ? r.ar.comment : r.en.comment}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-xl font-black text-amber-600 uppercase">
                      {r.en.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-amber-950">{lang === 'ar' ? r.ar.name : r.en.name}</p>
                      <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{lang === 'ar' ? 'عميل موثق' : 'Verified Customer'}</p>
                    </div>
                  </div>
               </div>
             ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq-section" className="mb-24 scroll-mt-32">
           <div className="max-w-4xl mx-auto">
             <h2 className="text-4xl font-black text-amber-950 mb-12 text-center">{t.faqTitle}</h2>
             <div className="space-y-4">
               {FAQS.map((f, i) => <FaqMini key={i} q={lang === 'ar' ? f.ar.q : f.en.q} a={lang === 'ar' ? f.ar.a : f.en.a} />)}
             </div>
           </div>
        </section>

        {/* Footer */}
        <footer id="footer-section" className="mb-24 scroll-mt-32">
           <div className="bg-amber-100/30 p-12 md:p-20 rounded-[4rem] border border-amber-100/50 flex flex-col md:flex-row justify-between items-center gap-16 text-center md:text-start">
              <div>
                <h2 className="text-3xl font-black text-amber-950 mb-6">{t.whyChooseUs}</h2>
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
                    <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-3xl shadow-xl">🍯</div>
                 </div>
                 <div className="flex gap-4">
                    <a href={INSTAGRAM_URL} target="_blank" className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black shadow-sm hover:-translate-y-1 transition-all border border-amber-100 text-sm">IG</a>
                    <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="w-14 h-14 bg-[#25D366] text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.401.832 2.903 1.274 4.437 1.275 5.398 0 9.791-4.393 9.793-9.793.001-2.615-1.017-5.074-2.868-6.925-1.851-1.851-4.312-2.868-6.927-2.868-5.398 0-9.791-4.393-9.793 9.793-.001 1.729.453 3.419 1.312 4.908l-.949 3.468 3.555-.933zm11.751-7.258c-.324-.162-1.916-.945-2.213-1.053-.297-.108-.513-.162-.729.162-.216.324-.838 1.053-1.026 1.269-.188.216-.378.243-.702.081-.324-.162-1.369-.505-2.61-1.611-.963-.859-1.613-1.921-1.802-2.245-.189-.324-.02-.5-.182-.661-.146-.145-.324-.378-.486-.567-.162-.189-.216-.324-.324-.541-.108-.216-.054-.405-.027-.567.027-.162.216-.513.324-.675.108-.162.144-.27.216-.432.072-.162.036-.306.018-.405-.018-.099-.216-.522-.296-.716-.078-.189-.157-.163-.216-.166-.056-.003-.12-.003-.184-.003-.065 0-.17.024-.259.121-.089.097-.339.332-.339.81s.348.939.397 1.003c.049.065.685 1.046 1.66 1.467.232.1.413.16.554.204.232.074.444.063.611.038.186-.028.572-.234.653-.461.081-.226.081-.421.056-.461-.026-.041-.097-.066-.421-.228z"/></svg>
                    </a>
                 </div>
              </div>
           </div>
        </footer>
      </div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        [dir="rtl"] .animate-marquee { animation: marquee-rtl 30s linear infinite; }
        @keyframes marquee-rtl { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .product-image-container { height: 320px; display: flex; align-items: center; justify-content: center; padding: 1rem; background-color: #fff; }
      `}</style>
    </div>
  );
};

const NavBtn = ({ icon, label, onClick, highlight }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black transition-all hover:scale-105 shrink-0 ${highlight ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-amber-950/70 hover:text-amber-950 hover:bg-amber-50'}`}
  >
    <span className="text-sm">{icon}</span>
    <span className="whitespace-nowrap uppercase tracking-tighter">{label}</span>
  </button>
);

const HtmlStyleProductCard = ({ product, lang, currency, onAdd, t }: any) => {
  const [sizeIdx, setSizeIdx] = useState(0);
  const currentPrice = product.prices[sizeIdx];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col transition-transform duration-300 hover:scale-[1.02] border border-amber-50">
        <div className="product-image-container">
             <img src={product.image} alt={product.titleEn} className="max-w-full max-h-full object-contain" />
        </div>
        <div className="p-8 flex-grow flex flex-col">
            <h3 className="text-2xl font-bold text-[#6B4226] mb-2 leading-tight">
              {lang === 'ar' ? product.titleAr : product.titleEn}
            </h3>
            <p className="text-[#A16207] mb-6 flex-grow text-sm leading-relaxed">
              {lang === 'ar' ? product.descriptionAr : product.descriptionEn}
            </p>
            
            <div className="mb-6">
                <p className="text-lg text-[#6B4226] mb-3 font-bold">{t.chooseSize}</p>
                <div className="flex flex-wrap gap-2">
                    {product.prices.map((p: any, i: number) => (
                      <button 
                        key={p.id}
                        onClick={() => setSizeIdx(i)} 
                        className={`border-2 rounded-full px-5 py-2 text-sm font-bold transition-all ${sizeIdx === i ? 'bg-[#6B4226] text-white border-[#6B4226]' : 'border-gray-200 text-gray-500 hover:border-amber-500'}`}
                      >
                        {lang === 'ar' ? p.sizeAr : p.sizeEn}
                      </button>
                    ))}
                </div>
            </div>
            
            <div className="text-center mt-auto border-t border-amber-50 pt-6">
                <p className="text-4xl font-black text-[#D97706] mb-6">
                  {currentPrice.price} {currency}
                </p>
                <button 
                  onClick={() => onAdd(product.id, currentPrice.id)}
                  className="w-full bg-[#FBBF24] hover:bg-[#F59E0B] text-amber-950 font-black py-4 px-8 rounded-full shadow-lg transform active:scale-95 transition-all text-lg flex items-center justify-center gap-3"
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
  <button onClick={onClick} className="bg-white p-6 rounded-[2.5rem] border border-amber-100 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 group shrink-0">
    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</span>
    <span className="text-2xl font-black text-amber-950 leading-none">{val}</span>
    <span className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest mt-2">{label}</span>
  </button>
);

const FaqMini = ({ q, a }: any) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-[2rem] border border-amber-50 overflow-hidden shadow-sm">
       <button onClick={() => setOpen(!open)} className="w-full p-8 text-start font-black text-amber-950 text-lg flex justify-between items-center group">
          <span>{q}</span>
          <span className={`w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center transition-transform duration-500 ${open ? 'rotate-180 bg-amber-500 text-white' : 'text-amber-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M19 9l-7 7-7-7" /></svg>
          </span>
       </button>
       <div className={`transition-all duration-500 overflow-hidden ${open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-8 pb-8 text-lg text-amber-800/60 leading-relaxed border-t border-amber-50 pt-6">{a}</div>
       </div>
    </div>
  );
};

const InputGroup = ({ label, placeholder, value, onChange }: any) => (
  <div className="space-y-4">
    <label className="text-[10px] font-black text-amber-900/30 uppercase tracking-[0.3em] px-2">{label}</label>
    <input 
      type="text" required value={value} onChange={e => onChange(e.target.value)}
      className="w-full p-6 bg-slate-50 rounded-3xl border border-slate-100 focus:ring-8 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 font-bold text-lg"
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
    <div className="flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border border-amber-100/50">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center p-2 shrink-0">
         <img src={prod?.image} alt="Cart item" className="w-full h-full object-contain" />
      </div>
      <div className="flex-grow text-center sm:text-start">
         <p className="font-black text-amber-950 text-lg mb-1">{lang === 'ar' ? prod?.titleAr : prod?.titleEn}</p>
         <select value={item.priceId} onChange={e => onUpdate(item.id, 'priceId', e.target.value)} className="bg-amber-50 px-3 py-1 rounded-lg text-xs font-black text-amber-700 outline-none border border-amber-100">
            {prod?.prices.map(pr => <option key={pr.id} value={pr.id}>{lang === 'ar' ? pr.sizeAr : pr.sizeEn} ({pr.price} {t.currency})</option>)}
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
