import React, { useState, useEffect, useMemo } from 'react';
import { Language, CartItem } from './types';
import {
  PRODUCTS,
  TRANSLATIONS,
  WHATSAPP_NUMBER,
  INSTAGRAM_URL,
  FAQS,
  MOCK_REVIEWS
} from './constants';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', location: '' });

  // AI
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const t = useMemo(() => TRANSLATIONS[lang], [lang]);

  /* =========================
     Effects
  ========================= */
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (cart.length === 0) {
      setCart([
        {
          id: 'init',
          productId: PRODUCTS[0].id,
          priceId: PRODUCTS[0].prices[0].id,
          quantity: 1
        }
      ]);
    }
  }, []);

  /* =========================
     Helpers
  ========================= */
  const toggleLanguage = () =>
    setLang(prev => (prev === 'ar' ? 'en' : 'ar'));

  const totalOrderPrice = useMemo(() => {
    return cart.reduce((sum, item) => {
      const p = PRODUCTS.find(x => x.id === item.productId);
      const price = p?.prices.find(pr => pr.id === item.priceId);
      return sum + (price ? price.price * item.quantity : 0);
    }, 0);
  }, [cart]);

  /* =========================
     AI Handler (FIXED)
  ========================= */
  const handleAiConsult = async () => {
    if (!aiMessage.trim()) return;

    setIsAiThinking(true);
    setAiResponse('');

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `
You are a professional Honey Expert for "Honey House".
User language: ${lang}.
Answer briefly and clearly.

Question:
${aiMessage}
          `
        })
      });

      const data = await res.json();

      if (data.reply) {
        setAiResponse(data.reply);
      } else {
        setAiResponse(lang === 'ar'
          ? 'لم يتم الحصول على رد واضح من الخبير.'
          : 'No clear response from AI.');
      }
    } catch (e) {
      setAiResponse(
        lang === 'ar'
          ? 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.'
          : 'Error connecting to AI.'
      );
    } finally {
      setIsAiThinking(false);
    }
  };

  /* =========================
     Order
  ========================= */
  const handleSendOrder = () => {
    if (!customer.name || !customer.phone || !customer.location) {
      alert(t.errorFields);
      return;
    }

    let summary = '';
    cart.forEach((item, i) => {
      const p = PRODUCTS.find(x => x.id === item.productId);
      const pr = p?.prices.find(x => x.id === item.priceId);
      if (p && pr) {
        summary += `${i + 1}. ${
          lang === 'ar' ? p.titleAr : p.titleEn
        } (${lang === 'ar' ? pr.sizeAr : pr.sizeEn}) x ${item.quantity}\n`;
      }
    });

    const msg = `
${t.whatsappOrderHeader}

${t.whatsappName} ${customer.name}
${t.whatsappPhone} ${customer.phone}
${t.whatsappLocation} ${customer.location}

${summary}
${t.whatsappTotal} ${totalOrderPrice} ${t.currency}
    `;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-[#FEFBF6] text-amber-950 font-primary">

      {/* Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur border-b border-amber-100 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <h1 className="text-2xl font-black">{t.companyName}</h1>

          <button
            onClick={toggleLanguage}
            className="ml-auto text-xs font-black border px-3 py-1 rounded-lg"
          >
            {lang === 'ar' ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      {/* AI SECTION (Smaller & Cleaner) */}
      <section className="max-w-5xl mx-auto mt-16 px-4">
        <div className="bg-amber-900 text-white rounded-3xl p-6 md:p-8 shadow-xl">
          <h2 className="text-2xl font-black mb-2">
            ✨ {t.aiAssistantTitle}
          </h2>
          <p className="opacity-80 text-sm mb-6">
            {t.aiAssistantDesc}
          </p>

          <div className="flex gap-2">
            <input
              value={aiMessage}
              onChange={e => setAiMessage(e.target.value)}
              placeholder={t.aiPlaceholder}
              className="flex-1 px-4 py-3 rounded-xl text-black outline-none text-sm"
            />
            <button
              onClick={handleAiConsult}
              disabled={isAiThinking}
              className="bg-amber-400 text-amber-950 px-6 rounded-xl font-black text-sm"
            >
              {isAiThinking
                ? (lang === 'ar' ? '...' : 'Thinking')
                : (lang === 'ar' ? 'اسأل' : 'Ask')}
            </button>
          </div>

          {aiResponse && (
            <div className="mt-4 bg-white/10 rounded-xl p-4 text-sm leading-relaxed">
              {aiResponse}
            </div>
          )}
        </div>
      </section>

      {/* ORDER */}
      <section className="max-w-4xl mx-auto mt-20 px-4">
        <h2 className="text-3xl font-black mb-8 text-center">
          {t.orderNow}
        </h2>

        <div className="grid gap-4 mb-6">
          <input
            placeholder={t.namePlaceholder}
            value={customer.name}
            onChange={e => setCustomer({ ...customer, name: e.target.value })}
            className="p-4 rounded-xl border"
          />
          <input
            placeholder={t.phonePlaceholder}
            value={customer.phone}
            onChange={e => setCustomer({ ...customer, phone: e.target.value })}
            className="p-4 rounded-xl border"
          />
          <input
            placeholder={t.locationPlaceholder}
            value={customer.location}
            onChange={e => setCustomer({ ...customer, location: e.target.value })}
            className="p-4 rounded-xl border"
          />
        </div>

        <button
          onClick={handleSendOrder}
          className="w-full bg-amber-500 text-white py-5 rounded-2xl font-black text-lg"
        >
          📲 {t.sendOrder}
        </button>
      </section>

      {/* Footer */}
      <footer className="mt-24 text-center text-xs opacity-60 pb-10">
        © Honey House – Premium Egyptian Honey
      </footer>
    </div>
  );
};

export default App;
