import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Plus, Upload } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { CanvasMenuContent } from "@/components/workspace/canvas/canvas-menu-content";
import type { CanvasActions } from "@/lib/workspace-atoms";

type CanvasContextMenuProps = {
  children: React.ReactNode;
  canvasId?: Id<"canvases">;
  isPublic?: boolean;
  isCollabEnabled?: boolean;
  actions?: CanvasActions;
  categories?: { _id: string; name: string }[];
  onNewWorkspace: () => void;
  onImportWorkspace: () => void;
  onDeleteClick?: () => void;
  copyPublicLink?: (e: React.MouseEvent) => void;
};

export function CanvasContextMenu({
  children,
  canvasId,
  isPublic = false,
  isCollabEnabled = false,
  actions,
  categories,
  onNewWorkspace,
  onImportWorkspace,
  onDeleteClick,
  copyPublicLink,
}: Readonly<CanvasContextMenuProps>) {
  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <div className="w-full h-full">
            {children}
          </div>
        }
        className="w-full h-full"
      />
      <ContextMenuContent>
        <ContextMenuItem onClick={onNewWorkspace}>
          <Plus className="mr-2 h-4 w-4" />
          New Workspace
        </ContextMenuItem>
        <ContextMenuItem onClick={onImportWorkspace}>
          <Upload className="mr-2 h-4 w-4" />
          Import Workspace
        </ContextMenuItem>
        {canvasId && (
          <>
            <ContextMenuSeparator />
            <CanvasMenuContent
              canvasId={canvasId}
              isPublic={isPublic}
              isCollabEnabled={isCollabEnabled}
              actions={actions}
              categories={categories}
              onDeleteClick={onDeleteClick ?? (() => {})}
              copyPublicLink={copyPublicLink ?? ((e) => {})}
            />
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}