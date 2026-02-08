export default async function handler(req, res) {
  try {
    // Allow POST only
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Validate env key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.startsWith("AIza")) {
      return res.status(500).json({
        error: "Invalid GEMINI_API_KEY",
        hint: "Set GEMINI_API_KEY in Vercel Environment Variables (should start with AIza).",
      });
    }

    // Validate input
    const { message } = req.body || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Missing message" });
    }

    // Call Gemini REST API
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
      }),
    });

    const data = await r.json();

    // If Google returned an error, surface it clearly
    if (!r.ok) {
      return res.status(r.status).json({
        error: "Gemini API error",
        details: data,
      });
    }

    // Extract text safely (some responses have multiple parts)
    const parts = data?.candidates?.[0]?.content?.parts;
    const reply = Array.isArray(parts)
      ? parts.map((p) => (typeof p?.text === "string" ? p.text : "")).join(" ").trim()
      : "";

    // If still empty, return debug so we can see the real structure
    if (!reply) {
      return res.status(200).json({
        reply: "No response from AI",
        debug: data,
      });
    }

    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({
      error: "Server error",
      details: String(e?.message || e),
    });
  }
}
