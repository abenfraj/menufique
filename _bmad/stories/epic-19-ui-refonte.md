# Epic 19 — Refonte complète UI/UX

**Priorité** : High (bloquer les Epics 17+ jusqu'à complétion)
**Agent principal** : Dev
**Dépendances** : Aucune (Epic 18 peut se faire en parallèle — backend pur)

## Contexte

Refonte complète de l'interface Menufique via pencil.dev.
L'Epic 18 (templates IA backend) peut être réalisé en parallèle car il ne touche aucun fichier UI.

---

## Inventaire des pages (13 pages)

### Groupe 1 — Marketing / Public
| Page | Route | Priorité design |
|------|-------|----------------|
| Landing page | `/` | ⭐⭐⭐ |
| Menu public (QR code) | `/m/[slug]` | ⭐⭐⭐ |
| 404 | `not-found.tsx` | ⭐ |
| Error | `error.tsx` | ⭐ |

### Groupe 2 — Auth
| Page | Route | Priorité design |
|------|-------|----------------|
| Login | `/login` | ⭐⭐⭐ |
| Register | `/register` | ⭐⭐⭐ |
| Forgot password | `/forgot-password` | ⭐⭐ |
| Reset password | `/reset-password` | ⭐⭐ |

### Groupe 3 — App (protégé)
| Page | Route | Priorité design |
|------|-------|----------------|
| Dashboard | `/dashboard` | ⭐⭐⭐ |
| Nouveau menu | `/menus/new` | ⭐⭐ |
| Éditeur de menu | `/menus/[id]` | ⭐⭐⭐ |
| Paramètres restaurant | `/settings/restaurant` | ⭐⭐ |
| Facturation | `/dashboard/billing` | ⭐⭐⭐ |

### Composants partagés (design system)
- `Button` — variantes : primary, outline, ghost, danger
- `Input` — avec label, error state, disabled
- `Card` — avec header/content/footer
- `Toast` — success, error, warning, info
- `Modal` — overlay + contenu
- `Badge` — FREE/PRO, statut publié/brouillon
- Navigation (header dashboard + sidebar mobile)
- Loading skeleton
- Empty state
- Spinner / loaders

---

## Story 19.1 — Design system avec pencil.dev

**Points** : 3
**Agent** : PO + Dev

### Étapes pencil.dev

1. **Créer un projet** sur pencil.dev avec le brief suivant :
   - SaaS de création de menus de restaurant
   - Cible : restaurateurs français indépendants, peu technophiles
   - Palette actuelle : orange `#FF6B35`, fond `#FFF8F2`, texte `#1A1A2E`
   - Garder l'orange comme couleur primaire (identité de marque)
   - Style : professionnel, chaleureux, épuré, moderne

2. **Générer le design system** :
   - Tokens de couleur (primary, secondary, neutrals, semantic)
   - Typographie (heading font + body font + scale)
   - Spacing scale (4px base)
   - Border radius, shadows, z-index

3. **Exporter** : récupérer les variables CSS à remplacer dans `src/app/globals.css`

### Critères d'acceptation
- [ ] Variables CSS définitives dans `globals.css`
- [ ] Palette complète : primaire, secondaire, neutrals, success, error, warning
- [ ] Typographie : 2 polices max, scale h1-h6, body, caption

---

## Story 19.2 — Refonte pages marketing (landing + menu public)

**Points** : 8
**Agent** : Dev

### Pages
- `/` — Landing page complète
- `/m/[slug]` — Page menu publique

### Priorités UX
- Landing : conversion maximale → CTA "Créer mon menu" above the fold
- Menu public : lisibilité mobile parfaite, chargement rapide, pas de compte requis

---

## Story 19.3 — Refonte pages auth

**Points** : 5
**Agent** : Dev

### Pages
- `/login`, `/register`, `/forgot-password`, `/reset-password`

### Priorités UX
- Formulaires clairs, feedback d'erreur immédiat
- Mobile-first (la plupart des restaurateurs utilisent leur téléphone)
- Login Google visible et accessible
- Progress implicite (login → dashboard en 1 étape)

---

## Story 19.4 — Refonte dashboard

**Points** : 8
**Agent** : Dev

### Pages
- `/dashboard` — liste des menus
- `/menus/new` — création
- `/dashboard/billing` — facturation

### Priorités UX
- Dashboard : carte menu lisible en un coup d'œil, actions rapides visibles
- Hiérarchie claire FREE vs PRO
- Billing : valeur Pro évidente avant le paywall

---

## Story 19.5 — Refonte éditeur de menu

**Points** : 13
**Agent** : Dev

### Page
- `/menus/[id]` — éditeur split-view

### Priorités UX
- La page la plus complexe : split left/right doit rester intuitive sur desktop
- Mobile : basculement entre édition et preview (onglets)
- Actions header claires (publier, PDF, partager)
- Panel IA accessible mais pas envahissant
- Drag & drop pour réordonner les catégories/plats (si dans la refonte)

---

## Story 19.6 — Refonte paramètres restaurant

**Points** : 3
**Agent** : Dev

### Page
- `/settings/restaurant`

---

## Ordre d'implémentation recommandé

```
1. Design system (tokens CSS)          ← débloquer tout le reste
2. Composants partagés                 ← Button, Input, Card, Toast
3. Pages auth                          ← simple, rapide à valider
4. Dashboard + Billing                 ← coeur de l'app
5. Éditeur de menu                     ← le plus complexe
6. Landing + Menu public               ← marketing
7. Pages utilitaires (404, error)      ← rapide
```

---

## Notes techniques

- Garder la structure de fichiers existante — uniquement remplacer le JSX/CSS
- Ne PAS changer les APIs, la logique métier, ni le routing
- Remplacer les classes Tailwind au fur et à mesure (pas de refactoring global)
- Tester chaque page sur mobile 375px ET desktop 1280px avant de valider
- `npm run build` doit passer après chaque story
