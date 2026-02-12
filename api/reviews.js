/**
 * /api/reviews
 * Storage: Vercel KV (Upstash)
 *
 * Required env:
 * - KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN, KV_REST_API_READ_ONLY_TOKEN
 * - ADMIN_REVIEW_KEY   (secret for admin actions)
 *
 * Install:
 *   npm i @vercel/kv
 */

const { kv } = require("@vercel/kv");

const REVIEWS_KEY = "honeyhouse:reviews:v1";

// لو عايز تسيّد 6 تقييمات افتراضيين لأول مرة فقط:
// حطهم هنا. لو KV فيها بيانات، مش هيعمل overwrite.
const SEED = []; // <- ممكن تحط MOCK_REVIEWS هنا لو تحب

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function nowIso() {
  return new Date().toISOString();
}

function isAdmin(req) {
  const key = (req.headers["x-admin-key"] || "").toString().trim();
  const expected = (process.env.ADMIN_REVIEW_KEY || "").trim();
  return !!expected && key && key === expected;
}

async function readBody(req) {
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

async function getOrInit() {
  const existing = await kv.get(REVIEWS_KEY);
  if (Array.isArray(existing)) return existing;

  const initial = Array.isArray(SEED) ? SEED : [];
  await kv.set(REVIEWS_KEY, initial);
  return initial;
}

module.exports = async (req, res) => {
  try {
    const method = (req.method || "GET").toUpperCase();

    if (method === "GET") {
      const list = await getOrInit();
      const sorted = [...list].sort((a, b) =>
        (b.createdAt || "").localeCompare(a.createdAt || "")
      );
      return json(res, 200, { ok: true, reviews: sorted });
    }

    if (method === "POST") {
      const body = await readBody(req);

      const name = (body.name || "").toString().trim();
      const comment = (body.comment || "").toString().trim();
      const rating = Math.max(1, Math.min(5, Number(body.rating || 5)));
      const lang = (body.lang || "ar").toString() === "en" ? "en" : "ar";

      if (!name || !comment)
        return json(res, 400, { ok: false, error: "Missing name or comment" });

      const list = await getOrInit();

      const review = {
        id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        name,
        rating,
        comment,
        lang,
        createdAt: nowIso(),
        approved: true,
      };

      const updated = [review, ...list];
      await kv.set(REVIEWS_KEY, updated);
      return json(res, 200, { ok: true, review });
    }

    if (method === "PUT") {
      if (!isAdmin(req))
        return json(res, 401, { ok: false, error: "Unauthorized" });

      const body = await readBody(req);
      const id = (body.id || "").toString();
      const patch = body.patch || {};
      if (!id) return json(res, 400, { ok: false, error: "Missing id" });

      const list = await getOrInit();

      const updated = list.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          ...(typeof patch.name === "string" ? { name: patch.name.trim() } : {}),
          ...(typeof patch.comment === "string"
            ? { comment: patch.comment.trim() }
            : {}),
          ...(patch.rating
            ? { rating: Math.max(1, Math.min(5, Number(patch.rating))) }
            : {}),
          ...(typeof patch.approved === "boolean" ? { approved: patch.approved } : {}),
          updatedAt: nowIso(),
        };
      });

      await kv.set(REVIEWS_KEY, updated);
      return json(res, 200, { ok: true });
    }

    if (method === "DELETE") {
      if (!isAdmin(req))
        return json(res, 401, { ok: false, error: "Unauthorized" });

      const body = await readBody(req);
      const id = (body.id || "").toString();
      if (!id) return json(res, 400, { ok: false, error: "Missing id" });

      const list = await getOrInit();
      const updated = list.filter((r) => r.id !== id);
      await kv.set(REVIEWS_KEY, updated);
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { ok: false, error: "Method not allowed" });
  } catch (e) {
    return json(res, 500, {
      ok: false,
      error: "Server error",
      details: String(e && e.message ? e.message : e),
    });
  }
};
