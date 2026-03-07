import { useAtomValue } from "jotai";
import { canvasViewModeAtom } from "@/lib/workspace-atoms";

export function LoadingSkeleton() {
  const viewMode = useAtomValue(canvasViewModeAtom);

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i + 1}
            className="border-border/60 flex animate-pulse items-center gap-3 rounded-lg border px-3 py-2"
          >
            <div className="bg-muted h-5 w-5 rounded" />
            <div className="bg-muted h-4 w-48 rounded" />
            <div className="bg-muted h-3 w-16 rounded ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i + 1}
          className="border-border/60 flex animate-pulse flex-col overflow-hidden rounded-xl border"
        >
          <div className="bg-muted/40 h-36" />
          <div className="flex flex-col gap-2 px-3 py-2.5">
            <div className="bg-muted h-4 w-24 rounded" />
            <div className="bg-muted h-3 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}