"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { toast } from "sonner";
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

/**
 * Custom hook that provides all workspace action handlers.
 *
 * This hook encapsulates canvas and category management operations including:
 * - Canvas CRUD operations (create, delete, rename, duplicate)
 * - Canvas visibility and sharing (toggle public, copy links)
 * - Category management (create, rename, delete, reorder)
 * - Canvas-to-category assignment
 *
 * @returns Object containing canvasActions and individual action handlers
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { canvasActions, handleCreate } = useWorkspaceActions();
 *
 *   return (
 *     <button onClick={() => handleCreate("New Canvas")}>
 *       Create Canvas
 *     </button>
 *   );
 * }
 * ```
 */
export function useWorkspaceActions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const categories = useAtomValue(categoriesAtom);

  const setRenameTarget = useSetAtom(renameCanvasTargetAtom);
  const setDeleteCategoryTarget = useSetAtom(deleteCategoryTargetAtom);
  const setActiveTab = useSetAtom(activeTabAtom);

  const createCanvas = useMutation(api.canvases.create);
  const duplicateCanvas = useMutation(api.canvases.duplicate);
  const removeCanvas = useMutation(api.canvases.remove);
  const renameCanvasMut = useMutation(api.canvases.rename);
  const togglePublicMut = useMutation(api.canvases.togglePublic);
  const toggleFavoriteMut = useMutation(api.canvases.toggleFavorite);
  const assignCategoryMut = useMutation(api.canvases.assignCategory);
  const createCategoryMut = useMutation(api.categories.create);
  const renameCategoryMut = useMutation(api.categories.rename);
  const removeCategoryMut = useMutation(api.categories.remove);
  const reorderCategoryMut = useMutation(api.categories.reorder);

  const handleCreate = async (title: string, templateData?: string) => {
    if (!session?.user) return;
    const categoryParam = searchParams.get("category");
    let categoryId: Id<"categories"> | undefined;
    if (categoryParam && categories) {
      const category = categories.find((c) => c.name === categoryParam);
      if (category) categoryId = category._id;
    }
    try {
      await createCanvas({ title, ownerId: session.user.id, categoryId, data: templateData });
      toast.success("Canvas created");
    } catch {
      toast.error("Failed to create canvas");
    }
  };

  const handleImport = async (title: string, data: string, categoryId?: string) => {
    if (!session?.user) return;
    try {
      await createCanvas({
        title,
        ownerId: session.user.id,
        categoryId: categoryId as Id<"categories"> | undefined,
        data,
      });
      toast.success("Canvas imported");
    } catch {
      toast.error("Failed to import canvas");
    }
  };

  const handleDelete = (e: React.MouseEvent, id: Id<"canvases">) => {
    e.stopPropagation();
    try {
      void removeCanvas({ id });
      toast.success("Canvas moved to trash");
    } catch {
      toast.error("Failed to delete canvas");
    }
  };

  const handleRename = (id: Id<"canvases">) => setRenameTarget(id);

  const handleDuplicate = (id: Id<"canvases">) => {
    try {
      void duplicateCanvas({ id });
      toast.success("Canvas duplicated");
    } catch {
      toast.error("Failed to duplicate canvas");
    }
  };

  const handleRenameConfirm = (newTitle: string, id: Id<"canvases">) => {
    try {
      renameCanvasMut({ id, title: newTitle });
      toast.success("Canvas renamed");
    } catch {
      toast.error("Failed to rename canvas");
    }
  };

  const handleTogglePublic = (id: Id<"canvases">) => {
    try {
      void togglePublicMut({ id });
      toast.success("Visibility updated");
    } catch {
      toast.error("Failed to update visibility");
    }
  };

  const handleToggleFavorite = (id: Id<"canvases">) => {
    try {
      void toggleFavoriteMut({ id });
    } catch {
      toast.error("Failed to update favorite");
    }
  };

  const handleCopyCollabLink = (id: Id<"canvases">) => {
    navigator.clipboard.writeText(`${window.location.origin}/workspace/${id}`);
    toast.success("Link copied to clipboard");
  };

  const handleMoveCanvas = (
    canvasId: Id<"canvases">,
    categoryId: string | undefined,
  ) => {
    try {
      assignCategoryMut({
        canvasId,
        categoryId: categoryId as Id<"categories"> | undefined,
      });
      toast.success("Canvas moved");
    } catch {
      toast.error("Failed to move canvas");
    }
  };

  const handleOpenCanvas = (id: Id<"canvases">) => {
    router.push(`/workspace/${id}`);
  };

  // Category actions
  const handleCreateCategory = (name: string) => {
    try {
      createCategoryMut({ name });
      toast.success("Category created");
    } catch {
      toast.error("Failed to create category");
    }
  };

  const handleRenameCategory = (newName: string, id: Id<"categories">) => {
    try {
      renameCategoryMut({ id, name: newName });
      toast.success("Category renamed");
    } catch {
      toast.error("Failed to rename category");
    }
  };

  const handleDeleteCategory = (id: Id<"categories">) => {
    setDeleteCategoryTarget(id);
  };

  const handleConfirmDeleteCategory = (id: Id<"categories">) => {
    try {
      removeCategoryMut({ id });
      setActiveTab((prev) => (prev === id ? "all" : prev));
      setDeleteCategoryTarget(null);
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    }
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
    onDuplicate: handleDuplicate,
    onTogglePublic: handleTogglePublic,
    onCopyCollabLink: handleCopyCollabLink,
    onMoveToCategory: handleMoveCanvas,
    onToggleFavorite: handleToggleFavorite,
  };

  return {
    canvasActions,
    handleCreate,
    handleImport,
    handleDelete,
    handleRename,
    handleRenameConfirm,
    handleTogglePublic,
    handleToggleFavorite,
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
