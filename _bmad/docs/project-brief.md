# Menufique — Project Brief

## Vision
Application SaaS permettant aux restaurateurs de créer un menu professionnel en moins de 5 minutes. Saisie des plats → choix template → PDF haute qualité + page web mobile via QR code.

## Marché
- **Cible** : Restaurateurs indépendants, France / francophone
- **Modèle** : Freemium + Pro à 9€/mois (81€/an)
- **Langue** : Interface 100% français

## État actuel (2026-02-18)

### Complété (Steps 1-12b)
| Step | Feature | Status |
|------|---------|--------|
| 1 | Setup projet (Next.js + TS + Tailwind + Prisma) | Done |
| 2 | Base de données (schéma Prisma + Supabase) | Done |
| 3 | Auth (NextAuth email/password + Google OAuth) | Done |
| 4 | CRUD Restaurant (infos + upload logo) | Done |
| 5 | CRUD Menu (catégories, plats, allergènes) | Done |
| 6 | Templates (Classic, Minimal, Bistrot) | Done |
| 7 | Preview temps réel | Done |
| 8 | Génération PDF (Puppeteer) | Done |
| 9 | QR Code + page publique | Done |
| 10 | Dashboard | Done |
| 11 | Stripe (checkout, portal, webhooks) | Done |
| 12 | Landing page | Done |
| 12b | Images IA + Couverture | Done |

### Restant (Steps 13-16)
| Step | Feature | Priority | Epic |
|------|---------|----------|------|
| 13 | Emails transactionnels (Resend) | High | `epic-13-emails` |
| 14 | Polish (animations, toasts, erreurs, SEO) | High | `epic-14-polish` |
| 15 | Tests (unit + intégration + e2e) | Medium | `epic-15-tests` |
| 16 | Déploiement (Vercel + domaine + env) | High | `epic-16-deploy` |

## Métriques de succès
- **Build** : 0 erreurs TypeScript, 0 warnings ESLint
- **Tests** : > 70% coverage sur `src/lib/`, E2E sur parcours critiques
- **Performance** : Lighthouse > 90 sur toutes les métriques
- **Temps de création menu** : < 5 minutes (mesure E2E)
