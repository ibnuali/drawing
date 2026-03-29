"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { XdrawIcon } from "@/components/xdraw-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAtom } from "jotai";
import { searchQueryAtom } from "@/lib/workspace-atoms";
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export function WorkspaceHeader() {
  const pathname = usePathname();
  const [searchQuery, onSearchChange] = useAtom(searchQueryAtom);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  // Reset search on navigation to prevent mobile header glitch
  React.useEffect(() => {
    onSearchChange("");
    setMobileSearchOpen(false);
  }, [pathname, onSearchChange]);

  // Close mobile search when search query is cleared
  const handleSearchChange = (value: string) => {
    onSearchChange(value);
    if (value === "" && mobileSearchOpen) {
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-30 flex items-center gap-4 border-b px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <XdrawIcon className="size-6" />
        <span className="text-foreground text-sm font-semibold tracking-tight">
          Xdraw
        </span>
      </div>

      <div className="relative ml-4 max-w-xs flex-1 hidden sm:block">
        <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
        <Input
          placeholder="Search workspace..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 pl-8 text-xs"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Mobile search button */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => {
            if (mobileSearchOpen) {
              setMobileSearchOpen(false);
              onSearchChange("");
            } else {
              setMobileSearchOpen(true);
            }
          }}
        >
          {mobileSearchOpen ? (
            <X className="size-4" />
          ) : (
            <Search className="size-4" />
          )}
        </Button>

        <ThemeToggle />

        <Separator orientation="vertical" />
        <UserProfileDropdown />
      </div>

      {/* Mobile expanded search */}
      {mobileSearchOpen && (
        <div className="absolute inset-x-0 top-full bg-background border-b border-border/60 p-3 sm:hidden">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search workspace..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-10 pl-8 text-sm"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
