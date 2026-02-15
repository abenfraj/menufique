# Menufique — Schéma de base de données

## Schéma Prisma complet

Voici le schéma Prisma à utiliser comme base. Copie ce contenu dans `prisma/schema.prisma`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER
// ============================================
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  emailVerified     DateTime?
  passwordHash      String?            // null si connexion Google uniquement
  name              String?
  image             String?
  plan              Plan     @default(FREE)
  stripeCustomerId  String?  @unique
  stripeSubscriptionId String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  restaurant        Restaurant?
  menus             Menu[]
  accounts          Account[]         // Pour NextAuth (OAuth providers)
  sessions          Session[]         // Pour NextAuth

  @@map("users")
}

enum Plan {
  FREE
  PRO
}

// ============================================
// NEXTAUTH — TABLES REQUISES
// ============================================
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ============================================
// RESTAURANT
// ============================================
model Restaurant {
  id          String   @id @default(cuid())
  userId      String   @unique
  name        String
  address     String?
  phone       String?
  email       String?
  website     String?
  logoUrl     String?            // URL vers S3/Supabase Storage
  openingHours Json?             // JSON libre : { "lundi": "12h-14h, 19h-22h", ... }
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  menus       Menu[]

  @@map("restaurants")
}

// ============================================
// MENU
// ============================================
model Menu {
  id              String       @id @default(cuid())
  userId          String
  restaurantId    String
  name            String       @default("Mon menu")
  slug            String       @unique    // URL-friendly, ex: "le-bistrot-du-coin"
  templateId      String       @default("classic")
  customColors    Json?        // { primary: "#FF6B35", background: "#FFF8F2", text: "#1A1A2E" }
  customFonts     Json?        // { heading: "Playfair Display", body: "Inter" }
  isPublished     Boolean      @default(false)
  pdfUrl          String?      // URL du dernier PDF généré
  qrCodeUrl       String?      // URL du QR code généré
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  restaurant      Restaurant   @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  categories      Category[]

  @@index([userId])
  @@index([slug])
  @@map("menus")
}

// ============================================
// CATEGORY (section du menu : Entrées, Plats, etc.)
// ============================================
model Category {
  id          String   @id @default(cuid())
  menuId      String
  name        String                    // ex: "Entrées", "Plats principaux", "Desserts"
  description String?                   // Description optionnelle de la catégorie
  sortOrder   Int      @default(0)      // Ordre d'affichage (drag & drop)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  menu        Menu     @relation(fields: [menuId], references: [id], onDelete: Cascade)
  dishes      Dish[]

  @@index([menuId])
  @@map("categories")
}

// ============================================
// DISH (plat individuel)
// ============================================
model Dish {
  id          String   @id @default(cuid())
  categoryId  String
  name        String                    // ex: "Tartare de saumon"
  description String?                   // ex: "Saumon frais, avocat, agrumes, sésame"
  price       Decimal  @db.Decimal(8,2) // ex: 14.50
  allergens   String[] @default([])     // ex: ["poissons", "sesame"]
  isAvailable Boolean  @default(true)   // Pour masquer temporairement un plat
  sortOrder   Int      @default(0)      // Ordre d'affichage
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@index([categoryId])
  @@map("dishes")
}
```

## Relations

```
User 1:1 Restaurant
User 1:N Menu
Restaurant 1:N Menu
Menu 1:N Category
Category 1:N Dish
```

## Notes importantes

- **Suppression en cascade** : supprimer un User supprime tout (restaurant, menus, catégories, plats)
- **Slug unique** : chaque menu a un slug URL-friendly unique pour la page publique (`/m/le-bistrot-du-coin`)
- **Allergènes** : stockés comme array de strings (les 14 allergènes européens normalisés)
- **sortOrder** : entier pour gérer le drag & drop des catégories et plats
- **customColors/customFonts** : JSON libre pour la personnalisation Pro
- **openingHours** : JSON libre car les formats d'horaires sont très variables

## Valeurs des allergènes (constantes à définir dans le code)

```typescript
export const ALLERGENS = [
  { id: 'gluten', label: 'Gluten', icon: 'allergen-gluten.svg' },
  { id: 'crustaces', label: 'Crustacés', icon: 'allergen-crustaces.svg' },
  { id: 'oeufs', label: 'Œufs', icon: 'allergen-oeufs.svg' },
  { id: 'poissons', label: 'Poissons', icon: 'allergen-poissons.svg' },
  { id: 'arachides', label: 'Arachides', icon: 'allergen-arachides.svg' },
  { id: 'soja', label: 'Soja', icon: 'allergen-soja.svg' },
  { id: 'lait', label: 'Lait', icon: 'allergen-lait.svg' },
  { id: 'fruits-a-coque', label: 'Fruits à coque', icon: 'allergen-fruits-a-coque.svg' },
  { id: 'celeri', label: 'Céleri', icon: 'allergen-celeri.svg' },
  { id: 'moutarde', label: 'Moutarde', icon: 'allergen-moutarde.svg' },
  { id: 'sesame', label: 'Sésame', icon: 'allergen-sesame.svg' },
  { id: 'sulfites', label: 'Sulfites', icon: 'allergen-sulfites.svg' },
  { id: 'lupin', label: 'Lupin', icon: 'allergen-lupin.svg' },
  { id: 'mollusques', label: 'Mollusques', icon: 'allergen-mollusques.svg' },
] as const;
```
