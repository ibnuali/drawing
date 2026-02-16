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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

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

  // Unsaved-changes dialog state
  const [showLeaveDialog, setShowLeaveDialog] = React.useState(false);
  const pendingNavigationRef = React.useRef<string | null>(null);

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

  // --- Navigation guard ---
  // Determines if we should block navigation (non-collab owner with pending save)
  const shouldBlock = React.useCallback(() => {
    if (collaborationEnabled || !isOwner || isViewer) return false;
    const handle = wrapperRef.current;
    if (!handle) return false;

    // No pending debounced save — nothing to worry about
    if (!handle.hasPendingChanges()) return false;

    // Never saved this session — canvas hasn't been modified
    const lastSaved = handle.getLastSavedAt();
    if (!lastSaved) return false;

    return true;
  }, [collaborationEnabled, isOwner, isViewer]);

  // beforeunload — browser native prompt for tab close / hard refresh
  React.useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (shouldBlock()) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [shouldBlock]);

  // popstate — intercept browser back/forward
  React.useEffect(() => {
    const handler = () => {
      if (shouldBlock()) {
        // Push the current URL back so we stay on the page
        window.history.pushState(null, "", window.location.href);
        pendingNavigationRef.current = "/workspace";
        setShowLeaveDialog(true);
      }
    };
    // Push an extra history entry so we can catch the first back press
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [shouldBlock]);

  // Back button click handler — check for unsaved changes first
  const handleBack = React.useCallback(() => {
    if (shouldBlock()) {
      pendingNavigationRef.current = "/workspace";
      setShowLeaveDialog(true);
    } else {
      router.push("/workspace");
    }
  }, [shouldBlock, router]);

  const handleSaveAndLeave = React.useCallback(() => {
    wrapperRef.current?.flushSave();
    setShowLeaveDialog(false);
    const dest = pendingNavigationRef.current ?? "/workspace";
    pendingNavigationRef.current = null;
    router.push(dest);
  }, [router]);

  const handleLeaveWithoutSaving = React.useCallback(() => {
    setShowLeaveDialog(false);
    const dest = pendingNavigationRef.current ?? "/workspace";
    pendingNavigationRef.current = null;
    router.push(dest);
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
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Would you like to save before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLeaveWithoutSaving}>
              Leave without saving
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAndLeave}>
              Save &amp; Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
