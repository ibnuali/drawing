"use client";

import { Badge } from "@/components/ui/badge";
import { CollaboratorAvatar } from "./collaborator-avatar";
import { AccessLevelSelect } from "./access-level-select";
import type { Collaborator } from "./collaborator-types";

interface CollaboratorItemProps {
  collaborator: Collaborator;
  ownerId: string;
  isCurrentUserOwner: boolean;
  onUpdateAccessLevel: (
    userId: string,
    accessLevel: "editor" | "viewer"
  ) => void;
  onRemove: (userId: string) => void;
}

export function CollaboratorItem({
  collaborator,
  ownerId,
  isCurrentUserOwner,
  onUpdateAccessLevel,
  onRemove,
}: Readonly<CollaboratorItemProps>) {
  const isCollabOwner = collaborator.userId === ownerId;

  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
      <div className="flex items-center gap-3 min-w-0">
        <CollaboratorAvatar
          name={collaborator.userName}
          avatarUrl={collaborator.avatarUrl}
        />

        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {collaborator.userName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {collaborator.userEmail}
          </p>
        </div>
      </div>

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