export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "Missing message" });

const r = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: message }] }],
    }),
  }
);

    const data = await r.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: "Error connecting to Gemini" });
  }
}
