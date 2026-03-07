"use client";

import { useAtomValue } from "jotai";
import { CanvasCard } from "@/components/workspace/canvas/canvas-card";
import { ViewModeToggle } from "@/components/workspace/view-mode-toggle";
import { Spinner } from "@/components/ui/spinner";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";
import { sharedCanvasesAtom, canvasViewModeAtom } from "@/lib/workspace-atoms";

export function SharedCanvasView() {
  const sharedCanvases = useAtomValue(sharedCanvasesAtom);
  const viewMode = useAtomValue(canvasViewModeAtom);
  const actions = useWorkspaceActions();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Shared with me
        </p>
        <ViewModeToggle />
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
        viewMode === "list" ? (
          <div className="flex flex-col gap-2">
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
                isList
              />
            ))}
          </div>
        ) : (
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
        )
      )}
    </>
  );
}