import React, { useState, useEffect, useMemo, useRef } from "react";
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
  
  /* ================= Admin Authentication ================= */
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminMessage, setAdminMessage] = useState("");

  /* ================= Cart / Order ================= */
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: "",
    phone: "",
    location: "",
  });
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  
  // Refs for form validation focus
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLTextAreaElement>(null);

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
  
  /* ================= Review Management ================= */
  const [editingReview, setEditingReview] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  /* ================= Products ================= */
  const [openProducts, setOpenProducts] = useState(true); // Products open by default

  const t = useMemo(() => TRANSLATIONS[lang], [lang]);

  /* RTL / LTR */
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  /* Load reviews from localStorage on initial load */
  useEffect(() => {
    const loadReviews = () => {
      setIsLoadingReviews(true);
      try {
        const savedReviews = localStorage.getItem('honeyhouse_reviews');
        if (savedReviews) {
          const parsedReviews = JSON.parse(savedReviews);
          if (parsedReviews.length > 0) {
            setReviews(parsedReviews);
          } else {
            // Use mock reviews if localStorage is empty
            setReviews(MOCK_REVIEWS);
            localStorage.setItem('honeyhouse_reviews', JSON.stringify(MOCK_REVIEWS));
          }
        } else {
          // First time user, use mock reviews
          setReviews(MOCK_REVIEWS);
          localStorage.setItem('honeyhouse_reviews', JSON.stringify(MOCK_REVIEWS));
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

  /* Save reviews to localStorage whenever reviews change */
  useEffect(() => {
    if (reviews.length > 0) {
      try {
        localStorage.setItem('honeyhouse_reviews', JSON.stringify(reviews));
      } catch (error) {
        console.error("Failed to save reviews:", error);
      }
    }
  }, [reviews]);

  /* Show cart notification */
  useEffect(() => {
    if (showCartNotification) {
      const timer = setTimeout(() => {
        setShowCartNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCartNotification]);

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
    const approvedReviews = reviews.filter(r => r.approved !== false);
    if (!approvedReviews.length) return "0.0";
    return (
      approvedReviews.reduce((a, r) => a + (r.rating || 0), 0) / approvedReviews.length
    ).toFixed(1);
  }, [reviews]);

  /* ================= Admin Functions ================= */
  const handleAdminLogin = () => {
    // Default admin password is "honeyadmin123"
    if (adminPassword === "honeyadmin123") {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword("");
      setAdminMessage(lang === "ar" ? "تم تسجيل الدخول بنجاح كمدير" : "Logged in successfully as admin");
      setTimeout(() => setAdminMessage(""), 3000);
    } else {
      setAdminMessage(lang === "ar" ? "كلمة المرور غير صحيحة" : "Incorrect password");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminMessage(lang === "ar" ? "تم تسجيل الخروج" : "Logged out successfully");
    setTimeout(() => setAdminMessage(""), 3000);
  };

  /* ================= Review Management Functions ================= */
  const startEditReview = (review: any) => {
    setEditingReview({...review});
    setShowEditForm(true);
    setShowReviewForm(false);
  };

  const saveEditReview = () => {
    if (!editingReview.name.trim() || !editingReview.comment.trim()) {
      alert(lang === "ar" ? "الرجاء ملء جميع الحقول المطلوبة." : "Please fill all required fields.");
      return;
    }

    setReviews(prev => 
      prev.map(review => 
        review.id === editingReview.id 
          ? { 
              ...editingReview, 
              name: editingReview.name.trim(),
              comment: editingReview.comment.trim(),
              updatedAt: new Date().toISOString()
            } 
          : review
      )
    );

    setShowEditForm(false);
    setEditingReview(null);
    setAdminMessage(lang === "ar" ? "تم تعديل التقييم بنجاح" : "Review updated successfully");
    setTimeout(() => setAdminMessage(""), 3000);
  };

  const deleteReview = (reviewId: string) => {
    if (window.confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا التقييم؟" : "Are you sure you want to delete this review?")) {
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      setAdminMessage(lang === "ar" ? "تم حذف التقييم بنجاح" : "Review deleted successfully");
      setTimeout(() => setAdminMessage(""), 3000);
    }
  };

  const approveReview = (reviewId: string) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, approved: true, approvedAt: new Date().toISOString() } 
          : review
      )
    );
    setAdminMessage(lang === "ar" ? "تم تفعيل التقييم" : "Review approved");
    setTimeout(() => setAdminMessage(""), 3000);
  };

  const unapproveReview = (reviewId: string) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, approved: false } 
          : review
      )
    );
    setAdminMessage(lang === "ar" ? "تم إلغاء تفعيل التقييم" : "Review unapproved");
    setTimeout(() => setAdminMessage(""), 3000);
  };

  /* ================= Cart Functions ================= */
  const addToCart = (productId: string, priceId: string, productName: string, sizeName: string) => {
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
      setNotificationMessage(`${lang === "ar" ? "تم زيادة الكمية لـ" : "Increased quantity for"} ${productName} (${sizeName})`);
    } else {
      const newItem: CartItem = {
        id: `${productId}_${priceId}_${Date.now()}`,
        productId,
        priceId,
        quantity: 1,
      };
      setCartItems(prev => [...prev, newItem]);
      setNotificationMessage(`${lang === "ar" ? "تم إضافة" : "Added"} ${productName} (${sizeName}) ${lang === "ar" ? "إلى السلة" : "to cart"}`);
    }
    
    setShowCartNotification(true);
    setShowOrderForm(true);
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
    if (!orderForm.name.trim()) {
      alert(lang === "ar" ? "الرجاء إدخال اسم العميل" : "Please enter customer name");
      nameInputRef.current?.focus();
      return;
    }
    
    if (!orderForm.phone.trim()) {
      alert(lang === "ar" ? "الرجاء إدخال رقم الهاتف" : "Please enter phone number");
      phoneInputRef.current?.focus();
      return;
    }
    
    if (!orderForm.location.trim()) {
      alert(lang === "ar" ? "الرجاء إدخال عنوان التوصيل" : "Please enter delivery address");
      locationInputRef.current?.focus();
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
    
    clearCart();
    setShowOrderForm(false);
    setOrderForm({ name: "", phone: "", location: "" });
    
    alert(lang === "ar" ? "تم إرسال الطلب بنجاح! سنتواصل معك قريباً." : "Order sent successfully! We'll contact you soon.");
  };

  /* ================= AI Consultation ================= */
  const handleAiConsult = async () => {
    if (!aiMessage.trim()) {
      alert(lang === "ar" ? "الرجاء كتابة سؤال" : "Please enter a question");
      return;
    }
    
    setIsAiThinking(true);
    setAiResponse("");

    try {
      setTimeout(() => {
        setAiResponse(lang === "ar" 
          ? "عسلنا الطبيعي يتميز بالنقاء والجودة العالية. يأتي مباشرة من المناحل المصرية بدون أي إضافات. غني بمضادات الأكسدة والأنزيمات المفيدة للصحة. مثالي لتقوية المناعة وتحسين الهضم. يمكن استخدامه كمحلي طبيعي بديل للسكر. ينصح بتخزينه في درجة حرارة الغرفة بعيداً عن الشمس."
          : "Our natural honey is characterized by purity and high quality. It comes directly from Egyptian apiaries without any additives. Rich in antioxidants and enzymes beneficial for health. Ideal for strengthening immunity and improving digestion. Can be used as a natural sweetener alternative to sugar. Recommended to store at room temperature away from sunlight."
        );
        setIsAiThinking(false);
      }, 1500);
    } catch {
      setAiResponse(lang === "ar" ? "خطأ في الاتصال بالذكاء الاصطناعي." : "Error connecting to AI.");
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
      const newReviewWithId = {
        id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newReview.name.trim(),
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        lang: lang,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        approved: true, // Auto-approve reviews
      };

      // Add to reviews array
      const updatedReviews = [newReviewWithId, ...reviews];
      setReviews(updatedReviews);
      
      // Save to localStorage immediately
      localStorage.setItem('honeyhouse_reviews', JSON.stringify(updatedReviews));
      
      // Reset form
      setShowReviewForm(false);
      setNewReview({ name: "", rating: 5, comment: "" });

      // Show success message
      alert(lang === "ar" ? "تم إرسال تقييمك بنجاح! شكراً لك." : "Review submitted successfully! Thank you.");
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(lang === "ar" ? "حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى." : "Error submitting review. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white text-slate-900 font-cairo">
      
      {/* ================= ADMIN MESSAGE ================= */}
      {adminMessage && (
        <div className="fixed top-20 right-4 left-4 md:left-auto md:right-4 z-50 animate-slide-in">
          <div className="bg-blue-500 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md mx-auto">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="font-bold">{adminMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= CART NOTIFICATION TOAST ================= */}
      {showCartNotification && (
        <div className="fixed top-20 right-4 left-4 md:left-auto md:right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md mx-auto">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold">{notificationMessage}</p>
              <p className="text-sm opacity-90">
                {lang === "ar" ? "تمت الإضافة إلى سلة الطلبات" : "Added to shopping cart"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADMIN LOGIN MODAL ================= */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-black text-amber-900 mb-4">
              {lang === "ar" ? "تسجيل الدخول كمدير" : "Admin Login"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === "ar" ? "كلمة المرور:" : "Password:"}
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder={lang === "ar" ? "أدخل كلمة المرور" : "Enter password"}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
              </div>
              <div className="text-xs text-gray-500 mb-4">
                {lang === "ar" ? "كلمة المرور الافتراضية: honeyadmin123" : "Default password: honeyadmin123"}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAdminLogin}
                  className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600"
                >
                  {lang === "ar" ? "تسجيل الدخول" : "Login"}
                </button>
                <button
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword("");
                  }}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT REVIEW MODAL ================= */}
      {showEditForm && editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-amber-900 mb-4">
              {lang === "ar" ? "تعديل التقييم" : "Edit Review"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === "ar" ? "الاسم:" : "Name:"}
                </label>
                <input
                  type="text"
                  value={editingReview.name}
                  onChange={(e) => setEditingReview({...editingReview, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === "ar" ? "التقييم:" : "Rating:"}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setEditingReview({...editingReview, rating: star})}
                      className={`text-3xl ${star <= editingReview.rating ? 'text-amber-500' : 'text-gray-300'}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === "ar" ? "التعليق:" : "Comment:"}
                </label>
                <textarea
                  value={editingReview.comment}
                  onChange={(e) => setEditingReview({...editingReview, comment: e.target.value})}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={saveEditReview}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
                >
                  {lang === "ar" ? "حفظ التعديلات" : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingReview(null);
                  }}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PROMO BANNER ================= */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-3 font-black text-sm md:text-base">
        <div className="flex items-center justify-center gap-2">
          <span>🚚</span>
          <span>{lang === "ar" ? "توصيل خلال" : "Delivery within"} <b>24h – 48h</b></span>
          <span className="hidden sm:inline"> | </span>
          <span className="block sm:inline">{lang === "ar" ? "توصيل مجاني فوق" : "Free delivery over"} <b>{DELIVERY_INFO.FREE_THRESHOLD} {t.currency}</b></span>
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-md z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
{/* LOGO */}
<div className="flex items-center gap-2">
  <img 
    src="https://imgur.com/tpBWWTy.jpeg" 
    alt="بيت العسل Honey House"
    className="w-12 h-12 object-contain"
  />
  <div className="flex flex-col">
    <h1 className="text-xl md:text-2xl font-black text-amber-900 leading-tight">
      بيت العسل
    </h1>
    <p className="text-xs text-amber-700 font-bold hidden md:block">
      Honey House
    </p>
  </div>
</div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="text-white font-black text-lg md:text-xl text-center leading-tight">
                  <div className="text-sm">🍯</div>
                  <div className="text-[10px] md:text-xs">بيت العسل</div>
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-black text-amber-900 leading-tight">
                  بيت العسل
                </h1>
                <p className="text-xs text-amber-700 font-bold hidden md:block">
                  Honey House
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Admin Button */}
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                    👑 {lang === "ar" ? "مدير" : "Admin"}
                  </span>
                  <button
                    onClick={handleAdminLogout}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 text-sm"
                  >
                    {lang === "ar" ? "خروج" : "Logout"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 text-sm hidden sm:block"
                  title={lang === "ar" ? "تسجيل دخول المدير" : "Admin Login"}
                >
                  👑
                </button>
              )}
              
              {/* Cart Button */}
              <button
                onClick={() => setShowOrderForm(!showOrderForm)}
                className="relative p-2 bg-amber-100 rounded-full hover:bg-amber-200 transition-colors"
              >
                <span className="text-xl">🛒</span>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              
              {/* Language Button */}
              <button
                onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                className="px-3 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors text-sm"
              >
                {lang === "ar" ? "EN" : "العربية"}
              </button>
            </div>
          </div>

          {/* MOBILE NAVIGATION */}
          <nav className="flex overflow-x-auto gap-2 mt-3 pb-2 no-scrollbar">
            <button
              onClick={() => {
                setOpenProducts(!openProducts);
                setOpenReviews(false);
              }}
              className={`px-4 py-2 rounded-full font-bold whitespace-nowrap flex items-center gap-2 ${openProducts ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-900'}`}
            >
              <span>🍯</span>
              <span className="text-sm">{lang === "ar" ? "المنتجات" : "Products"}</span>
            </button>
            
            <button
              onClick={() => {
                setOpenReviews(!openReviews);
                setOpenProducts(false);
              }}
              className={`px-4 py-2 rounded-full font-bold whitespace-nowrap flex items-center gap-2 ${openReviews ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-900'}`}
            >
              <span>⭐</span>
              <span className="text-sm">{lang === "ar" ? "التقييمات" : "Reviews"}</span>
              {reviews.length > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ${openReviews ? 'bg-white text-amber-500' : 'bg-amber-500 text-white'}`}>
                  {reviews.filter(r => r.approved !== false).length}
                </span>
              )}
            </button>
            
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-500 text-white rounded-full font-bold whitespace-nowrap flex items-center gap-2 hover:bg-green-600"
            >
              <span>📱</span>
              <span className="text-sm">{lang === "ar" ? "واتساب" : "WhatsApp"}</span>
            </a>
            
            {/* Mobile Admin Login */}
            {!isAdmin && (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-bold whitespace-nowrap flex items-center gap-2"
                title={lang === "ar" ? "تسجيل دخول المدير" : "Admin Login"}
              >
                <span>👑</span>
                <span className="text-sm">{lang === "ar" ? "مدير" : "Admin"}</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        
        {/* ================= ORDER FORM SECTION ================= */}
        {(showOrderForm || cartItems.length > 0) && (
          <section className="animate-slide-in">
            <div className="bg-white rounded-2xl shadow-xl border border-amber-200 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black flex items-center gap-2">
                    🛒 {lang === "ar" ? "سلة الطلبات" : "Shopping Cart"}
                  </h2>
                  <div className="flex items-center gap-2">
                    {cartItems.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30 text-sm"
                      >
                        {lang === "ar" ? "إفراغ السلة" : "Clear All"}
                      </button>
                    )}
                    <button
                      onClick={() => setShowOrderForm(false)}
                      className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              <div className="p-4 max-h-96 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">🛒</div>
                    <p className="text-gray-500 text-lg font-bold">
                      {lang === "ar" ? "سلة التسوق فارغة" : "Your cart is empty"}
                    </p>
                    <p className="text-gray-400 mt-2">
                      {lang === "ar" ? "أضف منتجات من قسم المنتجات" : "Add products from the products section"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => {
                      const product = PRODUCTS.find(p => p.id === item.productId);
                      const price = product?.prices.find(p => p.id === item.priceId);
                      
                      if (!product || !price) return null;

                      return (
                        <div key={item.id} className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-bold text-amber-900 text-sm md:text-base">
                                {lang === "ar" ? product.titleAr : product.titleEn}
                              </h3>
                              <p className="text-xs text-gray-600">
                                {lang === "ar" ? price.sizeAr : price.sizeEn} • {price.price} {t.currency}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                >
                                  −
                                </button>
                                <span className="font-bold w-6 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                >
                                  +
                                </button>
                              </div>
                              
                              <div className="text-right min-w-20">
                                <p className="font-bold text-green-600">
                                  {price.price * item.quantity} {t.currency}
                                </p>
                              </div>
                              
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              {cartItems.length > 0 && (
                <div className="border-t border-amber-100 p-4 bg-amber-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-amber-900">{lang === "ar" ? "الإجمالي" : "Subtotal"}:</span>
                    <span className="font-bold text-xl text-green-600">{totalPrice} {t.currency}</span>
                  </div>
                  
                  {totalPrice >= DELIVERY_INFO.FREE_THRESHOLD ? (
                    <div className="flex items-center gap-2 p-3 bg-green-100 text-green-800 rounded-lg mb-4">
                      <span className="text-xl">🎉</span>
                      <span className="font-bold">{lang === "ar" ? "تهانينا! التوصيل مجاني" : "Congratulations! Free delivery"}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-amber-100 text-amber-800 rounded-lg mb-4">
                      <span className="text-xl">📦</span>
                      <span className="text-sm">
                        {lang === "ar" ? "أضف" : "Add"} <span className="font-bold">{DELIVERY_INFO.FREE_THRESHOLD - totalPrice} {t.currency}</span> {lang === "ar" ? "أخرى للحصول على توصيل مجاني" : "more for free delivery"}
                      </span>
                    </div>
                  )}

                  {/* Order Form */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-amber-900 flex items-center gap-2">
                      <span>📝</span>
                      {lang === "ar" ? "معلومات الطلب" : "Order Information"}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.nameLabel} *
                        </label>
                        <input
                          ref={nameInputRef}
                          type="text"
                          value={orderForm.name}
                          onChange={(e) => setOrderForm({...orderForm, name: e.target.value})}
                          placeholder={t.namePlaceholder}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.phoneLabel} *
                        </label>
                        <input
                          ref={phoneInputRef}
                          type="tel"
                          value={orderForm.phone}
                          onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                          placeholder={t.phonePlaceholder}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.locationLabel} *
                      </label>
                      <textarea
                        ref={locationInputRef}
                        value={orderForm.location}
                        onChange={(e) => setOrderForm({...orderForm, location: e.target.value})}
                        placeholder={t.locationPlaceholder}
                        rows={2}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={sendOrderViaWhatsApp}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <span className="text-xl">📱</span>
                        <span>{t.sendOrder}</span>
                      </button>
                      
                      <button
                        onClick={() => setShowOrderForm(false)}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                      >
                        {lang === "ar" ? "إغلاق" : "Close"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ================= AI SECTION ================= */}
        <section className="bg-gradient-to-r from-amber-700 to-amber-900 text-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-5 md:p-6">
            <h2 className="text-xl md:text-2xl font-black mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              {lang === "ar" ? "خبير العسل الذكي" : "AI Honey Expert"}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder={lang === "ar" ? "اسأل عن العسل، الفوائد، التخزين..." : "Ask about honey, benefits, storage..."}
                className="flex-1 p-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm md:text-base"
                onKeyPress={(e) => e.key === 'Enter' && handleAiConsult()}
              />
              <button
                onClick={handleAiConsult}
                disabled={isAiThinking}
                className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAiThinking ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{lang === "ar" ? "جاري التفكير..." : "Thinking..."}</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">🤔</span>
                    <span>{lang === "ar" ? "اسأل الآن" : "Ask Now"}</span>
                  </>
                )}
              </button>
            </div>
            {aiResponse && (
              <div className="mt-4 bg-white/10 p-4 rounded-xl leading-relaxed text-sm md:text-base">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <p>{aiResponse}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= PRODUCTS SECTION (ALWAYS OPEN) ================= */}
        <section className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
          <button
            onClick={() => setOpenProducts(!openProducts)}
            className="w-full text-start p-5 md:p-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-black text-amber-900 flex items-center gap-2">
                <span className="text-2xl">🍯</span>
                {lang === "ar" ? "منتجاتنا المميزة" : "Our Premium Products"}
              </h2>
              <span className={`text-amber-500 text-xl transition-transform duration-300 ${openProducts ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </div>
          </button>

          {openProducts && (
            <div className="px-5 md:px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {PRODUCTS.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gradient-to-b from-white to-amber-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-amber-100 overflow-hidden"
                  >
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={lang === "ar" ? product.titleAr : product.titleEn}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://imgur.com/vIdADYw.jpeg";
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        🏷️ {lang === "ar" ? "أفضل بيع" : "Best Seller"}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-black text-lg mb-2 text-amber-900 line-clamp-1">
                        {lang === "ar" ? product.titleAr : product.titleEn}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {lang === "ar" ? product.descriptionAr : product.descriptionEn}
                      </p>
                      
                      <div className="mb-4">
                        <h4 className="font-bold text-amber-800 text-sm mb-2">
                          {lang === "ar" ? "الفوائد:" : "Benefits:"}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(lang === "ar" ? product.benefitsAr : product.benefitsEn).slice(0, 2).map((benefit, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-amber-800 text-sm mb-2">
                          {t.chooseSize}:
                        </h4>
                        <div className="space-y-2">
                          {product.prices.map((price) => (
                            <div
                              key={price.id}
                              className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                            >
                              <div>
                                <span className="font-bold text-sm">
                                  {lang === "ar" ? price.sizeAr : price.sizeEn}
                                </span>
                                <span className="mx-2 text-gray-400">•</span>
                                <span className="font-bold text-green-600">
                                  {price.price} {t.currency}
                                </span>
                              </div>
                              
                              <button
                                onClick={() => addToCart(
                                  product.id, 
                                  price.id, 
                                  lang === "ar" ? product.titleAr : product.titleEn,
                                  lang === "ar" ? price.sizeAr : price.sizeEn
                                )}
                                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-bold text-sm flex items-center gap-2"
                              >
                                <span>🛒</span>
                                <span>{lang === "ar" ? "أضف" : "Add"}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ================= REVIEWS SECTION ================= */}
        <section className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
          <button
            onClick={() => setOpenReviews(!openReviews)}
            className="w-full text-start p-5 md:p-6"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="text-2xl">⭐</span>
                  {reviews.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {reviews.filter(r => r.approved !== false).length}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-amber-900">
                    {t.reviewsTitle}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {lang === "ar" ? "متوسط التقييم" : "Average rating"}: <span className="font-bold text-amber-600">{avgRating}/5</span>
                    {isAdmin && (
                      <span className="mr-2 ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {reviews.filter(r => r.approved !== false).length}/{reviews.length} {lang === "ar" ? "مفعل" : "approved"}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <span className={`text-amber-500 text-xl transition-transform duration-300 ${openReviews ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </div>
          </button>

          {openReviews && (
            <div className="px-5 md:px-6 pb-6">
              {/* Add Review Button */}
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="w-full mb-4 p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">✍️</span>
                <span>{t.leaveReview}</span>
              </button>

              {/* Review Form */}
              {showReviewForm && (
                <form
                  onSubmit={submitReview}
                  className="mb-6 p-4 bg-amber-50 rounded-xl space-y-4 border border-amber-200"
                >
                  <div className="space-y-2">
                    <label className="font-bold text-amber-900 text-sm">
                      {t.reviewNameLabel}
                    </label>
                    <input
                      required
                      placeholder={t.namePlaceholder}
                      value={newReview.name}
                      onChange={(e) =>
                        setNewReview({ ...newReview, name: e.target.value })
                      }
                      className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-amber-900 text-sm">
                      {t.reviewRatingLabel}
                    </label>
                    <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className={`text-2xl md:text-3xl transition-all hover:scale-110 ${star <= newReview.rating ? 'text-amber-500' : 'text-gray-300'}`}
                        >
                          ⭐
                        </button>
                      ))}
                      <span className="font-bold text-amber-700 ml-2 md:ml-4 text-lg">
                        {newReview.rating}/5
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-amber-900 text-sm">
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
                      className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm min-h-[100px]"
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors text-sm"
                    >
                      {t.reviewSubmit}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(false);
                        setNewReview({ name: "", rating: 5, comment: "" });
                      }}
                      className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors text-sm"
                    >
                      {t.reviewCancel}
                    </button>
                  </div>
                </form>
              )}

              {/* Admin Controls */}
              {isAdmin && reviews.length > 0 && (
                <div className="mb-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-purple-600">👑</span>
                    <h3 className="font-bold text-purple-800">
                      {lang === "ar" ? "إدارة التقييمات" : "Review Management"}
                    </h3>
                  </div>
                  <div className="text-sm text-purple-700">
                    {lang === "ar" 
                      ? "يمكنك النقر على أي تقييم لرؤية خيارات الإدارة"
                      : "Click on any review to see management options"}
                  </div>
                </div>
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
                ) : reviews.filter(r => r.approved !== false).length === 0 ? (
                  <div className="text-center py-8 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-gray-500">
                      {t.reviewEmpty}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews
                      .filter(review => review.approved !== false)
                      .slice(0, 6)
                      .map((review, index) => (
                      <div
                        key={review.id || index}
                        className="bg-gradient-to-br from-white to-amber-50 p-4 rounded-xl shadow border border-amber-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-bold text-amber-900 text-sm md:text-base flex items-center gap-2">
                              {review.name || (review.ar?.name || review.en?.name)}
                              {review.approved && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  ✅
                                </span>
                              )}
                            </div>
                            {review.date && (
                              <div className="text-xs text-gray-500">
                                {new Date(review.date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                                {review.updatedAt && (
                                  <span className="text-xs text-blue-500 mr-2">
                                    ✏️ {lang === "ar" ? "معدل" : "edited"}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-full">
                              <span className="text-amber-700 font-bold text-sm md:text-base">
                                {review.rating || 5}
                              </span>
                              <span className="text-lg text-amber-500">⭐</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm leading-relaxed mb-3">
                          {review.comment || 
                            (lang === "ar" ? review.ar?.comment : review.en?.comment) ||
                            (review.ar?.comment || review.en?.comment)}
                        </p>
                        
                        {/* Admin Actions */}
                        {isAdmin && (
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-amber-100">
                            <button
                              onClick={() => startEditReview(review)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                            >
                              ✏️ {lang === "ar" ? "تعديل" : "Edit"}
                            </button>
                            
                            <button
                              onClick={() => deleteReview(review.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                            >
                              🗑️ {lang === "ar" ? "حذف" : "Delete"}
                            </button>
                            
                            {!review.approved ? (
                              <button
                                onClick={() => approveReview(review.id)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                              >
                                ✅ {lang === "ar" ? "تفعيل" : "Approve"}
                              </button>
                            ) : (
                              <button
                                onClick={() => unapproveReview(review.id)}
                                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
                              >
                                ⏸️ {lang === "ar" ? "إلغاء التفعيل" : "Unapprove"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ================= CONTACT SECTION ================= */}
        <section className="bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-5 md:p-6">
            <h2 className="text-xl md:text-2xl font-black mb-6 text-center">
              {t.contactUs}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-green-500 rounded-xl text-center font-bold hover:bg-green-600 transition-colors flex flex-col items-center justify-center gap-2"
              >
                <span className="text-3xl">💬</span>
                <div>
                  <div className="text-lg">{t.chatWhatsApp}</div>
                  <div className="text-sm opacity-90">{WHATSAPP_NUMBER}</div>
                </div>
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-center font-bold hover:opacity-90 transition-opacity flex flex-col items-center justify-center gap-2"
              >
                <span className="text-3xl">📸</span>
                <div>
                  <div className="text-lg">{t.followInstagram}</div>
                  <div className="text-sm opacity-90">@honeyhouse247</div>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-amber-900 text-white py-8 mt-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 shadow-lg">
                <img 
                  src="https://imgur.com/tpBWWTy.jpeg" 
                  alt="بيت العسل Honey House"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <h3 className="text-xl font-black mb-2">بيت العسل | Honey House</h3>
            <p className="opacity-80 mb-6 text-sm md:text-base">
              {lang === "ar" 
                ? "عسل طبيعي 100% من المنحل مباشرة إلى منزلك في الإمارات"
                : "100% Natural honey delivered directly from the apiary to your home in UAE"}
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <button
                onClick={() => setLang("ar")}
                className={`px-4 py-2 rounded-lg ${lang === "ar" ? "bg-amber-500" : "bg-amber-800"} hover:bg-amber-600 transition-colors text-sm`}
              >
                {t.arabic}
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-4 py-2 rounded-lg ${lang === "en" ? "bg-amber-500" : "bg-amber-800"} hover:bg-amber-600 transition-colors text-sm`}
              >
                {t.english}
              </button>
            </div>
            
            <p className="text-sm opacity-60">
              © {new Date().getFullYear()} بيت العسل. {t.copyright}.
            </p>
          </div>
        </div>
      </footer>

      {/* ================= FLOATING WHATSAPP BUTTON ================= */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-4 md:left-auto md:right-4 bg-green-500 text-white p-3 rounded-full shadow-2xl hover:bg-green-600 transition-all z-50 animate-bounce"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">💬</span>
          <span className="hidden sm:inline font-bold">{lang === "ar" ? "اطلب الآن" : "Order Now"}</span>
        </div>
      </a>

      {/* Add custom styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
        
        .font-cairo {
          font-family: 'Cairo', sans-serif;
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        
        .line-clamp-3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
        
        @keyframes slide-in {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        @media (max-width: 640px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
