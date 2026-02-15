# Checklist Déploiement Production

## Pré-déploiement
- [ ] `npm run build` passe sans erreur
- [ ] `npm run lint` passe sans erreur
- [ ] `npm run test` — tous les tests passent
- [ ] Audit de sécurité : `npm audit` sans vulnérabilité critique
- [ ] Pas de secrets dans le code source (`grep -r "sk-" src/`)
- [ ] `.env.example` à jour avec toutes les variables nécessaires

## Variables d'environnement (Vercel)
- [ ] `DATABASE_URL` — PostgreSQL Supabase (pooler)
- [ ] `DIRECT_URL` — PostgreSQL Supabase (direct, pour migrations)
- [ ] `NEXTAUTH_SECRET` — Secret fort (généré avec `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` — URL de production (https://menufique.fr)
- [ ] `NEXT_PUBLIC_APP_URL` — URL publique
- [ ] `STRIPE_SECRET_KEY` — Clé live Stripe
- [ ] `STRIPE_PUBLISHABLE_KEY` — Clé publique live Stripe
- [ ] `STRIPE_WEBHOOK_SECRET` — Secret du webhook de prod
- [ ] `RESEND_API_KEY` — Clé API Resend
- [ ] `OPENAI_API_KEY` — Clé OpenAI
- [ ] `ANTHROPIC_API_KEY` — Clé Anthropic
- [ ] `SENTRY_DSN` — DSN Sentry
- [ ] `SUPABASE_URL` — URL du projet Supabase
- [ ] `SUPABASE_ANON_KEY` — Clé anon Supabase

## Base de données
- [ ] Migrations Prisma appliquées sur la DB de prod
- [ ] Indexes vérifiés sur les colonnes fréquemment requêtées
- [ ] Backup automatique activé (Supabase Pro ou script)

## Post-déploiement
- [ ] Site accessible sur le domaine de prod
- [ ] Auth fonctionne (inscription + login)
- [ ] Stripe webhooks reçus (vérifier dans Stripe Dashboard)
- [ ] Emails envoyés correctement (test d'inscription)
- [ ] PDF généré sans erreur
- [ ] QR code mène à la bonne URL
- [ ] Sentry reçoit les events
- [ ] Lighthouse > 90 sur toutes les métriques
