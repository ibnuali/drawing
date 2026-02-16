"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, Users } from "lucide-react";
import { useAtom } from "jotai";
import { sidebarViewAtom } from "@/lib/workspace-atoms";

export type SidebarView = "my-canvas" | "shared";

const navItems: { id: SidebarView; label: string; icon: React.ElementType }[] = [
  { id: "my-canvas", label: "My Canvas", icon: LayoutDashboard },
  { id: "shared", label: "Shared with me", icon: Users },
];

export function WorkspaceSidebar() {
  const [activeView, onViewChange] = useAtom(sidebarViewAtom);
  return (
    <>
      {/* Mobile: horizontal tab bar */}
      <div className="flex border-b border-border/60 bg-background md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Desktop: vertical sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border/60 bg-background pt-4 md:flex">
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
