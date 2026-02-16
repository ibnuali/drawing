"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "@/lib/auth-client";
import {
  canvasesAtom,
  categoriesAtom,
  sharedCanvasesAtom,
  activeCollaboratorsAtom,
  searchQueryAtom,
} from "@/lib/workspace-atoms";
import { useAtomValue } from "jotai";

/**
 * Bridges Convex reactive queries into Jotai atoms so child components
 * can read workspace data without prop drilling.
 */
export function useWorkspaceSync() {
  const { data: session, isPending } = useSession();
  const searchQuery = useAtomValue(searchQueryAtom);

  const setCanvases = useSetAtom(canvasesAtom);
  const setCategories = useSetAtom(categoriesAtom);
  const setSharedCanvases = useSetAtom(sharedCanvasesAtom);
  const setCollaborators = useSetAtom(activeCollaboratorsAtom);

  const canvases = useQuery(
    api.canvases.list,
    session?.user ? { ownerId: session.user.id } : "skip",
  );

  const categories = useQuery(
    api.categories.list,
    session?.user ? { ownerId: session.user.id } : "skip",
  );

  const sharedCanvases = useQuery(
    api.canvases.listShared,
    session?.user
      ? { userId: session.user.id, search: searchQuery.trim() || undefined }
      : "skip",
  );

  const canvasIds = canvases?.map((c) => c._id);
  const activeCollaborators = useQuery(
    api.presence.getActiveCollaborators,
    canvasIds && canvasIds.length > 0 ? { canvasIds } : "skip",
  );

  useEffect(() => { setCanvases(canvases); }, [canvases, setCanvases]);
  useEffect(() => { setCategories(categories); }, [categories, setCategories]);
  useEffect(() => { setSharedCanvases(sharedCanvases); }, [sharedCanvases, setSharedCanvases]);
  useEffect(() => { setCollaborators(activeCollaborators); }, [activeCollaborators, setCollaborators]);

  return { session, isPending };
}
