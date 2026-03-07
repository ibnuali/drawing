import { Badge } from "@/components/ui/badge";

type CanvasSharedInfoProps = {
  isShared?: boolean;
  ownerName?: string;
  accessLevel?: "editor" | "viewer";
};

export function CanvasSharedInfo({
  isShared,
  ownerName,
  accessLevel,
}: CanvasSharedInfoProps) {
  if (!isShared) return null;

  return (
    <div className="mt-1 flex items-center gap-1.5">
      {ownerName && (
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
          By {ownerName}
        </Badge>
      )}
      {accessLevel && (
        <Badge
          variant={accessLevel === "editor" ? "default" : "outline"}
          className="text-[10px] h-4 px-1.5 capitalize"
        >
          {accessLevel}
        </Badge>
      )}
    </div>
  );
}