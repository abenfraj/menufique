# Journal de bord — Menufique

## 2026-02-18 — Epics 13-16 implémentés

### Décisions
- **Resend** : init paresseuse via `getResend()` pour éviter crash au boot sans API key
- **Reset password** : modèle `PasswordResetToken` ajouté au schéma Prisma (token 1h)
- **Email bienvenue** : envoyé via `events.createUser` NextAuth (couvre credentials + Google OAuth)
- **Toast system** : refactorisé avec `warning` type + 5s + animations CSS + accessibility (role=alert)
- **Security headers** : X-Frame-Options, X-Content-Type-Options, HSTS prod, Permissions-Policy
- **CI/CD** : GitHub Actions `.github/workflows/ci.yml` (lint → typecheck → test → build)
- **Tests** : 94/94 passent, setup.ts mock global Prisma/Resend/Stripe/NextAuth

### État
- ✅ Epic 13 — Emails : lib/email.ts, bienvenue, reset password, confirmation Pro, partage menu
- ✅ Epic 14 — Polish : toast amélioré, not-found.tsx, error.tsx, robots.ts, sitemap.ts, animations, skeleton loading
- ✅ Epic 15 — Tests : vitest.config.ts, setup.ts, tests email/qr/utils/validators/ai (94 tests)
- ✅ Epic 16 — Deploy : next.config.ts (security headers), CI/CD GitHub Actions, /api/health endpoint
- Google OAuth configuré dans .env.local
- Prochaine action : renseigner RESEND_API_KEY dans .env.local + déployer sur Vercel

## 2026-02-18 — Mise en place BMAD

### Décisions
- **Structure BMAD** : 6 agents (SM, PO, Architect, Dev, Tester, DevOps)
- **Nouveau projet Supabase** : Migration vers `ogjgzxlthwijxjiuovhk` (eu-west-1)
- **Schéma Prisma** : Pushé avec succès sur la nouvelle DB

### État
- 4 epics restants : Emails, Polish, Tests, Deploy
- DB vierge (nouveau projet Supabase), schéma en place
- Prochaine priorité : Epic 13 (Emails) ou Epic 14 (Polish)

---
<!-- Ajouter les nouvelles entrées au-dessus de cette ligne -->
