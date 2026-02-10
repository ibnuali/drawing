"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";

const ExcalidrawWrapper = dynamic(
  async () =>
    (await import("@/components/excalidraw/excalidraw-wrapper")).default,
  { ssr: false },
);

export default function PublicCanvasPage() {
  const params = useParams<{ canvasId: string }>();
  const canvasId = params.canvasId as Id<"canvases">;
  const canvas = useQuery(api.canvases.getPublic, { id: canvasId });

  if (canvas === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (canvas === null) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-2">
        <p className="text-foreground text-sm font-medium">
          This canvas is not available
        </p>
        <p className="text-muted-foreground text-xs">
          It may be private or doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return (
    <ExcalidrawWrapper
      user={{
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        email: "",
        emailVerified: false,
        name: canvas.title,
      }}
      initialData={canvas.data}
      viewMode
    />
  );
}
