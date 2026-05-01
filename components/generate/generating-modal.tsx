"use client";

import { useEffect, useRef } from "react";
import { useGenerateStore, STEP_LABEL } from "@/stores/generate-store";
import { X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface GeneratingModalProps {
  onClose: () => void;
}

const STEP_SEQUENCE: Array<ReturnType<typeof useGenerateStore.getState>["step"]> = [
  "preparing",
  "generating",
  "cleaning",
  "storing",
  "finishing",
];

export function GeneratingModal({ onClose }: GeneratingModalProps) {
  const { isGenerating, step, progress, error } = useGenerateStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate step progression during generation
  useEffect(() => {
    if (!isGenerating) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    let currentIndex = STEP_SEQUENCE.indexOf(step);
    if (currentIndex === -1) currentIndex = 0;

    intervalRef.current = setInterval(() => {
      if (currentIndex < STEP_SEQUENCE.length - 1) {
        currentIndex++;
        useGenerateStore.getState().setStep(STEP_SEQUENCE[currentIndex]);
      }
    }, 4000); // Advance every 4 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isGenerating, step]);

  if (!isGenerating && step !== "error" && step !== "done") {
    return null;
  }

  const isError = step === "error";
  const isDone = step === "done";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="generate-modal-title"
    >
      <div className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="generate-modal-title"
            className="text-lg font-semibold text-foreground"
          >
            {isError ? "生成失败" : isDone ? "生成完成！" : "正在生成你的主页"}
          </h2>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-muted transition-colors"
              aria-label="关闭"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Status icon */}
        <div className="flex justify-center mb-6">
          {isError ? (
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
          ) : isDone ? (
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-brand animate-spin" />
            </div>
          )}
        </div>

        {/* Status text */}
        <p className="text-center text-sm text-muted-foreground mb-4">
          {isError ? error : STEP_LABEL[step]}
        </p>

        {/* Progress bar */}
        {!isError && (
          <div className="mb-6">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">
              {progress}%
            </p>
          </div>
        )}

        {/* Retry button on error */}
        {isError && (
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-brand hover:bg-brand-dark text-white text-sm rounded-lg transition-colors"
            >
              关闭
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
