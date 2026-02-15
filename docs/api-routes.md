# Menufique — API Routes

Toutes les API routes suivent le pattern Next.js App Router (`src/app/api/`).
Toutes les réponses sont en JSON. Validation Zod systématique sur chaque endpoint.

## Convention

- Authentification requise sauf mention contraire (vérifier la session NextAuth)
- Réponses d'erreur : `{ error: string, details?: any }`
- Réponses de succès : `{ data: T }` ou `{ success: true }`
- Rate limiting : 100 req/min par IP (général), 10 req/min sur auth

---

## Auth — `src/app/api/auth/`

Géré principalement par NextAuth. Routes custom en complément :

### POST `/api/auth/register`
Inscription par email/mot de passe.
```
Body: { email: string, password: string, name?: string }
→ 201 { data: { user: User } }
→ 409 { error: "Un compte existe déjà avec cet email" }
→ 400 { error: "Mot de passe trop faible (min 8 caractères)" }
```

### POST `/api/auth/reset-password`
Demande de réinitialisation du mot de passe. Envoie un email via Resend.
```
Body: { email: string }
→ 200 { success: true }  // Toujours 200 (ne pas révéler si l'email existe)
```

### POST `/api/auth/reset-password/confirm`
Confirmation du nouveau mot de passe avec le token.
```
Body: { token: string, password: string }
→ 200 { success: true }
→ 400 { error: "Token invalide ou expiré" }
```

---

## Restaurant — `src/app/api/restaurant/`

### GET `/api/restaurant`
Récupérer les infos du restaurant de l'utilisateur connecté.
```
→ 200 { data: Restaurant }
→ 404 { error: "Aucun restaurant configuré" }
```

### PUT `/api/restaurant`
Créer ou mettre à jour les infos restaurant.
```
Body: {
  name: string,            // requis
  address?: string,
  phone?: string,
  email?: string,
  website?: string,
  openingHours?: Record<string, string>
}
→ 200 { data: Restaurant }
```

### POST `/api/restaurant/logo`
Upload du logo. Multipart form data.
```
Body: FormData avec fichier "logo" (PNG/JPG/SVG, max 5 Mo)
→ 200 { data: { logoUrl: string } }
→ 400 { error: "Format non supporté" | "Fichier trop volumineux (max 5 Mo)" }
```

### DELETE `/api/restaurant/logo`
Supprimer le logo.
```
→ 200 { success: true }
```

---

## Menus — `src/app/api/menus/`

### GET `/api/menus`
Lister tous les menus de l'utilisateur.
```
→ 200 { data: Menu[] }  // Avec categories et dishes inclus
```

### POST `/api/menus`
Créer un nouveau menu.
```
Body: { name?: string }   // défaut: "Mon menu"
→ 201 { data: Menu }
→ 403 { error: "Limite atteinte (1 menu en plan gratuit)" }
```

### GET `/api/menus/[id]`
Récupérer un menu complet avec catégories et plats.
```
→ 200 { data: Menu & { categories: (Category & { dishes: Dish[] })[] } }
→ 404 { error: "Menu introuvable" }
```

### PUT `/api/menus/[id]`
Mettre à jour un menu (nom, template, couleurs, polices).
```
Body: {
  name?: string,
  templateId?: string,
  customColors?: { primary: string, background: string, text: string },
  customFonts?: { heading: string, body: string }
}
→ 200 { data: Menu }
```

### DELETE `/api/menus/[id]`
Supprimer un menu (cascade : catégories + plats + fichiers S3).
```
→ 200 { success: true }
```

### PUT `/api/menus/[id]/publish`
Publier / dépublier un menu (rend la page publique active ou inactive).
```
Body: { isPublished: boolean }
→ 200 { data: Menu }
```

---

## Catégories — `src/app/api/menus/[menuId]/categories/`

### POST `/api/menus/[menuId]/categories`
Ajouter une catégorie au menu.
```
Body: { name: string, description?: string }
→ 201 { data: Category }
```

