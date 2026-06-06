"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { generateCsvTemplate } from "@/lib/curriculum/cbc-template";
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, X, Eye,
  Search, Download, BookOpen, ChevronRight
} from "lucide-react";
import { colors, ds } from "@/lib/design-system";

interface LessonData {
  id: string;
  title: string;
  slug: string;
  status: string;
  strand: string;
  subStrand: string;
  learningOutcome: string;
  term: string;
  week: string;
  activityTitle: string;
  questTitle: string;
  rewardCoins: number;
  rewardStars: number;
  estimatedDurationMinutes: number;
  difficulty: string;
  createdAt: string;
  orderIndex: number;
}

interface ParsedRow {
  grade: string; subject: string; strand: string; subStrand: string;
  learningOutcome: string; lessonTitle: string; term: string; week: string;
  activityTitle: string; activityInstructions: string;
  questTitle: string; questInstructions: string;
  reflectionPrompt: string; rewardCoins: string; rewardStars: string;
  estimatedDuration: string; difficulty: string;
  valid: boolean; errors: string[]; warnings: string[]; isDuplicate: boolean;
}

interface Toast {
  id: number;
  type: "success" | "error" | "warning";
  message: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:          { label: "Content Missing", color: "#92400E", bg: "#FEF3C7" },
  content_missing:{ label: "Content Missing", color: "#92400E", bg: "#FEF3C7" },
  draft:          { label: "Draft",          color: "#1E40AF", bg: "#DBEAFE" },
  generated:      { label: "Generated",      color: "#6B21A8", bg: "#EDE9FE" },
  reviewed:       { label: "Reviewed",       color: "#0F766E", bg: "#CCFBF1" },
  published:      { label: "Published",      color: "#065F46", bg: "#D1FAE5" },
};

const SUBJECT_NAMES: Record<string, string> = {
  mathematics: "Mathematics", english: "English", kiswahili: "Kiswahili",
  science: "Science", "social-studies": "Social Studies",
  environmental: "Environmental", movement: "Movement",
  hygiene: "Hygiene & Nutrition", agriculture: "Agriculture",
  "creative-arts": "Creative Arts", "religious-education": "IRE / CRE",
  business: "Business Studies", computing: "Computing",
  literacy: "Literacy", "hygiene-nutrition": "Hygiene & Nutrition",
  "movement-creative": "Movement & Creative", ire: "IRE", hpe: "HPE",
  "pre-technical": "Pre-Technical Studies", "science-tech": "Science & Technology",
};

