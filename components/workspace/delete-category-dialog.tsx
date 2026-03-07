"use client";

import { useAtom, useAtomValue } from "jotai";
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
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";
import {
  deleteCategoryTargetAtom,
  categoriesAtom,
  canvasesAtom,
} from "@/lib/workspace-atoms";

export function DeleteCategoryDialog() {
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useAtom(deleteCategoryTargetAtom);
  const categories = useAtomValue(categoriesAtom);
  const canvases = useAtomValue(canvasesAtom);
  const actions = useWorkspaceActions();

  const deleteCategoryDoc = categories?.find((c) => c._id === deleteCategoryTarget);

  const canvasCount = deleteCategoryTarget
    ? (canvases ?? []).filter((c) => c.categoryId === deleteCategoryTarget).length
    : 0;

  return (
    <AlertDialog
      open={deleteCategoryTarget !== null}
      onOpenChange={(open) => { if (!open) setDeleteCategoryTarget(null); }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete category</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{deleteCategoryDoc?.name}&rdquo;?
            {canvasCount > 0
              ? ` ${canvasCount} canvas${canvasCount === 1 ? "" : "es"} will be moved to Uncategorized.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              if (deleteCategoryTarget) actions.handleConfirmDeleteCategory(deleteCategoryTarget);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
