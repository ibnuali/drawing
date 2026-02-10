"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Search, Plus } from "lucide-react";

type WorkspaceHeaderProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export function WorkspaceHeader({
  searchQuery,
  onSearchChange,
}: WorkspaceHeaderProps) {
  const { data: session, isPending } = useSession();

  const initials = session?.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-30 flex items-center gap-4 border-b px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-xs font-bold">
          D
        </div>
        <span className="text-foreground text-sm font-semibold tracking-tight">
          Drawing
        </span>
      </div>

      <div className="relative ml-4 max-w-xs flex-1">
        <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
        <Input
          placeholder="Search workspace..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 pl-8 text-xs"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="bg-border mx-1 h-5 w-px" />

        {session?.user.image ? (
          <img
            src={session?.user.image}
            alt={session?.user.name}
            className="size-7 rounded-full object-cover"
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex size-7 items-center justify-center rounded-full text-[10px] font-medium">
            {initials}
          </div>
        )}

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => signOut()}
          title="Sign out"
        >
          <LogOut />
        </Button>
      </div>
    </header>
  );
}
