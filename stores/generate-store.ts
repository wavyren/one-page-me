import { create } from "zustand";

export type GenerateStep =
  | "idle"
  | "preparing"
  | "generating"
  | "cleaning"
  | "storing"
  | "finishing"
  | "done"
  | "error";

interface GenerateState {
  isGenerating: boolean;
  step: GenerateStep;
  progress: number;
  pageId: string | null;
  url: string | null;
  error: string | null;

  startGeneration: () => void;
  setStep: (step: GenerateStep) => void;
  setProgress: (progress: number) => void;
  setSuccess: (pageId: string, url: string) => void;
  setError: (error: string) => void;
  reset: () => void;
}

const STEP_PROGRESS: Record<GenerateStep, number> = {
  idle: 0,
  preparing: 10,
  generating: 40,
  cleaning: 60,
  storing: 80,
  finishing: 95,
  done: 100,
  error: 0,
};

const STEP_LABEL: Record<GenerateStep, string> = {
  idle: "准备中...",
  preparing: "正在准备数据...",
  generating: "AI 正在生成你的主页...",
  cleaning: "正在优化页面内容...",
  storing: "正在保存到你的空间...",
  finishing: "即将完成...",
  done: "生成完成！",
  error: "生成失败",
};

export const useGenerateStore = create<GenerateState>((set) => ({
  isGenerating: false,
  step: "idle",
  progress: 0,
  pageId: null,
  url: null,
  error: null,

  startGeneration: () =>
    set({
      isGenerating: true,
      step: "preparing",
      progress: STEP_PROGRESS.preparing,
      pageId: null,
      url: null,
      error: null,
    }),

  setStep: (step) =>
    set({
      step,
      progress: STEP_PROGRESS[step],
    }),

  setProgress: (progress) => set({ progress }),

  setSuccess: (pageId, url) =>
    set({
      isGenerating: false,
      step: "done",
      progress: 100,
      pageId,
      url,
      error: null,
    }),

  setError: (error) =>
    set({
      isGenerating: false,
      step: "error",
      progress: 0,
      error,
    }),

  reset: () =>
    set({
      isGenerating: false,
      step: "idle",
      progress: 0,
      pageId: null,
      url: null,
      error: null,
    }),
}));

export { STEP_LABEL };
