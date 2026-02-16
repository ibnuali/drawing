"use client";

import * as React from "react";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { CanvasCard } from "./canvas-card";
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CanvasActions, CollaboratorInfo } from "@/lib/workspace-atoms";

type CategorySectionProps = {
  category: Doc<"categories">;
  canvases: Doc<"canvases">[];
  isFirst: boolean;
  isLast: boolean;
  onToggleCollapse: (id: Id<"categories">) => void;
  onRename: (id: Id<"categories">) => void;
  onDelete: (id: Id<"categories">) => void;
  onMoveUp: (id: Id<"categories">) => void;
  onMoveDown: (id: Id<"categories">) => void;
  canvasActions: CanvasActions;
  categories?: Doc<"categories">[];
  activeCollaborators?: Record<string, CollaboratorInfo>;
};

export function CategorySection({
  category,
  canvases,
  isFirst,
  isLast,
  onToggleCollapse,
  onRename,
  onDelete,
  onMoveUp,
  onMoveDown,
  canvasActions,
  categories,
  activeCollaborators,
}: CategorySectionProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const isCollapsed = category.isCollapsed === true;

  return (
    <section className="group/category mb-6">
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => onToggleCollapse(category._id)}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          aria-label={isCollapsed ? "Expand category" : "Collapse category"}
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
          <span className="text-foreground text-sm font-medium">
            {category.name}
          </span>
        </button>
        <span className="text-muted-foreground text-xs">
          {canvases.length}
        </span>

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger
            className={cn(
              "text-muted-foreground hover:text-foreground ml-auto flex size-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover/category:opacity-100",
              menuOpen && "opacity-100",
            )}
          >
            <MoreHorizontal className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem onClick={() => onRename(category._id)}>
              <Pencil />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onMoveUp(category._id)}
              disabled={isFirst}
            >
              <ArrowUp />
              Move up
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onMoveDown(category._id)}
              disabled={isLast}
            >
              <ArrowDown />
              Move down
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                setMenuOpen(false);
                setDeleteOpen(true);
              }}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {canvases.map((canvas) => (
            <CanvasCard
              key={canvas._id}
              canvas={canvas}
              actions={canvasActions}
              collaborators={activeCollaborators?.[canvas._id]}
              categories={categories?.map((c) => ({ _id: c._id, name: c.name }))}
            />
          ))}
          {canvases.length === 0 && (
            <p className="text-muted-foreground col-span-full py-4 text-center text-xs">
              No canvases in this category
            </p>
          )}
        </div>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{category.name}&rdquo;?
              {canvases.length > 0
                ? ` ${canvases.length} canvas${canvases.length === 1 ? "" : "es"} will be moved to Uncategorized.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onDelete(category._id);
                setDeleteOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
