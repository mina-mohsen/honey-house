import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";

const KEY = "honeyhouse:reviews:v1";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const list = (await kv.get<any[]>(KEY)) || [];
      return res.status(200).json({ ok: true, reviews: list });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const current = (await kv.get<any[]>(KEY)) || [];

      const review = {
        id: body.id || `review_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: String(body.name || "").trim(),
        rating: Number(body.rating || 5),
        comment: String(body.comment || "").trim(),
        lang: body.lang === "en" ? "en" : "ar",
        createdAt: body.createdAt || new Date().toISOString(),
        approved: body.approved !== false, // default true
      };

      if (!review.name || !review.comment) {
        return res.status(400).json({ ok: false, error: "Missing name/comment" });
      }

      const updated = [review, ...current];
      await kv.set(KEY, updated);

      return res.status(200).json({ ok: true, review, reviews: updated });
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}
