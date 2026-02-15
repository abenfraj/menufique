# Epic 14 — Polish (UX, animations, erreurs, SEO)

**Priorité** : High
**Agents** : Dev + PO (validation)
**Dépendances** : Aucune

## Contexte
Raffiner l'expérience utilisateur avec des animations, un meilleur feedback, une gestion d'erreurs robuste et l'optimisation SEO.

---

## Story 14.1 — Système de toasts / notifications
**Points** : 3
**Agent** : Dev

### Description
Implémenter un système de notifications toast global pour le feedback utilisateur.

### Critères d'acceptation
- [ ] Composant Toast global (success, error, warning, info)
- [ ] Auto-dismiss après 5s, dismiss manuel au clic
- [ ] Animation d'entrée/sortie fluide
- [ ] Remplacer tous les `alert()` existants par des toasts
- [ ] Accessible (role="alert", aria-live)

---

## Story 14.2 — Animations et transitions
**Points** : 2
**Agent** : Dev

### Description
Ajouter des micro-animations pour rendre l'interface plus vivante.

### Critères d'acceptation
- [ ] Transition de page douce (fade)
- [ ] Animation d'apparition des cartes menu sur le dashboard
- [ ] Hover effects sur les boutons et cartes
- [ ] Loading skeletons sur les pages de chargement
- [ ] Respecter `prefers-reduced-motion`

---

## Story 14.3 — Gestion d'erreurs globale
**Points** : 3
**Agent** : Dev

### Description
Implémenter des pages d'erreur et une gestion d'erreurs cohérente.

### Critères d'acceptation
- [ ] Page 404 personnalisée (`not-found.tsx`) avec branding
- [ ] Page d'erreur globale (`error.tsx`) avec option "réessayer"
- [ ] Error boundaries sur les composants critiques (éditeur, preview)
- [ ] Messages d'erreur API en français et compréhensibles
- [ ] Logging Sentry des erreurs côté client et serveur

---

## Story 14.4 — SEO et metadata
**Points** : 2
**Agent** : Dev

### Description
Optimiser le référencement naturel des pages publiques.

### Critères d'acceptation
- [ ] Metadata dynamiques sur toutes les pages (`generateMetadata`)
- [ ] Open Graph tags (titre, description, image) pour la landing et les menus publics
- [ ] `robots.txt` configuré
- [ ] `sitemap.xml` dynamique (landing + menus publics publiés)
- [ ] Balises `<h1>` - `<h3>` sémantiquement correctes

---

## Story 14.5 — Responsive final et polish mobile
**Points** : 2
**Agent** : Dev + PO

### Description
Audit complet du responsive et corrections finales.

### Critères d'acceptation
- [ ] Toutes les pages testées sur 375px, 768px, 1280px
- [ ] Navigation mobile fonctionnelle (menu hamburger)
- [ ] Formulaires utilisables sur mobile (taille des inputs, espacement)
- [ ] Textes lisibles sans zoom
- [ ] PO valide le parcours complet sur mobile
