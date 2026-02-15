import { z } from "zod";

// ============================================
// AUTH
// ============================================

export const registerSchema = z.object({
  email: z
    .string()
    .email("Adresse email invalide")
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  name: z.string().min(1, "Le nom est requis").optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Adresse email invalide")
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .email("Adresse email invalide")
    .transform((v) => v.toLowerCase().trim()),
});

export const confirmResetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

// ============================================
// RESTAURANT
// ============================================

export const restaurantSchema = z.object({
  name: z.string().min(1, "Le nom du restaurant est requis"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  openingHours: z.record(z.string(), z.string()).optional(),
});

// ============================================
// MENU
// ============================================

export const menuSchema = z.object({
  name: z.string().min(1, "Le nom du menu est requis"),
  templateId: z.string().default("classic"),
  customColors: z
    .object({
      primary: z.string().optional(),
      background: z.string().optional(),
      text: z.string().optional(),
    })
    .optional(),
  customFonts: z
    .object({
      heading: z.string().optional(),
      body: z.string().optional(),
    })
    .optional(),
});

// ============================================
// CATEGORY
// ============================================

export const categorySchema = z.object({
  name: z.string().min(1, "Le nom de la catégorie est requis"),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

// ============================================
// DISH
// ============================================

export const dishSchema = z.object({
  name: z.string().min(1, "Le nom du plat est requis"),
  description: z.string().optional(),
  price: z.number().positive("Le prix doit être positif"),
  allergens: z.array(z.string()).default([]),
  imageUrl: z.string().optional().nullable(),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

// ============================================
// TYPES INFÉRÉS
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RestaurantInput = z.infer<typeof restaurantSchema>;
export type MenuInput = z.infer<typeof menuSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type DishInput = z.infer<typeof dishSchema>;
