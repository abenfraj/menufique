# MENUFIQUE — Contexte Projet pour Claude Code

## Vue d'ensemble

Menufique est une application web SaaS permettant aux restaurateurs de créer un menu professionnel en moins de 5 minutes, sans compétence technique. L'utilisateur saisit ses plats, choisit un template, et obtient un menu PDF haute qualité (prêt à imprimer) + une page web mobile accessible via QR code.

- **Type** : Application web SaaS, responsive, mobile-first
- **Marché** : France, marché francophone
- **Modèle économique** : Freemium + abonnement Pro (9€/mois ou 81€/an)
- **Langue de l'interface** : Français
- **Identité visuelle** : Palette orange chaleureuse (#FF6B35 primaire)

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 14+ (App Router) |
| Langage | TypeScript (strict mode) |
| UI | Tailwind CSS + Lucide Icons |
| Base de données | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | NextAuth.js (email/password + Google OAuth) |
| Paiement | Stripe (Checkout + Customer Portal + Webhooks) |
| Génération PDF | Puppeteer (headless Chrome) |
| QR Code | Package `qrcode` (SVG/PNG) |
| Stockage fichiers | Supabase Storage (ou AWS S3) |
| Emails | Resend |
| Monitoring | Sentry |
| Déploiement | Vercel |
| Tests | Vitest (unit/integ) + Playwright (e2e) |

## Structure du projet

```
menufique/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Routes auth (login, register, reset-password)
│   │   ├── (dashboard)/        # Routes protégées (menus, settings, billing)
│   │   ├── (public)/           # Routes publiques (landing, pricing)
│   │   ├── m/[slug]/           # Page menu public (accessible via QR code)
│   │   └── api/                # API Routes
│   │       ├── auth/           # Auth endpoints + NextAuth
│   │       ├── menus/          # CRUD menus
│   │       ├── generate/       # Génération PDF + QR
│   │       ├── upload/         # Upload logos
│   │       └── webhooks/       # Stripe webhooks
│   ├── components/
│   │   ├── ui/                 # Composants UI de base (Button, Input, Card, Modal, Toast)
│   │   ├── layout/             # Header, Footer, Sidebar, DashboardLayout
│   │   ├── editor/             # Éditeur de menu (formulaires, preview)
│   │   ├── templates/          # Composants de rendu des templates
│   │   └── landing/            # Composants landing page
│   ├── lib/
│   │   ├── db.ts               # Client Prisma
│   │   ├── auth.ts             # Config NextAuth
│   │   ├── stripe.ts           # Client Stripe + helpers
│   │   ├── pdf.ts              # Génération PDF (Puppeteer)
│   │   ├── qr.ts               # Génération QR code
│   │   ├── storage.ts          # Upload/download S3/Supabase
│   │   ├── email.ts            # Client Resend + templates
│   │   ├── validators.ts       # Schémas Zod
│   │   └── utils.ts            # Helpers divers
│   ├── templates/              # Templates HTML/CSS pour rendu PDF
│   │   ├── classic/
│   │   ├── modern/
│   │   ├── elegant/
│   │   ├── bistrot/
│   │   └── minimal/
│   └── types/                  # Types TypeScript partagés
│       ├── menu.ts
│       ├── restaurant.ts
│       └── user.ts
├── prisma/
│   └── schema.prisma           # Schéma BDD
├── public/
│   ├── allergens/              # Icônes allergènes SVG
│   └── images/                 # Assets statiques
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── _bmad/                      # BMAD - Agents & process agile
│   ├── agents/                 # Personas d'agents (SM, PO, Architect, Dev, Tester, DevOps)
│   ├── docs/                   # Project brief, journal de bord
│   ├── stories/                # Epics & stories (backlog)
│   ├── checklists/             # DoD, code review, deploy
│   └── workflows/              # Sprint workflow
├── .env.example
├── CLAUDE.md                   # CE FICHIER
└── docs/                       # Documentation détaillée
    ├── PRD.md
    ├── database-schema.md
    ├── api-routes.md
    ├── templates-guide.md
    └── stripe-integration.md
```

## Méthode BMAD

Ce projet utilise la méthode **BMAD** (Breakthrough Method for Agile AI-Driven Development) avec 6 agents spécialisés :

| Agent | Fichier | Rôle |
|-------|---------|------|
| **SM** (Scrum Master) | `_bmad/agents/sm.agent.md` | Orchestrateur, priorisation, suivi |
| **PO** (Product Owner) | `_bmad/agents/po.agent.md` | Vision produit, validation UX |
| **Architect** | `_bmad/agents/architect.agent.md` | Architecture, review technique |
| **Dev** | `_bmad/agents/dev.agent.md` | Implémentation, bug fixes |
| **Tester** | `_bmad/agents/tester.agent.md` | Tests auto, QA |
| **DevOps** | `_bmad/agents/devops.agent.md` | CI/CD, déploiement, monitoring |

### Invocation
Pour activer un agent : `@SM`, `@PO`, `@Architect`, `@Dev`, `@Tester`, `@DevOps`

### Workflow
1. Le **SM** identifie la prochaine story dans `_bmad/stories/`
2. L'agent approprié implémente selon les critères d'acceptation
3. L'**Architect** review si changement structurel
4. Le **PO** valide si feature visible
5. Le **SM** clôture avec la checklist DoD

## Conventions de code

- **Langue du code** : anglais (noms de variables, fonctions, composants)
- **Langue de l'UI** : français (textes affichés, labels, messages d'erreur)
- **Composants React** : fonctionnels avec hooks, nommage PascalCase
- **Fichiers** : kebab-case (ex: `menu-editor.tsx`)
- **API Routes** : RESTful, réponses JSON, validation Zod systématique
- **Gestion d'erreurs** : try/catch avec messages utilisateur en français
- **Commits** : format conventionnel (`feat:`, `fix:`, `refactor:`, `docs:`)
- **Pas de `any`** en TypeScript — typer tout explicitement
- **Imports** : utiliser des path aliases (`@/components/...`, `@/lib/...`)

