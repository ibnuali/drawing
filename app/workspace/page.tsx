"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { CanvasGrid } from "@/components/workspace/canvas-grid";
import { SharedCanvasGrid } from "@/components/workspace/shared-canvas-grid";
import { CreateCanvasDialog } from "@/components/workspace/create-canvas-dialog";
import { RenameCanvasDialog } from "@/components/workspace/rename-canvas-dialog";
import { Spinner } from "@/components/ui/spinner";

export default function WorkspacePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [renameTarget, setRenameTarget] = React.useState<Id<"canvases"> | null>(
    null,
  );

  const canvases = useQuery(
    api.canvases.list,
    session?.user
      ? {
          ownerId: session.user.id,
          search: searchQuery.trim() || undefined,
        }
      : "skip",
  );
  const sharedCanvases = useQuery(
    api.canvases.listShared,
    session?.user
      ? {
          userId: session.user.id,
          search: searchQuery.trim() || undefined,
        }
      : "skip",
  );
  const createCanvas = useMutation(api.canvases.create);
  const removeCanvas = useMutation(api.canvases.remove);
  const renameCanvas = useMutation(api.canvases.rename);
  const togglePublic = useMutation(api.canvases.togglePublic);

  const canvasIds = canvases?.map((c) => c._id);
  const activeCollaborators = useQuery(
    api.presence.getActiveCollaborators,
    canvasIds && canvasIds.length > 0 ? { canvasIds } : "skip",
  );

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

  const handleCreate = async (title: string) => {
    const id = await createCanvas({
      title,
      ownerId: session.user.id,
    });
    router.push(`/workspace/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: Id<"canvases">) => {
    e.stopPropagation();
    await removeCanvas({ id });
  };

  const handleRename = (id: Id<"canvases">) => {
    setRenameTarget(id);
  };

  const renameTargetCanvas = canvases?.find((c) => c._id === renameTarget);

  const handleRenameConfirm = (newTitle: string) => {
    if (renameTarget) {
      renameCanvas({ id: renameTarget, title: newTitle });
    }
  };

  const handleTogglePublic = (id: Id<"canvases">) => {
    togglePublic({ id });
  };

  const handleCopyCollabLink = (id: Id<"canvases">) => {
    navigator.clipboard.writeText(`${window.location.origin}/workspace/${id}`);
  };

  return (
    <div className="bg-background min-h-screen">
      <WorkspaceHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <CanvasGrid
        canvases={canvases}
        onCreate={() => setCreateDialogOpen(true)}
        onOpen={(id) => router.push(`/workspace/${id}`)}
        onDelete={handleDelete}
        onRename={handleRename}
        onTogglePublic={handleTogglePublic}
        onCopyCollabLink={handleCopyCollabLink}
        activeCollaborators={activeCollaborators ?? undefined}
      />
      {sharedCanvases && (
        <SharedCanvasGrid
          canvases={sharedCanvases}
          onOpen={(id) => router.push(`/workspace/${id}`)}
        />
      )}
      <CreateCanvasDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreate}
      />
      <RenameCanvasDialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
        currentTitle={renameTargetCanvas?.title ?? ""}
        onRename={handleRenameConfirm}
      />
    </div>
  );
}
