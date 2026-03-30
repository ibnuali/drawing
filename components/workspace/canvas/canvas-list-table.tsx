"use client";

import * as React from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { CanvasActions, CollaboratorInfo } from "@/lib/workspace-atoms";
import type { CategoryOption } from "@/lib/types";
import { CanvasCard } from "./canvas-card";

interface CanvasListTableProps {
  ownerId: string;
  categoryId?: Id<"categories">;
  actions: CanvasActions;
  collaborators?: Record<string, CollaboratorInfo>;
  categories?: CategoryOption[];
}

/** Skeleton loader for canvas list rows */
function ListSkeleton() {
  return (
    <div className="border-border/60 rounded-lg border overflow-hidden">
      <ListHeader />
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i + 1}
          className="flex animate-pulse items-center gap-3 px-3 py-2 border-b border-border/40 last:border-b-0"
        >
          <div className="bg-muted h-5 w-5 rounded shrink-0" />
          <div className="bg-muted h-4 flex-1 rounded" />
          <div className="bg-muted h-3 w-16 rounded shrink-0 hidden sm:block" />
          <div className="w-8 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** Header row for the canvas list table */
function ListHeader() {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 text-muted-foreground text-xs font-medium uppercase tracking-wider border-b border-border/60">
      <div className="w-5 shrink-0" />
      <div className="flex-1 min-w-0">Name</div>
      <div className="w-16 shrink-0 text-right hidden sm:block">Modified</div>
      <div className="w-8 shrink-0" />
    </div>
  );
}

export function CanvasListTable({
  ownerId,
  categoryId,
  actions,
  collaborators,
  categories,
}: Readonly<CanvasListTableProps>) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.canvases.listPaginated,
    { ownerId, categoryId },
    { initialNumItems: 20 }
  );

  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && status === "CanLoadMore") {
          loadMore(20);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [status, loadMore]);

  if (status === "LoadingFirstPage") {
    return <ListSkeleton />;
  }

  if (results.length === 0 && status === "Exhausted") {
    return (
      <div className="border-border/60 rounded-lg border overflow-hidden">
        <ListHeader />
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          No canvases found
        </div>
      </div>
    );
  }

  return (
    <div className="border-border/60 rounded-lg border overflow-hidden">
      <ListHeader />
      <div className="flex flex-col">
        {results.map((canvas) => (
          <CanvasCard
            key={canvas._id}
            canvas={canvas}
            actions={actions}
            collaborators={collaborators?.[canvas._id]}
            categories={categories}
            onToggleFavorite={actions.onToggleFavorite}
            isList
          />
        ))}
      </div>
      {status === "CanLoadMore" && (
        <div ref={loadMoreRef} className="flex justify-center py-4 border-t border-border/40">
          <div className="text-muted-foreground text-xs">Loading more...</div>
        </div>
      )}
      {status === "LoadingMore" && (
        <div className="flex justify-center py-4 border-t border-border/40">
          <div className="text-muted-foreground text-xs">Loading...</div>
        </div>
      )}
    </div>
  );
}