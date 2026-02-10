"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw";
import { useCollaboration } from "@/hooks/use-collaboration";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";

const ExcalidrawWrapper = dynamic(
  async () =>
    (await import("@/components/excalidraw/excalidraw-wrapper")).default,
  { ssr: false },
);

export default function CanvasPage() {
  const params = useParams<{ canvasId: string }>();
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();

  const canvasId = params.canvasId as Id<"canvases">;
  const userId = session?.user?.id ?? "";

  // Lightweight query to load the canvas and determine collaboration state
  const canvas = useQuery(api.canvases.get, userId ? { id: canvasId } : "skip");
  const isOwner = !!canvas && canvas.ownerId === userId;
  const collaborationEnabled = !!canvas?.collaborationEnabled;

  // Only subscribe to the collaboration-aware query when collab is active
  const collabCanvas = useQuery(
    api.canvases.getForCollaboration,
    collaborationEnabled && userId ? { id: canvasId, userId } : "skip",
  );

  // When collaboration is on, use the collab query (has access control);
  // otherwise use the basic canvas for the owner's solo path.
  const resolvedCanvas = collaborationEnabled ? collabCanvas : canvas;

  // Keep the original update mutation for the owner's own save path
  const updateCanvas = useMutation(api.canvases.update);

  // Track the Excalidraw API instance for the collaboration hook
  const [excalidrawAPI, setExcalidrawAPI] =
    React.useState<ExcalidrawImperativeAPI | null>(null);

  // Enable the collaboration hook when the canvas has collaboration turned on
  const { isCollaborating, collaborators, handlePointerUpdate } =
    useCollaboration({
      canvasId,
      user: { id: userId, name: session?.user?.name ?? "Anonymous" },
      excalidrawAPI,
      enabled: collaborationEnabled,
    });

  React.useEffect(() => {
    if (!sessionPending && !session) {
      router.push("/sign-in");
    }
  }, [sessionPending, session, router]);

  // Set the browser tab title to the canvas name
  React.useEffect(() => {
    if (resolvedCanvas?.title) {
      document.title = `Drawing - ${resolvedCanvas.title}`;
    }
    return () => {
      document.title = "Drawing";
    };
  }, [resolvedCanvas?.title]);

  // Owner save handler — only used when collaboration is NOT enabled
  // (when collaboration is enabled, the hook handles element sync)
  const handleChange = React.useCallback(
    (data: string) => {
      if (!collaborationEnabled) {
        updateCanvas({ id: canvasId, data });
      }
    },
    [canvasId, updateCanvas, collaborationEnabled],
  );

  const handleExcalidrawAPI = React.useCallback(
    (api: ExcalidrawImperativeAPI) => {
      setExcalidrawAPI(api);
    },
    [],
  );

  if (
    sessionPending ||
    !session ||
    canvas === undefined ||
    (collaborationEnabled && collabCanvas === undefined)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  // Canvas not found, or non-owner trying to access with collaboration disabled
  if (canvas === null || (!isOwner && !collaborationEnabled)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-sm">
          This canvas is not available. It may not exist or collaboration may be
          disabled.
        </p>
        <button
          className="text-sm underline"
          onClick={() => router.push("/workspace")}
        >
          Back to workspace
        </button>
      </div>
    );
  }

  return (
    <ExcalidrawWrapper
      initialData={resolvedCanvas?.data}
      onSave={handleChange}
      onBack={() => router.push("/workspace")}
      isCollaborating={isCollaborating}
      collaborators={collaborators}
      onPointerUpdate={handlePointerUpdate}
      onExcalidrawAPI={handleExcalidrawAPI}
    />
  );
}
