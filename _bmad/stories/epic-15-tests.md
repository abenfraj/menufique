# Epic 15 — Tests

**Priorité** : Medium
**Agent principal** : Tester
**Dépendances** : Epics 13-14 idéalement terminés

## Contexte
Mettre en place la suite de tests automatisés (unit, intégration, E2E) pour sécuriser les fonctionnalités existantes et faciliter les évolutions futures.

---

## Story 15.1 — Setup infrastructure de test
**Points** : 3
**Agent** : Tester + DevOps

### Description
Configurer Vitest et Playwright, préparer l'environnement de test.

### Critères d'acceptation
- [ ] `vitest.config.ts` configuré avec path aliases et coverage
- [ ] `playwright.config.ts` configuré (Chromium, mobile + desktop viewports)
- [ ] Scripts npm : `test`, `test:coverage`, `test:e2e`
- [ ] DB de test séparée ou mocks Prisma configurés
- [ ] Mocks globaux pour services externes (Stripe, Resend, OpenAI)
- [ ] CI-ready : tests exécutables en headless

---

## Story 15.2 — Tests unitaires lib/
**Points** : 5
**Agent** : Tester

### Description
Tests unitaires pour toutes les fonctions utilitaires et la logique métier.

### Critères d'acceptation
- [ ] Tests `src/lib/validators.ts` — tous les schémas Zod
- [ ] Tests `src/lib/utils.ts` — helpers divers
- [ ] Tests `src/lib/qr.ts` — génération QR code
- [ ] Tests `src/lib/pdf.ts` — génération PDF (mocked Puppeteer)
- [ ] Tests logique de détection type plat (`detectItemType`)
- [ ] Tests validation HTML généré (`validateGeneratedHtml`)
- [ ] Coverage > 70% sur `src/lib/`

---

## Story 15.3 — Tests d'intégration API
**Points** : 5
**Agent** : Tester

### Description
Tests des API routes avec requêtes simulées.

### Critères d'acceptation
- [ ] Tests CRUD restaurant (create, read, update, delete)
- [ ] Tests CRUD menu (create, read, update, delete, categories, items)
- [ ] Tests auth (register, login, session, logout)
- [ ] Tests génération PDF et QR
- [ ] Tests upload d'images
- [ ] Validation des réponses d'erreur (401, 403, 404, 422)
- [ ] Test des limites du plan Free vs Pro

---

## Story 15.4 — Tests E2E parcours critiques
**Points** : 8
**Agent** : Tester

### Description
Tests Playwright des parcours utilisateur de bout en bout.

### Critères d'acceptation
- [ ] **Inscription** : register → email confirmation → dashboard
- [ ] **Création menu complet** : infos restaurant → catégories → plats → template → preview → PDF
- [ ] **Édition menu** : dashboard → ouvrir menu → modifier plat → sauvegarder → preview mis à jour
- [ ] **Page publique** : accès via URL slug → affichage correct du menu → responsive mobile
- [ ] **Billing** : upgrade Pro → Stripe checkout → retour → fonctionnalités débloquées
- [ ] **Auth flows** : login, logout, reset password
- [ ] Tests sur viewport mobile (375px) ET desktop (1280px)

---

## Story 15.5 — Tests de non-régression visuels
**Points** : 3
**Agent** : Tester

### Description
Screenshots de référence pour les pages clés.

### Critères d'acceptation
- [ ] Screenshots Playwright des 3 templates (Classic, Minimal, Bistrot)
- [ ] Screenshot landing page
- [ ] Screenshot dashboard
- [ ] Comparaison automatique lors des prochains runs
- [ ] Seuil de différence < 1% pour passer
