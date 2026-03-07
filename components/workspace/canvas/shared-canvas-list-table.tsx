"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { CanvasCard } from "./canvas-card";
import type { CanvasActions } from "@/lib/workspace-atoms";

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

type SharedCanvasListTableProps = {
  canvases: SharedCanvasResult[];
  actions: CanvasActions;
};

export function SharedCanvasListTable({ canvases, actions }: SharedCanvasListTableProps) {
  const isEmpty = canvases.length === 0;

  return (
    <div className="border-border/60 rounded-lg border overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 text-muted-foreground text-xs font-medium uppercase tracking-wider border-b border-border/60">
        <div className="w-5 shrink-0" />
        <div className="flex-1 min-w-0 text-left">Name</div>
        <div className="w-24 shrink-0 text-left">Owner</div>
        <div className="w-16 shrink-0 text-right">Modified</div>
        <div className="w-8 shrink-0" />
      </div>
      {isEmpty ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          No shared canvases found
        </div>
      ) : (
        <div className="flex flex-col">
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
              actions={actions}
              isShared
              ownerName={canvas.ownerName}
              accessLevel={canvas.accessLevel}
              isList
            />
          ))}
        </div>
      )}
    </div>
  );
}