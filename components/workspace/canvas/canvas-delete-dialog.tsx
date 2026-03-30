import * as React from "react";
import type { Id } from "@/convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CanvasDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  canvasId: Id<"canvases">;
  onDelete?: (e: React.MouseEvent, id: Id<"canvases">) => void;
  pendingDeleteEvent: React.MutableRefObject<React.MouseEvent | null>;
}

export function CanvasDeleteDialog({
  open,
  onOpenChange,
  title,
  canvasId,
  onDelete,
  pendingDeleteEvent,
}: Readonly<CanvasDeleteDialogProps>) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete canvas</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{title}&rdquo;? It will be
            moved to trash and can be restored later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(pendingDeleteEvent.current ?? e, canvasId);
              onOpenChange(false);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}