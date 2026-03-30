"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import type { CanvasActions, CollaboratorInfo } from "@/lib/workspace-atoms";
import type { CategoryOption } from "@/lib/types";
import { CanvasCard } from "./canvas-card";

interface CanvasGridProps {
  canvases: Doc<"canvases">[] | undefined;
  actions: CanvasActions;
  activeCollaborators?: Record<string, CollaboratorInfo>;
  categories?: CategoryOption[];
}

/**
 * Displays a grid of canvas cards with loading states.
 * Used for the main canvas view in the workspace.
 */
export function CanvasGrid({
  canvases,
  actions,
  activeCollaborators,
  categories,
}: Readonly<CanvasGridProps>) {
  const isLoading = canvases === undefined;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-wider">
        Recent
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <CanvasGridSkeleton key={i} />
          ))}

        {canvases?.map((canvas) => (
          <CanvasCard
            key={canvas._id}
            canvas={canvas}
            actions={actions}
            collaborators={activeCollaborators?.[canvas._id]}
            categories={categories}
          />
        ))}
      </div>

      {canvases && canvases.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-2">
          <p className="text-foreground text-sm font-medium">No canvases yet</p>
          <p className="text-muted-foreground text-xs">
            Create your first canvas to get started
          </p>
        </div>
      )}
    </main>
  );
}

/** Skeleton loader for canvas grid cards */
function CanvasGridSkeleton() {
  return (
    <div className="border-border/60 flex animate-pulse flex-col overflow-hidden rounded-xl border">
      <div className="bg-muted/40 h-36" />
      <div className="flex flex-col gap-2 px-3 py-2.5">
        <div className="bg-muted h-4 w-24 rounded" />
        <div className="bg-muted h-3 w-16 rounded" />
      </div>
    </div>
  );
}
