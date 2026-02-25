import axios from "axios";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function chatWithGroq(messages, options = {}) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing");
  }

  const response = await axios.post(
    GROQ_URL,
    {
      model: MODEL,
      temperature: options.temperature ?? 0.3,
      response_format: options.json ? { type: "json_object" } : undefined,
      messages
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 30000
    }
  );

  return response.data.choices?.[0]?.message?.content?.trim() ?? "";
}