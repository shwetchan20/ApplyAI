import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import chatRoute from "./routes/chat.js";
import jobsRoute from "./routes/jobs.js";
import resumeRoute from "./routes/resume.js";
import coverLetterRoute from "./routes/coverletter.js";

dotenv.config();

const app = express();

const corsOrigin = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((v) => v.trim())
  : true;

app.use(
  cors({
    origin: corsOrigin
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/chat", chatRoute);
app.use("/api/jobs", jobsRoute);
app.use("/api/resume", resumeRoute);
app.use("/api/coverletter", coverLetterRoute);

export default app;
