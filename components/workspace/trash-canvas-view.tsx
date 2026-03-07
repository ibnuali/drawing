"use client";

import { useAtomValue } from "jotai";
import { Spinner } from "@/components/ui/spinner";
import { trashCanvasesAtom } from "@/lib/workspace-atoms";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return formatDate(timestamp);
  }
  if (days > 0) {
    return `${days}d ago`;
  }
  if (hours > 0) {
    return `${hours}h ago`;
  }
  if (minutes > 0) {
    return `${minutes}m ago`;
  }
  return "just now";
}

type TrashCanvasCardProps = {
  canvas: {
    _id: Id<"canvases">;
    title: string;
    updatedAt: number;
    deletedAt?: number;
  };
  onRestore: (id: Id<"canvases">) => void;
  onPermanentDelete: (id: Id<"canvases">) => void;
};

function TrashCanvasCard({ canvas, onRestore, onPermanentDelete }: TrashCanvasCardProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <div className="group flex items-center justify-between rounded-lg border border-border/60 bg-background px-4 py-3 transition-colors hover:border-border">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{canvas.title}</span>
              <span className="text-xs text-muted-foreground">
                Deleted {canvas.deletedAt ? formatRelativeTime(canvas.deletedAt) : "unknown"}
              </span>
            </div>
          </div>
        }
      />
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onRestore(canvas._id)}>
          <RotateCcw />
          Restore
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" onClick={() => onPermanentDelete(canvas._id)}>
          <Trash2 />
          Delete permanently
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function TrashCanvasView() {
  const trashCanvases = useAtomValue(trashCanvasesAtom);
  const restore = useMutation(api.canvases.restore);
  const permanentDelete = useMutation(api.canvases.permanentDelete);

  const handleRestore = (id: Id<"canvases">) => {
    restore({ id });
  };

  const handlePermanentDelete = (id: Id<"canvases">) => {
    permanentDelete({ id });
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Trash
        </p>
      </div>

      {trashCanvases === undefined && (
        <div className="flex items-center justify-center py-16">
          <Spinner className="size-6" />
        </div>
      )}

      {trashCanvases && trashCanvases.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-2">
          <p className="text-foreground text-sm font-medium">Trash is empty</p>
          <p className="text-muted-foreground text-xs">Deleted canvases will appear here</p>
        </div>
      )}

      {trashCanvases && trashCanvases.length > 0 && (
        <div className="flex flex-col gap-2">
          {trashCanvases.map((canvas) => (
            <TrashCanvasCard
              key={canvas._id}
              canvas={canvas}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}