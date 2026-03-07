"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { CanvasGridRenderer } from "@/components/workspace/canvas/canvas-grid-renderer";
import { ViewModeToggle } from "@/components/workspace/view-mode-toggle";
import { filterCanvasesBySearch } from "@/lib/category-logic";
import { LoadingSkeleton } from "@/components/workspace/canvas/loading-skeleton";
import { SearchResults } from "@/components/workspace/canvas/search-results";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";
import {
  searchQueryAtom,
  canvasesAtom,
  categoriesAtom,
  isSearchingAtom,
  activeCategoryFilterAtom,
  createCanvasDialogAtom,
} from "@/lib/workspace-atoms";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Plus, Upload } from "lucide-react";

export function MyCanvasView() {
  const canvases = useAtomValue(canvasesAtom);
  const categories = useAtomValue(categoriesAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const isSearching = useAtomValue(isSearchingAtom);
  const activeCategoryFilter = useAtomValue(activeCategoryFilterAtom);
  const actions = useWorkspaceActions();
  const setCreateDialogOpen = useSetAtom(createCanvasDialogAtom);

  const allCanvases = canvases ?? [];

  // Apply category filter, then search
  const categoryFiltered = activeCategoryFilter
    ? allCanvases.filter((c) => c.categoryId === activeCategoryFilter)
    : allCanvases;
  const filteredCanvases = isSearching
    ? filterCanvasesBySearch(categoryFiltered, searchQuery)
    : categoryFiltered;

  // Category name lookup for search badges
  const categoryNameMap = new Map<string, string>();
  for (const cat of categories ?? []) {
    categoryNameMap.set(cat._id, cat.name);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          My canvases
        </p>
        <ViewModeToggle />
      </div>
      <ContextMenu>
        <ContextMenuTrigger
          render={
            <div className="flex-1 flex flex-col w-full h-full">
              {canvases === undefined && <LoadingSkeleton />}

              {canvases !== undefined && isSearching && (
                <SearchResults
                  canvases={filteredCanvases}
                  categoryNameMap={categoryNameMap}
                />
              )}

              {canvases !== undefined && !isSearching && (
                <>
                  {filteredCanvases.length === 0 ? (
                    <div className="mt-16 flex flex-col items-center gap-2">
                      <p className="text-foreground text-sm font-medium">
                        {activeCategoryFilter
                          ? "No canvases in this category"
                          : "No canvases yet"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {activeCategoryFilter
                          ? "Move a canvas here or create a new one"
                          : "Create your first canvas to get started"}
                      </p>
                    </div>
                  ) : (
                    <CanvasGridRenderer
                      items={filteredCanvases}
                      actions={actions.canvasActions}
                    />
                  )}
                </>
              )}
            </div>
          }
        ></ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            New workspace
          </ContextMenuItem>
          <ContextMenuItem onClick={() => console.log("Import")}>
            <Upload className="mr-2 size-4" />
            Import workspace
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}