export default function SubjectCurriculumPage() {
  const params = useParams();
  const gradeId = Number(params.gradeId);
  const subjectSlug = params.subjectSlug as string;
  const subjectName = SUBJECT_NAMES[subjectSlug] || subjectSlug.replace(/-/g, " ");

  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ParsedRow[] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lessons state
  const [lessonResult, setLessonResult] = useState<any>(null);

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  // Load lessons
  const loadLessons = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/curriculum/lessons?gradeId=${gradeId}&subjectSlug=${subjectSlug}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setLessons(data.lessons || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [gradeId, subjectSlug]);

  useEffect(() => { loadLessons(); }, [loadLessons]);

  // Filter lessons
  const filteredLessons = lessons.filter(l => {
    const matchesSearch = !searchQuery ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.strand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.questTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.term || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.week || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || l.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // File handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreviewRows(null); setStep("upload"); }
  };

  const handlePreview = async () => {
    if (!file) return;
    setPreviewLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("action", "preview");
      fd.append("gradeId", String(gradeId));
      fd.append("subjectSlug", subjectSlug);
      const res = await fetch("/api/admin/curriculum/upload", { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Preview failed");
      setPreviewRows(data.rows);
      setStep("preview");
      if (data.invalidRows > 0) addToast("warning", `${data.invalidRows} rows have errors`);
      if (data.duplicateRows > 0) addToast("warning", `${data.duplicateRows} rows are duplicates (already imported)`);
    } catch (e: any) { addToast("error", e.message); }
    setPreviewLoading(false);
  };

  const handleConfirmImport = async () => {
    if (!previewRows) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append("action", "confirm");
      fd.append("gradeId", String(gradeId));
      fd.append("subjectSlug", subjectSlug);
      fd.append("previewData", JSON.stringify(previewRows));
      const res = await fetch("/api/admin/curriculum/upload", { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setImportResult(data);
      setStep("result");
      addToast("success", data.message || "Import successful!");
      loadLessons();
    } catch (e: any) { addToast("error", e.message); }
    setImporting(false);
  };

  const closeModal = () => {
    setShowModal(false); setFile(null); setPreviewRows(null);
    setStep("upload"); setImportResult(null);
  };

  const downloadTemplate = () => {
      const csv = generateCsvTemplate(gradeId, subjectName);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `grade-${gradeId}-${subjectSlug}-template.csv`;
      a.click(); URL.revokeObjectURL(url);
    };
  const getStatusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["DRAFT"];
    return (
      <span style={{
        display: "inline-block", padding: "2px 10px", borderRadius: 6,
        fontSize: "0.6875rem", fontWeight: 700,
        color: cfg.color, background: cfg.bg,
      }}>
        {cfg.label}
      </span>
    );
  };

  if (loading) return <div style={{ padding: "2rem", color: colors.textMuted }}>Loading curriculum...</div>;

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <Link href="/dashboard/admin/grades" style={{ color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>Grades</Link>
        <ChevronRight size={14} style={{ color: colors.textMuted }} />
        <Link href={`/dashboard/admin/grades/${gradeId}`} style={{ color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>Grade {gradeId}</Link>
        <ChevronRight size={14} style={{ color: colors.textMuted }} />
        <span style={{ color: colors.text, fontSize: "0.875rem", fontWeight: 700 }}>{subjectName}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: colors.text, margin: "0 0 4px" }}>
            Grade {gradeId} {subjectName}
          </h1>
          <p style={{ color: colors.textMuted, fontSize: "0.9375rem" }}>
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} imported
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={downloadTemplate} style={{
            padding: "9px 18px", borderRadius: 10, border: `1.5px solid ${colors.border}`,
            background: "white", color: colors.text, fontWeight: 700, fontSize: "0.8125rem",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>
            <Download size={15} /> Template
          </button>
          <button onClick={() => { setShowModal(true); setStep("upload"); setImportResult(null); setPreviewRows(null); setFile(null); }} style={{
            padding: "9px 18px", borderRadius: 10, border: "none",
            background: colors.primary, color: "#fff", fontWeight: 700, fontSize: "0.8125rem",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>
            <Upload size={15} /> Upload CSV
          </button>
        </div>
      </div>

      {/* Result banner */}
      {lessonResult && lessonResult.success && (
        <div style={{
          padding: "14px 18px", borderRadius: 12, marginBottom: "1.5rem",
          background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46",
          fontSize: "0.875rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
        }}>
          <CheckCircle2 size={18} /> {lessonResult.message}
        </div>
      )}

      {/* Empty state */}
      {lessons.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "3rem 2rem", background: "white",
          borderRadius: 16, border: `1px solid ${colors.border}`,
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text, marginBottom: "0.5rem" }}>
            No lessons imported yet
          </h3>
          <p style={{ color: colors.textMuted, fontSize: "0.875rem", maxWidth: 420, margin: "0 auto 1.5rem" }}>
            Upload a CSV file to create lesson shells for {subjectName}. You can add content to each lesson after import.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { setShowModal(true); setStep("upload"); }} style={{
              padding: "10px 22px", borderRadius: 10, border: "none",
              background: colors.primary, color: "#fff", fontWeight: 700,
              fontSize: "0.875rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <Upload size={16} /> Upload Curriculum
            </button>
            <button onClick={downloadTemplate} style={{
              padding: "10px 22px", borderRadius: 10, border: `1.5px solid ${colors.border}`,
              background: "white", color: colors.text, fontWeight: 700,
              fontSize: "0.875rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <FileSpreadsheet size={16} /> Download Template
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 360 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: colors.textMuted }} />
              <input
                type="text" placeholder="Search lessons, strands, terms..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px 9px 36px", borderRadius: 10,
                  border: `1px solid ${colors.border}`, background: "white",
                  fontSize: "0.8125rem", color: colors.text, outline: "none",
                }}
              />
            </div>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} style={{
              padding: "9px 12px", borderRadius: 10, border: `1px solid ${colors.border}`,
              background: "white", fontSize: "0.8125rem", color: colors.text, cursor: "pointer",
            }}>
              <option value="all">All Status</option>
              <option value="DRAFT">Content Missing</option>
              <option value="draft">Draft</option>
              <option value="generated">Generated</option>
              <option value="reviewed">Reviewed</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Lesson table */}
          <div style={{ background: "white", borderRadius: 14, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: `1px solid ${colors.border}` }}>
                    {["#", "Lesson", "Strand", "Term", "Week", "Quest", "Status", "Coins", ""].map(h => (
                      <th key={h} style={{
                        padding: "10px 14px", textAlign: "left", fontWeight: 700,
                        color: colors.text, whiteSpace: "nowrap", fontSize: "0.75rem",
                        textTransform: "uppercase", letterSpacing: "0.04em",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLessons.map((l, i) => (
                    <tr key={l.id} style={{
                      borderBottom: "1px solid #F1F5F9",
                      background: i % 2 === 0 ? "white" : "#FAFBFC",
                    }}>
                      <td style={{ padding: "10px 14px", color: colors.textMuted, fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ fontWeight: 700, color: colors.text }}>{l.title}</div>
                        {l.learningOutcome && (
                          <div style={{ color: colors.textMuted, fontSize: "0.75rem", marginTop: 2 }}>
                            {l.learningOutcome.slice(0, 60)}{l.learningOutcome.length > 60 ? "…" : ""}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "10px 14px", color: colors.text }}>{l.strand || "—"}</td>
                      <td style={{ padding: "10px 14px", color: colors.textMuted }}>{l.term || "—"}</td>
                      <td style={{ padding: "10px 14px", color: colors.textMuted }}>{l.week || "—"}</td>
                      <td style={{ padding: "10px 14px", color: colors.textMuted }}>{l.questTitle || "—"}</td>
                      <td style={{ padding: "10px 14px" }}>{getStatusBadge(l.status)}</td>
                      <td style={{ padding: "10px 14px", color: colors.textMuted, fontWeight: 600 }}>🪙 {l.rewardCoins}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <Link href={`/dashboard/admin/lessons/${l.id}`} style={{
                          padding: "4px 10px", borderRadius: 6, border: `1px solid ${colors.border}`,
                          background: "white", color: colors.textMuted, fontSize: "0.75rem",
                          cursor: "pointer", fontWeight: 600, textDecoration: "none", display: "inline-block",
                        }}>Edit</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredLessons.length === 0 && (
              <div style={{ padding: "2rem", textAlign: "center", color: colors.textMuted, fontSize: "0.875rem" }}>
                No lessons match your search.
              </div>
            )}
            <div style={{ padding: "10px 14px", borderTop: `1px solid ${colors.border}`, background: "#F8FAFC", fontSize: "0.75rem", color: colors.textMuted }}>
              Showing {filteredLessons.length} of {lessons.length} lessons
            </div>
          </div>
        </>
      )}

      {/* ═══ IMPORT MODAL ═══ */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }} onClick={closeModal}>
          <div style={{
            background: "white", borderRadius: 20, width: "100%", maxWidth: 860,
            maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
          }} onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{
              padding: "18px 24px", borderBottom: `1px solid ${colors.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FileSpreadsheet size={22} style={{ color: colors.primary }} />
                <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text, margin: 0 }}>
                  {step === "upload" && "Upload Curriculum"}
                  {step === "preview" && "Preview Import"}
                  {step === "result" && "Import Complete"}
                </h2>
              </div>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <X size={20} style={{ color: colors.textMuted }} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "24px", overflowY: "auto", flex: 1, minHeight: 0 }}>

              {/* Step: Upload */}
              {step === "upload" && (
                <>
                  <div style={{
                    border: `2px dashed ${colors.border}`, borderRadius: 16,
                    padding: "2.5rem 2rem", textAlign: "center", marginBottom: 20,
                    background: file ? "#ECFDF5" : "#FAFAFA",
                  }}>
                    <input ref={fileInputRef} type="file" accept=".csv"
                      onChange={handleFileSelect} style={{ display: "none" }} />
                    {file ? (
                      <>
                        <CheckCircle2 size={36} style={{ color: "#059669", margin: "0 auto 10px" }} />
                        <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: colors.text, margin: "0 0 4px" }}>{file.name}</p>
                        <p style={{ fontSize: "0.8125rem", color: colors.textMuted, margin: "0 0 14px" }}>{(file.size / 1024).toFixed(1)} KB</p>
                        <button onClick={() => fileInputRef.current?.click()} style={{
                          padding: "7px 16px", borderRadius: 8, border: `1px solid ${colors.border}`,
                          background: "white", color: colors.text, fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer",
                        }}>Change file</button>
                      </>
                    ) : (
                      <>
                        <Upload size={36} style={{ color: colors.textMuted, margin: "0 auto 10px", opacity: 0.4 }} />
                        <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: colors.text, margin: "0 0 4px" }}>
                          Drop your CSV file here
                        </p>
                        <p style={{ fontSize: "0.8125rem", color: colors.textMuted, margin: "0 0 14px" }}>
                          or click to browse · .csv files only
                        </p>
                        <button onClick={() => fileInputRef.current?.click()} style={{
                          padding: "9px 24px", borderRadius: 10, border: "none",
                          background: colors.primary, color: "#fff", fontWeight: 700,
                          fontSize: "0.875rem", cursor: "pointer",
                        }}>Choose File</button>
                      </>
                    )}
                  </div>

                  <div style={{
                    padding: "14px 16px", borderRadius: 12, background: "#F8FAFC",
                    border: "1px solid #E2E8F0", marginBottom: 16,
                  }}>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: colors.text, margin: "0 0 8px" }}>
                      Required columns: <code style={{ background: "#E2E8F0", padding: "1px 6px", borderRadius: 4, fontSize: "0.75rem" }}>lesson_title</code>
                    </p>
                    <p style={{ fontSize: "0.75rem", color: colors.textMuted, margin: "0 0 6px" }}>
                      <strong style={{ color: colors.text }}>Optional:</strong> grade, subject, strand, sub_strand, learning_outcome, term, week, activity_title, activity_instructions, quest_title, quest_instructions, reflection_prompt, reward_coins, reward_stars, estimated_duration, difficulty
                    </p>
                    <p style={{ fontSize: "0.75rem", color: colors.textMuted, margin: 0 }}>
                      💡 Download the template below for the correct format.
                    </p>
                  </div>

                  <button onClick={downloadTemplate} style={{
                    padding: "8px 16px", borderRadius: 8, border: `1px solid ${colors.border}`,
                    background: "white", color: colors.text, fontWeight: 600, fontSize: "0.8125rem",
                    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                  }}>
                    <Download size={14} /> Download Sample Template
                  </button>
                </>
              )}

              {/* Step: Preview */}
              {step === "preview" && previewRows && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Eye size={18} style={{ color: colors.primary }} />
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, color: colors.text, margin: 0 }}>
                      Preview — {previewRows.length} rows
                    </h3>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#059669", background: "#ECFDF5", padding: "2px 8px", borderRadius: 6 }}>
                      {previewRows.filter(r => r.valid && !r.isDuplicate).length} valid
                    </span>
                    {previewRows.filter(r => !r.valid).length > 0 && (
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#DC2626", background: "#FEF2F2", padding: "2px 8px", borderRadius: 6 }}>
                        {previewRows.filter(r => !r.valid).length} errors
                      </span>
                    )}
                    {previewRows.filter(r => r.isDuplicate).length > 0 && (
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#D97706", background: "#FEF3C7", padding: "2px 8px", borderRadius: 6 }}>
                        {previewRows.filter(r => r.isDuplicate).length} duplicates
                      </span>
                    )}
                    {previewRows.filter(r => r.warnings.length > 0 && r.valid && !r.isDuplicate).length > 0 && (
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#D97706", background: "#FEF3C7", padding: "2px 8px", borderRadius: 6 }}>
                        {previewRows.filter(r => r.warnings.length > 0 && r.valid && !r.isDuplicate).length} warnings
                      </span>
                    )}
                  </div>

                  <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${colors.border}`, maxHeight: 400 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                      <thead>
                        <tr style={{ background: "#F8FAFC", position: "sticky", top: 0 }}>
                          {["#", "Grade", "Subject", "Strand", "Sub-strand", "Lesson Title", "Term", "Week", "Quest", "Status"].map(h => (
                            <th key={h} style={{
                              padding: "10px 12px", textAlign: "left", fontWeight: 700,
                              color: colors.text, borderBottom: `1px solid ${colors.border}`,
                              whiteSpace: "nowrap",
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => (
                          <tr key={i} style={{
                            background: !row.valid ? "#FEF2F2" : row.isDuplicate ? "#FEF3C7" : row.warnings.length > 0 ? "#FFFBEB" : "white",
                            borderBottom: "1px solid #F1F5F9",
                          }}>
                            <td style={{ padding: "8px 12px", color: colors.textMuted }}>{i + 1}</td>
                            <td style={{ padding: "8px 12px", color: row.grade ? colors.text : "#DC2626", fontWeight: row.grade ? 500 : 700 }}>{row.grade || "—"}</td>
                            <td style={{ padding: "8px 12px", color: colors.text }}>{row.subject || "(page subject)"}</td>
                            <td style={{ padding: "8px 12px", color: colors.text }}>{row.strand || "—"}</td>
                            <td style={{ padding: "8px 12px", color: colors.text }}>{row.subStrand || "—"}</td>
                            <td style={{ padding: "8px 12px", color: row.lessonTitle ? colors.text : "#DC2626", fontWeight: row.lessonTitle ? 500 : 700 }}>{row.lessonTitle || "MISSING"}</td>
                            <td style={{ padding: "8px 12px", color: colors.textMuted }}>{row.term || "—"}</td>
                            <td style={{ padding: "8px 12px", color: colors.textMuted }}>{row.week || "—"}</td>
                            <td style={{ padding: "8px 12px", color: colors.textMuted }}>{row.questTitle || "—"}</td>
                            <td style={{ padding: "8px 12px" }}>
                              {row.valid ? (
                                row.isDuplicate ? (
                                  <span style={{ color: "#D97706", fontWeight: 700 }} title={row.warnings.join(", ")}>
                                    🔄 Duplicate
                                  </span>
                                ) : (
                                  <span style={{ color: "#059669", fontWeight: 700 }}>✓ Valid</span>
                                )
                              ) : (
                                <span style={{ color: "#DC2626", fontWeight: 700 }} title={row.errors.join(", ")}>
                                  ⚠ {row.errors[0]}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Step: Result */}
              {step === "result" && importResult && (
                <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                  <CheckCircle48 size={48} style={{ color: "#059669", margin: "0 auto 16px" }} />
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.text, marginBottom: "0.75rem" }}>
                    Import Successful!
                  </h3>
                  <p style={{ color: colors.textMuted, fontSize: "0.9375rem", marginBottom: "1.5rem" }}>
                    {importResult.message}
                  </p>
                  {importResult.summary && (
                    <div style={{
                      display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
                      maxWidth: 480, margin: "0 auto 1.5rem",
                    }}>
                      {[
                        { label: "Modules", val: importResult.summary.themesCreated },
                        { label: "Quests", val: importResult.summary.questsCreated },
                        { label: "Lessons", val: importResult.summary.lessonsCreated },
                      ].map(s => (
                        <div key={s.label} style={{
                          padding: "14px", borderRadius: 12, background: "#F8FAFC",
                          border: `1px solid ${colors.border}`,
                        }}>
                          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: colors.text }}>+{s.val}</div>
                          <div style={{ fontSize: "0.75rem", color: colors.textMuted, fontWeight: 700 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div style={{
                      padding: "12px 16px", borderRadius: 10, background: "#FEF2F2",
                      border: "1px solid #FECACA", fontSize: "0.75rem", color: "#991B1B",
                      textAlign: "left", maxWidth: 480, margin: "0 auto 1.5rem",
                    }}>
                      <strong>Warnings:</strong>
                      {importResult.errors.slice(0, 5).map((e: string, i: number) => (
                        <div key={i} style={{ marginTop: 4 }}>• {e}</div>
                      ))}
                      {importResult.errors.length > 5 && (
                        <div style={{ marginTop: 4, fontWeight: 600 }}>+{importResult.errors.length - 5} more</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div style={{
              padding: "16px 24px", borderTop: `1px solid ${colors.border}`,
              display: "flex", justifyContent: "flex-end", gap: 10,
            }}>
              {step === "upload" && (
                <>
                  <button onClick={closeModal} style={{
                    padding: "10px 20px", borderRadius: 10, border: `1px solid ${colors.border}`,
                    background: "white", color: colors.text, fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer",
                  }}>Cancel</button>
                  <button onClick={handlePreview} disabled={!file || previewLoading} style={{
                    padding: "10px 20px", borderRadius: 10, border: "none",
                    background: colors.primary, color: "#fff", fontWeight: 700,
                    fontSize: "0.8125rem", cursor: file && !previewLoading ? "pointer" : "default",
                    opacity: !file || previewLoading ? 0.5 : 1, display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {previewLoading ? "Parsing..." : <><Eye size={14} /> Preview</>}
                  </button>
                </>
              )}
              {step === "preview" && (
                <>
                  <button onClick={() => setStep("upload")} style={{
                    padding: "10px 20px", borderRadius: 10, border: `1px solid ${colors.border}`,
                    background: "white", color: colors.text, fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer",
                  }}>← Back</button>
                  <button onClick={handleConfirmImport} disabled={importing || previewRows!.filter(r => r.valid && !r.isDuplicate).length === 0} style={{
                    padding: "10px 20px", borderRadius: 10, border: "none",
                    background: colors.primary, color: "#fff", fontWeight: 700,
                    fontSize: "0.8125rem", cursor: !importing && previewRows!.filter(r => r.valid && !r.isDuplicate).length > 0 ? "pointer" : "default",
                    opacity: importing || previewRows!.filter(r => r.valid && !r.isDuplicate).length === 0 ? 0.5 : 1, display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {importing ? "Importing..." : <><CheckCircle2 size={14} /> Import {previewRows!.filter(r => r.valid && !r.isDuplicate).length} Rows</>}
                  </button>
                </>
              )}
              {step === "result" && (
                <button onClick={closeModal} style={{
                  padding: "10px 24px", borderRadius: 10, border: "none",
                  background: colors.primary, color: "#fff", fontWeight: 700,
                  fontSize: "0.8125rem", cursor: "pointer",
                }}>Done</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            padding: "12px 18px", borderRadius: 12, fontSize: "0.875rem", fontWeight: 600,
            color: toast.type === "success" ? "#065F46" : toast.type === "error" ? "#991B1B" : "#92400E",
            background: toast.type === "success" ? "#D1FAE5" : toast.type === "error" ? "#FECACA" : "#FEF3C7",
            border: `1px solid ${toast.type === "success" ? "#A7F3D0" : toast.type === "error" ? "#FCA5A5" : "#FDE68A"}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            display: "flex", alignItems: "center", gap: 8,
            animation: "slideIn 0.2s ease",
          }}>
            {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {toast.message}
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, marginLeft: 8 }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}

// Fix: CheckCircle2 icon reference in result step
function CheckCircle48({ size, style }: { size: number; style?: any }) {
  return <CheckCircle2 size={size} style={style} />;
}
