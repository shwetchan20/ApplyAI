import express from "express";
import axios from "axios";
import { chatWithGroq } from "../lib/groq.js";
import { fitScoringPrompt } from "../prompts/systemPrompts.js";

const router = express.Router();

function normalizeJob(job) {
  return {
    id: job.id,
    title: job.title,
    company: job.company?.display_name || "Unknown",
    location: job.location?.display_name || "Unknown",
    salaryMin: job.salary_min ?? null,
    salaryMax: job.salary_max ?? null,
    description: job.description || "",
    redirectUrl: job.redirect_url
  };
}

function fallbackScore(profile, description) {
  const skills = (profile?.skills || []).map((s) => String(s).toLowerCase());
  const text = String(description || "").toLowerCase();
  const hits = skills.filter((s) => s && text.includes(s));
  const score = Math.min(95, Math.max(20, hits.length * 12 + 20));
  return {
    fitScore: score,
    reasoning: hits.length
      ? `Matched ${hits.length} profile skills with job requirements.`
      : "Limited overlap found from explicit skills.",
    matchedKeywords: hits.slice(0, 8)
  };
}

router.post("/", async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile?.targetRole) {
      return res.status(400).json({ error: "profile.targetRole is required" });
    }

    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    const country = process.env.ADZUNA_COUNTRY || "us";

    if (!appId || !appKey) {
      return res.status(500).json({ error: "Missing Adzuna API credentials" });
    }

    const searchParams = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      results_per_page: "10",
      what: profile.targetRole,
      where: profile?.jobPreferences?.location || profile.location || "",
      content_type: "application/json"
    });

    const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${searchParams.toString()}`;
    const response = await axios.get(adzunaUrl, { timeout: 20000 });
    const jobs = (response.data.results || []).map(normalizeJob);

    const scoredJobs = [];
    for (const job of jobs) {
      try {
        const aiContent = await chatWithGroq(
          [
            { role: "system", content: fitScoringPrompt },
            {
              role: "user",
              content: `Candidate profile:\n${JSON.stringify(profile)}\n\nJob:\n${JSON.stringify(job)}`
            }
          ],
          { json: true, temperature: 0.2 }
        );

        const parsed = JSON.parse(aiContent);
        scoredJobs.push({ ...job, ...parsed });
      } catch {
        scoredJobs.push({ ...job, ...fallbackScore(profile, job.description) });
      }
    }

    scoredJobs.sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0));
    res.json({ jobs: scoredJobs });
  } catch (error) {
    res.status(500).json({ error: error.message || "Job fetch failed" });
  }
});

export default router;