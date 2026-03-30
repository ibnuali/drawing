"use client";

import * as React from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import type {
  ExcalidrawImperativeAPI,
  Collaborator,
  SocketId,
  BinaryFileData,
  NonDeletedExcalidrawElement,
  AppState,
  LibraryItems,
} from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useTheme } from "next-themes";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { SaveTracker } from "@/lib/save-tracker";
import { useSession } from "@/lib/auth-client";

export interface ExcalidrawWrapperHandle {
  /** Immediately save any pending changes. */
  flushSave: () => void;
  /** Returns true when there is a pending debounced save. */
  hasPendingChanges: () => boolean;
  /** Returns the last saved timestamp, or null if never saved this session. */
  getLastSavedAt: () => Date | null;
}

interface ExcalidrawWrapperProps {
  initialData?: string;
  onSave?: (data: string) => void;
  onBack?: () => void;
  viewMode?: boolean;
  isCollaborating?: boolean;
  collaborators?: Map<SocketId, Collaborator>;
  onPointerUpdate?: (payload: {
    pointer: { x: number; y: number; tool: "pointer" | "laser" };
    button: "down" | "up";
    pointersMap: Map<number, { x: number; y: number }>;
  }) => void;
  onExcalidrawAPI?: (api: ExcalidrawImperativeAPI) => void;
  toolbarExtras?: React.ReactNode;
  topRightUI?: React.ReactNode;
  canvasId?: Id<"canvases">;
}

const SAVE_DEBOUNCE_MS = 1000;

const ExcalidrawWrapper = React.forwardRef<
  ExcalidrawWrapperHandle,
  ExcalidrawWrapperProps
