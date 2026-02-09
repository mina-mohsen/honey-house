import React, { useState, useEffect, useMemo } from "react";
import { Language, CartItem } from "./types";
import {
  PRODUCTS,
  TRANSLATIONS,
  WHATSAPP_NUMBER,
  INSTAGRAM_URL,
  FAQS,
  MOCK_REVIEWS,
  DELIVERY_INFO,
} from "./constants";

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>("ar");

  /* ================= Cart / Order ================= */
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: "",
    phone: "",
    location: "",
  });

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
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const t = useMemo(() => TRANSLATIONS[lang], [lang]);

  /* RTL / LTR */
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  /* Load reviews from server */
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

  /* Calculate total price */
  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      if (!product) return total;
      
      const price = product.prices.find(p => p.id === item.priceId);
      if (!price) return total;
      
      return total + (price.price * item.quantity);
    }, 0);
  }, [cartItems]);

  /* Calculate average rating */
  const avgRating = useMemo(() => {
    if (!reviews.length) return "0.0";
    return (
      reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length
    ).toFixed(1);
  }, [reviews]);

  /* ================= Cart Functions ================= */
  const addToCart = (productId: string, priceId: string) => {
    const existingItem = cartItems.find(
      item => item.productId === productId && item.priceId === priceId
    );

    if (existingItem) {
      setCartItems(prev =>
        prev.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: `${productId}_${priceId}_${Date.now()}`,
        productId,
        priceId,
        quantity: 1,
      };
      setCartItems(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  /* ================= Send Order via WhatsApp ================= */
  const sendOrderViaWhatsApp = () => {
    if (!orderForm.name || !orderForm.phone || !orderForm.location) {
      alert(lang === "ar" ? "الرجاء ملء جميع الحقول المطلوبة." : "Please fill all required fields.");
      return;
    }

    if (cartItems.length === 0) {
      alert(lang === "ar" ? "السلة فارغة. أضف منتجات أولاً." : "Cart is empty. Add products first.");
      return;
    }

    let message = `*${lang === "ar" ? "طلب جديد من موقع بيت العسل" : "New Order from Honey House"}*\\n\\n`;
    message += `*${t.whatsappName}* ${orderForm.name}\\n`;
    message += `*${t.whatsappPhone}* ${orderForm.phone}\\n`;
    message += `*${t.whatsappLocation}* ${orderForm.location}\\n\\n`;
    message += `*${lang === "ar" ? "المنتجات المطلوبة" : "Order Items"}:*\\n`;

    cartItems.forEach(item => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      if (product) {
        const price = product.prices.find(p => p.id === item.priceId);
        if (price) {
          message += `- ${lang === "ar" ? product.titleAr : product.titleEn} (${lang === "ar" ? price.sizeAr : price.sizeEn}) x${item.quantity}: ${price.price * item.quantity} ${t.currency}\\n`;
        }
      }
    });

    message += `\\n*${t.whatsappTotal}* ${totalPrice} ${t.currency}`;
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Clear cart after sending order
    clearCart();
    setShowOrderForm(false);
    setOrderForm({ name: "", phone: "", location: "" });
  };

  /* ================= AI Consultation ================= */
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newReview,
          lang: lang,
          date: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit review');
      }

      const saved = await res.json();
      setReviews((prev) => [saved, ...prev]);
      setReviewUpdateKey(prev => prev + 1);
      setShowReviewForm(false);
      setNewReview({ name: "", rating: 5, comment: "" });
      
      alert(lang === "ar" ? "تم إرسال تقييمك بنجاح! شكراً لك." : "Review submitted successfully! Thank you.");
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(lang === "ar" ? "حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى." : "Error submitting review. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFBF6] text-slate-900">

      {/* ================= PROMO BANNER ================= */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-3 font-black animate-pulse">
        🚚 {lang === "ar" ? "توصيل خلال" : "Delivery within"} <b>24h – 48h</b> | {lang === "ar" ? "توصيل مجاني فوق" : "Free delivery over"} <b>{DELIVERY_INFO.FREE_THRESHOLD} {t.currency}</b>
      </div>

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 bg-white shadow z-50">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-xl font-black text-amber-900">
            {t.companyName}
          </h1>
          <div className="flex items-center gap-3">
            {/* Cart Icon with Badge */}
            {cartItems.length > 0 && (
              <div className="relative">
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
            )}
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="px-4 py-2 bg-amber-100 rounded-xl font-black hover:bg-amber-200 transition-colors"
            >
              {lang === "ar" ? "EN" : "AR"}
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
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
          <button
            onClick={() => setShowOrderForm(!showOrderForm)}
            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            🛒 {lang === "ar" ? "الطلب" : "Order"} 
            {cartItems.length > 0 && (
              <span className="bg-white text-green-600 text-xs px-2 py-1 rounded-full">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* ================= ORDER FORM & CART ================= */}
        {(showOrderForm || cartItems.length > 0) && (
          <section className="bg-white rounded-2xl p-6 shadow-lg border border-amber-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-amber-900">
                🛒 {lang === "ar" ? "سلة الطلبات" : "Shopping Cart"}
              </h2>
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  {lang === "ar" ? "إفراغ السلة" : "Clear Cart"}
                </button>
              )}
            </div>

            {/* Cart Items */}
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">
                  {lang === "ar" ? "السلة فارغة" : "Your cart is empty"}
                </p>
                <p className="text-gray-400 mt-2">
                  {lang === "ar" ? "أضف منتجات من قسم المنتجات" : "Add products from the products section"}
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                  const product = PRODUCTS.find(p => p.id === item.productId);
                  const price = product?.prices.find(p => p.id === item.priceId);
                  
                  if (!product || !price) return null;

                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-bold text-amber-900">
                          {lang === "ar" ? product.titleAr : product.titleEn}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {lang === "ar" ? price.sizeAr : price.sizeEn} • {price.price} {t.currency}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="font-bold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {price.price * item.quantity} {t.currency}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Order Summary */}
            {cartItems.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold">{lang === "ar" ? "الإجمالي" : "Subtotal"}:</span>
                  <span className="font-bold text-lg">{totalPrice} {t.currency}</span>
                </div>
                
                {totalPrice >= DELIVERY_INFO.FREE_THRESHOLD ? (
                  <div className="text-green-600 bg-green-50 p-3 rounded-lg mb-4">
                    🎉 {lang === "ar" ? "تهانينا! التوصيل مجاني" : "Congratulations! Free delivery"}
                  </div>
                ) : (
                  <div className="text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
                    📦 {lang === "ar" ? "أضف" : "Add"} {DELIVERY_INFO.FREE_THRESHOLD - totalPrice} {t.currency} {lang === "ar" ? "أخرى للحصول على توصيل مجاني" : "more for free delivery"}
                  </div>
                )}
              </div>
            )}

            {/* Order Form */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-amber-900">
                📝 {lang === "ar" ? "معلومات الطلب" : "Order Information"}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={orderForm.name}
                    onChange={(e) => setOrderForm({...orderForm, name: e.target.value})}
                    placeholder={t.namePlaceholder}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                    placeholder={t.phonePlaceholder}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.locationLabel}
                </label>
                <textarea
                  value={orderForm.location}
                  onChange={(e) => setOrderForm({...orderForm, location: e.target.value})}
                  placeholder={t.locationPlaceholder}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={sendOrderViaWhatsApp}
                  disabled={cartItems.length === 0}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  📱 {t.sendOrder}
                </button>
                
                <button
                  onClick={() => setShowOrderForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                >
                  {lang === "ar" ? "إغلاق" : "Close"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ================= AI SECTION ================= */}
        <section className="bg-amber-900 text-white p-6 rounded-3xl shadow-lg">
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
            <span className="text-lg transform transition-transform">
              {openProducts ? "▴" : "▾"}
            </span>
          </button>

          {openProducts && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRODUCTS.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-amber-100"
                >
                  <img
                    src={product.image}
                    alt={lang === "ar" ? product.titleAr : product.titleEn}
                    className="h-48 w-full object-cover rounded-lg mb-4"
                  />
                  
                  <h3 className="font-black text-lg mb-2 text-amber-900">
                    {lang === "ar" ? product.titleAr : product.titleEn}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {lang === "ar" ? product.descriptionAr : product.descriptionEn}
                  </p>
                  
                  {product.benefitsAr && (
                    <div className="mb-4">
                      <h4 className="font-bold text-amber-800 mb-2">
                        {lang === "ar" ? "الفوائد:" : "Benefits:"}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(lang === "ar" ? product.benefitsAr : product.benefitsEn).map((benefit, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <h4 className="font-bold text-amber-800 mb-3">
                      {t.chooseSize}:
                    </h4>
                    <div className="space-y-3">
                      {product.prices.map((price) => (
                        <div
                          key={price.id}
                          className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                        >
                          <div>
                            <span className="font-bold">
                              {lang === "ar" ? price.sizeAr : price.sizeEn}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="font-bold text-green-600">
                              {price.price} {t.currency}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => addToCart(product.id, price.id)}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-bold"
                          >
                            {lang === "ar" ? "أضف للسلة" : "Add to Cart"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= REVIEWS SECTION ================= */}
        <section>
          <button
            onClick={() => setOpenReviews(!openReviews)}
            className="w-full text-start text-2xl font-black mb-2 flex justify-between items-center"
          >
            <span>
              ⭐ {t.reviewsTitle} ({reviews.length}) — {lang === "ar" ? "متوسط" : "Average"} {avgRating}
            </span>
            {isLoadingReviews && (
              <span className="text-sm font-normal animate-pulse">
                {lang === "ar" ? "جاري التحميل..." : "Loading..."}
              </span>
            )}
          </button>

          {openReviews && (
            <div className="space-y-6">
              {/* Add Review Button */}
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-black hover:opacity-90 transition-opacity shadow-md"
              >
                ✍️ {t.leaveReview}
              </button>

              {/* Review Form */}
              {showReviewForm && (
                <form
                  onSubmit={submitReview}
                  className="bg-white p-6 rounded-xl space-y-4 shadow-lg border border-amber-200"
                >
                  <div className="space-y-2">
                    <label className="font-bold text-amber-900">
                      {t.reviewNameLabel}
                    </label>
                    <input
                      required
                      placeholder={t.namePlaceholder}
                      value={newReview.name}
                      onChange={(e) =>
                        setNewReview({ ...newReview, name: e.target.value })
                      }
                      className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-amber-900">
                      {t.reviewRatingLabel}
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
                      {t.reviewCommentLabel}
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
                      {t.reviewSubmit}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(false);
                        setNewReview({ name: "", rating: 5, comment: "" });
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                      {t.reviewCancel}
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
                      {t.reviewLoading}
                    </p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-xl shadow border border-amber-200">
                    <p className="text-gray-500">
                      {t.reviewEmpty}
                    </p>
                  </div>
                ) : (
                  reviews.map((review, index) => (
                    <div
                      key={review.id || index}
                      className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow border border-amber-100"
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
                      <p className="text-gray-700 leading-relaxed">
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
        <section className="bg-white rounded-3xl p-6 shadow-lg border border-amber-200">
          <h2 className="text-2xl font-black mb-6 text-amber-900">
            {t.contactUs}
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 text-white p-4 rounded-xl text-center font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-3"
            >
              <span className="text-2xl">💬</span>
              <span>{t.chatWhatsApp}</span>
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl text-center font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
            >
              <span className="text-2xl">📸</span>
              <span>{t.followInstagram}</span>
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
                className={`px-4 py-2 rounded-lg ${lang === "ar" ? "bg-amber-500" : "bg-amber-800"} hover:bg-amber-600 transition-colors`}
              >
                {t.arabic}
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-4 py-2 rounded-lg ${lang === "en" ? "bg-amber-500" : "bg-amber-800"} hover:bg-amber-600 transition-colors`}
              >
                {t.english}
              </button>
            </div>
            <p className="text-sm opacity-60">
              © {new Date().getFullYear()} {t.companyName}. {t.copyright}.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
