export default function JobCard({ job, onSelect, selected }) {
  const salaryText = job.salaryMin && job.salaryMax
    ? `$${Math.round(job.salaryMin / 1000)}k - $${Math.round(job.salaryMax / 1000)}k`
    : "Salary not listed";

  return (
    <article className={`card-elevated p-4 sm:p-5 transition-all hover-lift ${selected ? "ring-2 ring-teal-400/70" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="headline font-bold text-xl leading-tight">{job.title}</h3>
          <p className="text-sm text-slate-300 mt-1">{job.company} • {job.location}</p>
        </div>
        <span className="rounded-full px-3 py-1 text-sm font-bold text-cyan-200 bg-cyan-900/40 border border-cyan-700/50">
          {job.fitScore ?? 0}% fit
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="soft-chip">{salaryText}</span>
        {(job.matchedKeywords || []).slice(0, 3).map((keyword) => (
          <span key={keyword} className="soft-chip">{keyword}</span>
        ))}
      </div>

      <p className="mt-4 text-sm text-slate-200">{job.reasoning || "No reasoning available."}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => onSelect(job)}>Use This Job</button>
        <a className="btn-secondary inline-flex items-center" href={job.redirectUrl} target="_blank" rel="noreferrer">View</a>
      </div>
    </article>
  );
}
