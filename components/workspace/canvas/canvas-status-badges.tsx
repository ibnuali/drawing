import { Globe, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CanvasStatusBadgesProps {
  isPublic: boolean;
  isCollabEnabled: boolean;
}

export function CanvasStatusBadges({
  isPublic,
  isCollabEnabled,
}: Readonly<CanvasStatusBadgesProps>) {
  if (!isPublic && !isCollabEnabled) return null;

  return (
    <>
      {isPublic && (
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-primary">
          <Globe className="size-3" />
          <span className="text-[10px] font-medium">Public</span>
        </div>
      )}
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
    </>
  );
}