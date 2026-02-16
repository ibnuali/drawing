"use client";

import * as React from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryTabProps = {
  category: Doc<"categories">;
  count: number;
  isFirst: boolean;
  isLast: boolean;
  onRename: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

export function CategoryTab({
  category,
  count,
  isFirst,
  isLast,
  onRename,
  onDelete,
  onMoveUp,
  onMoveDown,
}: CategoryTabProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="group/cat-tab relative flex items-center">
      <TabsTrigger value={category._id} className="pr-6">
        {category.name}
        <span className="text-muted-foreground ml-1 text-[10px]">{count}</span>
      </TabsTrigger>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger
          className={cn(
            "text-muted-foreground hover:text-foreground absolute right-0.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded opacity-0 transition-opacity group-hover/cat-tab:opacity-100",
            menuOpen && "opacity-100",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="size-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={4}>
          <DropdownMenuItem onClick={onRename}>
            <Pencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onMoveUp} disabled={isFirst}>
            <ArrowLeft />
            Move left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMoveDown} disabled={isLast}>
            <ArrowRight />
            Move right
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
