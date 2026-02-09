import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const reviews = (await kv.get("reviews")) || [];
    return res.status(200).json(reviews);
  }

  if (req.method === "POST") {
    const { name, rating, comment } = req.body;

    const reviews = (await kv.get("reviews")) || [];
    const newReview = {
      name,
      rating,
      comment,
      createdAt: Date.now(),
    };

    const updated = [newReview, ...reviews];
    await kv.set("reviews", updated);

    return res.status(200).json(newReview);
  }

  res.status(405).end();
}
