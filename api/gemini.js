export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.startsWith("AIza")) {
      return res.status(500).json({
        error: "Invalid GEMINI_API_KEY"
      });
    }

    const { message } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Missing message" });
    }

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: message }]
            }
          ],
          systemInstruction: {
            parts: [
              {
                text:
                  "You are a professional Egyptian honey expert. " +
                  "Always answer clearly in Arabic. " +
                  "Give short, helpful, safe answers about honey benefits."
              }
            ]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 256
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        })
      }
    );

    const data = await r.json();

    const parts = data?.candidates?.[0]?.content?.parts;
    const reply = Array.isArray(parts)
      ? parts.map(p => p.text || "").join(" ").trim()
      : "";

    if (!reply) {
      return res.status(200).json({
        reply: "No response from AI",
        debug: data
      });
    }

    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({
      error: "Server error",
      details: String(e)
    });
  }
}
