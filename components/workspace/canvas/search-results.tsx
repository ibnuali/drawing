import { useAtomValue } from "jotai";
import type { Doc } from "@/convex/_generated/dataModel";
import { CanvasCard } from "@/components/workspace/canvas/canvas-card";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";
import {
  activeCollaboratorsAtom,
  categoryOptionsAtom,
  canvasViewModeAtom,
} from "@/lib/workspace-atoms";

export function SearchResults({
  canvases,
  categoryNameMap,
}: Readonly<{
  canvases: Doc<"canvases">[];
  categoryNameMap: Map<string, string>;
}>) {
  const viewMode = useAtomValue(canvasViewModeAtom);
  const actions = useWorkspaceActions();
  const activeCollaborators = useAtomValue(activeCollaboratorsAtom);
  const categoryOptions = useAtomValue(categoryOptionsAtom);

  if (canvases.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-2">
        <p className="text-foreground text-sm font-medium">No results found</p>
        <p className="text-muted-foreground text-xs">Try a different search term</p>
      </div>
    );
  }

  const wrapperClass =
    viewMode === "list"
      ? "flex flex-col gap-2"
      : "grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  return (
    <div className={wrapperClass}>
      {canvases.map((canvas) => (
        <div key={canvas._id} className="relative">
          {canvas.categoryId && categoryNameMap.has(canvas.categoryId) && (
            <Badge
              variant="secondary"
              className={`mb-1 text-[10px] h-4 px-1.5${viewMode === "list" ? " absolute -top-5 left-0" : ""}`}
            >
              {categoryNameMap.get(canvas.categoryId)}
            </Badge>
          )}
          <CanvasCard
            canvas={canvas}
            actions={actions.canvasActions}
            collaborators={activeCollaborators?.[canvas._id]}
            categories={categoryOptions}
            isList={viewMode === "list"}
          />
        </div>
      ))}
    </div>
  );
}