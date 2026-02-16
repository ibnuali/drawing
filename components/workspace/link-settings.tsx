"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Link2 } from "lucide-react";

interface LinkSettingsProps {
  canvasId: Id<"canvases">;
  canvas: {
    linkAccessEnabled?: boolean;
    linkAccessLevel?: "editor" | "viewer";
  };
}

export function LinkSettings({ canvasId, canvas }: LinkSettingsProps) {
  const updateLinkSettings = useMutation(api.canvases.updateLinkSettings);
  const [copied, setCopied] = React.useState(false);
  const linkEnabled = canvas.linkAccessEnabled ?? false;

  const handleAccessModeChange = (value: string | null) => {
    const enabled = value === "anyone";
    updateLinkSettings({
      canvasId,
      linkAccessEnabled: enabled,
      linkAccessLevel: "viewer",
    });
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/canvas/${canvasId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const descriptiveText = linkEnabled
    ? "Anyone on the internet with the link can view"
    : "Only people with explicit access can open";

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">General access</h3>

      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <Globe className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex-1 space-y-2">
          {/* Access mode dropdown: Anyone with the link / Restricted */}
          <Select
            value={linkEnabled ? "anyone" : "restricted"}
            onValueChange={handleAccessModeChange as (value: string | null) => void}
          >
            <SelectTrigger className="w-full max-sm:min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anyone">
                Anyone with the link (Viewer)
              </SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
            </SelectContent>
          </Select>

          {/* Descriptive text explaining current setting */}
          <p className="text-xs text-muted-foreground">{descriptiveText}</p>
        </div>
      </div>

      {/* Copy link button */}
      <Button
        variant="outline"
        className="w-full max-sm:min-h-[44px]"
        onClick={handleCopyLink}
        disabled={!linkEnabled}
      >
        <Link2 className="h-4 w-4 mr-2" />
        {copied ? "Link copied!" : "Copy link"}
      </Button>
    </div>
  );
}