>(function ExcalidrawWrapper(
  {
    initialData,
    onSave,
    onBack,
    viewMode = false,
    isCollaborating = false,
    collaborators,
    onPointerUpdate,
    onExcalidrawAPI,
    toolbarExtras,
    topRightUI,
    canvasId,
  },
  ref,
) {
  const { resolvedTheme } = useTheme();
  const { data: session } = useSession();
  const [excalidrawAPI, setExcalidrawAPI] =
    React.useState<ExcalidrawImperativeAPI | null>(null);
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);
  const uploadThumbnails = useAction(api.canvases.uploadThumbnails);

  // Load library items from Convex (shared across all users)
  const libraryItemsData = useQuery(api.libraryItems.list, {});

  React.useEffect(() => {
    if (excalidrawAPI && onExcalidrawAPI) {
      onExcalidrawAPI(excalidrawAPI);
    }
  }, [excalidrawAPI, onExcalidrawAPI]);

  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTrackerRef = React.useRef<SaveTracker>(new SaveTracker());

  React.useEffect(() => {
    saveTrackerRef.current.reset(initialData ?? undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initialScene = React.useMemo(() => {
    if (!initialData) return undefined;
    try {
      const parsed = JSON.parse(initialData);
      return {
        elements: parsed.elements,
        appState: parsed.appState,
        files: parsed.files,
      };
    } catch {
      return undefined;
    }
  }, [initialData]);

  // Convert Convex library items to Excalidraw LibraryItems format
  const libraryItems = React.useMemo((): LibraryItems | undefined => {
    if (!libraryItemsData) return undefined;

    const allItems: {
      id: string;
      status: "published";
      elements: readonly NonDeletedExcalidrawElement[];
      created: number;
      name?: string;
    }[] = [];

    for (const item of libraryItemsData) {
      try {
        const parsed = JSON.parse(item.elements);

        // Handle v1 .excalidrawlib format: { type: "excalidrawlib", library: [[elements], [elements], ...] }
        if (parsed.type === "excalidrawlib" && Array.isArray(parsed.library)) {
          // Each array in library is a separate library item (v1 format)
          parsed.library.forEach((elementsArray: unknown[], index: number) => {
            if (Array.isArray(elementsArray)) {
              allItems.push({
                id: `${item._id}-${index}`,
                status: "published" as const,
                elements: elementsArray as readonly NonDeletedExcalidrawElement[],
                created: item.createdAt,
                name: `${item.name} ${index + 1}`,
              });
            }
          });
        }
        // Handle v2 format: { elements: [...] }
        else if (Array.isArray(parsed)) {
          allItems.push({
            id: item._id,
            status: "published" as const,
            elements: parsed as readonly NonDeletedExcalidrawElement[],
            created: item.createdAt,
            name: item.name,
          });
        }
        else if (Array.isArray(parsed.elements)) {
          allItems.push({
            id: item._id,
            status: "published" as const,
            elements: parsed.elements as readonly NonDeletedExcalidrawElement[],
            created: item.createdAt,
            name: item.name,
          });
        }
      } catch {
        // Skip invalid items
      }
    }

    return allItems.length > 0 ? (allItems as LibraryItems) : undefined;
  }, [libraryItemsData]);

  // Merge initial scene with library items
  const initialDataWithLibrary = React.useMemo(() => {
    if (!initialScene && !libraryItems) return undefined;
    return {
      ...initialScene,
      libraryItems,
    };
  }, [initialScene, libraryItems]);

  React.useEffect(() => {
    if (!excalidrawAPI || !collaborators) return;
    excalidrawAPI.updateScene({ collaborators });
  }, [excalidrawAPI, collaborators]);

  // Update library when library items change
  React.useEffect(() => {
    if (!excalidrawAPI || !libraryItems) return;
    excalidrawAPI.updateLibrary({
      libraryItems,
    });
  }, [excalidrawAPI, libraryItems]);

  const generateThumbnail = React.useCallback(async (
    elements: readonly NonDeletedExcalidrawElement[],
    appState: AppState,
    files: Record<string, BinaryFileData>,
  ) => {
    if (!canvasId) return;

    try {
      // Generate both light and dark thumbnails
      const [lightBlob, darkBlob] = await Promise.all([
        exportToBlob({
          elements,
          appState: {
            viewBackgroundColor: appState.viewBackgroundColor,
            exportWithDarkMode: false,
          },
          files,
          maxWidthOrHeight: 300,
          exportPadding: 20,
          mimeType: "image/png",
        }),
        exportToBlob({
          elements,
          appState: {
            viewBackgroundColor: appState.viewBackgroundColor,
            exportWithDarkMode: true,
          },
          files,
          maxWidthOrHeight: 300,
          exportPadding: 20,
          mimeType: "image/png",
        }),
      ]);

      // Convert blobs to base64 data URLs
      const blobToDataUrl = (blob: Blob): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

      const [lightDataUrl, darkDataUrl] = await Promise.all([
        blobToDataUrl(lightBlob),
        blobToDataUrl(darkBlob),
      ]);

      // Upload both thumbnails via Convex action
      await uploadThumbnails({ canvasId, lightDataUrl, darkDataUrl });
    } catch (error) {
      console.error("Failed to generate thumbnails:", error);
    }
  }, [canvasId, uploadThumbnails]);

  const flushSave = React.useCallback(() => {
    if (!excalidrawAPI || !onSave) return;

    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const allFiles = excalidrawAPI.getFiles();

    const usedFileIds = new Set(
      elements
        .filter((el) => el.type === "image" && el.fileId)
        .map((el) => el.fileId as string),
    );
    const usedFiles: Record<string, BinaryFileData> = {};
    for (const [id, file] of Object.entries(allFiles)) {
      if (usedFileIds.has(id)) {
        usedFiles[id] = file;
      }
    }

    const data = JSON.stringify({
      elements,
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor,
        gridSize: appState.gridSize,
      },
      files: usedFiles,
    });

    if (!saveTrackerRef.current.markChange(data)) return;

    onSave(data);
    saveTrackerRef.current.confirmSave(data);
    setLastSavedAt(new Date());

    // Generate and upload thumbnail
    if (canvasId && elements.length > 0) {
      generateThumbnail(elements, appState, usedFiles);
    }
  }, [excalidrawAPI, onSave, canvasId, generateThumbnail]);

  // Expose imperative handle to parent
  React.useImperativeHandle(ref, () => ({
    flushSave,
    hasPendingChanges: () => saveTimerRef.current !== null,
    getLastSavedAt: () => lastSavedAt,
  }), [flushSave, lastSavedAt]);

  // Register onChange callback via imperative API
  React.useEffect(() => {
    if (!excalidrawAPI || viewMode || !onSave) return;

    const unsubscribe = excalidrawAPI.onChange(() => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [excalidrawAPI, viewMode, onSave, flushSave]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={initialDataWithLibrary}
        viewModeEnabled={viewMode}
        isCollaborating={isCollaborating}
        onPointerUpdate={onPointerUpdate}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        renderTopRightUI={() => (topRightUI ? <>{topRightUI}</> : null)}
        UIOptions={{
          canvasActions: {
            loadScene: !viewMode,
            clearCanvas: !viewMode,
          },
        }}
      >
        {onBack && (
          <div className="absolute left-20 top-4 z-10 flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onBack}
                    className="bg-secondary hover:bg-primary/10 shadow border-0 flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                }
              />
              <TooltipContent>
                <p>Back</p>
              </TooltipContent>
            </Tooltip>
            {lastSavedAt && (
              <span className="bg-secondary/80 text-primary rounded-md px-2 py-1 text-xs shadow backdrop-blur-sm">
                Saved {lastSavedAt.toLocaleTimeString()}
              </span>
            )}
          </div>
        )}
        {toolbarExtras && (
          <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
            {toolbarExtras}
          </div>
        )}
      </Excalidraw>
    </div>
  );
});

export default ExcalidrawWrapper;
