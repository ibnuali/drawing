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

type RenameCanvasDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  onRename: (newTitle: string) => void;
};

export function RenameCanvasDialog({
  open,
  onOpenChange,
  currentTitle,
  onRename,
}: RenameCanvasDialogProps) {
  const [title, setTitle] = React.useState(currentTitle);

  React.useEffect(() => {
    if (open) setTitle(currentTitle);
  }, [open, currentTitle]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== currentTitle) {
      onRename(trimmed);
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
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
