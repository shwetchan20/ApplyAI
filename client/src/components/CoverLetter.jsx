export default function CoverLetter({ content, onGenerate, loading }) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between">
        <h3 className="headline text-xl font-bold">Cover Letter</h3>
        <button className="btn-secondary" onClick={onGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
      <textarea
        className="field mt-4 min-h-[510px] leading-relaxed"
        value={content}
        readOnly
        placeholder="Generate a personalized cover letter for selected job..."
      />
    </div>
  );
}
