"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useAtom, useAtomValue } from "jotai";
import { renameCanvasTargetAtom, canvasesAtom } from "@/lib/workspace-atoms";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";

export function RenameCanvasDialog() {
  const [renameTarget, setRenameTarget] = useAtom(renameCanvasTargetAtom);
  const canvases = useAtomValue(canvasesAtom);
  const { handleRenameConfirm } = useWorkspaceActions();

  const open = renameTarget !== null;
  const currentTitle =
    canvases?.find((c) => c._id === renameTarget)?.title ?? "";
  const [title, setTitle] = React.useState(currentTitle);

  React.useEffect(() => {
    if (open) setTitle(currentTitle);
  }, [open, currentTitle]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== currentTitle && renameTarget) {
      handleRenameConfirm(trimmed, renameTarget);
    }
    setRenameTarget(null);
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) setRenameTarget(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rename canvas</AlertDialogTitle>
          <AlertDialogDescription>
            Enter a new name for your canvas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder="Canvas name"
          autoFocus
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={!title.trim() || title.trim() === currentTitle}
          >
            Rename
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
