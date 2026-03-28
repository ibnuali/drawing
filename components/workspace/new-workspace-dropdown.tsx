"use client";

import { Plus, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSetAtom } from "jotai";
import { createCanvasDialogAtom, importCanvasDialogAtom } from "@/lib/workspace-atoms";

export function NewWorkspaceDropdown() {
  const setCreateDialogOpen = useSetAtom(createCanvasDialogAtom);
  const setImportDialogOpen = useSetAtom(importCanvasDialogAtom);

  const handleNewWorkspace = () => {
    setCreateDialogOpen(true);
  };

  const handleImportWorkspace = () => {
    setImportDialogOpen(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
        <Plus className="size-4" />
        New
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4}>
        <DropdownMenuItem onClick={handleNewWorkspace}>
          <Plus className="mr-2 size-4" />
          New workspace
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleImportWorkspace}>
          <Upload className="mr-2 size-4" />
          Import workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}