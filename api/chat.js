export default async function handler(req, res) {
  const message = req.body.message;

  const systemPrompt = `
You are a professional automotive cost estimation assistant for Sweden.

Rules:
- Only answer car-related questions.
- Always calculate a SINGLE approximate total price in SEK including labor.
- Typical labor rate: 900–1200 SEK/hour.
- Use Swedish market pricing.
- Politely refuse non-car questions.
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{
      "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      model:"gpt-4o-mini",
      messages:[
        {role:"system",content:systemPrompt},
        {role:"user",content:message}
      ]
    })
  });

  const data = await response.json();
  res.status(200).json({ reply: data.choices[0].message.content });
}
