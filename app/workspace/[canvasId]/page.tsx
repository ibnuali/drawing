"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw";
import type { ExcalidrawWrapperHandle } from "@/components/excalidraw/excalidraw-wrapper";
import { useCollaboration } from "@/hooks/use-collaboration";
import { ShareButton } from "@/components/workspace/share-button";
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

  const [initialCanvasData, setInitialCanvasData] = React.useState<
    string | undefined
  >(undefined);
  const [hasLoaded, setHasLoaded] = React.useState(false);

  const wrapperRef = React.useRef<ExcalidrawWrapperHandle>(null);

  const canvas = useQuery(
    api.canvases.get,
    userId ? { id: canvasId } : "skip",
  );

  React.useEffect(() => {
    if (canvas !== undefined && !hasLoaded) {
      setInitialCanvasData(canvas?.data);
      setHasLoaded(true);
    }
  }, [canvas, hasLoaded]);

  const effectiveCanvas = canvas;
  const isOwner = !!effectiveCanvas && effectiveCanvas.ownerId === userId;
  const collaborationEnabled = !!effectiveCanvas?.collaborationEnabled;

  const accessRecord = useQuery(
    api.access.getCollaborators,
    !isOwner && userId && effectiveCanvas ? { canvasId } : "skip",
  );

  const hasExplicitAccess = !!accessRecord?.some(
    (c) => c.userId === userId && c.accessLevel !== "owner",
  );
  const hasLinkAccess = !!effectiveCanvas?.linkAccessEnabled;
  const hasAccess =
    isOwner || hasExplicitAccess || hasLinkAccess || collaborationEnabled;

  const collabCanvas = useQuery(
    api.canvases.getForCollaboration,
    hasAccess && !isOwner && userId ? { id: canvasId, userId } : "skip",
  );

  const resolvedCanvas = !isOwner && hasAccess ? collabCanvas : effectiveCanvas;
  const isViewer = !isOwner && collabCanvas?.userAccessLevel === "viewer";

  const updateCanvas = useMutation(api.canvases.update);

  const [excalidrawAPI, setExcalidrawAPI] =
    React.useState<ExcalidrawImperativeAPI | null>(null);

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

  React.useEffect(() => {
    if (resolvedCanvas?.title) {
      document.title = `Drawing - ${resolvedCanvas.title}`;
    }
    return () => {
      document.title = "Drawing";
    };
  }, [resolvedCanvas?.title]);

  const handleChange = React.useCallback(
    (data: string) => {
      if (!collaborationEnabled && isOwner) {
        updateCanvas({ id: canvasId, data });
      }
    },
    [canvasId, updateCanvas, collaborationEnabled, isOwner],
  );

  const handleExcalidrawAPI = React.useCallback(
    (api: ExcalidrawImperativeAPI) => {
      setExcalidrawAPI(api);
    },
    [],
  );

  // beforeunload — flush pending save on tab close / hard refresh
  React.useEffect(() => {
    const handler = () => {
      wrapperRef.current?.flushSave();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // popstate — flush pending save on browser back/forward, then allow navigation
  React.useEffect(() => {
    const handler = () => {
      wrapperRef.current?.flushSave();
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  // Back button click handler — flush any pending save and navigate
  const handleBack = React.useCallback(() => {
    wrapperRef.current?.flushSave();
    router.push("/workspace");
  }, [router]);

  // Derive viewMode once for reuse
  const viewModeActive = isViewer;

  if (
    sessionPending ||
    !session ||
    !hasLoaded ||
    (!isOwner && hasAccess && collabCanvas === undefined)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (effectiveCanvas === null || !hasAccess) {
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

  const initialDataForEditor = isOwner
    ? initialCanvasData
    : resolvedCanvas?.data;

  return (
    <>
      <ExcalidrawWrapper
        ref={wrapperRef}
        initialData={initialDataForEditor}
        onSave={handleChange}
        onBack={handleBack}
        viewMode={viewModeActive}
        isCollaborating={isCollaborating}
        collaborators={collaborators}
        onPointerUpdate={handlePointerUpdate}
        onExcalidrawAPI={handleExcalidrawAPI}
        topRightUI={
          <ShareButton canvasId={canvasId} isOwner={isOwner} userId={userId} />
        }
      />
    </>
  );
}
