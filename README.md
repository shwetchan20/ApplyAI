# ApplyAI

AI-powered job application assistant that gathers your profile by chat, fetches matching jobs, and generates tailored resume + cover letter.

## Stack
- Frontend: React, TailwindCSS, React Router, jsPDF
- Backend: Node.js, Express
- AI: Groq (LLaMA 3)
- Jobs: Adzuna API

## Project Structure
- `client` React app
- `server` Express API

## Setup
1. Copy env templates:
   - `Copy-Item server/.env.example server/.env`
   - `Copy-Item client/.env.example client/.env`
2. Fill values in `server/.env`:
   - `GROQ_API_KEY`
   - `ADZUNA_APP_ID`
   - `ADZUNA_APP_KEY`
3. Install dependencies:
   - `npm run install:all`
4. Run backend:
   - `npm run dev:server`
5. Run frontend in another terminal:
   - `npm run dev:client`

## Vercel Deploy
- Project is configured for full-stack Vercel deployment using:
  - `vercel.json`
  - `api/index.mjs` (serverless API handler)
- Required Vercel environment variables:
  - `GROQ_API_KEY`
  - `ADZUNA_APP_ID`
  - `ADZUNA_APP_KEY`
  - `ADZUNA_COUNTRY` (optional, default `us`)
  - `CLIENT_ORIGIN` (set to your Vercel domain URL)
- Frontend uses `/api` automatically in production when `VITE_API_BASE_URL` is not set.

## API Endpoints
- `POST /api/chat` -> chat onboarding + optional profile JSON
- `POST /api/jobs` -> Adzuna jobs + fit scoring
- `POST /api/resume` -> tailored resume JSON
- `POST /api/coverletter` -> personalized cover letter text

## Notes
- For hackathon speed, app is state/session based (no DB).
- If Groq returns malformed JSON occasionally, retry request.