### PUT `/api/menus/[menuId]/categories/[id]`
Modifier une catégorie.
```
Body: { name?: string, description?: string }
→ 200 { data: Category }
```

### DELETE `/api/menus/[menuId]/categories/[id]`
Supprimer une catégorie (cascade : tous les plats dedans).
```
→ 200 { success: true }
```

### PUT `/api/menus/[menuId]/categories/reorder`
Réordonner les catégories (drag & drop).
```
Body: { orderedIds: string[] }   // Liste des IDs dans le nouvel ordre
→ 200 { success: true }
```

---

## Plats — `src/app/api/menus/[menuId]/categories/[categoryId]/dishes/`

### POST `.../dishes`
Ajouter un plat.
```
Body: {
  name: string,
  description?: string,
  price: number,
  allergens?: string[]    // ex: ["gluten", "lait"]
}
→ 201 { data: Dish }
```

### PUT `.../dishes/[id]`
Modifier un plat.
```
Body: {
  name?: string,
  description?: string,
  price?: number,
  allergens?: string[],
  isAvailable?: boolean
}
→ 200 { data: Dish }
```

### DELETE `.../dishes/[id]`
Supprimer un plat.
```
→ 200 { success: true }
```

### PUT `.../dishes/reorder`
Réordonner les plats dans une catégorie.
```
Body: { orderedIds: string[] }
→ 200 { success: true }
```

---

## Génération — `src/app/api/generate/`

### POST `/api/generate/pdf`
Générer le PDF d'un menu.
```
Body: { menuId: string }
→ 200 { data: { pdfUrl: string } }
→ 403 { error: "Upgrade vers Pro pour générer sans watermark" }
→ 500 { error: "Erreur lors de la génération du PDF" }
```

### POST `/api/generate/qr`
Générer le QR code d'un menu.
```
Body: { menuId: string }
→ 200 { data: { qrCodeUrl: string, publicUrl: string } }
```

---

## Page publique du menu — `src/app/m/[slug]/`

### GET `/m/[slug]` (page, pas API)
**Pas d'authentification requise.** Page SSR publique accessible via QR code.
Affiche le menu complet du restaurant de façon responsive mobile-first.
Retourne 404 si le menu n'est pas publié.

---

## Stripe — `src/app/api/stripe/`

### POST `/api/stripe/checkout`
Créer une session Stripe Checkout pour passer en Pro.
```
Body: { priceId: string }   // ID du prix Stripe (mensuel ou annuel)
→ 200 { data: { checkoutUrl: string } }
```

### POST `/api/stripe/portal`
Créer une session Stripe Customer Portal (gestion abo, factures, annulation).
```
→ 200 { data: { portalUrl: string } }
```

### POST `/api/stripe/webhooks`
**Pas d'authentification requise.** Endpoint pour les webhooks Stripe.
Vérification de la signature Stripe.
Événements gérés :
- `checkout.session.completed` → Passer l'utilisateur en PRO
- `customer.subscription.updated` → Mettre à jour le plan
- `customer.subscription.deleted` → Repasser en FREE
- `invoice.payment_failed` → Notification email à l'utilisateur
```
→ 200 { received: true }
```

---

## Utilisateur — `src/app/api/user/`

### GET `/api/user/profile`
Récupérer le profil utilisateur.
```
→ 200 { data: User }
```

### PUT `/api/user/profile`
Mettre à jour le profil.
```
Body: { name?: string, email?: string }
→ 200 { data: User }
```

### DELETE `/api/user/account`
Supprimer le compte (RGPD). Supprime tout : user, restaurant, menus, fichiers S3, abonnement Stripe.
```
→ 200 { success: true }
```

### GET `/api/user/export`
Export RGPD : toutes les données de l'utilisateur en JSON.
```
→ 200 { data: { user, restaurant, menus: [...] } }
```
