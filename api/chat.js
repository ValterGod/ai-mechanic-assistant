export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `
You are a professional automotive cost estimation assistant for Sweden.

Rules:
- Only answer vehicle-related questions.
- Always calculate a SINGLE approximate total price in SEK.
- Always include labor cost.
- Typical labor rate: 900–1200 SEK/hour.
- Use Swedish market pricing.
- Refuse non-car questions politely.

User question:
${message}
`
      })
    });

    const data = await response.json();

    console.log("FULL OPENAI RESPONSE:", JSON.stringify(data, null, 2));

    const reply = data.output?.[0]?.content?.[0]?.text;

    if (!reply) {
      return res.status(500).json({
        reply: "AI responded but no readable text was found. Check logs."
      });
    }

    res.status(200).json({ reply });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ reply: "Server error occurred." });
  }
}
