import express from "express";
import { chatWithGroq } from "../lib/groq.js";
import { coverLetterPrompt } from "../prompts/systemPrompts.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { profile, job } = req.body;

    if (!profile || !job) {
      return res.status(400).json({ error: "profile and job are required" });
    }

    const letter = await chatWithGroq([
      { role: "system", content: coverLetterPrompt },
      {
        role: "user",
        content: `Candidate profile:\n${JSON.stringify(profile, null, 2)}\n\nJob:\n${JSON.stringify(job, null, 2)}`
      }
    ]);

    res.json({ coverLetter: letter });
  } catch (error) {
    res.status(500).json({ error: error.message || "Cover letter generation failed" });
  }
});

export default router;