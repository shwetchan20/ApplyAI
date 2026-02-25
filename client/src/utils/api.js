const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function post(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

export const api = {
  chat: (messages) => post("/chat", { messages }),
  jobs: (profile) => post("/jobs", { profile }),
  resume: (profile, job) => post("/resume", { profile, job }),
  coverLetter: (profile, job) => post("/coverletter", { profile, job })
};