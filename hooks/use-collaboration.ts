"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type {
  ExcalidrawImperativeAPI,
  Collaborator,
  ExcalidrawElement,
  BinaryFileData,
  BinaryFiles,
  SocketId,
} from "@excalidraw/excalidraw";
import { getUserColor, reconcileElements } from "@/lib/collaboration";

// The generated api types may not include presence yet if codegen hasn't
// been re-run after adding convex/presence.ts. Cast through `any` so the
// runtime references resolve correctly.
/* eslint-disable @typescript-eslint/no-explicit-any */
const presenceApi = {
  getByCanvas: (api as any).presence?.getByCanvas,
  update: (api as any).presence?.update,
  remove: (api as any).presence?.remove,
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// --- Timing constants ---
const POINTER_THROTTLE_MS = 50;
const ELEMENT_SYNC_MS = 100; // throttle interval for element sync

export interface UseCollaborationOptions {
  canvasId: Id<"canvases">;
  user: { id: string; name: string };
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  enabled: boolean;
}

export interface UseCollaborationReturn {
  isCollaborating: boolean;
  collaborators: Map<SocketId, Collaborator>;
  handlePointerUpdate: (payload: {
    pointer: { x: number; y: number; tool: "pointer" | "laser" };
    button: "down" | "up";
  }) => void;
}

export function useCollaboration({
  canvasId,
  user,
  excalidrawAPI,
  enabled,
}: UseCollaborationOptions): UseCollaborationReturn {
  const userColor = useMemo(() => getUserColor(user.id), [user.id]);

  // --- Convex subscriptions ---
  // Subscribe to the canvas data for reconciling remote changes.
  // Only active when collaboration is enabled.
  const remoteCanvas = useQuery(
    api.canvases.getForCollaboration,
    enabled ? { id: canvasId, userId: user.id } : "skip",
  );

  const presenceRecords = useQuery(
    presenceApi.getByCanvas,
    enabled ? { canvasId } : "skip",
  );

  // --- Convex mutations ---
  const updatePresence = useMutation(presenceApi.update);
  const removePresence = useMutation(presenceApi.remove);
  const updateElements = useMutation(api.canvases.updateElements);

  // --- Refs for throttle/debounce timers and tracking ---
  const pointerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointerTimeRef = useRef(0);
  const lastElementSyncRef = useRef(0);
  const lastRemoteDataRef = useRef<string | undefined>(undefined);
  const isApplyingRemoteRef = useRef(false);

  // --- Mount/unmount: insert and remove presence ---
  useEffect(() => {
    if (!enabled) return;

    updatePresence({
      canvasId,
      userId: user.id,
      userName: user.name,
      userColor,
    });

    return () => {
      removePresence({ canvasId, userId: user.id });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId, user.id, user.name, userColor, enabled]);

  // --- Apply remote element updates via reconcileElements ---
  useEffect(() => {
    if (!enabled || !excalidrawAPI || !remoteCanvas?.data) return;

    // Skip if we already processed this exact data string
    if (remoteCanvas.data === lastRemoteDataRef.current) return;
    lastRemoteDataRef.current = remoteCanvas.data;

    // Guard against re-entrant updates (our own writes echoing back)
    if (isApplyingRemoteRef.current) return;

    try {
      const parsed = JSON.parse(remoteCanvas.data);
      const remoteElements: ExcalidrawElement[] = Array.isArray(parsed)
        ? parsed
        : (parsed.elements ?? []);
      const remoteFiles: BinaryFiles = parsed.files ?? {};

      const localElements =
        excalidrawAPI.getSceneElements() as ExcalidrawElement[];

      const merged = reconcileElements(localElements, remoteElements);

      isApplyingRemoteRef.current = true;
      excalidrawAPI.updateScene({ elements: merged });

      // Restore any new image files from the remote data
      const newFiles: BinaryFileData[] = [];
      const localFiles = excalidrawAPI.getFiles();
      for (const [id, file] of Object.entries(remoteFiles)) {
        if (!localFiles[id]) {
          newFiles.push(file);
        }
      }
      if (newFiles.length > 0) {
        excalidrawAPI.addFiles(newFiles);
      }

      isApplyingRemoteRef.current = false;
    } catch {
      // Ignore deserialization errors from malformed data
    }
  }, [enabled, excalidrawAPI, remoteCanvas?.data]);

  // --- Build collaborators map from presence records ---
  const collaborators = useMemo<Map<SocketId, Collaborator>>(() => {
    const map = new Map<SocketId, Collaborator>();
    if (!presenceRecords || !enabled) return map;

    for (const record of presenceRecords) {
      // Skip the current user — Excalidraw renders them separately
      if (record.userId === user.id) continue;

      const selectedElementIds: Record<string, true> = {};
      for (const id of record.selectedElementIds) {
        selectedElementIds[id] = true;
      }

      const collaborator: Collaborator = {
        username: record.userName,
        color: { background: record.userColor, stroke: record.userColor },
        selectedElementIds,
        userState: record.isIdle ? "idle" : "active",
        id: record.userId,
      };

      if (record.pointer) {
        collaborator.pointer = {
          x: record.pointer.x,
          y: record.pointer.y,
          tool: "pointer",
        };
      }

      map.set(record.userId as unknown as SocketId, collaborator);
    }

    return map;
  }, [presenceRecords, enabled, user.id]);

  // --- Update Excalidraw collaborators when the map changes ---
  useEffect(() => {
    if (!enabled || !excalidrawAPI) return;
    excalidrawAPI.updateScene({ collaborators });
  }, [enabled, excalidrawAPI, collaborators]);

  // --- Throttled pointer update handler ---
  const handlePointerUpdate = useCallback(
    (payload: {
      pointer: { x: number; y: number; tool: "pointer" | "laser" };
      button: "down" | "up";
    }) => {
      if (!enabled) return;

      const now = Date.now();
      const elapsed = now - lastPointerTimeRef.current;

      if (elapsed >= POINTER_THROTTLE_MS) {
        lastPointerTimeRef.current = now;
        updatePresence({
          canvasId,
          userId: user.id,
          userName: user.name,
          userColor,
          pointer: { x: payload.pointer.x, y: payload.pointer.y },
        });
      } else {
        if (pointerTimerRef.current) clearTimeout(pointerTimerRef.current);
        pointerTimerRef.current = setTimeout(() => {
          lastPointerTimeRef.current = Date.now();
          updatePresence({
            canvasId,
            userId: user.id,
            userName: user.name,
            userColor,
            pointer: { x: payload.pointer.x, y: payload.pointer.y },
          });
        }, POINTER_THROTTLE_MS - elapsed);
      }
    },
    [enabled, canvasId, user.id, user.name, userColor, updatePresence],
  );

  // --- Throttled element sync via Excalidraw onChange listener ---
  // Sends immediately on first change, then throttles subsequent changes
  // so updates go out at most every ELEMENT_SYNC_MS.
  useEffect(() => {
    if (!enabled || !excalidrawAPI) return;

    const sendUpdate = (elements: readonly ExcalidrawElement[]) => {
      const typedElements = elements as ExcalidrawElement[];
      const allFiles = excalidrawAPI.getFiles();

      // Collect only files referenced by image elements
      const usedFileIds = new Set(
        typedElements
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
        elements: typedElements,
        files: usedFiles,
      });
      updateElements({ id: canvasId, data, userId: user.id });
      lastElementSyncRef.current = Date.now();
    };

    const unsubscribe = excalidrawAPI.onChange((elements) => {
      // Don't echo back remote updates we just applied
      if (isApplyingRemoteRef.current) return;

      const now = Date.now();
      const elapsed = now - lastElementSyncRef.current;

      if (elapsed >= ELEMENT_SYNC_MS) {
        // Enough time has passed — send immediately
        sendUpdate(elements);
      } else {
        // Schedule a trailing update
        if (elementTimerRef.current) clearTimeout(elementTimerRef.current);
        elementTimerRef.current = setTimeout(() => {
          // Re-read current elements at send time
          const currentElements = excalidrawAPI.getSceneElements();
          sendUpdate(currentElements);
        }, ELEMENT_SYNC_MS - elapsed);
      }
    });

    return () => {
      unsubscribe();
      if (elementTimerRef.current) clearTimeout(elementTimerRef.current);
    };
  }, [enabled, excalidrawAPI, canvasId, user.id, updateElements]);

  // --- Cleanup timers on unmount ---
  useEffect(() => {
    return () => {
      if (pointerTimerRef.current) clearTimeout(pointerTimerRef.current);
      if (elementTimerRef.current) clearTimeout(elementTimerRef.current);
    };
  }, []);

  return {
    isCollaborating: enabled && !!remoteCanvas,
    collaborators,
    handlePointerUpdate,
  };
}
