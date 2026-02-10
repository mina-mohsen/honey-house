import { kv } from '@vercel/kv';

/**
 * Reviews API (Vercel KV)
 * - GET    /api/reviews              -> list reviews
 * - POST   /api/reviews              -> add review (public)
 * - PUT    /api/reviews              -> update review (admin)
 * - DELETE /api/reviews?id=<id>      -> delete review (admin)
 */

const KV_KEY = 'honeyhouse:reviews:v1';

function json(res, status = 200) {
  return new Response(JSON.stringify(res), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function requireAdmin(req) {
  const key = req.headers.get('x-admin-key') || '';
  if (!process.env.ADMIN_REVIEW_KEY) return false; // must be set in Vercel env
  return key && key === process.env.ADMIN_REVIEW_KEY;
}

function normalizeReview({ id, name, comment, rating, lang, createdAt }) {
  const safeName = String(name || '').trim().slice(0, 60);
  const safeComment = String(comment || '').trim().slice(0, 500);
  const safeRating = Math.min(5, Math.max(1, Number(rating) || 5));

  const base = {
    id,
    rating: safeRating,
    createdAt: createdAt ?? Date.now(),
  };

  // Keep both languages so UI can switch without losing text
  if (lang === 'en') {
    return {
      ...base,
      ar: { name: safeName, comment: safeComment },
      en: { name: safeName, comment: safeComment },
    };
  }
  return {
    ...base,
    ar: { name: safeName, comment: safeComment },
    en: { name: safeName, comment: safeComment },
  };
}

async function readAll() {
  const data = await kv.get(KV_KEY);
  return Array.isArray(data) ? data : [];
}

export default async function handler(req) {
  try {
    const method = (req.method || 'GET').toUpperCase();

    if (method === 'GET') {
      const all = await readAll();
      return json(all, 200);
    }

    if (method === 'POST') {
      const body = await req.json();
      const id = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
      const review = normalizeReview({
        id,
        name: body?.name,
        comment: body?.comment,
        rating: body?.rating,
        lang: body?.lang,
      });

      const all = await readAll();
      const next = [review, ...all].slice(0, 200); // keep last 200
      await kv.set(KV_KEY, next);
      return json(review, 200);
    }

    if (method === 'PUT') {
      if (!requireAdmin(req)) return json({ error: 'Unauthorized' }, 401);

      const body = await req.json();
      const id = String(body?.id || '').trim();
      if (!id) return json({ error: 'Missing id' }, 400);

      const all = await readAll();
      const idx = all.findIndex(r => r?.id === id);
      if (idx === -1) return json({ error: 'Not found' }, 404);

      const updated = normalizeReview({
        id,
        name: body?.name,
        comment: body?.comment,
        rating: body?.rating,
        lang: body?.lang,
        createdAt: all[idx]?.createdAt ?? Date.now(),
      });

      const next = [...all];
      next[idx] = updated;
      await kv.set(KV_KEY, next);
      return json(updated, 200);
    }

    if (method === 'DELETE') {
      if (!requireAdmin(req)) return json({ error: 'Unauthorized' }, 401);

      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      if (!id) return json({ error: 'Missing id' }, 400);

      const all = await readAll();
      const next = all.filter(r => r?.id !== id);
      await kv.set(KV_KEY, next);
      return json({ ok: true }, 200);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    return json({ error: 'Server error', details: String(err?.message || err) }, 500);
  }
}
