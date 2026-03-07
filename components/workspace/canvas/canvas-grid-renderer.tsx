"use client";

import { useAtomValue } from "jotai";
import { useSession } from "@/lib/auth-client";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { CanvasCard } from "@/components/workspace/canvas/canvas-card";
import { CanvasListTable } from "@/components/workspace/canvas/canvas-list-table";
import {
  activeCollaboratorsAtom,
  categoryOptionsAtom,
  canvasViewModeAtom,
  isSearchingAtom,
  type CanvasActions,
} from "@/lib/workspace-atoms";

interface CanvasGridRendererProps {
  items: Doc<"canvases">[];
  actions: CanvasActions;
  categoryId?: Id<"categories">;
}

export function CanvasGridRenderer({ items, actions, categoryId }: Readonly<CanvasGridRendererProps>) {
  const viewMode = useAtomValue(canvasViewModeAtom);
  const activeCollaborators = useAtomValue(activeCollaboratorsAtom);
  const categoryOptions = useAtomValue(categoryOptionsAtom);
  const isSearching = useAtomValue(isSearchingAtom);
  const { data: session } = useSession();

  if (viewMode === "list" && session?.user && !isSearching) {
    return (
      <CanvasListTable
        ownerId={session.user.id}
        categoryId={categoryId}
        actions={actions}
        collaborators={activeCollaborators}
        categories={categoryOptions}
      />
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-2">
        {items.map((canvas) => (
          <CanvasCard
            key={canvas._id}
            canvas={canvas}
            actions={actions}
            collaborators={activeCollaborators?.[canvas._id]}
            categories={categoryOptions}
            isList
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((canvas) => (
        <CanvasCard
          key={canvas._id}
          canvas={canvas}
          actions={actions}
          collaborators={activeCollaborators?.[canvas._id]}
          categories={categoryOptions}
        />
      ))}
    </div>
  );
}
