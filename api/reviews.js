import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    try {
      console.log("Fetching reviews from KV store...");
      const reviews = (await kv.get("honeyhouse:reviews")) || [];
      
      // Ensure all reviews have required fields
      const validatedReviews = reviews.map(review => ({
        id: review.id || Date.now() + Math.random(),
        name: review.name || "مستخدم مجهول",
        rating: typeof review.rating === 'number' ? review.rating : 5,
        comment: review.comment || "",
        createdAt: review.createdAt || Date.now(),
        date: review.date || new Date(review.createdAt || Date.now()).toISOString(),
        lang: review.lang || "ar",
        ...review
      }));

      console.log(`Returning ${validatedReviews.length} reviews`);
      return res.status(200).json(validatedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ 
        error: "Failed to fetch reviews",
        message: error.message 
      });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, rating, comment, lang } = req.body;

      // Validate input
      if (!name || !name.trim()) {
        return res.status(400).json({ 
          error: "Validation failed", 
          message: "Name is required" 
        });
      }

      if (!comment || !comment.trim()) {
        return res.status(400).json({ 
          error: "Validation failed", 
          message: "Comment is required" 
        });
      }

      const numericRating = Math.min(5, Math.max(1, parseInt(rating) || 5));
      const currentTime = Date.now();
      
      // Get existing reviews
      const existingReviews = (await kv.get("honeyhouse:reviews")) || [];
      
      // Create new review with all necessary fields
      const newReview = {
        id: `review_${currentTime}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        rating: numericRating,
        comment: comment.trim(),
        lang: lang || "ar",
        createdAt: currentTime,
        date: new Date(currentTime).toISOString(),
      };

      console.log("Adding new review:", { 
        name: newReview.name, 
        rating: newReview.rating,
        lang: newReview.lang 
      });

      // Add new review to beginning of array (most recent first)
      const updatedReviews = [newReview, ...existingReviews];
      
      // Limit reviews to last 1000 to prevent storage issues
      const limitedReviews = updatedReviews.slice(0, 1000);
      
      // Save to KV store
      await kv.set("honeyhouse:reviews", limitedReviews);
      
      // Also update review count
      const reviewCount = limitedReviews.length;
      await kv.set("honeyhouse:review_count", reviewCount);

      // Log success
      console.log(`Review saved successfully. Total reviews: ${reviewCount}`);

      // Return the new review
      return res.status(201).json(newReview);

    } catch (error) {
      console.error("Error saving review:", error);
      return res.status(500).json({ 
        error: "Failed to save review",
        message: error.message 
      });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).json({ 
    error: "Method not allowed",
    message: `Method ${req.method} not supported` 
  });
}
