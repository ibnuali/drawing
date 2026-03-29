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
import { useAtom } from "jotai";
import { createCanvasDialogAtom } from "@/lib/workspace-atoms";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";
import { getTemplates, getTemplateData, type TemplateId } from "@/lib/canvas-templates";
import { cn } from "@/lib/utils";
import { Network, File, Trello } from "lucide-react";

const templateIcons: Record<TemplateId, React.ElementType> = {
  blank: File,
  systemdesign: Network,
  scrum: Trello,
};

export function CreateCanvasDialog() {
  const [open, setOpen] = useAtom(createCanvasDialogAtom);
  const { handleCreate } = useWorkspaceActions();
  const [title, setTitle] = React.useState("");
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateId>("blank");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const templates = React.useMemo(() => getTemplates(), []);

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setSelectedTemplate("blank");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSubmit = () => {
    const trimmed = title.trim() || "Untitled";
    const templateData = getTemplateData(selectedTemplate);
    handleCreate(trimmed, templateData);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-lg max-sm:max-w-[calc(100vw-32px)] max-sm:p-4">
        <AlertDialogHeader>
          <AlertDialogTitle>New workspace</AlertDialogTitle>
          <AlertDialogDescription>
            Give your canvas a name and choose a template to get started.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Field>
            <FieldLabel htmlFor="canvas-name">Name</FieldLabel>
            <Input
              ref={inputRef}
              id="canvas-name"
              placeholder="My canvas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
        </form>

        <div className="space-y-2">
          <FieldLabel>Template</FieldLabel>
          <div className="grid grid-cols-3 gap-2">
            {templates.map((template) => {
              const Icon = templateIcons[template.id];
              const isSelected = selectedTemplate === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("size-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-xs", isSelected ? "text-primary font-medium" : "text-muted-foreground")}>
                    {template.name}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedTemplate !== "blank" && (
            <p className="text-xs text-muted-foreground">
              {templates.find((t) => t.id === selectedTemplate)?.description}
            </p>
          )}
        </div>

        <AlertDialogFooter className="max-sm:flex-col max-sm:gap-2">
          <AlertDialogCancel className="max-sm:w-full max-sm:min-h-[44px]">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} className="max-sm:w-full max-sm:min-h-[44px]">Create</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}