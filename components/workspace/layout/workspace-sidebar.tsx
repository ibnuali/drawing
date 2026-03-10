"use client";
import { Plus } from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  sidebarViewAtom,
  sortedCategoriesAtom,
  categoriesAtom,
  createCategoryDialogAtom,
  renameCategoryTargetAtom,
} from "@/lib/workspace-atoms";
import { NewWorkspaceDropdown } from "@/components/workspace/new-workspace-dropdown";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";
import { CategorySkeleton, CategoryItem } from "./sidebar-category-list";
import { NavItem, navItems } from "./sidebar-nav-item";

export type SidebarView = "my-canvas" | "shared" | "trash";

export function WorkspaceSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeView, onViewChange] = useAtom(sidebarViewAtom);
  const sortedCategories = useAtomValue(sortedCategoriesAtom);
  const categories = useAtomValue(categoriesAtom);
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

  const isNavItemActive = (item: (typeof navItems)[number]) =>
    item.href ? pathname === item.href : activeView === item.id;

  const renderCategorySection = () => {
    if (categories === undefined) return <CategorySkeleton />;
    if (sortedCategories.length === 0) return null;

    return (
      <>
        <div className="my-2 border-t border-border/60" />
        <span className="text-muted-foreground mb-1 px-3 text-[10px] font-medium uppercase tracking-wider">
          Categories
        </span>
        <div className="flex flex-col gap-0.5">
          {sortedCategories.map((category) => (
            <CategoryItem
              key={category._id}
              categoryName={category.name}
              isActive={activeCategoryFilter === category.name}
              onClick={() => handleCategoryClick(category.name)}
              onRename={() => setRenameCategoryTarget(category._id)}
              onDelete={() => handleDeleteCategory(category._id)}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <>
      <div className="border-b border-border/60 bg-background md:hidden">
        <div className="flex">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={isNavItemActive(item)}
              isMobile
              activeCategoryFilter={activeCategoryFilter}
              onNavClick={handleNavClick}
            />
          ))}
        </div>
        {categories !== undefined && sortedCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-3 pb-2 pt-1">
            {sortedCategories.map((category) => (
              <button
                key={category._id}
                onClick={() => handleCategoryClick(category.name)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeCategoryFilter === category.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <aside className="hidden w-56 shrink-0 flex-col border-r border-border/60 bg-background pt-4 md:flex">
        <nav className="flex flex-col gap-1 px-3">
          <NewWorkspaceDropdown />

          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={isNavItemActive(item)}
              isMobile={false}
              activeCategoryFilter={activeCategoryFilter}
              onNavClick={handleNavClick}
            />
          ))}

          {renderCategorySection()}

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