# Checklist Code Review

À passer avant de considérer une implémentation terminée.

## Qualité
- [ ] Pas de code dupliqué évitable
- [ ] Fonctions < 50 lignes (sinon découper)
- [ ] Fichiers < 300 lignes (sinon découper)
- [ ] Nommage clair et cohérent (anglais pour le code)
- [ ] Pas de `console.log` oublié (sauf logging intentionnel)
- [ ] Pas de code commenté / mort

## TypeScript
- [ ] Zéro `any` — types explicites partout
- [ ] Interfaces/types pour les objets complexes
- [ ] Zod pour la validation des inputs externes
- [ ] Gestion correcte des cas `null` / `undefined`

## React / Next.js
- [ ] Server Components par défaut, `"use client"` uniquement si nécessaire
- [ ] Pas de props drilling excessif (> 3 niveaux)
- [ ] `key` prop sur les listes
- [ ] Images avec `next/image` et dimensions explicites
- [ ] Metadata définie sur les pages

## API Routes
- [ ] Validation Zod de tous les inputs
- [ ] Codes HTTP appropriés (200, 201, 400, 401, 403, 404, 500)
- [ ] Messages d'erreur en français pour l'utilisateur
- [ ] Auth vérifiée sur les routes protégées
- [ ] Try/catch avec gestion d'erreur propre

## Performance
- [ ] Pas de requêtes N+1 (utiliser `include` Prisma)
- [ ] Pas d'import lourd côté client inutilement
- [ ] Images optimisées (sharp/next-image)
- [ ] Pas de re-renders inutiles (mémoisation si besoin)

## Sécurité
- [ ] Pas d'injection SQL (Prisma protège, mais vérifier les raw queries)
- [ ] Pas de XSS (échappement des outputs, pas de `dangerouslySetInnerHTML` sans sanitize)
- [ ] Secrets jamais exposés côté client
- [ ] CSRF protégé sur les mutations
