import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  restaurantSchema,
  menuSchema,
  categorySchema,
  dishSchema,
} from "@/lib/validators";

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "12345678",
      name: "John",
    });
    expect(result.success).toBe(true);
  });

  it("accepts registration without name", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "1234567",
    });
    expect(result.success).toBe(false);
  });

  it("lowercases email", () => {
    const result = registerSchema.safeParse({
      email: "Test@Example.COM",
      password: "12345678",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
    }
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("restaurantSchema", () => {
  it("accepts valid restaurant data", () => {
    const result = restaurantSchema.safeParse({
      name: "Le Bistrot",
      address: "12 rue de la Paix",
      phone: "01 23 45 67 89",
    });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = restaurantSchema.safeParse({
      address: "12 rue de la Paix",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty optional fields", () => {
    const result = restaurantSchema.safeParse({
      name: "Le Bistrot",
      email: "",
      website: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email when provided", () => {
    const result = restaurantSchema.safeParse({
      name: "Le Bistrot",
      email: "not-valid",
    });
    expect(result.success).toBe(false);
  });
});

describe("menuSchema", () => {
  it("accepts valid menu data", () => {
    const result = menuSchema.safeParse({
      name: "Menu du midi",
    });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = menuSchema.safeParse({
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("defaults templateId to classic", () => {
    const result = menuSchema.safeParse({ name: "Menu" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.templateId).toBe("classic");
    }
  });
});

describe("categorySchema", () => {
  it("accepts valid category", () => {
    const result = categorySchema.safeParse({
      name: "Entrées",
      description: "Nos entrées fraîches",
    });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = categorySchema.safeParse({
      description: "Description",
    });
    expect(result.success).toBe(false);
  });
});

describe("dishSchema", () => {
  it("accepts valid dish", () => {
    const result = dishSchema.safeParse({
      name: "Tartare de saumon",
      description: "Saumon frais, avocat, agrumes",
      price: 14.5,
      allergens: ["poissons", "sesame"],
    });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = dishSchema.safeParse({
      price: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = dishSchema.safeParse({
      name: "Plat",
      price: -5,
    });
    expect(result.success).toBe(false);
  });

  it("defaults allergens to empty array", () => {
    const result = dishSchema.safeParse({
      name: "Plat",
      price: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.allergens).toEqual([]);
    }
  });

  it("defaults isAvailable to true", () => {
    const result = dishSchema.safeParse({
      name: "Plat",
      price: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isAvailable).toBe(true);
    }
  });
});
