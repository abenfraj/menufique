# Epic 17 — Import menu depuis Deliveroo / Uber Eats

**Priorité** : Medium-High
**Agent principal** : Dev
**Dépendances** : Epic 5 (CRUD Menu), Epic 12b (AI) — ✅ tous complétés

## Contexte

Un restaurateur a déjà son menu sur Deliveroo ou Uber Eats. Saisir à nouveau tous les plats est fastidieux. Cette feature lui permet de coller son URL et d'importer son menu en 1 clic grâce à Claude AI.

L'infrastructure est déjà en place :
- `POST /api/menus/[id]/import` — insère les catégories/plats en DB
- `src/lib/ai.ts` — client Claude (Anthropic SDK)
- Il manque : la route d'extraction URL + le UI dans l'éditeur

---

## Story 17.1 — Route d'extraction depuis URL

**Points** : 5
**Agent** : Dev

### Description

Créer `POST /api/ai/extract-from-url` qui :
1. Reçoit `{ url: string, menuId: string }`
2. Valide que l'URL est Deliveroo ou Uber Eats (whitelist de domaines)
3. Fetch la page HTML avec un User-Agent navigateur standard
4. Envoie le HTML à Claude avec un prompt structuré
5. Retourne `{ categories: [{ name, description, dishes: [{ name, description, price }] }] }`

### Contraintes techniques
- Whitelist domaines : `deliveroo.fr`, `deliveroo.co.uk`, `ubereats.com`
- Timeout fetch : 10s max
- Taille HTML envoyée à Claude : tronquer à 100k caractères
- En cas d'échec fetch : erreur claire "Page inaccessible, essayez de copier-coller le texte"
- Rate limit : 5 extractions / heure / user

### Critères d'acceptation
- [ ] Route créée et sécurisée (auth requise)
- [ ] Validation URL (domaine whitelist + format valide)
- [ ] Fetch HTML avec User-Agent navigateur
- [ ] Claude extrait correctement : catégories, noms, descriptions, prix
- [ ] Réponse JSON `{ categories: [...] }` compatible avec `/api/menus/[id]/import`
- [ ] Erreur explicite si page inaccessible

---

## Story 17.2 — UI dans l'éditeur de menu

**Points** : 3
**Agent** : Dev

### Description

Ajouter dans l'éditeur de menu (`/menus/[id]`) un bouton **"Importer depuis Deliveroo / Uber Eats"** qui ouvre une modale :

1. Champ URL + bouton "Extraire"
2. État loading pendant l'extraction Claude
3. Preview des catégories/plats extraits (liste scrollable)
4. Bouton "Importer X plats" → appel `/api/menus/[id]/import`
5. Toast succès + refresh de l'éditeur

### UI / UX
- Modale avec overlay (réutiliser le composant Modal existant)
- Pendant l'extraction : spinner + "Claude analyse votre menu..."
- Preview : afficher catégories avec leurs plats (nom + prix)
- Si erreur : message clair avec suggestion de copier-coller le texte

### Critères d'acceptation
- [ ] Bouton "Importer" visible dans l'éditeur (à côté de "Nouvelle catégorie")
- [ ] Modale fonctionnelle (URL → extraction → preview → import)
- [ ] Loading states corrects (extraction et import séparés)
- [ ] Preview lisible avant confirmation
- [ ] Toast succès avec nombre de plats importés
- [ ] Responsive (mobile 375px)

---

## Flow complet

```
[Éditeur menu] → clic "Importer depuis Deliveroo/Uber Eats"
  → Modale s'ouvre
  → User colle : https://deliveroo.fr/fr/menu/paris/restaurant-xyz
  → Clic "Extraire"
  → POST /api/ai/extract-from-url { url, menuId }
    → fetch(url) → HTML
    → Claude → { categories: [...] }
  → Preview affichée dans la modale
  → Clic "Importer 23 plats"
  → POST /api/menus/[id]/import { categories: [...] }
  → Toast "23 plats importés avec succès !"
  → Éditeur rafraîchi
```

---

## Notes pour le Dev

- Le prompt Claude doit extraire **prix numériques** (ex: `12.5`, pas `"12,50 €"`)
- Deliveroo a du SSR (Next.js) → la plupart des données sont dans le HTML initial
- Uber Eats a aussi du SSR → fonctionne généralement
- Ne pas utiliser Puppeteer (trop lourd, coûteux) — fetch simple suffit
- Si les prix sont en format `"12,50"` → normaliser en float côté Claude prompt
