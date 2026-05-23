"use client";

import { cn } from "@/lib/utils/cn";
import { FileText, Play, Image, FlaskConical, BookOpen, HelpCircle, CheckCircle2, XCircle } from "lucide-react";

interface ContentBlockData {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

interface ContentBlockProps {
  block: ContentBlockData;
  className?: string;
}

const blockIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  text: FileText,
  video: Play,
  image: Image,
  experiment: FlaskConical,
  journal: BookOpen,
  quiz: HelpCircle,
};

const blockLabels: Record<string, string> = {
  text: "Reading",
  video: "Video",
  image: "Image",
  experiment: "Experiment",
  journal: "Journal",
  quiz: "Quiz",
};

const blockColors: Record<string, string> = {
  text: "bg-primary/10 text-primary",
  video: "bg-red-100 text-red-700",
  image: "bg-green-100 text-green-700",
  experiment: "bg-amber-100 text-amber-700",
  journal: "bg-purple-100 text-purple-700",
  quiz: "bg-blue-100 text-blue-700",
};

function BlockHeader({ type }: { type: string }) {
  const Icon = blockIcons[type] || FileText;
  const label = blockLabels[type] || type;
  const color = blockColors[type] || "bg-surface-sunken text-text-muted";

  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-0.5", color)}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    </div>
  );
}

function TextBlock({ data }: { data: Record<string, unknown> }) {
  const content = (data.content as string) || "";
  const paragraphs = content.split("\n\n");

  return (
    <div className="prose prose-sm max-w-none">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-text-muted leading-relaxed mb-3 last:mb-0">
          {p}
        </p>
      ))}
    </div>
  );
}

function VideoBlock({ data }: { data: Record<string, unknown> }) {
  const url = (data.url as string) || "";
  const caption = (data.caption as string) || "";

  // Handle YouTube/Vimeo embeds
  const getEmbedUrl = (url: string) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  return (
    <div className="space-y-3">
      {url && (
        <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={getEmbedUrl(url)}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video content"
          />
        </div>
      )}
      {caption && <p className="text-xs text-text-muted italic">{caption}</p>}
    </div>
  );
}

function ImageBlock({ data }: { data: Record<string, unknown> }) {
  const url = (data.url as string) || "";
  const caption = (data.caption as string) || "";

  return (
    <div className="space-y-2">
      {url && (
        <img
          src={url}
          alt={caption || "Content image"}
          className="w-full rounded-xl object-cover max-h-96"
        />
      )}
      {caption && <p className="text-xs text-text-muted italic text-center">{caption}</p>}
    </div>
  );
}

function ExperimentBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "Experiment";
  const materials = (data.materials as any[]) || [];
  const tools = (data.tools as any[]) || [];
  const steps = (data.steps as string[]) || (data.procedureSteps as any[]) || [];
  const safetyNotes = (data.safetyNotes as string[]) || [];

  return (
    <div className="space-y-4">
      {/* Materials */}
      {materials.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text mb-2">🧪 Materials</h4>
          <ul className="space-y-1.5">
            {materials.map((m: any, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                <span>
                  {typeof m === "string" ? m : `${m.item}${m.quantity ? ` — ${m.quantity}` : ""}${m.notes ? ` (${m.notes})` : ""}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tools */}
      {tools.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text mb-2">🔧 Tools</h4>
          <ul className="space-y-1.5">
            {tools.map((t: any, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>{typeof t === "string" ? t : `${t.tool}${t.quantity ? ` ×${t.quantity}` : ""}`}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text mb-2">📋 Steps</h4>
          <ol className="space-y-3">
            {steps.map((s: any, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-text-muted pt-0.5">
                  {typeof s === "string" ? s : s.description || s}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Safety */}
      {safetyNotes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <h4 className="text-sm font-semibold text-amber-800 mb-1">⚠️ Safety</h4>
          {safetyNotes.map((note, i) => (
            <p key={i} className="text-xs text-amber-700">{note}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function JournalBlock({ data }: { data: Record<string, unknown> }) {
  const prompt = (data.prompt as string) || "Write your reflection...";
  const placeholder = (data.placeholder as string) || "Start writing...";

  return (
    <div className="space-y-3">
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <p className="text-sm font-medium text-purple-800">{prompt}</p>
      </div>
      <textarea
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
      />
      <div className="flex justify-end">
        <button className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
          Save Reflection →
        </button>
      </div>
    </div>
  );
}

function QuizBlock({ data }: { data: Record<string, unknown> }) {
  const question = (data.question as string) || "";
  const options = (data.options as string[]) || [];
  const correctIndex = data.correctIndex as number | undefined;
  const explanation = (data.explanation as string) || "";

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-text">{question}</p>
      <div className="space-y-2">
        {options.map((option, i) => (
          <button
            key={i}
            className="w-full text-left rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted hover:border-primary hover:bg-primary/5 transition-all"
          >
            <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Renderer ────────────────────────────────────────────

export function ContentBlock({ block, className }: ContentBlockProps) {
  const renderBlock = () => {
    switch (block.type) {
      case "text":
        return <TextBlock data={block.data} />;
      case "video":
        return <VideoBlock data={block.data} />;
      case "image":
        return <ImageBlock data={block.data} />;
      case "experiment":
        return <ExperimentBlock data={block.data} />;
      case "journal":
        return <JournalBlock data={block.data} />;
      case "quiz":
        return <QuizBlock data={block.data} />;
      default:
        return (
          <div className="text-sm text-text-muted italic">
            Unsupported block type: {block.type}
          </div>
        );
    }
  };

  return (
    <div className={cn("bg-surface-raised rounded-2xl border border-border p-5", className)}>
      <BlockHeader type={block.type} />
      {renderBlock()}
    </div>
  );
}

export function ContentBlockList({ blocks, className }: { blocks: ContentBlockData[]; className?: string }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="bg-surface-raised rounded-2xl border border-border p-8 text-center">
        <p className="text-text-muted">No content blocks in this lesson yet.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {blocks.map((block) => (
        <ContentBlock key={block.id} block={block} />
      ))}
    </div>
  );
}
