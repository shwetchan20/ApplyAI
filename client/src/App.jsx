import { useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Chat from "./components/Chat.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ResumePreview from "./components/ResumePreview.jsx";
import { api } from "./utils/api.js";

const SIGNAL_KEYWORDS = [
  "react", "node", "express", "javascript", "typescript", "python", "java",
  "sql", "mongodb", "aws", "docker", "kubernetes", "tailwind", "next.js",
  "figma", "machine learning", "data analysis", "llm", "api"
];

function calcAts(resume, job) {
  if (!resume || !job) return 0;
  const text = `${resume.summary || ""} ${(resume.skills || []).join(" ")} ${(resume.experienceBullets || []).join(" ")}`.toLowerCase();
  const jd = `${job.title} ${job.description || ""}`.toLowerCase();
  const keywords = Array.from(new Set(jd.match(/[a-zA-Z]{4,}/g) || [])).slice(0, 80);
  if (!keywords.length) return 70;
  const hit = keywords.filter((k) => text.includes(k)).length;
  return Math.max(20, Math.min(99, Math.round((hit / keywords.length) * 100)));
}

function extractQuickSignals(text) {
  const lower = String(text || "").toLowerCase();
  return SIGNAL_KEYWORDS
    .filter((skill) => lower.includes(skill))
    .map((skill) => skill.split(" ").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" "));
}

