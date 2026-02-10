"use client";

import * as React from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Globe,
  Lock,
  Link,
  Users,
  UserX,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type CollaboratorInfo = {
  count: number;
  names: string[];
};

type CanvasCardProps = {
  canvas: Doc<"canvases">;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onRename: () => void;
  onTogglePublic: () => void;
  onToggleCollaboration: () => void;
  onCopyCollabLink: () => void;
  collaborators?: CollaboratorInfo;
};

function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function CanvasCard({
  canvas,
  onClick,
  onDelete,
  onRename,
  onTogglePublic,
  onToggleCollaboration,
  onCopyCollabLink,
  collaborators,
}: CanvasCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const pendingDeleteEvent = React.useRef<React.MouseEvent | null>(null);
  const isPublic = canvas.isPublic === true;
  const isCollabEnabled = canvas.collaborationEnabled === true;

  const copyPublicLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${window.location.origin}/canvas/${canvas._id}`,
    );
  };

  return (
    <div
      className={cn(
        "group/canvas border-border/60 hover:border-border relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-transparent transition-all hover:shadow-lg",
        menuOpen && "border-border shadow-lg",
      )}
      onClick={onClick}
    >
      {/* Thumbnail area */}
      <div className="bg-muted/40 relative flex h-36 items-center justify-center overflow-hidden">
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
          <rect width="100%" height="100%" fill={`url(#grid-${canvas._id})`} />
        </svg>

        <Pencil className="text-muted-foreground/20 relative size-10" />

        {/* Public badge */}
        {isPublic && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-primary">
            <Globe className="size-3" />
            <span className="text-[10px] font-medium">Public</span>
          </div>
        )}

        {/* Collaboration badge */}
        {isCollabEnabled && (
          <div
            className={cn(
              "absolute left-2 flex items-center gap-1 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-blue-600 dark:text-blue-400",
              isPublic ? "top-8" : "top-2",
            )}
          >
            <Users className="size-3" />
            <span className="text-[10px] font-medium">Collab</span>
          </div>
        )}

        {/* Active collaborator indicators */}
        {collaborators && collaborators.count > 0 && (
          <div className="absolute bottom-2 left-2 group/collab">
            <div className="flex items-center gap-1">
              {collaborators.names.slice(0, 3).map((name, i) => (
                <div
                  key={i}
                  className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-background"
                  style={{ marginLeft: i > 0 ? "-4px" : "0" }}
                  title={name}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
              ))}
              {collaborators.count > 3 && (
                <div
                  className="flex size-5 items-center justify-center rounded-full bg-muted text-[9px] font-medium text-muted-foreground ring-2 ring-background"
                  style={{ marginLeft: "-4px" }}
                >
                  +{collaborators.count - 3}
                </div>
              )}
            </div>
            {/* Tooltip on hover */}
            <div className="pointer-events-none absolute bottom-full left-0 mb-1 hidden rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10 group-hover/collab:block">
              {collaborators.names.join(", ")}
            </div>
          </div>
        )}

        {/* Hover actions */}
        <div
          className={cn(
            "absolute right-2 top-2 opacity-0 transition-opacity group-hover/canvas:opacity-100",
            menuOpen && "opacity-100",
          )}
        >
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="bg-background/90 hover:bg-background border-border/60 flex size-7 items-center justify-center rounded-md border shadow-sm backdrop-blur-sm"
            >
              <MoreHorizontal className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className={"w-fit"} align="end" sideOffset={4}>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRename();
                }}
              >
                <Pencil />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePublic();
                }}
              >
                {isPublic ? <Lock /> : <Globe />}
                {isPublic ? "Make private" : "Share public"}
              </DropdownMenuItem>
              {isPublic && (
                <DropdownMenuItem onClick={copyPublicLink}>
                  <Link />
                  Copy public link
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollaboration();
                }}
              >
                {isCollabEnabled ? <UserX /> : <Users />}
                {isCollabEnabled ? "Stop collaborating" : "Collaborate"}
              </DropdownMenuItem>
              {isCollabEnabled && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyCollabLink();
                  }}
                >
                  <Link />
                  Copy collab link
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  pendingDeleteEvent.current = e as unknown as React.MouseEvent;
                  setMenuOpen(false);
                  setDeleteOpen(true);
                }}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 px-3 py-2.5">
        <span className="text-foreground truncate text-sm font-medium">
          {canvas.title}
        </span>
        <span className="text-muted-foreground text-xs">
          Edited {formatRelativeDate(canvas.updatedAt)}
        </span>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete canvas</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{canvas.title}&rdquo;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(pendingDeleteEvent.current ?? e);
                setDeleteOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
