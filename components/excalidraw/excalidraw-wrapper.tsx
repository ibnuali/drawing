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
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type ExcalidrawWrapperProps = {
  initialData?: string;
  onSave?: (data: string) => void;
  onBack?: () => void;
  viewMode?: boolean;
  // Collaboration props
  isCollaborating?: boolean;
  collaborators?: Map<SocketId, Collaborator>;
  onPointerUpdate?: (payload: {
    pointer: { x: number; y: number; tool: "pointer" | "laser" };
    button: "down" | "up";
    pointersMap: Map<number, { x: number; y: number }>;
  }) => void;
  onExcalidrawAPI?: (api: ExcalidrawImperativeAPI) => void;
};

const SAVE_DEBOUNCE_MS = 1000;

const ExcalidrawWrapper: React.FC<ExcalidrawWrapperProps> = ({
  initialData,
  onSave,
  onBack,
  viewMode = false,
  isCollaborating = false,
  collaborators,
  onPointerUpdate,
  onExcalidrawAPI,
}) => {
  const [excalidrawAPI, setExcalidrawAPI] =
    React.useState<ExcalidrawImperativeAPI | null>(null);

  // Notify parent when the API becomes available
  React.useEffect(() => {
    if (excalidrawAPI && onExcalidrawAPI) {
      onExcalidrawAPI(excalidrawAPI);
    }
  }, [excalidrawAPI, onExcalidrawAPI]);
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Push collaborators into Excalidraw whenever the map changes
  React.useEffect(() => {
    if (!excalidrawAPI || !collaborators) return;
    excalidrawAPI.updateScene({ collaborators });
  }, [excalidrawAPI, collaborators]);

  const handleChange = React.useCallback(() => {
    if (!excalidrawAPI || !onSave) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const allFiles = excalidrawAPI.getFiles();

      // Collect only files referenced by image elements on the canvas
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
      onSave(data);
    }, SAVE_DEBOUNCE_MS);
  }, [excalidrawAPI, onSave]);

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
        UIOptions={{
          canvasActions: {
            loadScene: !viewMode,
            clearCanvas: !viewMode,
          },
        }}
      >
        {onBack && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onBack}
                  className="absolute left-20 bg-[#ececf4] hover:bg-primary/10 shadow border-0 top-4 z-10 flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              }
            />
            <TooltipContent>
              <p>Back</p>
            </TooltipContent>
          </Tooltip>
        )}
      </Excalidraw>
    </div>
  );
};

export default ExcalidrawWrapper;
