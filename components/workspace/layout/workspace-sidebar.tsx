"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Plus,
  TrashIcon,
  Trash2,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  sidebarViewAtom,
  sortedCategoriesAtom,
  createCategoryDialogAtom,
  renameCategoryTargetAtom,
} from "@/lib/workspace-atoms";
import { NewWorkspaceDropdown } from "@/components/workspace/new-workspace-dropdown";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export type SidebarView = "my-canvas" | "shared" | "trash";

const navItems: {
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

export function WorkspaceSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeView, onViewChange] = useAtom(sidebarViewAtom);
  const sortedCategories = useAtomValue(sortedCategoriesAtom);
  const setCreateCategoryOpen = useSetAtom(createCategoryDialogAtom);
  const setRenameCategoryTarget = useSetAtom(renameCategoryTargetAtom);
  const { handleDeleteCategory } = useWorkspaceActions();

  const activeCategoryFilter = searchParams.get("category");

  const handleNavClick = (id: SidebarView) => {
    onViewChange(id);
  };

  const handleCategoryClick = (categoryName: string) => {
    onViewChange("my-canvas");
    const params = new URLSearchParams(searchParams);
    const currentCategory = params.get("category");
    if (currentCategory === categoryName) {
      params.delete("category");
    } else {
      params.set("category", categoryName);
    }
    router.push(`/workspace/my-canvas?${params.toString()}`);
  };

  return (
    <>
      {/* Mobile: horizontal tab bar */}
      <div className="flex border-b border-border/60 bg-background md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href
            ? pathname === item.href
            : activeView === item.id;
          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive && !activeCategoryFilter
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
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
          <NewWorkspaceDropdown />

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href
              ? pathname === item.href
              : activeView === item.id && activeCategoryFilter === null;
            const content = (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
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
              <Link key={item.id} href={item.href} className="block">
                {content}
              </Link>
            ) : (
              <button key={item.id} onClick={() => handleNavClick(item.id)}>
                {content}
              </button>
            );
          })}

          {sortedCategories.length > 0 && (
            <>
              <div className="my-2 border-t border-border/60" />
              <span className="text-muted-foreground mb-1 px-3 text-[10px] font-medium uppercase tracking-wider">
                Categories
              </span>
              <div className="flex flex-col gap-0.5">
                {sortedCategories.map((category) => (
                  <ContextMenu key={category._id}>
                    <ContextMenuTrigger
                      render={
                        <button
                          onClick={() => handleCategoryClick(category.name)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors cursor-pointer truncate",
                            "hover:bg-accent hover:text-accent-foreground",
                            activeCategoryFilter === category.name
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground",
                          )}
                        >
                          <FolderOpen className="size-3.5 shrink-0" />
                          <span className="truncate">{category.name}</span>
                        </button>
                      }
                    />
                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() => setRenameCategoryTarget(category._id)}
                      >
                        <Pencil />
                        Rename
                      </ContextMenuItem>
                      <ContextMenuItem
                        variant="destructive"
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        <TrashIcon />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </div>
            </>
          )}

          <div className="my-2 border-t border-border/60" />
          <button
            onClick={() => setCreateCategoryOpen(true)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
          >
            <Plus className="size-3.5 shrink-0" />
            New category
          </button>
        </nav>
      </aside>
    </>
  );
}
