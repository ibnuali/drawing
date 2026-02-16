"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmailInviteInput } from "@/components/workspace/email-invite-input";
import { CollaboratorList } from "@/components/workspace/collaborator-list";
import { LinkSettings } from "@/components/workspace/link-settings";

interface ShareModalProps {
  canvasId: Id<"canvases">;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function ShareModal({ canvasId, isOpen, onClose, userId }: ShareModalProps) {
  // Real-time subscriptions (Req 8.2, 8.3): canvas data and collaborator list
  const canvas = useQuery(api.canvases.get, isOpen ? { id: canvasId } : "skip");
  const collaborators = useQuery(
    api.access.getCollaborators,
    isOpen ? { canvasId } : "skip"
  );

  if (!canvas) return null;

  const ownerId = canvas.ownerId;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-w-[600px] max-sm:max-w-[90vw] max-sm:p-4"
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Modal header with canvas title (Req 1.2) */}
        <DialogHeader>
          <DialogTitle>Share &ldquo;{canvas.title}&rdquo;</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <EmailInviteInput canvasId={canvasId} />
          <CollaboratorList
            canvasId={canvasId}
            collaborators={collaborators ?? []}
            currentUserId={userId}
            ownerId={ownerId}
          />
          <LinkSettings
            canvasId={canvasId}
            canvas={{
              linkAccessEnabled: canvas.linkAccessEnabled,
              linkAccessLevel: canvas.linkAccessLevel,
            }}
          />
        </div>

        {/* Done button closes modal (Req 7.1) */}
        <DialogFooter>
          <Button onClick={onClose} className="max-sm:min-h-[44px]">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
