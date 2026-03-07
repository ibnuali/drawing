"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AccessLevelSelectProps {
  currentLevel: "editor" | "viewer";
  onChangeLevel: (level: "editor" | "viewer") => void;
  onRemove: () => void;
}

export function AccessLevelSelect({
  currentLevel,
  onChangeLevel,
  onRemove,
}: Readonly<AccessLevelSelectProps>) {
  const handleValueChange = (value: string | null) => {
    if (value === "remove") {
      onRemove();
    } else if (value === "editor" || value === "viewer") {
      onChangeLevel(value);
    }
  };

  return (
    <Select
      value={currentLevel}
      onValueChange={handleValueChange as (value: "editor" | "viewer" | null) => void}
    >
      <SelectTrigger size="sm" className="w-[120px] max-sm:min-h-[44px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="editor">Editor</SelectItem>
        <SelectItem value="viewer">Viewer</SelectItem>
        <SelectSeparator />
        <SelectItem value="remove">Remove access</SelectItem>
      </SelectContent>
    </Select>
  );
}