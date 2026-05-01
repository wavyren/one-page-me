"use client";

export function TypingIndicator() {
  return (
    <div className="flex gap-2 items-center" role="status" aria-label="小页正在输入">
      <div
        className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-white text-xs shrink-0"
        aria-hidden="true"
      >
        小页
      </div>
      <div className="bg-muted rounded-r-xl rounded-bl-xl px-4 py-3">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
