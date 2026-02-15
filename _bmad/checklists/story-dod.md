# Definition of Done (DoD) — Story

Une story est considérée "terminée" quand TOUS les critères suivants sont remplis.

## Code
- [ ] Critères d'acceptation de la story tous remplis
- [ ] Code en TypeScript strict — 0 `any`
- [ ] `npm run build` passe sans erreur
- [ ] Pas de warnings ESLint non justifiés
- [ ] Code review checklist passée (`_bmad/checklists/code-review.md`)

## UX
- [ ] Textes UI en français, sans faute
- [ ] Responsive vérifié (mobile 375px + desktop 1280px)
- [ ] Feedback visuel sur les actions utilisateur (loading, success, error)
- [ ] Palette de couleurs respectée (#FF6B35, #FFF8F2, #1A1A2E)

## Sécurité
- [ ] Pas de vulnérabilité introduite (XSS, injection, etc.)
- [ ] Routes protégées nécessitent authentification
- [ ] Validation Zod sur les inputs utilisateur

## Documentation
- [ ] Journal mis à jour si décision architecturale (`_bmad/docs/journal.md`)
- [ ] Commentaires uniquement si logique non évidente
