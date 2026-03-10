"use client";

import { cn } from "@/lib/utils";
import { FolderOpen, TrashIcon, Pencil } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export function CategorySkeleton() {
  return (
    <>
      <div className="my-2 border-t border-border/60" />
      <span className="text-muted-foreground mb-1 px-3 text-[10px] font-medium uppercase tracking-wider">
        Categories
      </span>
      <div className="flex flex-col gap-0.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i+1}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5"
          >
            <div className="bg-muted size-3.5 shrink-0 animate-pulse rounded" />
            <div className="bg-muted h-5 w-40 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </>
  );
}

interface CategoryItemProps {
  categoryName: string;
  isActive: boolean;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function CategoryItem({
  categoryName,
  isActive,
  onClick,
  onRename,
  onDelete,
}: Readonly<CategoryItemProps>) {
  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <button
            onClick={onClick}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors cursor-pointer truncate",
              "hover:bg-accent hover:text-accent-foreground",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground",
            )}
          >
            <FolderOpen className="size-3.5 shrink-0" />
            <span className="truncate">{categoryName}</span>
          </button>
        }
      />
      <ContextMenuContent>
        <ContextMenuItem onClick={onRename}>
          <Pencil />
          Rename
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" onClick={onDelete}>
          <TrashIcon />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}