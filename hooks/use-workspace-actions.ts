"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  renameCanvasTargetAtom,
  deleteCategoryTargetAtom,
  activeTabAtom,
  categoriesAtom,
  type CanvasActions,
} from "@/lib/workspace-atoms";
import { useSession } from "@/lib/auth-client";

export function useWorkspaceActions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const categories = useAtomValue(categoriesAtom);

  const setRenameTarget = useSetAtom(renameCanvasTargetAtom);
  const setDeleteCategoryTarget = useSetAtom(deleteCategoryTargetAtom);
  const setActiveTab = useSetAtom(activeTabAtom);

  const createCanvas = useMutation(api.canvases.create);
  const removeCanvas = useMutation(api.canvases.remove);
  const renameCanvasMut = useMutation(api.canvases.rename);
  const togglePublicMut = useMutation(api.canvases.togglePublic);
  const assignCategoryMut = useMutation(api.canvases.assignCategory);
  const createCategoryMut = useMutation(api.categories.create);
  const renameCategoryMut = useMutation(api.categories.rename);
  const removeCategoryMut = useMutation(api.categories.remove);
  const reorderCategoryMut = useMutation(api.categories.reorder);

  const handleCreate = async (title: string) => {
    if (!session?.user) return;
    const categoryParam = searchParams.get("category");
    let categoryId: Id<"categories"> | undefined;
    if (categoryParam && categories) {
      const category = categories.find((c) => c.name === categoryParam);
      if (category) categoryId = category._id;
    }
    await createCanvas({ title, ownerId: session.user.id, categoryId });
  };

  const handleImport = async (title: string, data: string, categoryId?: string) => {
    if (!session?.user) return;
    await createCanvas({
      title,
      ownerId: session.user.id,
      categoryId: categoryId as Id<"categories"> | undefined,
      data,
    });
  };

  const handleDelete = (e: React.MouseEvent, id: Id<"canvases">) => {
    e.stopPropagation();
    void removeCanvas({ id });
  };

  const handleRename = (id: Id<"canvases">) => setRenameTarget(id);

  const handleRenameConfirm = (newTitle: string, id: Id<"canvases">) => {
    renameCanvasMut({ id, title: newTitle });
  };

  const handleTogglePublic = (id: Id<"canvases">) => {
    void togglePublicMut({ id });
  };

  const handleCopyCollabLink = (id: Id<"canvases">) => {
    navigator.clipboard.writeText(`${window.location.origin}/workspace/${id}`);
  };

  const handleMoveCanvas = (
    canvasId: Id<"canvases">,
    categoryId: string | undefined,
  ) => {
    assignCategoryMut({
      canvasId,
      categoryId: categoryId as Id<"categories"> | undefined,
    });
  };

  const handleOpenCanvas = (id: Id<"canvases">) => {
    router.push(`/workspace/${id}`);
  };

  // Category actions
  const handleCreateCategory = (name: string) => {
    createCategoryMut({ name });
  };

  const handleRenameCategory = (newName: string, id: Id<"categories">) => {
    renameCategoryMut({ id, name: newName });
  };

  const handleDeleteCategory = (id: Id<"categories">) => {
    setDeleteCategoryTarget(id);
  };

  const handleConfirmDeleteCategory = (id: Id<"categories">) => {
    removeCategoryMut({ id });
    setActiveTab((prev) => (prev === id ? "all" : prev));
    setDeleteCategoryTarget(null);
  };

  const handleMoveUp = (id: Id<"categories">) => {
    if (!categories) return;
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c._id === id);
    if (idx > 0) reorderCategoryMut({ id, newPosition: idx - 1 });
  };

  const handleMoveDown = (id: Id<"categories">) => {
    if (!categories) return;
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c._id === id);
    if (idx < sorted.length - 1)
      reorderCategoryMut({ id, newPosition: idx + 1 });
  };

  const canvasActions: CanvasActions = {
    onOpen: handleOpenCanvas,
    onDelete: handleDelete,
    onRename: handleRename,
    onTogglePublic: handleTogglePublic,
    onCopyCollabLink: handleCopyCollabLink,
    onMoveToCategory: handleMoveCanvas,
  };

  return {
    canvasActions,
    handleCreate,
    handleImport,
    handleDelete,
    handleRename,
    handleRenameConfirm,
    handleTogglePublic,
    handleCopyCollabLink,
    handleMoveCanvas,
    handleOpenCanvas,
    handleCreateCategory,
    handleRenameCategory,
    handleDeleteCategory,
    handleConfirmDeleteCategory,
    handleMoveUp,
    handleMoveDown,
  };
}
