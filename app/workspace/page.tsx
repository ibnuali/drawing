"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type { Doc } from "@/convex/_generated/dataModel";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { CanvasCard } from "@/components/workspace/canvas-card";
import { CreateCanvasDialog } from "@/components/workspace/create-canvas-dialog";
import { RenameCanvasDialog } from "@/components/workspace/rename-canvas-dialog";
import { CreateCategoryDialog } from "@/components/workspace/create-category-dialog";
import { RenameCategoryDialog } from "@/components/workspace/rename-category-dialog";
import { NewCanvasButton } from "@/components/workspace/new-canvas-button";
import { CategoryTab } from "@/components/workspace/category-tab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { filterCanvasesBySearch } from "@/lib/category-logic";
import { useWorkspaceSync } from "@/hooks/use-workspace-sync";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";
import {
  sidebarViewAtom,
  searchQueryAtom,
  activeTabAtom,
  createCategoryDialogAtom,
  renameCategoryTargetAtom,
  deleteCategoryTargetAtom,
  canvasesAtom,
  categoriesAtom,
  sharedCanvasesAtom,
  activeCollaboratorsAtom,
  sortedCategoriesAtom,
  categoryOptionsAtom,
  isSearchingAtom,
} from "@/lib/workspace-atoms";

export default function WorkspacePage() {
  const router = useRouter();
  const { session, isPending } = useWorkspaceSync();
  const actions = useWorkspaceActions();

  const activeView = useAtomValue(sidebarViewAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const setCreateCategoryOpen = useSetAtom(createCategoryDialogAtom);
  const setRenameCategoryTarget = useSetAtom(renameCategoryTargetAtom);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useAtom(deleteCategoryTargetAtom);

  const canvases = useAtomValue(canvasesAtom);
  const categories = useAtomValue(categoriesAtom);
  const sharedCanvases = useAtomValue(sharedCanvasesAtom);
  const activeCollaborators = useAtomValue(activeCollaboratorsAtom);
  const sortedCategories = useAtomValue(sortedCategoriesAtom);
  const categoryOptions = useAtomValue(categoryOptionsAtom);
  const isSearching = useAtomValue(isSearchingAtom);

  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  // Derive filtered/grouped data
  const allCanvases = canvases ?? [];
  const filteredCanvases = isSearching
    ? filterCanvasesBySearch(allCanvases, searchQuery)
    : allCanvases;

  // Group canvases by categoryId
  const canvasesByCategory = new Map<string | "uncategorized", Doc<"canvases">[]>();
  canvasesByCategory.set("uncategorized", []);
  for (const canvas of filteredCanvases) {
    const key = canvas.categoryId ?? "uncategorized";
    if (!canvasesByCategory.has(key)) canvasesByCategory.set(key, []);
    canvasesByCategory.get(key)!.push(canvas);
  }

  // Category name lookup for search badges
  const categoryNameMap = new Map<string, string>();
  for (const cat of categories ?? []) {
    categoryNameMap.set(cat._id, cat.name);
  }

  const deleteCategoryDoc = categories?.find((c) => c._id === deleteCategoryTarget);

  const renderCanvasGrid = (items: Doc<"canvases">[], showNewButton = false) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {showNewButton && <NewCanvasButton />}
      {items.map((canvas) => (
        <CanvasCard
          key={canvas._id}
          canvas={canvas}
          actions={actions.canvasActions}
          collaborators={activeCollaborators?.[canvas._id]}
          categories={categoryOptions}
        />
      ))}
    </div>
  );

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <WorkspaceHeader />

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <WorkspaceSidebar />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
          {/* ── My Canvas view ── */}
          {activeView === "my-canvas" && (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  My canvases
                </p>
              </div>

              {/* Loading state */}
              {canvases === undefined && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-border/60 flex animate-pulse flex-col overflow-hidden rounded-xl border"
                    >
                      <div className="bg-muted/40 h-36" />
                      <div className="flex flex-col gap-2 px-3 py-2.5">
                        <div className="bg-muted h-4 w-24 rounded" />
                        <div className="bg-muted h-3 w-16 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Search results */}
              {canvases !== undefined && isSearching && (
                <>
                  {filteredCanvases.length === 0 ? (
                    <div className="mt-16 flex flex-col items-center gap-2">
                      <p className="text-foreground text-sm font-medium">No results found</p>
                      <p className="text-muted-foreground text-xs">Try a different search term</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {filteredCanvases.map((canvas) => (
                        <div key={canvas._id} className="relative">
                          {canvas.categoryId && categoryNameMap.has(canvas.categoryId) && (
                            <Badge variant="secondary" className="mb-1 text-[10px] h-4 px-1.5">
                              {categoryNameMap.get(canvas.categoryId)}
                            </Badge>
                          )}
                          <CanvasCard
                            canvas={canvas}
                            actions={actions.canvasActions}
                            collaborators={activeCollaborators?.[canvas._id]}
                            categories={categoryOptions}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Normal view — tab-based categories */}
              {canvases !== undefined && !isSearching && (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="mb-6 flex flex-wrap items-center gap-2">
                    <TabsList variant="line" className="shrink-0">
                      <TabsTrigger value="all">
                        All
                        <span className="text-muted-foreground ml-1 text-[10px]">
                          {allCanvases.length}
                        </span>
                      </TabsTrigger>
                      {sortedCategories.map((category, idx) => (
                        <CategoryTab
                          key={category._id}
                          category={category}
                          count={(canvasesByCategory.get(category._id) ?? []).length}
                          isFirst={idx === 0}
                          isLast={idx === sortedCategories.length - 1}
                          onRename={() => setRenameCategoryTarget(category._id)}
                          onDelete={() => actions.handleDeleteCategory(category._id)}
                          onMoveUp={() => actions.handleMoveUp(category._id)}
                          onMoveDown={() => actions.handleMoveDown(category._id)}
                        />
                      ))}
                      <TabsTrigger value="uncategorized">
                        Uncategorized
                        <span className="text-muted-foreground ml-1 text-[10px]">
                          {(canvasesByCategory.get("uncategorized") ?? []).length}
                        </span>
                      </TabsTrigger>
                    </TabsList>
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground shrink-0 gap-1"
                      onClick={() => setCreateCategoryOpen(true)}
                    >
                      <Plus />
                      New category
                    </Button>
                  </div>

                  <TabsContent value="all">
                    {renderCanvasGrid(allCanvases, true)}
                    {allCanvases.length === 0 && (
                      <div className="mt-16 flex flex-col items-center gap-2">
                        <p className="text-foreground text-sm font-medium">No canvases yet</p>
                        <p className="text-muted-foreground text-xs">Create your first canvas to get started</p>
                      </div>
                    )}
                  </TabsContent>

                  {sortedCategories.map((category) => (
                    <TabsContent key={category._id} value={category._id}>
                      {renderCanvasGrid(canvasesByCategory.get(category._id) ?? [], true)}
                      {(canvasesByCategory.get(category._id) ?? []).length === 0 && (
                        <p className="text-muted-foreground mt-8 text-center text-xs">
                          No canvases in this category
                        </p>
                      )}
                    </TabsContent>
                  ))}

                  <TabsContent value="uncategorized">
                    {renderCanvasGrid(canvasesByCategory.get("uncategorized") ?? [], true)}
                    {(canvasesByCategory.get("uncategorized") ?? []).length === 0 && (
                      <p className="text-muted-foreground mt-8 text-center text-xs">
                        No uncategorized canvases
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </>
          )}

          {/* ── Shared with me view ── */}
          {activeView === "shared" && (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Shared with me
                </p>
              </div>

              {sharedCanvases === undefined && (
                <div className="flex items-center justify-center py-16">
                  <Spinner className="size-6" />
                </div>
              )}

              {sharedCanvases && sharedCanvases.length === 0 && (
                <div className="mt-16 flex flex-col items-center gap-2">
                  <p className="text-foreground text-sm font-medium">Nothing shared yet</p>
                  <p className="text-muted-foreground text-xs">Canvases shared with you will appear here</p>
                </div>
              )}

              {sharedCanvases && sharedCanvases.length > 0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {sharedCanvases.map((canvas) => (
                    <CanvasCard
                      key={canvas._id}
                      canvas={{
                        _id: canvas._id,
                        title: canvas.title,
                        updatedAt: canvas.updatedAt,
                        isPublic: canvas.isPublic,
                        collaborationEnabled: canvas.collaborationEnabled,
                        ownerId: canvas.ownerId,
                        _creationTime: 0,
                      } as any}
                      actions={actions.canvasActions}
                      isShared
                      ownerName={canvas.ownerName}
                      accessLevel={canvas.accessLevel}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Dialogs — all self-contained now, no props needed */}
      <CreateCanvasDialog />
      <RenameCanvasDialog />
      <CreateCategoryDialog />
      <RenameCategoryDialog />

      {/* Delete category confirmation */}
      <AlertDialog
        open={deleteCategoryTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteCategoryTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteCategoryDoc?.name}&rdquo;?
              {(() => {
                const count = deleteCategoryTarget
                  ? (canvasesByCategory.get(deleteCategoryTarget) ?? []).length
                  : 0;
                return count > 0
                  ? ` ${count} canvas${count === 1 ? "" : "es"} will be moved to Uncategorized.`
                  : "";
              })()}
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
    </div>
  );
}
