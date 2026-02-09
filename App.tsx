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
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
        } else {
          setReviews(MOCK_REVIEWS);
        }
      })
      .catch(() => setReviews(MOCK_REVIEWS));
  }, []);

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
      setAiResponse("Error connecting to AI.");
    } finally {
      setIsAiThinking(false);
    }
  };

  /* ================= Submit Review ================= */
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    });

    const saved = await res.json();
    setReviews((prev) => [saved, ...prev]);
    setShowReviewForm(false);
    setNewReview({ name: "", rating: 5, comment: "" });
  };

  return (
    <div className="min-h-screen bg-[#FEFBF6] text-slate-900">

      {/* ================= PROMO BANNER ================= */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-3 font-black animate-pulse">
        🚚 توصيل خلال <b>24h – 48h</b> | توصيل مجاني فوق <b>200 درهم</b>
      </div>

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 bg-white shadow z-50">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-xl font-black text-amber-900">
            {t.companyName}
          </h1>
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="px-4 py-2 bg-amber-100 rounded-xl font-black"
          >
            {lang === "ar" ? "EN" : "AR"}
          </button>
        </div>

        {/* MOBILE FRIENDLY NAV */}
        <nav className="flex gap-3 overflow-x-auto px-4 pb-3 text-sm font-black">
          <button className="px-4 py-2 bg-amber-500 text-white rounded-full">
            ✨ الخبير
          </button>
          <button
            onClick={() => setOpenProducts(!openProducts)}
            className="px-4 py-2 bg-amber-100 rounded-full"
          >
            🍯 المنتجات
          </button>
          <button
            onClick={() => setOpenReviews(!openReviews)}
            className="px-4 py-2 bg-amber-100 rounded-full"
          >
            ⭐ التقييمات
          </button>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            className="px-4 py-2 bg-green-500 text-white rounded-full"
          >
            📦 اطلب الآن
          </a>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-12">

        {/* ================= AI SECTION ================= */}
        <section className="bg-amber-900 text-white p-6 rounded-3xl">
          <h2 className="text-2xl font-black mb-4">✨ خبير العسل الذكي</h2>
          <div className="flex gap-3">
            <input
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              placeholder="اسأل عن العسل..."
              className="flex-1 p-4 rounded-xl text-black"
            />
            <button
              onClick={handleAiConsult}
              className="px-6 py-4 bg-amber-500 rounded-xl font-black"
            >
              {isAiThinking ? "..." : "اسأل"}
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
            className="w-full text-start text-2xl font-black mb-4"
          >
            🍯 المنتجات
          </button>

          {openProducts && (
            <div className="grid md:grid-cols-2 gap-6">
              {PRODUCTS.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-6 shadow"
                >
                  <img
                    src={p.image}
                    alt=""
                    className="h-40 mx-auto object-contain mb-4"
                  />
                  <h3 className="font-black text-lg mb-2">
                    {lang === "ar" ? p.titleAr : p.titleEn}
                  </h3>
                  <p className="text-sm opacity-70">
                    {lang === "ar"
                      ? p.descriptionAr
                      : p.descriptionEn}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= REVIEWS ACCORDION ================= */}
        <section>
          <button
            onClick={() => setOpenReviews(!openReviews)}
            className="w-full text-start text-2xl font-black mb-2"
          >
            ⭐ التقييمات ({reviews.length}) — متوسط {avgRating}
          </button>

          {openReviews && (
            <div className="space-y-4">

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl font-black"
              >
                ✍️ أضف تقييمك
              </button>

              {showReviewForm && (
                <form
                  onSubmit={submitReview}
                  className="bg-white p-4 rounded-xl space-y-3"
                >
                  <input
                    required
                    placeholder="الاسم"
                    value={newReview.name}
                    onChange={(e) =>
                      setNewReview({ ...newReview, name: e.target.value })
                    }
                    className="w-full p-3 border rounded"
                  />
                  <textarea
                    required
                    placeholder="رأيك"
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({
                        ...newReview,
                        comment: e.target.value,
                      })
                    }
                    className="w-full p-3 border rounded"
                  />
                  <button className="px-4 py-2 bg-green-500 text-white rounded">
                    إرسال
                  </button>
                </form>
              )}

              {reviews.map((r, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-xl shadow"
                >
                  <div className="font-black">
                    {r.name} ⭐ {r.rating}
                  </div>
                  <p className="opacity-70">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
