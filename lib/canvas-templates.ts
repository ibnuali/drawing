// Excalidraw element templates for new canvases
// Each template contains pre-made elements for common use cases

import scrumBoardElements from "@/templates/scrum-board-elements.json";
import systemDesignElements from "@/templates/system-design-elements.json";

export type TemplateId =
  | "blank"
  | "systemdesign"
  | "scrum";

export interface CanvasTemplate {
  id: TemplateId;
  name: string;
  description: string;
  elements: unknown[];
}

export function getTemplates(): CanvasTemplate[] {
  return [
    {
      id: "blank",
      name: "Blank",
      description: "Start with an empty canvas",
      elements: [],
    },
    {
      id: "systemdesign",
      name: "System Design",
      description: "Microservices architecture diagram",
      elements: systemDesignElements,
    },
    {
      id: "scrum",
      name: "Scrum Board",
      description: "Agile scrum board with task cards",
      elements: scrumBoardElements,
    },
  ];
}

export function getTemplateData(templateId: TemplateId): string | undefined {
  const templates = getTemplates();
  const template = templates.find((t) => t.id === templateId);
  if (!template || template.elements.length === 0) return undefined;
  return JSON.stringify({
    elements: template.elements,
    appState: {},
    files: {},
  });
}
