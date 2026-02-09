import { kv } from '@vercel/kv';

export async function GET() {
  try {
    const reviews = await kv.get('honeyhouse:reviews');
    return Response.json(reviews || []);
  } catch (error) {
    console.error('GET Error:', error);
    return Response.json(
      { error: 'Failed to fetch reviews', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, rating, comment, lang } = await request.json();

    // Validation
    if (!name || !name.trim()) {
      return Response.json(
        { error: 'Validation failed', message: 'Name is required' },
        { status: 400 }
      );
    }

    if (!comment || !comment.trim()) {
      return Response.json(
        { error: 'Validation failed', message: 'Comment is required' },
        { status: 400 }
      );
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

    // Add to beginning and limit to 1000 reviews
    const updatedReviews = [newReview, ...existingReviews].slice(0, 1000);
    
    // Save to KV
    await kv.set('honeyhouse:reviews', updatedReviews);

    return Response.json(newReview, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return Response.json(
      { error: 'Failed to save review', message: error.message },
      { status: 500 }
    );
  }
}