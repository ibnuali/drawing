"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CanvasGrid } from "@/components/dashboard/canvas-grid";
import { CreateCanvasDialog } from "@/components/dashboard/create-canvas-dialog";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  const canvases = useQuery(
    api.canvases.list,
    session?.user
      ? {
          ownerId: session.user.id,
          search: searchQuery.trim() || undefined,
        }
      : "skip",
  );
  const createCanvas = useMutation(api.canvases.create);
  const removeCanvas = useMutation(api.canvases.remove);
  const renameCanvas = useMutation(api.canvases.rename);
  const togglePublic = useMutation(api.canvases.togglePublic);

  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  const handleCreate = async (title: string) => {
    const id = await createCanvas({
      title,
      ownerId: session.user.id,
    });
    router.push(`/dashboard/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: Id<"canvases">) => {
    e.stopPropagation();
    await removeCanvas({ id });
  };

  const handleRename = (id: Id<"canvases">) => {
    const canvas = canvases?.find((c) => c._id === id);
    const newTitle = window.prompt("Rename canvas", canvas?.title ?? "");
    if (newTitle && newTitle.trim()) {
      renameCanvas({ id, title: newTitle.trim() });
    }
  };

  const handleTogglePublic = (id: Id<"canvases">) => {
    togglePublic({ id });
  };

  return (
    <div className="bg-background min-h-screen">
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <CanvasGrid
        canvases={canvases}
        onCreate={() => setCreateDialogOpen(true)}
        onOpen={(id) => router.push(`/dashboard/${id}`)}
        onDelete={handleDelete}
        onRename={handleRename}
        onTogglePublic={handleTogglePublic}
      />
      <CreateCanvasDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreate}
      />
    </div>
  );
}
