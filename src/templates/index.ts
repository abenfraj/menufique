import { ClassicTemplate } from "./classic/template";
import { MinimalTemplate } from "./minimal/template";
import { BistrotTemplate } from "./bistrot/template";
import { AiCustomTemplate } from "./ai-custom/template";

export const templates = {
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  bistrot: BistrotTemplate,
  "ai-custom": AiCustomTemplate,
} as const;

export type TemplateId = keyof typeof templates;

export function getTemplate(id: string) {
  return templates[id as TemplateId] ?? templates.classic;
}
