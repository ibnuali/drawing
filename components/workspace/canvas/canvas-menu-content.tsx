import type { Id } from "@/convex/_generated/dataModel";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import { Pencil, Trash2, Globe, Lock, Link, FolderInput } from "lucide-react";
import type { CanvasActions } from "@/lib/workspace-atoms";

type CategoryOption = {
  _id: string;
  name: string;
};

type CanvasMenuContentProps = {
  canvasId: Id<"canvases">;
  isPublic: boolean;
  isCollabEnabled: boolean;
  actions?: CanvasActions;
  categories?: CategoryOption[];
  onDeleteClick: () => void;
  copyPublicLink: (e: React.MouseEvent) => void;
};

export function CanvasMenuContent({
  canvasId,
  isPublic,
  isCollabEnabled,
  actions,
  categories,
  onDeleteClick,
  copyPublicLink,
}: Readonly<CanvasMenuContentProps>) {
  return (
    <ContextMenuContent>
      <ContextMenuItem onClick={() => actions?.onRename(canvasId)}>
        <Pencil />
        Rename
      </ContextMenuItem>
      <ContextMenuItem onClick={() => actions?.onTogglePublic(canvasId)}>
        {isPublic ? <Lock /> : <Globe />}
        {isPublic ? "Make private" : "Share public"}
      </ContextMenuItem>
      {isPublic && (
        <ContextMenuItem onClick={copyPublicLink}>
          <Link />
          Copy public link
        </ContextMenuItem>
      )}
      {isCollabEnabled && (
        <ContextMenuItem onClick={() => actions?.onCopyCollabLink(canvasId)}>
          <Link />
          Copy collab link
        </ContextMenuItem>
      )}
      {actions && categories && categories.length > 0 && (
        <>
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <FolderInput className="size-4 mr-2" />
              Move to category
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {categories.map((cat) => (
                <ContextMenuItem
                  key={cat._id}
                  onClick={() => actions.onMoveToCategory(canvasId, cat._id)}
                >
                  {cat.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        </>
      )}
      <ContextMenuSeparator />
      <ContextMenuItem variant="destructive" onClick={onDeleteClick}>
        <Trash2 />
        Move to trash
      </ContextMenuItem>
    </ContextMenuContent>
  );
}

export type { CategoryOption };