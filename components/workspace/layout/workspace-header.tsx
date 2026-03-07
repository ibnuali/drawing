"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAtom } from "jotai";
import { searchQueryAtom } from "@/lib/workspace-atoms";
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown";
import { Separator } from "@/components/ui/separator";

export function WorkspaceHeader() {
  const [searchQuery, onSearchChange] = useAtom(searchQueryAtom);
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-30 flex items-center gap-4 border-b px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-md text-xs font-bold">
          <Image src="/icon.png" alt="" width={100} height={100} />
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
        <ThemeToggle />

        <Separator orientation="vertical" />
        <UserProfileDropdown />
      </div>
    </header>
  );
}
