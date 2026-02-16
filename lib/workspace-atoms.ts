import { atom } from "jotai";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { SidebarView } from "@/components/workspace/workspace-sidebar";

// ── UI state atoms ──

export const sidebarViewAtom = atom<SidebarView>("my-canvas");
export const searchQueryAtom = atom<string>("");
export const activeTabAtom = atom<string>("all");

// ── Dialog state atoms ──

export const createCanvasDialogAtom = atom(false);
export const renameCanvasTargetAtom = atom<Id<"canvases"> | null>(null);
export const createCategoryDialogAtom = atom(false);
export const renameCategoryTargetAtom = atom<Id<"categories"> | null>(null);
export const deleteCategoryTargetAtom = atom<Id<"categories"> | null>(null);

// ── Server data atoms (written by the sync hook, read by children) ──

export type CollaboratorInfo = {
  count: number;
  names: string[];
};

export const canvasesAtom = atom<Doc<"canvases">[] | undefined>(undefined);
export const categoriesAtom = atom<Doc<"categories">[] | undefined>(undefined);

type SharedCanvasResult = {
  _id: Id<"canvases">;
  title: string;
  updatedAt: number;
  isPublic?: boolean;
  collaborationEnabled?: boolean;
  accessLevel: "editor" | "viewer";
  ownerName: string;
  ownerId: string;
};
export const sharedCanvasesAtom = atom<SharedCanvasResult[] | undefined>(undefined);
export const activeCollaboratorsAtom = atom<Record<string, CollaboratorInfo> | undefined>(undefined);

// ── Derived atoms ──

export const sortedCategoriesAtom = atom((get) => {
  const categories = get(categoriesAtom);
  if (!categories) return [];
  return [...categories].sort((a, b) => a.order - b.order);
});

export const categoryNamesAtom = atom((get) => {
  const categories = get(categoriesAtom);
  return categories?.map((c) => c.name) ?? [];
});

export const categoryOptionsAtom = atom((get) => {
  const sorted = get(sortedCategoriesAtom);
  return sorted.map((c) => ({ _id: c._id, name: c.name }));
});

export const isSearchingAtom = atom((get) => get(searchQueryAtom).trim().length > 0);

// ── Canvas action types (single prop instead of 6 callbacks) ──

export type CanvasActions = {
  onOpen: (id: Id<"canvases">) => void;
  onDelete: (e: React.MouseEvent, id: Id<"canvases">) => void;
  onRename: (id: Id<"canvases">) => void;
  onTogglePublic: (id: Id<"canvases">) => void;
  onCopyCollabLink: (id: Id<"canvases">) => void;
  onMoveToCategory: (canvasId: Id<"canvases">, categoryId: string | undefined) => void;
};
