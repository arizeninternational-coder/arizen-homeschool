// ─────────────────────────────────────────────────────────────────────────────
// Content Block Architecture — Types & Utilities
// ─────────────────────────────────────────────────────────────────────────────
// Separates lesson content from lesson rendering.
// Each step in a journey contains ordered content blocks.
// The lesson player renders blocks dynamically based on type.
// ─────────────────────────────────────────────────────────────────────────────

export type ContentBlockType =
  | "text"
  | "image"
  | "video"
  | "callout"
  | "hint"
  | "example"
  | "activity"
  | "question"
  | "reflection"
  | "reward"
  | "divider";

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: string;
  metadata?: Record<string, any>;
}

export interface TextBlock extends ContentBlock {
  type: "text";
  content: string;
}

export interface ImageBlock extends ContentBlock {
  type: "image";
  content: string; // URL or base64
  altText?: string;
  caption?: string;
}

export interface VideoBlock extends ContentBlock {
  type: "video";
  content: string; // YouTube URL or uploaded video URL
  title?: string;
  provider?: "youtube" | "upload";
}

export interface CalloutBlock extends ContentBlock {
  type: "callout";
  content: string;
  variant?: "info" | "warning" | "success" | "tip";
}

export interface HintBlock extends ContentBlock {
  type: "hint";
  content: string;
}

export interface ExampleBlock extends ContentBlock {
  type: "example";
  content: string;
  title?: string;
}

export interface ActivityBlock extends ContentBlock {
  type: "activity";
  content: string;
  title?: string;
  materials?: string[];
}

export interface QuestionBlock extends ContentBlock {
  type: "question";
  content: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
}

export interface ReflectionBlock extends ContentBlock {
  type: "reflection";
  content: string;
  prompts?: string[];
}

export interface RewardBlock extends ContentBlock {
  type: "reward";
  content: string;
  xp?: number;
  coins?: number;
}

export interface DividerBlock extends ContentBlock {
  type: "divider";
  content: string;
}

// ── Journey Step with Content Blocks ─────────────────────────────────────────

export interface JourneyStepBlocks {
  id: string;
  stepType: string;
  title: string;
  owlText: string;
  blocks: ContentBlock[];
  interaction?: {
    type: string;
    question?: string;
    options?: string[];
    correctAnswer?: number;
    hint?: string;
  };
  media?: {
    illustration?: {
      url: string | null;
      altText: string;
      status: string;
    };
    video?: {
      url: string | null;
      title: string;
      status: string;
    };
  };
  materials?: string[];
  estimatedMinutes?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function createBlock(type: ContentBlockType, content: string = ""): ContentBlock {
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    content,
  };
}

export function createTextBlock(content: string = ""): TextBlock {
  return { ...createBlock("text", content), type: "text" };
}

export function createImageBlock(url: string = "", altText: string = ""): ImageBlock {
  return { ...createBlock("image", url), type: "image", altText };
}

export function createVideoBlock(url: string = "", title: string = ""): VideoBlock {
  return { ...createBlock("video", url), type: "video", title };
}

export function createCalloutBlock(content: string = "", variant: "info" | "warning" | "success" | "tip" = "info"): CalloutBlock {
  return { ...createBlock("callout", content), type: "callout", variant };
}

export function createHintBlock(content: string = ""): HintBlock {
  return { ...createBlock("hint", content), type: "hint" };
}

export function createExampleBlock(content: string = "", title: string = ""): ExampleBlock {
  return { ...createBlock("example", content), type: "example", title };
}

export function createActivityBlock(content: string = "", title: string = ""): ActivityBlock {
  return { ...createBlock("activity", content), type: "activity", title };
}

export function createQuestionBlock(content: string = ""): QuestionBlock {
  return { ...createBlock("question", content), type: "question" };
}

export function createReflectionBlock(content: string = ""): ReflectionBlock {
  return { ...createBlock("reflection", content), type: "reflection" };
}

export function createRewardBlock(content: string = ""): RewardBlock {
  return { ...createBlock("reward", content), type: "reward" };
}

// ── Convert legacy journey steps to content blocks ───────────────────────────

export function stepToBlocks(step: any): JourneyStepBlocks {
  const blocks: ContentBlock[] = [];

  if (step.studentText) {
    blocks.push(createTextBlock(step.studentText));
  }

  if (step.mathDisplay) {
    blocks.push(createCalloutBlock(step.mathDisplay, "info"));
  }

  if (step.interaction?.question) {
    blocks.push(createQuestionBlock(step.interaction.question));
  }

  return {
    id: step.id || `step-${Date.now()}`,
    stepType: step.stepType || "welcome",
    title: step.title || "",
    owlText: step.owlText || "",
    blocks,
    interaction: step.interaction,
    media: step.media,
    materials: step.materials,
    estimatedMinutes: step.estimatedMinutes,
  };
}

// ── Convert content blocks back to legacy journey step ───────────────────────

export function blocksToStep(blocks: JourneyStepBlocks): any {
  const step: any = {
    id: blocks.id,
    stepType: blocks.stepType,
    title: blocks.title,
    owlText: blocks.owlText,
  };

  // Extract text from blocks
  const textBlock = blocks.blocks.find(b => b.type === "text");
  if (textBlock) {
    step.studentText = textBlock.content;
  }

  // Extract interaction from question block
  const questionBlock = blocks.blocks.find(b => b.type === "question");
  if (questionBlock && blocks.interaction) {
    step.interaction = blocks.interaction;
  }

  // Extract media
  if (blocks.media) {
    step.media = blocks.media;
  }

  if (blocks.materials) {
    step.materials = blocks.materials;
  }

  return step;
}
