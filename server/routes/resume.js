import express from "express";
import { chatWithGroq } from "../lib/groq.js";
import { resumePrompt } from "../prompts/systemPrompts.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { profile, job } = req.body;

    if (!profile) {
      return res.status(400).json({ error: "profile is required" });
    }

    const content = await chatWithGroq(
      [
        { role: "system", content: resumePrompt },
        {
          role: "user",
          content: `Candidate Profile:\n${JSON.stringify(profile, null, 2)}\n\nTarget Job:\n${JSON.stringify(job ?? {}, null, 2)}`
        }
      ],
      { json: true }
    );

    res.json({ resume: JSON.parse(content) });
  } catch (error) {
    res.status(500).json({ error: error.message || "Resume generation failed" });
  }
});

export default router;