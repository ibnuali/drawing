"use client";

import { useAtom } from "jotai";
import { List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { canvasViewModeAtom } from "@/lib/workspace-atoms";

export function ViewModeToggle() {
  const [viewMode, setViewMode] = useAtom(canvasViewModeAtom);

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border/60 p-0.5">
      <button
        onClick={() => setViewMode("list")}
        className={cn(
          "flex items-center rounded-md p-2 text-xs transition-colors",
          viewMode === "list"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <List className="size-3.5 mr-1" />
        List
      </button>
      <button
        onClick={() => setViewMode("grid")}
        className={cn(
          "flex items-center rounded-md p-2 text-xs transition-colors",
          viewMode === "grid"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="size-3.5 mr-1" />
        Grid
      </button>
    </div>
  );
}
