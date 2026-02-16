"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { CanvasCard } from "./canvas-card";

type SharedCanvasResult = {
  _id: Id<"canvases">;
  title: string;
  updatedAt: number;
  isPublic?: boolean;
  collaborationEnabled?: boolean;
  accessLevel: "editor" | "viewer";
  ownerName: string;
  ownerId: string;
};

type SharedCanvasGridProps = {
  canvases: SharedCanvasResult[];
  onOpen: (id: Id<"canvases">) => void;
};

export function SharedCanvasGrid({ canvases, onOpen }: SharedCanvasGridProps) {
  if (canvases.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-wider">
        Shared with me
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {canvases.map((canvas) => (
          <CanvasCard
            key={canvas._id}
            canvas={{
              _id: canvas._id,
              title: canvas.title,
              updatedAt: canvas.updatedAt,
              isPublic: canvas.isPublic,
              collaborationEnabled: canvas.collaborationEnabled,
              ownerId: canvas.ownerId,
              _creationTime: 0,
            } as any}
            onClick={() => onOpen(canvas._id)}
            isShared
            ownerName={canvas.ownerName}
            accessLevel={canvas.accessLevel}
          />
        ))}
      </div>
    </section>
  );
}
