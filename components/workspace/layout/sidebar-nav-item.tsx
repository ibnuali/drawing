"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Trash2 } from "lucide-react";
import Link from "next/link";
import type { SidebarView } from "./workspace-sidebar";

export const navItems: {
  id: SidebarView;
  label: string;
  icon: React.ElementType;
  href?: string;
}[] = [
  {
    id: "my-canvas",
    label: "My Canvas",
    icon: LayoutDashboard,
    href: "/workspace/my-canvas",
  },
  {
    id: "shared",
    label: "Shared with me",
    icon: Users,
    href: "/workspace/shared",
  },
  {
    id: "trash",
    label: "Trash",
    icon: Trash2,
    href: "/workspace/trash",
  },
];

interface NavItemProps {
  item: (typeof navItems)[number];
  isActive: boolean;
  isMobile: boolean;
  activeCategoryFilter: string | null;
  onNavClick: (id: SidebarView) => void;
}

export function NavItem({
  item,
  isActive,
  isMobile,
  activeCategoryFilter,
  onNavClick,
}: Readonly<NavItemProps>) {
  const Icon = item.icon;

  if (isMobile) {
    if (item.href) {
      return (
        <Link
          href={item.href}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors",
            isActive && !activeCategoryFilter
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground",
          )}
          title={item.label}
        >
          <Icon className="size-5 shrink-0" />
          <span className="sr-only">{item.label}</span>
        </Link>
      );
    }
    return (
      <button
        onClick={() => onNavClick(item.id)}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "border-b-2 border-primary text-primary"
            : "text-muted-foreground",
        )}
        title={item.label}
      >
        <Icon className="size-5 shrink-0" />
        <span className="sr-only">{item.label}</span>
      </button>
    );
  }

  const content = (
    <button
      onClick={() => onNavClick(item.id)}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && activeCategoryFilter === null
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {item.label}
    </button>
  );

  return item.href ? (
    <Link href={item.href} className="block">
      {content}
    </Link>
  ) : (
    <button onClick={() => onNavClick(item.id)}>{content}</button>
  );
}