function initials(fullName) {
  if (!fullName) return "U";
  const parts = fullName.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "U";
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [liveSignals, setLiveSignals] = useState([]);
  const [linkedinFileName, setLinkedinFileName] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingResume, setLoadingResume] = useState(false);
  const [loadingCoverLetter, setLoadingCoverLetter] = useState(false);

  const atsScore = useMemo(() => calcAts(resume, selectedJob), [resume, selectedJob]);
  const completedProfile = Boolean(profile?.targetRole && profile?.skills?.length);
  const currentStep = location.pathname.startsWith("/dashboard")
    ? 2
    : location.pathname.startsWith("/resume")
      ? 3
      : 1;

  const sendMessage = async (text) => {
    const nextMessages = [...messages, { role: "user", content: text }];
    const detectedSignals = extractQuickSignals(text);
    if (detectedSignals.length) {
      setLiveSignals((prev) => Array.from(new Set([...prev, ...detectedSignals])).slice(0, 12));
    }
    setMessages(nextMessages);
    setLoadingChat(true);
    try {
      const data = await api.chat(nextMessages);
      const merged = [...nextMessages, { role: "assistant", content: data.reply }];
      setMessages(merged);
      if (data.profile) {
        setProfile(data.profile);
        const profileSkills = (data.profile.skills || []).map((s) => String(s).trim()).filter(Boolean);
        if (profileSkills.length) {
          setLiveSignals((prev) => Array.from(new Set([...prev, ...profileSkills])).slice(0, 12));
        }
        navigate("/dashboard");
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${error.message}` }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const generateJobs = async () => {
    if (!profile) return;
    setLoadingJobs(true);
    try {
      const data = await api.jobs(profile);
      setJobs(data.jobs || []);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingJobs(false);
    }
  };

  const selectJob = (job) => {
    setSelectedJob(job);
    navigate("/resume");
  };

  const generateResume = async () => {
    if (!profile || !selectedJob) return;
    setLoadingResume(true);
    try {
      const data = await api.resume(profile, selectedJob);
      setResume(data.resume);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingResume(false);
    }
  };

  const generateCoverLetter = async () => {
    if (!profile || !selectedJob) return;
    setLoadingCoverLetter(true);
    try {
      const data = await api.coverLetter(profile, selectedJob);
      setCoverLetter(data.coverLetter || "");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingCoverLetter(false);
    }
  };

  const handleLinkedinUpload = (file) => {
    if (!file) return;
    setLinkedinFileName(file.name);
  };

  const handleManualProfile = (manual) => {
    const manualSkills = String(manual.skills || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const manualProfile = {
      fullName: manual.fullName || profile?.fullName || "",
      email: manual.email || profile?.email || "",
      phone: profile?.phone || "",
      location: manual.location || profile?.location || "",
      targetRole: manual.targetRole || profile?.targetRole || "",
      experienceYears: manual.experienceYears || profile?.experienceYears || "",
      skills: manualSkills.length ? manualSkills : profile?.skills || [],
      education: profile?.education || [],
      projects: profile?.projects || [],
      achievements: profile?.achievements || [],
      jobPreferences: profile?.jobPreferences || { location: "", type: "" },
      summary: profile?.summary || ""
    };

    setProfile(manualProfile);
    if (manualSkills.length) {
      setLiveSignals((prev) => Array.from(new Set([...prev, ...manualSkills])).slice(0, 12));
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid-bg relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="aurora-orb orb-a" />
        <div className="aurora-orb orb-b" />
        <div className="aurora-orb orb-c" />
      </div>
      <header className="max-w-7xl mx-auto px-4 pt-4 pb-2 sticky top-0 z-20">
        <div className="glass px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="logo-glow" />
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white grid place-content-center font-extrabold relative">
              A
              </div>
            </div>
            <div>
              <h1 className="headline text-xl font-bold tracking-tight shimmer-text">ApplyAI</h1>
              <p className="text-xs text-slate-300/80">Profile to application, one flow</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => navigate("/chat")}>Onboarding Chat</button>
            <button className="btn-secondary" onClick={() => navigate("/dashboard")}>Job Matches</button>
            <button className="btn-secondary" onClick={() => navigate("/resume")}>Resume Studio</button>
          </nav>
          <div className="flex items-center gap-2">
            <div className="avatar-badge">{initials(profile?.fullName)}</div>
            <span className={`soft-chip ${completedProfile ? "!bg-emerald-900/50 !text-emerald-200 !border-emerald-700/60" : ""}`}>
              {completedProfile ? "Profile Ready" : "Profile Incomplete"}
            </span>
            <span className="soft-chip">ATS {atsScore}%</span>
            {linkedinFileName && <span className="soft-chip">LinkedIn PDF added</span>}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-10">
        <div className="mb-4 flex flex-wrap gap-2 fade-in-up">
          <span className={`step-pill ${currentStep === 1 ? "step-pill-active" : ""}`}>Step 1 of 3: Chat</span>
          <span className={`step-pill ${currentStep === 2 ? "step-pill-active" : ""}`}>Step 2 of 3: Jobs</span>
          <span className={`step-pill ${currentStep === 3 ? "step-pill-active" : ""}`}>Step 3 of 3: Resume</span>
        </div>
        <div className="mb-4 rounded-2xl border border-sky-500/30 bg-slate-900/45 px-4 py-3 text-base font-medium text-slate-200 fade-in-up">
          <span className="font-semibold text-white">Flow:</span> Chat onboarding | ranked jobs | ATS-tailored resume | personalized cover letter.
        </div>
        <div className="mb-5 grid gap-3 sm:grid-cols-3 fade-in-up">
          <div className="card px-4 py-3 hover-lift">
            <p className="text-xs uppercase tracking-wide text-slate-400">Profile Signals</p>
            <p className="mt-1 text-2xl font-bold">{profile?.skills?.length || "—"}</p>
            <p className="mt-1 text-xs text-slate-400">{profile?.skills?.length ? "Signals extracted" : "Chat to unlock"}</p>
          </div>
          <div className="card px-4 py-3 hover-lift">
            <p className="text-xs uppercase tracking-wide text-slate-400">Live Matches</p>
            <p className="mt-1 text-2xl font-bold">{jobs.length || "—"}</p>
            <p className="mt-1 text-xs text-slate-400">{jobs.length ? "Ranked by fit score" : "Find jobs after onboarding"}</p>
          </div>
          <div className="card px-4 py-3 hover-lift">
            <p className="text-xs uppercase tracking-wide text-slate-400">Current ATS</p>
            <p className="mt-1 text-2xl font-bold">{resume ? `${atsScore}%` : "—"}</p>
            <p className="mt-1 text-xs text-slate-400">{resume ? "Based on selected role" : "Generate resume to score"}</p>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route
            path="/chat"
            element={
              <Chat
                messages={messages}
                onSend={sendMessage}
                loading={loadingChat}
                profile={profile}
                liveSignals={liveSignals}
                onLinkedinUpload={handleLinkedinUpload}
                linkedinFileName={linkedinFileName}
                onManualProfile={handleManualProfile}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                profile={profile}
                jobs={jobs}
                loading={loadingJobs}
                onGenerateJobs={generateJobs}
                onSelectJob={selectJob}
                selectedJob={selectedJob}
              />
            }
          />
          <Route
            path="/resume"
            element={
              <ResumePreview
                resume={resume}
                selectedJob={selectedJob}
                onGenerateResume={generateResume}
                loadingResume={loadingResume}
                atsScore={atsScore}
                coverLetter={coverLetter}
                onGenerateCoverLetter={generateCoverLetter}
                loadingCoverLetter={loadingCoverLetter}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
