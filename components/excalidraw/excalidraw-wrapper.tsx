"use client";

import * as React from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import type {
  ExcalidrawImperativeAPI,
  Collaborator,
  SocketId,
  BinaryFileData,
} from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { SaveTracker } from "@/lib/save-tracker";

export type ExcalidrawWrapperHandle = {
  /** Immediately save any pending changes. */
  flushSave: () => void;
  /** Returns true when there is a pending debounced save. */
  hasPendingChanges: () => boolean;
  /** Returns the last saved timestamp, or null if never saved this session. */
  getLastSavedAt: () => Date | null;
};

type ExcalidrawWrapperProps = {
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
};

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
  },
  ref,
) {
  const { resolvedTheme } = useTheme();
  const [excalidrawAPI, setExcalidrawAPI] =
    React.useState<ExcalidrawImperativeAPI | null>(null);
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);

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

  React.useEffect(() => {
    if (!excalidrawAPI || !collaborators) return;
    excalidrawAPI.updateScene({ collaborators });
  }, [excalidrawAPI, collaborators]);

  const flushSave = React.useCallback(() => {
    if (!excalidrawAPI || !onSave) return;

    const elements = excalidrawAPI.getSceneElements();
    if (elements.length === 0) return;

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
  }, [excalidrawAPI, onSave]);

  const handleChange = React.useCallback(() => {
    if (!excalidrawAPI || !onSave) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
  }, [excalidrawAPI, onSave, flushSave]);

  // Expose imperative handle to parent
  React.useImperativeHandle(ref, () => ({
    flushSave,
    hasPendingChanges: () => saveTimerRef.current !== null,
    getLastSavedAt: () => lastSavedAt,
  }), [flushSave, lastSavedAt]);

  // Cleanup timer on unmount (no flush — parent handles that)
  React.useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

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
        initialData={initialScene}
        onChange={viewMode ? undefined : handleChange}
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
