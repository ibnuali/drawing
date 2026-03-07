"use client";

import { useSearchParams } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "@/lib/auth-client";
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
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const canvases = useAtomValue(canvasesAtom);
  const categories = useAtomValue(categoriesAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const isSearching = useAtomValue(isSearchingAtom);
  const activeCategoryFilter = searchParams.get("category");
  const actions = useWorkspaceActions();
  const setCreateDialogOpen = useSetAtom(createCanvasDialogAtom);

  const categoryCanvases = useQuery(
    api.canvases.listByCategoryName,
    session?.user && activeCategoryFilter
      ? { ownerId: session.user.id, categoryName: activeCategoryFilter, search: isSearching ? searchQuery : undefined }
      : "skip"
  );

  const allCanvases = canvases ?? [];
  const displayCanvases = activeCategoryFilter ? (categoryCanvases ?? []) : allCanvases;

  const searchFiltered = isSearching
    ? filterCanvasesBySearch(allCanvases, searchQuery)
    : allCanvases;

  const filteredCanvases = activeCategoryFilter
    ? displayCanvases
    : searchFiltered;

  const isLoading = canvases === undefined || (activeCategoryFilter && categoryCanvases === undefined);

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
              {isLoading && <LoadingSkeleton />}

              {!isLoading && isSearching && (
                <SearchResults
                  canvases={filteredCanvases}
                  categoryNameMap={categoryNameMap}
                />
              )}

              {!isLoading && !isSearching && (
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