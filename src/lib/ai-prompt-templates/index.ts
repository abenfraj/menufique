import { elegantTemplate } from "./elegant";
import { modernTemplate } from "./modern";
import { rusticTemplate } from "./rustic";
import { minimalTemplate } from "./minimal";
import { colorfulTemplate } from "./colorful";
import { luxeTemplate } from "./luxe";

export {
  elegantTemplate,
  modernTemplate,
  rusticTemplate,
  minimalTemplate,
  colorfulTemplate,
  luxeTemplate,
};

type MenuStyle = "elegant" | "modern" | "rustic" | "minimal" | "colorful" | "luxe" | "auto";
type MenuComplexity = "simple" | "detailed" | "luxe";

/**
 * Returns the reference HTML template for a given style + complexity.
 * - complexity "luxe" always returns the luxe template regardless of style.
 * - style "auto" defaults to elegant (most versatile).
 */
export function getTemplateByStyle(style: MenuStyle, complexity?: MenuComplexity): string {
  if (complexity === "luxe") return luxeTemplate;
  switch (style) {
    case "elegant":  return elegantTemplate;
    case "modern":   return modernTemplate;
    case "rustic":   return rusticTemplate;
    case "minimal":  return minimalTemplate;
    case "colorful": return colorfulTemplate;
    case "luxe":     return luxeTemplate;
    case "auto":
    default:         return elegantTemplate;
  }
}
