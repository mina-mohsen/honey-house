import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      console.log('Fetching reviews from KV...');
      const reviews = (await kv.get('honeyhouse:reviews')) || [];
      
      // Add mock reviews if empty (for initial setup)
      if (reviews.length === 0) {
        const mockReviews = [
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
            name: 'Sarah Ahmed',
            comment: 'Best honey I\'ve ever tasted! Pure, natural, and delivered so fast.',
            rating: 5,
            date: '2024-11-10T10:00:00Z',
            lang: 'en'
          }
        ];
        await kv.set('honeyhouse:reviews', mockReviews);
        return res.status(200).json(mockReviews);
      }

      return res.status(200).json(reviews);
    } catch (error) {
      console.error('GET Error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch reviews',
        message: error.message 
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, rating, comment, lang } = req.body;

      // Validation
      if (!name || !name.trim()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          message: 'Name is required' 
        });
      }

      if (!comment || !comment.trim()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          message: 'Comment is required' 
        });
      }

      const numericRating = Math.min(5, Math.max(1, parseInt(rating) || 5));
      const currentTime = Date.now();

      // Get existing reviews
      const existingReviews = (await kv.get('honeyhouse:reviews')) || [];

      // Create new review
      const newReview = {
        id: `review_${currentTime}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        rating: numericRating,
        comment: comment.trim(),
        lang: lang || 'ar',
        createdAt: currentTime,
        date: new Date(currentTime).toISOString(),
      };

      console.log('Adding new review:', newReview.name);

      // Add to beginning and limit
      const updatedReviews = [newReview, ...existingReviews].slice(0, 1000);
      
      // Save to KV
      await kv.set('honeyhouse:reviews', updatedReviews);

      return res.status(201).json(newReview);
    } catch (error) {
      console.error('POST Error:', error);
      return res.status(500).json({ 
        error: 'Failed to save review',
        message: error.message 
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ 
    error: 'Method not allowed',
    message: `Method ${req.method} not supported` 
  });
}
