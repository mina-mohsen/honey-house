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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
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
                  "You are an expert Egyptian honey consultant. " +
                  "Answer clearly in Arabic with short, helpful advice."
              }
            ]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 256
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Gemini API error",
        details: data
      });
    }

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
