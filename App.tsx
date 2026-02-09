import React, { useState, useEffect, useMemo } from "react";
import { Language, CartItem } from "./types";
import {
  PRODUCTS,
  TRANSLATIONS,
  WHATSAPP_NUMBER,
  INSTAGRAM_URL,
  FAQS,
  MOCK_REVIEWS,
} from "./constants";

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>("ar");

  /* ================= AI ================= */
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  /* ================= Reviews ================= */
  const [reviews, setReviews] = useState<any[]>([]);
  const [openReviews, setOpenReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewUpdateKey, setReviewUpdateKey] = useState(0);
  const [newReview, setNewReview] = useState({
    name: "",
    rating: 5,
    comment: "",
  });

  /* ================= Products ================= */
  const [openProducts, setOpenProducts] = useState(false);

  const t = useMemo(() => TRANSLATIONS[lang], [lang]);

  /* RTL / LTR */
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  /* Load reviews from server (fallback = 6 existing reviews) */
  useEffect(() => {
    const loadReviews = async () => {
      setIsLoadingReviews(true);
      try {
        const response = await fetch("/api/reviews");
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
        } else {
          setReviews(MOCK_REVIEWS);
        }
      } catch (error) {
        console.error("Failed to load reviews:", error);
        setReviews(MOCK_REVIEWS);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    loadReviews();
  }, [reviewUpdateKey]);

  /* Periodic refresh for reviews when section is open */
  useEffect(() => {
    if (!openReviews) return;
    
    const interval = setInterval(() => {
      setReviewUpdateKey(prev => prev + 1);
    }, 30000); // Refresh every 30 seconds when reviews are open
    
    return () => clearInterval(interval);
  }, [openReviews]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return "0.0";
    return (
      reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length
    ).toFixed(1);
  }, [reviews]);

  /* ================= AI ================= */
  const handleAiConsult = async () => {
    if (!aiMessage.trim()) return;
    setIsAiThinking(true);
    setAiResponse("");

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `You are a professional honey expert.
Explain in detail (6–10 sentences).
User language: ${lang}.
Question: ${aiMessage}`,
        }),
      });

      const data = await res.json();
      setAiResponse(data.reply || "");
    } catch {
      setAiResponse(lang === "ar" ? "خطأ في الاتصال بالذكاء الاصطناعي." : "Error connecting to AI.");
    } finally {
      setIsAiThinking(false);
    }
  };

  /* ================= Submit Review ================= */
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newReview.name.trim() || !newReview.comment.trim()) {
      alert(lang === "ar" ? "الرجاء ملء جميع الحقول المطلوبة." : "Please fill all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newReview,
          lang: lang,
          date: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit review");
      }

      const saved = await res.json();
      
      // Add the new review to the beginning of the list
      setReviews((prev) => [saved, ...prev]);
      
      // Trigger a reload of reviews to get fresh data from server
      setReviewUpdateKey(prev => prev + 1);
      
      // Reset form and close
      setShowReviewForm(false);
      setNewReview({ name: "", rating: 5, comment: "" });
      
      // Show success message
      alert(lang === "ar" ? "تم إرسال تقييمك بنجاح! شكراً لك." : "Review submitted successfully! Thank you.");
      
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(lang === "ar" ? "حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى." : "Error submitting review. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFBF6] text-slate-900">

      {/* ================= PROMO BANNER ================= */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-3 font-black animate-pulse">
        🚚 {lang === "ar" ? "توصيل خلال" : "Delivery within"} <b>24h – 48h</b> | {lang === "ar" ? "توصيل مجاني فوق" : "Free delivery over"} <b>200 {lang === "ar" ? "درهم" : "AED"}</b>
      </div>

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 bg-white shadow z-50">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-xl font-black text-amber-900">
            {t.companyName}
          </h1>
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="px-4 py-2 bg-amber-100 rounded-xl font-black hover:bg-amber-200 transition-colors"
          >
            {lang === "ar" ? "EN" : "AR"}
          </button>
        </div>

        {/* MOBILE FRIENDLY NAV */}
        <nav className="flex gap-3 overflow-x-auto px-4 pb-3 text-sm font-black">
          <button className="px-4 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors">
            ✨ {lang === "ar" ? "الخبير" : "AI Expert"}
          </button>
          <button
            onClick={() => setOpenProducts(!openProducts)}
            className="px-4 py-2 bg-amber-100 rounded-full hover:bg-amber-200 transition-colors"
          >
            🍯 {lang === "ar" ? "المنتجات" : "Products"}
          </button>
          <button
            onClick={() => setOpenReviews(!openReviews)}
            className="px-4 py-2 bg-amber-100 rounded-full hover:bg-amber-200 transition-colors flex items-center gap-2"
          >
            ⭐ {lang === "ar" ? "التقييمات" : "Reviews"}
            {reviews.length > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                {reviews.length}
              </span>
            )}
          </button>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            📦 {lang === "ar" ? "اطلب الآن" : "Order Now"}
          </a>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-12">

        {/* ================= AI SECTION ================= */}
        <section className="bg-amber-900 text-white p-6 rounded-3xl honey-shadow">
          <h2 className="text-2xl font-black mb-4">✨ {lang === "ar" ? "خبير العسل الذكي" : "AI Honey Expert"}</h2>
          <div className="flex gap-3">
            <input
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              placeholder={lang === "ar" ? "اسأل عن العسل..." : "Ask about honey..."}
              className="flex-1 p-4 rounded-xl text-black focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <button
              onClick={handleAiConsult}
              disabled={isAiThinking}
              className="px-6 py-4 bg-amber-500 rounded-xl font-black hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {isAiThinking ? (lang === "ar" ? "جاري التفكير..." : "Thinking...") : (lang === "ar" ? "اسأل" : "Ask")}
            </button>
          </div>
          {aiResponse && (
            <div className="mt-4 bg-white/10 p-4 rounded-xl leading-relaxed">
              {aiResponse}
            </div>
          )}
        </section>

        {/* ================= PRODUCTS ACCORDION ================= */}
        <section>
          <button
            onClick={() => setOpenProducts(!openProducts)}
            className="w-full text-start text-2xl font-black mb-4 flex justify-between items-center"
          >
            <span>🍯 {lang === "ar" ? "المنتجات" : "Products"}</span>
            <span className="text-lg">▾</span>
          </button>

          {openProducts && (
            <div className="grid md:grid-cols-2 gap-6">
              {PRODUCTS.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-6 honey-shadow hover:shadow-lg transition-shadow"
                >
                  <img
                    src={p.image}
                    alt={lang === "ar" ? p.titleAr : p.titleEn}
                    className="h-40 mx-auto object-contain mb-4"
                  />
                  <h3 className="font-black text-lg mb-2 text-amber-900">
                    {lang === "ar" ? p.titleAr : p.titleEn}
                  </h3>
                  <p className="text-sm opacity-70 mb-4">
                    {lang === "ar"
                      ? p.descriptionAr
                      : p.descriptionEn}
                  </p>
                  {p.prices && p.prices.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-amber-100">
                      <h4 className="font-bold text-amber-800 mb-2">
                        {lang === "ar" ? "الأسعار:" : "Prices:"}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {p.prices.map((price) => (
                          <div
                            key={price.id}
                            className="bg-amber-50 px-3 py-2 rounded-lg"
                          >
                            <span className="font-bold">{price.sizeAr}</span>
                            <span className="mx-2">-</span>
                            <span className="font-bold text-green-600">{price.price} {lang === "ar" ? "درهم" : "AED"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= REVIEWS ACCORDION ================= */}
        <section>
          <button
            onClick={() => setOpenReviews(!openReviews)}
            className="w-full text-start text-2xl font-black mb-2 flex justify-between items-center"
          >
            <span>
              ⭐ {lang === "ar" ? "آراء العملاء" : "Customer Reviews"} ({reviews.length}) — {lang === "ar" ? "متوسط" : "Average"} {avgRating}
            </span>
            {isLoadingReviews && <span className="text-sm font-normal animate-pulse">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</span>}
          </button>

          {openReviews && (
            <div className="space-y-6">
              {/* Add Review Button */}
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-black hover:opacity-90 transition-opacity shadow-md"
              >
                ✍️ {lang === "ar" ? "أضف تقييمك" : "Add Your Review"}
              </button>

              {/* Review Form */}
              {showReviewForm && (
                <form
                  onSubmit={submitReview}
                  className="bg-white p-6 rounded-xl space-y-4 honey-shadow"
                >
                  <div className="space-y-2">
                    <label className="font-bold text-amber-900">
                      {lang === "ar" ? "اسمك:" : "Your Name:"}
                    </label>
                    <input
                      required
                      placeholder={lang === "ar" ? "اكتب اسمك هنا..." : "Enter your name..."}
                      value={newReview.name}
                      onChange={(e) =>
                        setNewReview({ ...newReview, name: e.target.value })
                      }
                      className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-amber-900">
                      {lang === "ar" ? "التقييم:" : "Rating:"}
                    </label>
                    <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className={`text-3xl transition-transform hover:scale-110 ${star <= newReview.rating ? 'text-amber-500' : 'text-gray-300'}`}
                        >
                          ⭐
                        </button>
                      ))}
                      <span className="font-bold text-amber-700 ml-4 text-lg">
                        {newReview.rating}/5
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-amber-900">
                      {lang === "ar" ? "تعليقك:" : "Your Comment:"}
                    </label>
                    <textarea
                      required
                      placeholder={lang === "ar" ? "اكتب رأيك هنا..." : "Write your review here..."}
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview({
                          ...newReview,
                          comment: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[120px]"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors flex-1"
                    >
                      {lang === "ar" ? "إرسال التقييم" : "Submit Review"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(false);
                        setNewReview({ name: "", rating: 5, comment: "" });
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                      {lang === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {isLoadingReviews ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="mt-4 text-amber-700">
                      {lang === "ar" ? "جاري تحميل التقييمات..." : "Loading reviews..."}
                    </p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-xl honey-shadow">
                    <p className="text-gray-500">
                      {lang === "ar" ? "لا توجد تقييمات بعد. كن أول من يقيّم!" : "No reviews yet. Be the first to review!"}
                    </p>
                  </div>
                ) : (
                  reviews.map((review, index) => (
                    <div
                      key={review.id || index}
                      className="bg-white p-6 rounded-xl honey-shadow hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-black text-lg text-amber-900">
                            {review.name || (review.ar?.name || review.en?.name)}
                          </div>
                          {review.date && (
                            <div className="text-xs text-gray-500">
                              {new Date(review.date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                          <span className="text-amber-700 font-bold text-lg">
                            {review.rating || 5}
                          </span>
                          <span className="text-xl text-amber-500">⭐</span>
                        </div>
                      </div>
                      <p className="opacity-80 leading-relaxed text-gray-700">
                        {review.comment || 
                          (lang === "ar" ? review.ar?.comment : review.en?.comment) ||
                          (review.ar?.comment || review.en?.comment)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        {/* ================= SOCIAL & CONTACT ================= */}
        <section className="bg-white rounded-3xl p-6 honey-shadow">
          <h2 className="text-2xl font-black mb-6 text-amber-900">
            {lang === "ar" ? "تواصل معنا" : "Contact Us"}
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 text-white p-4 rounded-xl text-center font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-3"
            >
              <span className="text-2xl">💬</span>
              <span>{lang === "ar" ? "تواصل عبر واتساب" : "Chat on WhatsApp"}</span>
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl text-center font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
            >
              <span className="text-2xl">📸</span>
              <span>{lang === "ar" ? "تابعنا على انستجرام" : "Follow on Instagram"}</span>
            </a>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-amber-900 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-black mb-4">🍯 {t.companyName}</h3>
            <p className="opacity-80 mb-6">
              {lang === "ar" 
                ? "عسل طبيعي 100% من المنحل مباشرة إلى منزلك في الإمارات"
                : "100% Natural honey delivered directly from the apiary to your home in UAE"}
            </p>
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setLang("ar")}
                className={`px-4 py-2 rounded-lg ${lang === "ar" ? "bg-amber-500" : "bg-amber-800"}`}
              >
                العربية
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-4 py-2 rounded-lg ${lang === "en" ? "bg-amber-500" : "bg-amber-800"}`}
              >
                English
              </button>
            </div>
            <p className="text-sm opacity-60">
              © {new Date().getFullYear()} {t.companyName}. {lang === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
