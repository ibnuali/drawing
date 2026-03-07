"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Copy, Mail } from "lucide-react";
import { CollaboratorItem } from "./collaborator-item";
import type { Collaborator } from "./collaborator-types";

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
}: Readonly<CollaboratorListProps>) {
  const updateAccessLevel = useMutation(api.access.updateAccessLevel);
  const removeCollaborator = useMutation(api.access.removeCollaborator);

  const isOwner = currentUserId === ownerId;

  const sortedCollaborators = [...collaborators].sort((a, b) => {
    if (a.userId === ownerId) return -1;
    if (b.userId === ownerId) return 1;
    return a.userName.localeCompare(b.userName);
  });

  return (
    <div className="space-y-2">
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

      <div className="space-y-1 max-h-[300px] max-sm:max-h-[40vh] overflow-y-auto">
        {sortedCollaborators.map((collab) => (
          <CollaboratorItem
            key={`${collab.userId}-${collab.accessLevel}`}
            collaborator={collab}
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