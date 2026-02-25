import express from "express";
import { chatWithGroq } from "../lib/groq.js";
import { profileSystemPrompt } from "../prompts/systemPrompts.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { messages = [] } = req.body;

    const aiReply = await chatWithGroq([
      { role: "system", content: profileSystemPrompt },
      ...messages
    ]);

    let profile = null;
    try {
      if (aiReply.startsWith("{")) {
        profile = JSON.parse(aiReply);
      }
    } catch {
      profile = null;
    }

    res.json({ reply: aiReply, profile });
  } catch (error) {
    res.status(500).json({ error: error.message || "Chat failed" });
  }
});

export default router;