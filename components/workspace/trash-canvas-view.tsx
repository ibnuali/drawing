"use client";

import { useAtomValue } from "jotai";
import { toast } from "sonner";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const emptyTrash = useMutation(api.canvases.emptyTrash);

  const handleRestore = (id: Id<"canvases">) => {
    try {
      restore({ id });
      toast.success("Canvas restored");
    } catch {
      toast.error("Failed to restore canvas");
    }
  };

  const handlePermanentDelete = (id: Id<"canvases">) => {
    try {
      permanentDelete({ id });
      toast.success("Canvas deleted permanently");
    } catch {
      toast.error("Failed to delete canvas");
    }
  };

  const handleEmptyTrash = async (ownerId: string) => {
    try {
      const count = await emptyTrash({ ownerId });
      toast.success(`Deleted ${count} canvas(es)`);
    } catch {
      toast.error("Failed to empty trash");
    }
  };

  const canvasCount = trashCanvases?.length ?? 0;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Trash
        </p>
        {canvasCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="mr-2 size-4" />
                  Empty trash
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Empty trash?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {canvasCount} canvas{canvasCount !== 1 ? "es" : ""} in trash. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    // Get ownerId from the first canvas
                    if (trashCanvases && trashCanvases.length > 0) {
                      handleEmptyTrash(trashCanvases[0].ownerId);
                    }
                  }}
                >
                  Delete all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
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