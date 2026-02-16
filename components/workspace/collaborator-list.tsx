"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Copy, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

export interface Collaborator {
  userId: string;
  userName: string;
  userEmail: string;
  accessLevel: "owner" | "editor" | "viewer";
  avatarUrl?: string;
}

interface CollaboratorListProps {
  canvasId: Id<"canvases">;
  collaborators: Collaborator[];
  currentUserId: string;
  ownerId: string;
}

export function CollaboratorList({
  canvasId,
  collaborators,
  currentUserId,
  ownerId,
}: CollaboratorListProps) {
  const updateAccessLevel = useMutation(api.access.updateAccessLevel);
  const removeCollaborator = useMutation(api.access.removeCollaborator);

  const isOwner = currentUserId === ownerId;

  // Sort: owner first, then alphabetically by name
  const sortedCollaborators = [...collaborators].sort((a, b) => {
    if (a.userId === ownerId) return -1;
    if (b.userId === ownerId) return 1;
    return a.userName.localeCompare(b.userName);
  });

  return (
    <div className="space-y-2">
      {/* Section header with title and icons */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">People with access</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" className="max-sm:size-11">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="max-sm:size-11">
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable collaborator list */}
      <div className="space-y-1 max-h-[300px] max-sm:max-h-[40vh] overflow-y-auto">
        {sortedCollaborators.map((collab) => (
          <CollaboratorItem
            key={`${collab.userId}-${collab.accessLevel}`}
            collaborator={collab}
            canvasId={canvasId}
            ownerId={ownerId}
            isCurrentUserOwner={isOwner}
            onUpdateAccessLevel={(userId, accessLevel) =>
              updateAccessLevel({ canvasId, userId, accessLevel })
            }
            onRemove={(userId) =>
              removeCollaborator({ canvasId, userId })
            }
          />
        ))}
      </div>
    </div>
  );
}

interface CollaboratorItemProps {
  collaborator: Collaborator;
  canvasId: Id<"canvases">;
  ownerId: string;
  isCurrentUserOwner: boolean;
  onUpdateAccessLevel: (
    userId: string,
    accessLevel: "editor" | "viewer"
  ) => void;
  onRemove: (userId: string) => void;
}

function CollaboratorItem({
  collaborator,
  ownerId,
  isCurrentUserOwner,
  onUpdateAccessLevel,
  onRemove,
}: CollaboratorItemProps) {
  const isCollabOwner = collaborator.userId === ownerId;

  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar with image or initials fallback */}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
            collaborator.avatarUrl
              ? ""
              : "bg-muted text-muted-foreground"
          )}
        >
          {collaborator.avatarUrl ? (
            <img
              src={collaborator.avatarUrl}
              alt={collaborator.userName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            getInitials(collaborator.userName)
          )}
        </div>

        {/* Name and email */}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {collaborator.userName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {collaborator.userEmail}
          </p>
        </div>
      </div>

      {/* Access level: Owner badge, dropdown for non-owners (if current user is owner), or read-only badge */}
      {isCollabOwner ? (
        <Badge variant="secondary">Owner</Badge>
      ) : isCurrentUserOwner ? (
        <AccessLevelSelect
          currentLevel={collaborator.accessLevel as "editor" | "viewer"}
          onChangeLevel={(level) =>
            onUpdateAccessLevel(collaborator.userId, level)
          }
          onRemove={() => onRemove(collaborator.userId)}
        />
      ) : (
        <Badge variant="outline">
          {collaborator.accessLevel.charAt(0).toUpperCase() +
            collaborator.accessLevel.slice(1)}
        </Badge>
      )}
    </div>
  );
}

interface AccessLevelSelectProps {
  currentLevel: "editor" | "viewer";
  onChangeLevel: (level: "editor" | "viewer") => void;
  onRemove: () => void;
}

function AccessLevelSelect({
  currentLevel,
  onChangeLevel,
  onRemove,
}: AccessLevelSelectProps) {
  const handleValueChange = (value: string | null) => {
    if (value === "remove") {
      onRemove();
    } else if (value === "editor" || value === "viewer") {
      onChangeLevel(value);
    }
  };

  return (
    <Select
      value={currentLevel}
      onValueChange={handleValueChange as (value: "editor" | "viewer" | null) => void}
    >
      <SelectTrigger size="sm" className="w-[120px] max-sm:min-h-[44px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="editor">Editor</SelectItem>
        <SelectItem value="viewer">Viewer</SelectItem>
        <SelectSeparator />
        <SelectItem value="remove">Remove access</SelectItem>
      </SelectContent>
    </Select>
  );
}
