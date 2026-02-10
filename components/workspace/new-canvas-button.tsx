"use client";

import { Plus } from "lucide-react";

type NewCanvasButtonProps = {
  onClick: () => void;
};

export function NewCanvasButton({ onClick }: NewCanvasButtonProps) {
  return (
    <button
      onClick={onClick}
      className="border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary group/new flex h-full min-h-[196px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed transition-all hover:shadow-md"
    >
      <div className="bg-muted group-hover/new:bg-primary/10 flex size-10 items-center justify-center rounded-full transition-colors">
        <Plus className="size-5" />
      </div>
      <span className="text-xs font-medium">New workspace</span>
    </button>
  );
}
