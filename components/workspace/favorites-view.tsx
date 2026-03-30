"use client";

import * as React from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "@/lib/auth-client";
import { CanvasGridRenderer } from "@/components/workspace/canvas/canvas-grid-renderer";
import { ViewModeToggle } from "@/components/workspace/view-mode-toggle";
import { LoadingSkeleton } from "@/components/workspace/canvas/loading-skeleton";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";
import {
  searchQueryAtom,
  categoriesAtom,
  isSearchingAtom,
  canvasViewModeAtom,
} from "@/lib/workspace-atoms";
import { Star } from "lucide-react";

export function FavoritesView() {
  const { data: session } = useSession();
  const categories = useAtomValue(categoriesAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const isSearching = useAtomValue(isSearchingAtom);
  const viewMode = useAtomValue(canvasViewModeAtom);
  const actions = useWorkspaceActions();

  const favoriteCanvases = useQuery(
    api.canvases.list,
    session?.user
      ? { ownerId: session.user.id, favoritesOnly: true, search: isSearching ? searchQuery : undefined }
      : "skip"
  );

  const isLoading = viewMode === "grid" && favoriteCanvases === undefined;

  const categoryNameMap = new Map<string, string>();
  for (const cat of categories ?? []) {
    categoryNameMap.set(cat._id, cat.name);
  }

  const showEmptyState = viewMode === "list"
    ? false
    : !favoriteCanvases || favoriteCanvases.length === 0;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Favorites
        </p>
        <ViewModeToggle />
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {isLoading && <LoadingSkeleton />}

        {!isLoading && showEmptyState && (
          <div className="flex-1 mt-16 flex flex-col items-center gap-2">
            <Star className="text-muted-foreground/40 size-10" />
            <p className="text-foreground text-sm font-medium">
              No favorites yet
            </p>
            <p className="text-muted-foreground text-xs">
              Star canvases to add them to your favorites
            </p>
          </div>
        )}

        {!isLoading && !showEmptyState && favoriteCanvases && (
          <CanvasGridRenderer
            items={favoriteCanvases}
            actions={actions.canvasActions}
            categoryNameMap={categoryNameMap}
          />
        )}
      </div>
    </div>
  );
}