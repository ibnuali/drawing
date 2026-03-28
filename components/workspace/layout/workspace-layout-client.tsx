"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { WorkspaceHeader } from "@/components/workspace/layout/workspace-header";
import { WorkspaceSidebar } from "@/components/workspace/layout/workspace-sidebar";
import { CreateCanvasDialog } from "@/components/workspace/canvas/create-canvas-dialog";
import { ImportCanvasDialog } from "@/components/workspace/canvas/import-canvas-dialog";
import { RenameCanvasDialog } from "@/components/workspace/canvas/rename-canvas-dialog";
import { CreateCategoryDialog } from "@/components/workspace/category/create-category-dialog";
import { RenameCategoryDialog } from "@/components/workspace/category/rename-category-dialog";
import { DeleteCategoryDialog } from "@/components/workspace/delete-category-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useWorkspaceSync } from "@/hooks/use-workspace-sync";

export function WorkspaceLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isPending } = useWorkspaceSync();

  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="bg-background flex h-screen flex-col">
      <WorkspaceHeader />

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <WorkspaceSidebar />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-2">
          {children}
        </main>
      </div>

      <CreateCanvasDialog />
      <ImportCanvasDialog />
      <RenameCanvasDialog />
      <CreateCategoryDialog />
      <RenameCategoryDialog />
      <DeleteCategoryDialog />
    </div>
  );
}