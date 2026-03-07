"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { useAtom } from "jotai";
import { createCanvasDialogAtom } from "@/lib/workspace-atoms";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";

export function CreateCanvasDialog() {
  const [open, setOpen] = useAtom(createCanvasDialogAtom);
  const { handleCreate } = useWorkspaceActions();
  const [title, setTitle] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSubmit = () => {
    const trimmed = title.trim() || "Untitled";
    handleCreate(trimmed);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>New workspace</AlertDialogTitle>
          <AlertDialogDescription>
            Give your canvas a name to get started.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Field>
            <FieldLabel htmlFor="canvas-name">Name</FieldLabel>
            <Input
              ref={inputRef}
              id="canvas-name"
              placeholder="My canvas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
        </form>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>Create</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
