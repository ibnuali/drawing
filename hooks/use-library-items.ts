"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSession } from "@/lib/auth-client";
import { getTemplates } from "@/lib/canvas-templates";

export function useLibraryItems() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Library items are shared across all users
  const items = useQuery(api.libraryItems.list, {});

  const createItem = useMutation(api.libraryItems.create);
  const updateItem = useMutation(api.libraryItems.update);
  const deleteItem = useMutation(api.libraryItems.remove);

  const addToLibrary = async (
    name: string,
    elements: string,
    description?: string
  ) => {
    return await createItem({
      name,
      elements,
      description,
      createdById: userId,
    });
  };

  const updateLibraryItem = async (
    id: Id<"libraryItems">,
    updates: {
      name?: string;
      description?: string;
      elements?: string;
    }
  ) => {
    await updateItem({ id, ...updates });
  };

  const removeFromLibrary = async (id: Id<"libraryItems">) => {
    await deleteItem({ id });
  };

  // Seed default templates as library items (run once)
  const seedDefaults = async () => {
    const templates = getTemplates().filter((t) => t.id !== "blank");
    const existingNames = new Set(items?.map((i) => i.name) ?? []);

    for (const template of templates) {
      if (existingNames.has(template.name)) continue;

      await createItem({
        name: template.name,
        description: template.description,
        elements: JSON.stringify({ elements: template.elements }),
        createdById: userId,
      });
    }
  };

  return {
    items,
    addToLibrary,
    updateLibraryItem,
    removeFromLibrary,
    seedDefaults,
    isLoading: items === undefined,
  };
}