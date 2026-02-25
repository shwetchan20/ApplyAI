import jsPDF from "jspdf";
import CoverLetter from "./CoverLetter.jsx";

export default function ResumePreview({ resume, selectedJob, onGenerateResume, loadingResume, atsScore, coverLetter, onGenerateCoverLetter, loadingCoverLetter }) {
  const downloadPdf = () => {
    if (!resume) return;
    const doc = new jsPDF();
    let y = 12;
    const push = (text, size = 11, gap = 7) => {
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(String(text || ""), 180);
      doc.text(lines, 15, y);
      y += lines.length * gap;
    };

    push(resume.name || "Candidate", 16, 8);
    push(resume.contact || "", 10, 6);
    y += 3;
    push("Summary", 13, 7);
    push(resume.summary || "", 11, 6);
    y += 2;
    push("Skills", 13, 7);
    push((resume.skills || []).join(", "), 11, 6);
    y += 2;
    push("Experience", 13, 7);
    (resume.experienceBullets || []).forEach((b) => push(`- ${b}`, 11, 6));
    y += 2;
    push("Projects", 13, 7);
    (resume.projects || []).forEach((p) => push(`- ${p}`, 11, 6));
    y += 2;
    push("Education", 13, 7);
    (resume.education || []).forEach((e) => push(`- ${e}`, 11, 6));
    doc.save("applyai_resume.pdf");
  };

  return (
    <section className="space-y-4 fade-in-up">
      <div className="card-elevated p-4 sm:p-5">
        <p className="soft-chip mb-2">Step 3 of 3</p>
        <h2 className="headline text-2xl font-bold">Resume Studio</h2>
        <p className="text-sm text-slate-300 mt-1">
          Generate ATS-tailored resume and personalized cover letter for your selected match.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <h3 className="headline text-xl font-bold">Resume Preview</h3>
            <div className="soft-chip">ATS Score: {atsScore}%</div>
          </div>
          <p className="text-sm text-slate-300 mt-1">Selected Job: {selectedJob ? `${selectedJob.title} @ ${selectedJob.company}` : "None"}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary" onClick={onGenerateResume} disabled={!selectedJob || loadingResume}>
              {loadingResume ? "Generating..." : "Generate Tailored Resume"}
            </button>
            <button className="btn-secondary" onClick={downloadPdf} disabled={!resume}>Download PDF</button>
          </div>

          <textarea
            className="field mt-4 min-h-[430px] leading-relaxed"
            readOnly
            value={
              resume
                ? `${resume.name || ""}\n${resume.contact || ""}\n\nSUMMARY\n${resume.summary || ""}\n\nSKILLS\n${(resume.skills || []).join(", ")}\n\nEXPERIENCE\n${(resume.experienceBullets || []).map((b) => `- ${b}`).join("\n")}\n\nPROJECTS\n${(resume.projects || []).map((p) => `- ${p}`).join("\n")}\n\nEDUCATION\n${(resume.education || []).map((e) => `- ${e}`).join("\n")}`
                : "Generate resume after selecting a job from dashboard."
            }
          />
        </section>

        <CoverLetter
          content={coverLetter}
          onGenerate={onGenerateCoverLetter}
          loading={loadingCoverLetter}
        />
      </div>
    </section>
  );
}
