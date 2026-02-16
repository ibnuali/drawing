"use client";

import * as React from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ShareModal } from "@/components/workspace/share-modal";
import { Share2 } from "lucide-react";

interface ShareButtonProps {
  canvasId: Id<"canvases">;
  isOwner: boolean;
  userId: string;
}

export function ShareButton({ canvasId, isOwner, userId }: ShareButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Req 1.3: Only canvas owners see the Share button
  if (!isOwner) return null;

  return (
    <>
      {/* Req 1.1: Share button opens the sharing modal */}
      <Button variant="outline" size={"icon"} onClick={() => setIsOpen(true)}>
        <Share2 className="h-4 w-4" />
      </Button>
      <ShareModal
        canvasId={canvasId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userId={userId}
      />
    </>
  );
}
