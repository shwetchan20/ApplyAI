import JobCard from "./JobCard.jsx";

export default function Dashboard({ profile, jobs, loading, onGenerateJobs, onSelectJob, selectedJob }) {
  return (
    <section className="space-y-4 fade-in-up">
      <div className="card-elevated p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="soft-chip mb-2">Step 2 of 3</p>
          <h2 className="headline text-2xl font-bold">Matched Jobs Dashboard</h2>
          <p className="text-sm text-slate-300 mt-1">Fetch and rank live jobs by candidate fit.</p>
        </div>
        <button className="btn-primary" onClick={onGenerateJobs} disabled={!profile || loading}>
          {loading ? "Finding jobs..." : "Refresh Matches"}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="card-elevated p-5 h-fit">
          <h3 className="headline text-xl font-bold">Candidate Snapshot</h3>
        {profile ? (
          <div className="mt-4 text-sm space-y-3">
            <p><b>Name:</b> {profile.fullName || "-"}</p>
            <p><b>Target Role:</b> {profile.targetRole || "-"}</p>
            <p><b>Experience:</b> {profile.experienceYears || "-"}</p>
            <div>
              <p className="mb-2"><b>Skills:</b></p>
              <div className="flex flex-wrap gap-2">
                {(profile.skills || []).slice(0, 10).map((skill) => (
                  <span key={skill} className="soft-chip">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm mt-2 text-slate-300">Complete chat onboarding first.</p>
        )}
          <div className="mt-5 text-xs text-slate-400">
            {selectedJob ? `Selected: ${selectedJob.title}` : "Pick a job to continue to resume studio."}
          </div>
        </aside>

        <section className="space-y-4">
          {jobs.length === 0 ? (
            <div className="card-elevated p-7 text-slate-300 text-sm">
              No matches yet. Run job matching to fetch ranked results from Adzuna.
            </div>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                selected={selectedJob?.id === job.id}
                onSelect={onSelectJob}
              />
            ))
          )}
        </section>
      </div>
    </section>
  );
}
