"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { useAtom, useAtomValue } from "jotai";
import {
  importCanvasDialogAtom,
  categoryOptionsAtom,
} from "@/lib/workspace-atoms";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ParsedExcalidrawFile {
  elements: unknown[];
  appState?: Record<string, unknown>;
  files?: Record<string, unknown>;
  name?: string;
}

export function ImportCanvasDialog() {
  const [open, setOpen] = useAtom(importCanvasDialogAtom);
  const categoryOptions = useAtomValue(categoryOptionsAtom);
  const { handleImport } = useWorkspaceActions();
  const [title, setTitle] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string | undefined>(undefined);
  const [parsedData, setParsedData] = React.useState<ParsedExcalidrawFile | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setCategoryId(undefined);
      setParsedData(null);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const parseFile = async (file: File): Promise<ParsedExcalidrawFile> => {
    const text = await file.text();
    const json = JSON.parse(text);

    // Validate it's an Excalidraw file
    if (!json.elements || !Array.isArray(json.elements)) {
      throw new Error("Invalid Excalidraw file: missing elements array");
    }

    // Extract name from file name (remove extension)
    const fileName = file.name.replace(/\.[^/.]+$/, "");

    return {
      elements: json.elements,
      appState: json.appState,
      files: json.files,
      name: fileName,
    };
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Check file extension
    if (!file.name.endsWith(".excalidraw")) {
      setError("Only .excalidraw files are supported");
      setParsedData(null);
      return;
    }

    try {
      const parsed = await parseFile(file);
      setParsedData(parsed);
      setTitle(parsed.name || "Untitled");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
      setParsedData(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async () => {
    if (!parsedData) return;

    const trimmed = title.trim() || "Untitled";
    const dataString = JSON.stringify({
      elements: parsedData.elements,
      appState: parsedData.appState
        ? {
            viewBackgroundColor: parsedData.appState.viewBackgroundColor,
            gridSize: parsedData.appState.gridSize,
          }
        : undefined,
      files: parsedData.files,
    });

    await handleImport(trimmed, dataString, categoryId);
    setOpen(false);
  };

  const elementsCount = parsedData?.elements?.length ?? 0;
  const filesCount = parsedData?.files ? Object.keys(parsedData.files).length : 0;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Import workspace</AlertDialogTitle>
          <AlertDialogDescription>
            Import an Excalidraw file to create a new canvas.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* File drop zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".excalidraw"
              onChange={handleFileInputChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-sm text-muted-foreground">
                Drag and drop an Excalidraw file here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Accepts .excalidraw files
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Preview */}
          {parsedData && (
            <div className="rounded-lg border border-border p-3 bg-muted/50">
              <p className="text-sm font-medium mb-2">Preview</p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{elementsCount} elements</span>
                <span>{filesCount} files</span>
              </div>
            </div>
          )}

          {/* Name field */}
          <Field>
            <FieldLabel htmlFor="canvas-name">Name</FieldLabel>
            <Input
              ref={inputRef}
              id="canvas-name"
              placeholder="My imported canvas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!parsedData}
            />
          </Field>

          {/* Category select */}
          <Field>
            <FieldLabel htmlFor="category">Category (optional)</FieldLabel>
            <Select
              value={categoryId ?? "none"}
              onValueChange={(val) => setCategoryId(val === "none" || val === null ? undefined : val)}
              disabled={!parsedData || !categoryOptions?.length}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categoryOptions?.map((cat) => (
                  <SelectItem key={cat._id} value={String(cat._id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={!parsedData}>
            Import
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}