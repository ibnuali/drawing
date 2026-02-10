"use client";

import * as React from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type ExcalidrawWrapperProps = {
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
    userId?: string | null | undefined;
  };
  initialData?: string;
  onSave?: (data: string) => void;
  onBack?: () => void;
  viewMode?: boolean;
};

const SAVE_DEBOUNCE_MS = 1000;

const ExcalidrawWrapper: React.FC<ExcalidrawWrapperProps> = ({
  user,
  initialData,
  onSave,
  onBack,
  viewMode = false,
}) => {
  const [excalidrawAPI, setExcalidrawAPI] =
    React.useState<ExcalidrawImperativeAPI | null>(null);
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialScene = React.useMemo(() => {
    if (!initialData) return undefined;
    try {
      return JSON.parse(initialData);
    } catch {
      return undefined;
    }
  }, [initialData]);

  const handleChange = React.useCallback(() => {
    if (!excalidrawAPI || !onSave) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const data = JSON.stringify({
        elements,
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          gridSize: appState.gridSize,
        },
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
        UIOptions={{
          canvasActions: {
            loadScene: !viewMode,
            clearCanvas: !viewMode,
          },
        }}
        renderTopRightUI={() => (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft />
                Back
              </Button>
            )}
            <span style={{ fontWeight: "bold", fontSize: 14 }}>
              {user.name}
            </span>
          </div>
        )}
      />
    </div>
  );
};

export default ExcalidrawWrapper;
