import { kv } from '@vercel/kv';
import crypto from 'crypto';

// Store an array of reviews under one KV key.
// Review shape:
// { id, rating, createdAt, ar:{name,comment}, en:{name,comment} }
const KV_KEY = 'honey_house:reviews:v1';

function readBody(req) {
  // Vercel parses JSON body into req.body for Node runtime.
  return req.body || {};
}

function getAdminKey(req) {
  // Allow either header or query param for convenience.
  return (
    req.headers['x-admin-key'] ||
    req.headers['X-Admin-Key'] ||
    (req.query && (req.query.key || req.query.adminKey)) ||
    ''
  );
}

function requireAdmin(req) {
  const expected = process.env.ADMIN_KEY || '';
  if (!expected) return { ok: false, reason: 'ADMIN_KEY is not set on the server.' };
  const provided = String(getAdminKey(req) || '');
  if (!provided || provided !== expected) return { ok: false, reason: 'Unauthorized (bad admin key).' };
  return { ok: true };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const reviews = (await kv.get(KV_KEY)) || [];
      return res.status(200).json({ reviews });
    }

    if (req.method === 'POST') {
      const body = readBody(req);
      const name = String(body.name || '').trim();
      const comment = String(body.comment || '').trim();
      const rating = Number(body.rating || 5);

      if (!name || !comment) {
        return res.status(400).json({ error: 'Missing name or comment.' });
      }
      const safeRating = Math.max(1, Math.min(5, Number.isFinite(rating) ? rating : 5));

      const review = {
        id: crypto.randomUUID(),
        rating: safeRating,
        createdAt: Date.now(),
        ar: { name, comment },
        en: { name, comment },
      };

      const existing = (await kv.get(KV_KEY)) || [];
      const updated = [review, ...existing].slice(0, 500); // keep a sane cap
      await kv.set(KV_KEY, updated);

      return res.status(200).json({ review, reviews: updated });
    }

    if (req.method === 'PATCH') {
      const auth = requireAdmin(req);
      if (!auth.ok) return res.status(401).json({ error: auth.reason });

      const body = readBody(req);
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Missing review id.' });

      const existing = (await kv.get(KV_KEY)) || [];
      const idx = existing.findIndex((r) => String(r.id) === id);
      if (idx === -1) return res.status(404).json({ error: 'Review not found.' });

      const cur = existing[idx];
      const next = { ...cur };

      if (body.rating !== undefined) {
        const rr = Number(body.rating);
        next.rating = Math.max(1, Math.min(5, Number.isFinite(rr) ? rr : cur.rating));
      }
      if (body.name !== undefined) {
        const n = String(body.name || '').trim();
        if (n) {
          next.ar = { ...(next.ar || {}), name: n };
          next.en = { ...(next.en || {}), name: n };
        }
      }
      if (body.comment !== undefined) {
        const c = String(body.comment || '').trim();
        if (c) {
          next.ar = { ...(next.ar || {}), comment: c };
          next.en = { ...(next.en || {}), comment: c };
        }
      }

      const updated = [...existing];
      updated[idx] = next;
      await kv.set(KV_KEY, updated);

      return res.status(200).json({ review: next, reviews: updated });
    }

    if (req.method === 'DELETE') {
      const auth = requireAdmin(req);
      if (!auth.ok) return res.status(401).json({ error: auth.reason });

      const body = readBody(req);
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Missing review id.' });

      const existing = (await kv.get(KV_KEY)) || [];
      const updated = existing.filter((r) => String(r.id) !== id);
      await kv.set(KV_KEY, updated);

      return res.status(200).json({ ok: true, reviews: updated });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: String(err?.message || err) });
  }
}
