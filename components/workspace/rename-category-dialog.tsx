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
import { validateCategoryName, isDuplicateName } from "@/lib/category-logic";
import { useAtom, useAtomValue } from "jotai";
import {
  renameCategoryTargetAtom,
  categoryNamesAtom,
  categoriesAtom,
} from "@/lib/workspace-atoms";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";

export function RenameCategoryDialog() {
  const [renameCategoryTarget, setRenameCategoryTarget] = useAtom(renameCategoryTargetAtom);
  const existingNames = useAtomValue(categoryNamesAtom);
  const categories = useAtomValue(categoriesAtom);
  const { handleRenameCategory } = useWorkspaceActions();

  const open = renameCategoryTarget !== null;
  const currentName = categories?.find((c) => c._id === renameCategoryTarget)?.name ?? "";
  const [name, setName] = React.useState(currentName);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setName(currentName);
      setError(null);
    }
  }, [open, currentName]);

  const validate = (value: string): string | null => {
    const result = validateCategoryName(value);
    if (!result.valid) return result.error ?? "Invalid name";
    const otherNames = existingNames.filter(
      (n) => n.toLowerCase() !== currentName.toLowerCase(),
    );
    if (isDuplicateName(value, otherNames)) {
      return "A category with this name already exists";
    }
    return null;
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed === currentName) {
      setRenameCategoryTarget(null);
      return;
    }
    const validationError = validate(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (renameCategoryTarget) {
      handleRenameCategory(trimmed, renameCategoryTarget);
    }
    setRenameCategoryTarget(null);
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) setRenameCategoryTarget(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rename category</AlertDialogTitle>
          <AlertDialogDescription>
            Enter a new name for your category.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder="Category name"
          autoFocus
        />
        {error && (
          <p className="text-destructive text-xs">{error}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={!name.trim() || name.trim() === currentName}
          >
            Rename
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
