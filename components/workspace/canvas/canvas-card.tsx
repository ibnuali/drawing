"use client";

import * as React from "react";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTheme } from "next-themes";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Pencil, Globe, Users, File } from "lucide-react";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { CanvasActions, CollaboratorInfo } from "@/lib/workspace-atoms";
import { CanvasMenuContent, type CategoryOption } from "./canvas-menu-content";
import { CanvasDeleteDialog } from "./canvas-delete-dialog";
import { CanvasCollaboratorAvatars } from "./canvas-collaborator-avatars";
import { CanvasStatusBadges } from "./canvas-status-badges";
import { CanvasSharedInfo } from "./canvas-shared-info";

type CanvasCardProps = {
  canvas: Doc<"canvases">;
  actions?: CanvasActions;
  collaborators?: CollaboratorInfo;
  isShared?: boolean;
  ownerName?: string;
  accessLevel?: "editor" | "viewer";
  categories?: CategoryOption[];
  isList?: boolean;
};

export function CanvasCard({
  canvas,
  actions,
  collaborators,
  isShared,
  ownerName,
  accessLevel,
  categories,
  isList,
}: Readonly<CanvasCardProps>) {
  const { resolvedTheme } = useTheme();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const pendingDeleteEvent = React.useRef<React.MouseEvent | null>(null);
  const isPublic = canvas.isPublic === true;
  const isCollabEnabled = canvas.collaborationEnabled === true;

  // Fetch theme-appropriate thumbnail URL
  const hasThumbnail = canvas.thumbnailId || canvas.thumbnailIdDark;
  const thumbnailUrl = useQuery(
    api.canvases.getCanvasThumbnailUrl,
    hasThumbnail
      ? { canvasId: canvas._id, theme: resolvedTheme === "dark" ? "dark" : "light" }
      : "skip",
  );

  const copyPublicLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${window.location.origin}/canvas/${canvas._id}`,
    );
  };

  const handleDeleteClick = () => {
    pendingDeleteEvent.current = null;
    setDeleteOpen(true);
  };

  const menuProps = {
    canvasId: canvas._id,
    isPublic,
    isCollabEnabled,
    actions,
    categories,
    onDeleteClick: handleDeleteClick,
    copyPublicLink,
  };

  if (isList) {
    return (
      <>
        <ContextMenu>
          <ContextMenuTrigger
            render={
              <button
                data-canvas-item="true"
                className={cn(
                  "group/canvas relative flex cursor-pointer items-center gap-3 bg-transparent px-3 py-2 transition-all hover:bg-accent/50 border-b border-border/40 last:border-b-0 w-full",
                )}
                onClick={() => actions?.onOpen(canvas._id)}
              >
                <File className="text-muted-foreground/40 shrink-0 size-5" />
                <span className="text-foreground truncate text-sm font-medium flex-1 min-w-0 text-left">
                  {canvas.title}
                </span>
                {isShared && (
                  <span className="text-muted-foreground text-xs shrink-0 w-24 truncate text-left hidden sm:block">
                    {ownerName ?? "Unknown"}
                  </span>
                )}
                <span className="text-muted-foreground text-xs shrink-0 w-16 text-right hidden sm:block">
                  {formatRelativeDate(canvas.updatedAt)}
                </span>
                <div className="flex items-center gap-1 w-8 shrink-0">
                  {isPublic && (
                    <Globe className="text-muted-foreground/60 size-3.5 shrink-0" />
                  )}
                  {isCollabEnabled && (
                    <Users className="text-muted-foreground/60 size-3.5 shrink-0" />
                  )}
                </div>
              </button>
            }
            className="w-full"
          ></ContextMenuTrigger>
          <CanvasMenuContent {...menuProps} />
        </ContextMenu>
        {!isShared && (
          <CanvasDeleteDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title={canvas.title}
            canvasId={canvas._id}
            onDelete={actions?.onDelete}
            pendingDeleteEvent={pendingDeleteEvent}
          />
        )}
      </>
    );
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          render={
            <button
              data-canvas-item="true"
              className={cn(
                "group/canvas border-border/60 hover:border-border relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-transparent transition-all hover:shadow-lg",
              )}
              onClick={() => actions?.onOpen(canvas._id)}
            >
              <div
                className={`relative flex h-36 items-center justify-center overflow-hidden ${thumbnailUrl ? "" : "bg-muted/40"}`}
              >
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={canvas.title}
                    className="size-full object-contain bg-muted/30"
                  />
                ) : (
                  <>
                    <svg
                      className="text-border/80 absolute inset-0 size-full"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <pattern
                          id={`grid-${canvas._id}`}
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d="M 20 0 L 0 0 0 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="0.5"
                          />
                        </pattern>
                      </defs>
                      <rect
                        width="100%"
                        height="100%"
                        fill={`url(#grid-${canvas._id})`}
                      />
                    </svg>

                    <Pencil className="text-muted-foreground/20 relative size-10" />
                  </>
                )}

                <CanvasStatusBadges
                  isPublic={isPublic}
                  isCollabEnabled={isCollabEnabled}
                />
                <CanvasCollaboratorAvatars collaborators={collaborators} />
              </div>

              <div className="flex flex-col gap-0.5 px-3 py-2.5 text-left">
                <span className="text-foreground truncate text-sm font-medium ">
                  {canvas.title}
                </span>
                <span className="text-muted-foreground text-xs">
                  Edited {formatRelativeDate(canvas.updatedAt)}
                </span>
                <CanvasSharedInfo
                  isShared={isShared}
                  ownerName={ownerName}
                  accessLevel={accessLevel}
                />
              </div>
            </button>
          }
          className="w-full"
        ></ContextMenuTrigger>
        <CanvasMenuContent {...menuProps} />
      </ContextMenu>
      {!isShared && (
        <CanvasDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={canvas.title}
          canvasId={canvas._id}
          onDelete={actions?.onDelete}
          pendingDeleteEvent={pendingDeleteEvent}
        />
      )}
    </>
  );
}
