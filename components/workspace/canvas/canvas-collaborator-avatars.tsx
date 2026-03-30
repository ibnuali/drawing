import type { CollaboratorInfo } from "@/lib/workspace-atoms";

interface CanvasCollaboratorAvatarsProps {
  collaborators?: CollaboratorInfo;
}

export function CanvasCollaboratorAvatars({
  collaborators,
}: Readonly<CanvasCollaboratorAvatarsProps>) {
  if (!collaborators || collaborators.count === 0) return null;

  return (
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
      <div className="pointer-events-none absolute bottom-full left-0 mb-1 hidden rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10 group-hover/collab:block">
        {collaborators.names.join(", ")}
      </div>
    </div>
  );
}