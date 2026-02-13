export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    const systemPrompt = `
You are a professional automotive cost estimation assistant for Sweden.

Rules:
- You ONLY answer questions related to cars, vehicle repairs, servicing, diagnostics, maintenance, and costs.
- If a question is not vehicle-related, politely refuse.

Pricing logic:
- Always calculate a SINGLE approximate total price in SEK.
- Always include labor cost.
- Use Swedish market pricing.
- Typical labor rate: 900–1200 SEK/hour.

Response structure:
- Clear title
- Parts estimate
- Labor estimate
- Final total as: ≈ XXXX SEK
- Short disclaimer: Prices are estimates only.

Tone:
- Professional
- Helpful
- Clear
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await openaiResponse.json();

    let reply = "Sorry, I could not generate a response.";

    if (data.output && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.content) {
          for (const part of item.content) {
            if (part.type === "output_text") {
              reply = part.text;
              break;
            }
          }
        }
      }
    }

    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