## Commandes utiles

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run lint         # Linting ESLint
npm run test         # Tests Vitest
npm run test:e2e     # Tests Playwright
npm run db:push      # Push schéma Prisma vers la BDD
npm run db:migrate   # Créer une migration
npm run db:studio    # Ouvrir Prisma Studio
```

## Variables d'environnement requises

Voir `.env.example` pour la liste complète. Les principales :
- `DATABASE_URL` — URL PostgreSQL Supabase
- `NEXTAUTH_SECRET` — Secret NextAuth
- `NEXTAUTH_URL` — URL de l'app
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth Google
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — Clés Stripe
- `STRIPE_WEBHOOK_SECRET` — Secret webhook Stripe
- `RESEND_API_KEY` — Clé API Resend
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — Supabase
- `SENTRY_DSN` — DSN Sentry
- `NEXT_PUBLIC_APP_URL` — URL publique de l'app

## Principes UX/UI

- **Mobile-first** : toujours designer pour mobile d'abord
- **Clarté radicale** : un seul objectif par écran
- **Zéro friction** : minimum de clics entre arrivée et menu généré
- **Feedback immédiat** : retour visuel sur chaque action
- **Palette orange** : primaire #FF6B35, fond #FFF8F2, texte principal #1A1A2E
- **Composants** : coins arrondis, ombres douces, animations subtiles
- **Icônes** : Lucide Icons (outline, stroke 1.5px)
- **Accessibilité** : WCAG AA minimum

## Plans tarifaires

| | Gratuit | Pro (9€/mois) |
|---|---------|---------------|
| Menus | 1 | Illimités |
| Templates | 2 basiques | Tous (5-8) |
| PDF | Avec watermark | Sans watermark |
| QR Code | ✅ | ✅ |
| Logo personnalisé | ❌ | ✅ |
| Couleurs/polices | ❌ | ✅ |
| Support | — | Prioritaire |

## Ordre de développement recommandé

1. ~~**Setup projet** : Init Next.js + TypeScript + Tailwind + Prisma + config ESLint~~ ✅
2. ~~**Base de données** : Schéma Prisma + migration initiale (voir `docs/database-schema.md`)~~ ✅
3. ~~**Auth** : NextAuth avec email/password + Google OAuth~~ ✅
4. ~~**CRUD Restaurant** : Formulaire infos restaurant + upload logo~~ ✅
5. ~~**CRUD Menu** : Éditeur de menu (catégories, plats, allergènes)~~ ✅
6. ~~**Templates** : Créer 2-3 templates HTML/CSS de menu~~ ✅ (Classic, Minimal, Bistrot)
7. ~~**Preview temps réel** : Affichage live du menu pendant l'édition~~ ✅
8. ~~**Génération PDF** : Pipeline Puppeteer pour rendu PDF A4~~ ✅
9. ~~**QR Code** : Génération + page publique du menu~~ ✅
10. ~~**Dashboard** : Liste des menus, actions rapides~~ ✅
11. ~~**Stripe** : Intégration paiement, plans, webhooks~~ ✅
12. ~~**Landing page** : Page d'accueil marketing~~ ✅
12b. ~~**Images IA + Couverture** : Photos DALL-E par plat/catégorie, upload photo, page de couverture, téléchargement PDF~~ ✅
13. **Emails** : Transactionnels (bienvenue, reset password)
14. **Polish** : Animations, toasts, gestion d'erreurs, SEO
15. **Tests** : Unit + intégration + e2e
16. **Déploiement** : Config Vercel + domaine + variables d'env

## Fichiers de documentation

Consulte les fichiers dans `docs/` pour des spécifications détaillées :
- `docs/PRD.md` — Cahier des charges complet (personas, fonctionnalités, UX flows)
- `docs/database-schema.md` — Schéma Prisma complet avec relations
- `docs/api-routes.md` — Tous les endpoints API avec request/response
- `docs/templates-guide.md` — Guide de création des templates de menu
- `docs/stripe-integration.md` — Flux Stripe détaillé (checkout, webhooks, portail)
