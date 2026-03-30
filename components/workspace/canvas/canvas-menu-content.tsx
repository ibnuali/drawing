import type { Id } from "@/convex/_generated/dataModel";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import { Pencil, Trash2, Globe, Lock, Link, FolderInput, Copy, Star } from "lucide-react";
import type { CanvasActions } from "@/lib/workspace-atoms";
import type { CategoryOption } from "@/lib/types";

interface CanvasMenuContentProps {
  canvasId: Id<"canvases">;
  isPublic: boolean;
  isCollabEnabled: boolean;
  isFavorite: boolean;
  actions?: CanvasActions;
  categories?: CategoryOption[];
  onDeleteClick: () => void;
  onToggleFavorite?: (id: Id<"canvases">) => void;
  copyPublicLink: (e: React.MouseEvent) => void;
}

export function CanvasMenuContent({
  canvasId,
  isPublic,
  isCollabEnabled,
  isFavorite,
  actions,
  categories,
  onDeleteClick,
  onToggleFavorite,
  copyPublicLink,
}: Readonly<CanvasMenuContentProps>) {
  return (
    <ContextMenuContent>
      <ContextMenuItem onClick={() => onToggleFavorite?.(canvasId)}>
        <Star className={isFavorite ? "fill-yellow-500 text-yellow-500" : ""} />
        {isFavorite ? "Remove from favorites" : "Add to favorites"}
      </ContextMenuItem>
      <ContextMenuItem onClick={() => actions?.onRename(canvasId)}>
        <Pencil />
        Rename
      </ContextMenuItem>
      <ContextMenuItem onClick={() => actions?.onDuplicate(canvasId)}>
        <Copy />
        Duplicate
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