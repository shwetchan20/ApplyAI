import { useState } from "react";

const seedPrompt = "Hi! I am your ApplyAI assistant. Tell me your target role and years of experience.";

function estimateProgress(profile) {
  if (!profile) return 20;
  let score = 0;
  const checks = [
    profile.fullName,
    profile.targetRole,
    profile.experienceYears,
    profile.summary,
    profile.skills?.length,
    profile.education?.length,
    profile.projects?.length
  ];
  checks.forEach((c) => {
    if (c) score += 1;
  });
  return Math.min(100, Math.round((score / checks.length) * 100));
}

export default function Chat({
  messages,
  onSend,
  loading,
  profile,
  liveSignals,
  onLinkedinUpload,
  linkedinFileName,
  onManualProfile
}) {
  const [input, setInput] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manual, setManual] = useState({
    fullName: "",
    email: "",
    location: "",
    targetRole: "",
    experienceYears: "",
    skills: ""
  });
  const progress = estimateProgress(profile);

  const submit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  const chatItems = messages.length
    ? messages
    : [{ role: "assistant", content: seedPrompt }];

  const signalTags = Array.from(
    new Set([...(profile?.skills || []), ...(liveSignals || [])])
  ).slice(0, 10);

  const onPickFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onLinkedinUpload(file);
  };

  const submitManual = (e) => {
    e.preventDefault();
    onManualProfile(manual);
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[320px_1fr] fade-in-up">
      <aside className="card-elevated p-5 h-fit">
        <p className="soft-chip mb-3">Step 1 of 3</p>
        <h2 className="headline text-2xl font-bold">Build Your Profile</h2>
        <p className="mt-2 text-sm text-slate-300">
          Chat naturally. ApplyAI will extract your profile, projects, and target role automatically.
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Completion</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
            <div className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        {messages.length === 0 && (
          <div className="mt-4 space-y-2">
            <label className="btn-secondary w-full text-center cursor-pointer block">
              Upload LinkedIn PDF
              <input className="hidden" type="file" accept=".pdf" onChange={onPickFile} />
            </label>
            <p className="text-xs text-slate-400">{linkedinFileName ? `${linkedinFileName} uploaded` : "Optional: add profile context before chat."}</p>
          </div>
        )}
        <div className="mt-5 space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">Collected Signals</p>
          <div className="flex flex-wrap gap-2">
            {signalTags.length ? (
              signalTags.map((tag) => <span key={tag} className="soft-chip signal-pop">{tag}</span>)
            ) : (
              <>
                <span className="soft-chip">Role Pending</span>
                <span className="soft-chip">Skills Pending</span>
                <span className="soft-chip">Projects Pending</span>
              </>
            )}
          </div>
        </div>
        <button className="mt-4 text-sm text-sky-300 hover:text-sky-200 underline underline-offset-4" onClick={() => setShowManualEntry((s) => !s)}>
          {showManualEntry ? "Back to chat mode" : "Skip to manual entry"}
        </button>
      </aside>

      <div className="card-elevated p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="headline text-xl font-bold">AI Recruiter Assistant</h3>
          <span className="soft-chip">Real-time profile extraction</span>
        </div>

        <div className="h-[480px] overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-950/50 p-4 sm:p-5 space-y-3 chat-canvas">
          {chatItems.map((m, i) => (
            <div key={`${m.role}-${i}`} className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white ml-auto shadow-lg shadow-sky-500/20" : "bg-slate-900/85 border border-slate-700 text-slate-100"}`}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="typing-wrap">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          )}
        </div>

        {showManualEntry ? (
          <form className="mt-4 grid gap-2 sm:grid-cols-2" onSubmit={submitManual}>
            <input className="field" placeholder="Full Name" value={manual.fullName} onChange={(e) => setManual((p) => ({ ...p, fullName: e.target.value }))} />
            <input className="field" placeholder="Email" value={manual.email} onChange={(e) => setManual((p) => ({ ...p, email: e.target.value }))} />
            <input className="field" placeholder="Location" value={manual.location} onChange={(e) => setManual((p) => ({ ...p, location: e.target.value }))} />
            <input className="field" placeholder="Target Role" value={manual.targetRole} onChange={(e) => setManual((p) => ({ ...p, targetRole: e.target.value }))} />
            <input className="field" placeholder="Years Experience" value={manual.experienceYears} onChange={(e) => setManual((p) => ({ ...p, experienceYears: e.target.value }))} />
            <input className="field" placeholder="Skills (comma separated)" value={manual.skills} onChange={(e) => setManual((p) => ({ ...p, skills: e.target.value }))} />
            <button className="btn-primary sm:col-span-2" type="submit">Save & Continue</button>
          </form>
        ) : (
          <form className="mt-4 flex gap-2" onSubmit={submit}>
            <input
              className="field flex-1"
              placeholder="Type your answer..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="btn-primary btn-send" type="submit" disabled={loading}>Send</button>
          </form>
        )}
      </div>
    </section>
  );
}
