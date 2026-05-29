"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Upload, ArrowLeft, AlertCircle, CheckCircle, Download, FileSpreadsheet,
  Loader2, BookOpen, Layers, X, Coins
} from "lucide-react";
import { ds, colors } from "@/lib/design-system";

type Step = "upload" | "preview" | "importing" | "report";

interface ParsedData {
  levels: number;
  subjects: number;
  weeks: number;
  quests: number;
  lessons: number;
  questLessonLinks: number;
  errors: string[];
  duplicates: number;
  toCreate: number;
}

interface ImportReport {
  success: boolean;
  message: string;
  created: Record<string, number>;
  skipped: number;
  errors: string[];
}

export default function AdminCurriculumImportPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (!data?.user || (data.user.role !== "ADMIN" && data.user.role !== "admin")) {
          window.location.replace("/auth/login");
          return;
        }
        setUser(data.user);
      } catch { window.location.replace("/auth/login"); }
      finally { setLoading(false); }
    }
    check();
  }, []);

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
      setFeedback({ type: "error", text: "Please upload an Excel file (.xlsx or .xls)" });
      return;
    }
    setFile(f);
    setFeedback(null);
    setParsed(null);
    setReport(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  async function handleDownloadTemplate() {
    // Generate a simple CSV template
    const csvContent = `level,subject,strand,substrand,week,lesson_order,lesson_slug,lesson_title,lesson_summary,lesson_content,activity_instructions,question_1,answer_1,xp_reward,status
2,Mathematics,Number Sense,Counting,1,1,counting-ones,Counting by Ones,Learn to count from 1 to 100,"Count from 1 to 100 by ones. Practice saying each number.",Count objects in groups of 1,What comes after 50?,51,10,draft
2,Mathematics,Number Sense,Counting,1,2,counting-tens,Counting by Tens,Count by 10s,"Count by 10s: 10, 20, 30... 100",Skip count by 10s on a number line,How many tens in 100?,10,10,draft`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "curriculum_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleUpload() {
    if (!file) return;
    setStep("preview");
    setFeedback(null);

    try {
      // For now, we parse on the server side
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/curriculum/preview", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setParsed(data as ParsedData);
        if ((data as ParsedData).errors?.length > 0) {
          setFeedback({ type: "error", text: `Found ${(data as ParsedData).errors.length.IMPORTERROR} error(s). Please fix before importing.` });
        }
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to parse file" });
        setStep("upload");
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "Failed to upload file" });
      setStep("upload");
    }
  }

  async function handleImport() {
    if (!file) return;
    setStep("importing");
    setImporting(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/curriculum/import", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      setReport(data as ImportReport);
      setStep("report");

      if (data.success) {
        setFeedback({ type: "success", text: "Import completed successfully!" });
      } else {
        setFeedback({ type: "error", text: data.error || "Import completed with errors" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "Import failed" });
      setStep("preview");
    } finally {
      setImporting(false);
    }
  }

  function handleReset() {
    setFile(null);
    setStep("upload");
    setFeedback(null);
    setParsed(null);
    setReport(null);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
        <p style={{ color: colors.textMuted }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Link href="/dashboard/admin" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: colors.textMuted, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Admin Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", borderRadius: 8, border: `1px solid ${colors.border}`, background: "none", color: colors.textMuted, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
            Sign Out
          </button>
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text, marginBottom: "0.25rem" }}>Curriculum Import</h1>
        <p style={{ color: colors.textMuted, marginBottom: "2rem" }}>Upload Excel files to bulk-import lessons, quests, and curriculum structure.</p>

        {feedback && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1.5rem", background: feedback.type === "success" ? `${colors.success}10` : `${colors.warning || "#EF4444"}10`, color: feedback.type === "success" ? colors.success : "#DC2626", fontSize: "0.875rem", fontWeight: 600 }}>
            {feedback.type === "success" ? <CheckCircle style={{ width: 16, height: 16 }} /> : <AlertCircle style={{ width: 16, height: 16 }} />}
            {feedback.text}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === "upload" && (
          <>
            {/* Download Template */}
            <button onClick={handleDownloadTemplate} style={{ ...ds.btnSecondary, marginBottom: "1.5rem", fontSize: "0.875rem" }}>
              <Download style={{ width: 14, height: 14 }} /> Download Template (CSV)
            </button>

            {/* Upload Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                ...ds.card,
                padding: "2rem",
                textAlign: "center",
                border: `2px dashed ${dragOver ? colors.primary : colors.border}`,
                background: dragOver ? `${colors.primary}05` : "white",
                transition: "all 0.2s",
                marginBottom: "1.5rem",
              }}
            >
              <Upload style={{ width: 48, height: 48, color: colors.textMuted, margin: "0 auto 1rem", opacity: 0.5 }} />
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>
                {file ? file.name : "Drop your Excel file here"}
              </h3>
              <p style={{ color: colors.textMuted, fontSize: "0.875rem", marginBottom: "1rem" }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "or click to browse (.xlsx, .xls, .csv)"}
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                style={{ display: "none" }}
                id="file-input"
              />
              <label htmlFor="file-input" style={{ ...ds.btnPrimary, fontSize: "0.875rem", cursor: "pointer" }}>
                <FileSpreadsheet style={{ width: 14, height: 14 }} /> Choose File
              </label>
            </div>

            {file && (
              <button onClick={handleUpload} style={{ ...ds.btnPrimary, fontSize: "0.9375rem", padding: "0.75rem 2rem" }}>
                <Upload style={{ width: 16, height: 16 }} /> Upload & Preview
              </button>
            )}
          </>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && parsed && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Levels", value: parsed.levels, icon: BookOpen },
                { label: "Subjects", value: parsed.subjects, icon: Layers },
                { label: "Weeks", value: parsed.weeks, icon: BookOpen },
                { label: "Quests", value: parsed.quests, icon: Layers },
                { label: "Lessons", value: parsed.lessons, icon: BookOpen },
                { label: "Links", value: parsed.questLessonLinks, icon: Coins },
              ].map((item) => (
                <div key={item.label} style={{ ...ds.card, padding: "1rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.text }}>{item.value}</div>
                  <div style={{ fontSize: "0.75rem", color: colors.textMuted, fontWeight: 600 }}>{item.label}</div>
                </div>
              ))}
            </div>

            {parsed.errors.length > 0 && (
              <div style={{ ...ds.alertError, marginBottom: "1.5rem" }}>
                <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>{parsed.errors.length} validation error(s):</strong>
                  <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.25rem", fontSize: "0.8125rem" }}>
                    {parsed.errors.slice(0, 10).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {parsed.errors.length > 10 && <li>...and {parsed.errors.length - 10} more</li>}
                  </ul>
                </div>
              </div>
            )}

            {parsed.duplicates > 0 && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1.5rem", background: `${colors.warning}10`, border: `1px solid ${colors.warning}30`, color: colors.warning, fontSize: "0.875rem", fontWeight: 600 }}>
                {parsed.duplicates} records already exist and will be skipped.
              </div>
            )}

            {parsed.toCreate > 0 && !importing && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1.5rem", background: `${colors.success}10`, border: `1px solid ${colors.success}30`, color: colors.success, fontSize: "0.875rem", fontWeight: 600 }}>
                {parsed.toCreate} new records will be created as DRAFT.
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={handleImport} disabled={parsed.errors.length > 0 || importing} style={{ ...ds.btnPrimary, fontSize: "0.9375rem", padding: "0.75rem 2rem", opacity: parsed.errors.length > 0 ? 0.5 : 1 }}>
                <CheckCircle style={{ width: 16, height: 16 }} /> Confirm Import
              </button>
              <button onClick={handleReset} style={{ ...ds.btnSecondary, fontSize: "0.9375rem" }}>
                <X style={{ width: 16, height: 16 }} /> Cancel
              </button>
            </div>
          </>
        )}

        {/* Step 3: Importing */}
        {step === "importing" && (
          <div style={{ ...ds.card, textAlign: "center", padding: "3rem 2rem" }}>
            <Loader2 style={{ width: 48, height: 48, color: colors.primary, margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.text, marginBottom: "0.5rem" }}>Importing curriculum...</h3>
            <p style={{ color: colors.textMuted }}>This may take a moment. Please don't close this page.</p>
          </div>
        )}

        {/* Step 4: Report */}
        {step === "report" && report && (
          <div style={{ ...ds.card, padding: "2rem" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: report.success ? `${colors.success}15` : `${colors.warning}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                {report.success ? <CheckCircle style={{ width: 32, height: 32, color: colors.success }} /> : <AlertCircle style={{ width: 32, height: 32, color: colors.warning }} />}
              </div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: colors.text, marginBottom: "0.5rem" }}>
                {report.success ? "Import Complete!" : "Import Finished with Issues"}
              </h2>
              <p style={{ color: colors.textMuted }}>{report.message}</p>
            </div>

            {report.created && Object.keys(report.created).length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                {Object.entries(report.created).map(([key, val]) => (
                  <div key={key} style={{ padding: "1rem", borderRadius: 12, background: colors.bgSoft, textAlign: "center" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: colors.text }}>{val}</div>
                    <div style={{ fontSize: "0.75rem", color: colors.textMuted, fontWeight: 600 }}>{key}</div>
                  </div>
                ))}
              </div>
            )}

            {report.skipped > 0 && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1.5rem", background: colors.bgSoft, fontSize: "0.875rem", color: colors.textMuted, fontWeight: 600 }}>
                Skipped {report.skipped} existing records
              </div>
            )}

            {report.errors?.length > 0 && (
              <div style={{ ...ds.alertError, marginBottom: "1.5rem" }}>
                <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>{report.errors.length} error(s):</strong>
                  <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.25rem", fontSize: "0.8125rem" }}>
                    {report.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href="/dashboard/admin/lessons" style={{ ...ds.btnPrimary, fontSize: "0.875rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <BookOpen style={{ width: 14, height: 14 }} /> View Lessons
              </Link>
              <Link href="/dashboard/admin/quests" style={{ ...ds.btnSecondary, fontSize: "0.875rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <Layers style={{ width: 14, height: 14 }} /> View Quests
              </Link>
              <Link href="/dashboard/admin" style={{ ...ds.btnGhost, fontSize: "0.875rem", textDecoration: "none" }}>
                Go to Admin Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
