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

  // Use getForCollaboration instead of get — supports non-owner access
  const canvas = useQuery(
    api.canvases.getForCollaboration,
    userId ? { id: canvasId, userId } : "skip",
  );

  // Keep the original update mutation for the owner's own save path
  const updateCanvas = useMutation(api.canvases.update);

  // Track the Excalidraw API instance for the collaboration hook
  const [excalidrawAPI, setExcalidrawAPI] =
    React.useState<ExcalidrawImperativeAPI | null>(null);

  const collaborationEnabled = !!canvas?.collaborationEnabled;

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
    if (canvas?.title) {
      document.title = `Drawing - ${canvas.title}`;
    }
    return () => {
      document.title = "Drawing";
    };
  }, [canvas?.title]);

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

  if (sessionPending || !session || canvas === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  // Canvas not found OR collaboration disabled for non-owner
  if (canvas === null) {
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
      initialData={canvas.data}
      onSave={handleChange}
      onBack={() => router.push("/workspace")}
      isCollaborating={isCollaborating}
      collaborators={collaborators}
      onPointerUpdate={handlePointerUpdate}
      onExcalidrawAPI={handleExcalidrawAPI}
    />
  );
}
