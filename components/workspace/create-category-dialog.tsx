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
import { validateCategoryName, isDuplicateName } from "@/lib/category-logic";
import { useAtom, useAtomValue } from "jotai";
import { createCategoryDialogAtom, categoryNamesAtom } from "@/lib/workspace-atoms";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";

export function CreateCategoryDialog() {
  const [open, setOpen] = useAtom(createCategoryDialogAtom);
  const existingNames = useAtomValue(categoryNamesAtom);
  const { handleCreateCategory } = useWorkspaceActions();
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setName("");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const validate = (value: string): string | null => {
    const result = validateCategoryName(value);
    if (!result.valid) return result.error ?? "Invalid name";
    if (isDuplicateName(value, existingNames)) {
      return "A category with this name already exists";
    }
    return null;
  };

  const handleSubmit = () => {
    const validationError = validate(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    handleCreateCategory(name.trim());
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>New category</AlertDialogTitle>
          <AlertDialogDescription>
            Give your category a name to organize your canvases.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Field>
            <FieldLabel htmlFor="category-name">Name</FieldLabel>
            <Input
              ref={inputRef}
              id="category-name"
              placeholder="My category"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
            />
          </Field>
          {error && (
            <p className="text-destructive mt-1.5 text-xs">{error}</p>
          )}
        </form>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>Create</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
