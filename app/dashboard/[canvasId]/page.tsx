"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";

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
  const canvas = useQuery(api.canvases.get, { id: canvasId });
  const updateCanvas = useMutation(api.canvases.update);

  React.useEffect(() => {
    if (!sessionPending && !session) {
      router.push("/sign-in");
    }
  }, [sessionPending, session, router]);

  const handleChange = React.useCallback(
    (data: string) => {
      updateCanvas({ id: canvasId, data });
    },
    [canvasId, updateCanvas],
  );

  if (sessionPending || !session || canvas === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (canvas === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Canvas not found.</p>
      </div>
    );
  }

  return (
    <ExcalidrawWrapper
      user={session.user}
      initialData={canvas.data}
      onSave={handleChange}
      onBack={() => router.push("/dashboard")}
    />
  );
}
