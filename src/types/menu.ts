// ============================================
// ALLERGENS
// ============================================
export const ALLERGENS = [
  { id: "gluten", label: "Gluten", icon: "allergen-gluten.svg" },
  { id: "crustaces", label: "Crustacés", icon: "allergen-crustaces.svg" },
  { id: "oeufs", label: "Œufs", icon: "allergen-oeufs.svg" },
  { id: "poissons", label: "Poissons", icon: "allergen-poissons.svg" },
  { id: "arachides", label: "Arachides", icon: "allergen-arachides.svg" },
  { id: "soja", label: "Soja", icon: "allergen-soja.svg" },
  { id: "lait", label: "Lait", icon: "allergen-lait.svg" },
  { id: "fruits-a-coque", label: "Fruits à coque", icon: "allergen-fruits-a-coque.svg" },
  { id: "celeri", label: "Céleri", icon: "allergen-celeri.svg" },
  { id: "moutarde", label: "Moutarde", icon: "allergen-moutarde.svg" },
  { id: "sesame", label: "Sésame", icon: "allergen-sesame.svg" },
  { id: "sulfites", label: "Sulfites", icon: "allergen-sulfites.svg" },
  { id: "lupin", label: "Lupin", icon: "allergen-lupin.svg" },
  { id: "mollusques", label: "Mollusques", icon: "allergen-mollusques.svg" },
] as const;

export type AllergenId = (typeof ALLERGENS)[number]["id"];

// ============================================
// TEMPLATES
// ============================================
export const TEMPLATES = [
  { id: "classic", name: "Classique", isPro: false },
  { id: "minimal", name: "Minimal", isPro: false },
  { id: "bistrot", name: "Bistrot", isPro: true },
  { id: "ai-custom", name: "IA Générative", isPro: true },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]["id"];

// ============================================
// MENU TYPES
// ============================================
export interface Dish {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number | string;
  allergens: string[];
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
}

export interface Category {
  id: string;
  menuId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  dishes: Dish[];
}

export interface MenuCustomColors {
  primary: string;
  background: string;
  text: string;
}

export interface MenuCustomFonts {
  heading: string;
  body: string;
}

export interface Menu {
  id: string;
  userId: string;
  restaurantId: string;
  name: string;
  slug: string;
  templateId: TemplateId;
  customColors: MenuCustomColors | null;
  customFonts: MenuCustomFonts | null;
  isPublished: boolean;
  aiDesignHtml: string | null;
  aiBackgroundUrl: string | null;
  designPrompt: string | null;
  pdfUrl: string | null;
  qrCodeUrl: string | null;
  categories: Category[];
}

// ============================================
// FORM TYPES
// ============================================
export interface DishFormData {
  name: string;
  description: string;
  price: string;
  allergens: string[];
  isAvailable: boolean;
}

export interface CategoryFormData {
  name: string;
  description: string;
}

export interface MenuFormData {
  name: string;
  templateId: TemplateId;
  customColors?: MenuCustomColors;
  customFonts?: MenuCustomFonts;
}
