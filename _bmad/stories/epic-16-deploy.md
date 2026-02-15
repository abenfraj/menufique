# Epic 16 — Déploiement

**Priorité** : High
**Agent principal** : DevOps
**Dépendances** : Build qui passe (Epic 14 minimum)

## Contexte
Déployer Menufique en production sur Vercel avec toute l'infrastructure nécessaire.

---

## Story 16.1 — Configuration Vercel
**Points** : 3
**Agent** : DevOps

### Description
Setup du projet Vercel avec toutes les variables d'environnement.

### Critères d'acceptation
- [ ] Projet Vercel créé et lié au repo GitHub
- [ ] Toutes les env vars configurées (DB, Auth, Stripe, Resend, Sentry, IA)
- [ ] Build settings corrects (framework preset Next.js)
- [ ] Preview deploys activés sur les PRs
- [ ] Deploy réussi sur l'URL Vercel par défaut

---

## Story 16.2 — Domaine custom + SSL
**Points** : 2
**Agent** : DevOps

### Description
Configurer le domaine menufique.fr (ou équivalent) avec SSL.

### Critères d'acceptation
- [ ] Domaine acheté et DNS configuré
- [ ] SSL automatique via Vercel
- [ ] Redirection www → non-www (ou inverse)
- [ ] `NEXT_PUBLIC_APP_URL` et `NEXTAUTH_URL` mis à jour en prod

---

## Story 16.3 — Pipeline CI/CD GitHub Actions
**Points** : 5
**Agent** : DevOps

### Description
Pipeline d'intégration continue complète.

### Critères d'acceptation
- [ ] Workflow `.github/workflows/ci.yml` créé
- [ ] Jobs : lint → typecheck → test → build
- [ ] Tests E2E sur Vercel preview URL
- [ ] Notifications Slack/Discord en cas d'échec (optionnel)
- [ ] Protection branche `main` : PR required + CI verte

---

## Story 16.4 — Monitoring et alerting
**Points** : 3
**Agent** : DevOps

### Description
Mettre en place le monitoring de production.

### Critères d'acceptation
- [ ] Sentry configuré (client + serveur + source maps)
- [ ] Alertes email sur erreurs critiques
- [ ] Vercel Analytics activé (Core Web Vitals)
- [ ] Health check endpoint (`/api/health`) pour monitoring externe
- [ ] Vérification que Puppeteer fonctionne sur Vercel (ou alternative)

---

## Story 16.5 — Sécurité production
**Points** : 3
**Agent** : DevOps + Architect

### Description
Hardening sécurité pour la mise en production.

### Critères d'acceptation
- [ ] Headers de sécurité dans `next.config.js` (CSP, HSTS, X-Frame-Options, etc.)
- [ ] Rate limiting sur les API routes sensibles (auth, generate, upload)
- [ ] Webhook Stripe avec vérification de signature en prod
- [ ] Audit des dépendances (`npm audit`)
- [ ] Vérification : aucun secret dans le code source
- [ ] CORS configuré correctement

---

## Story 16.6 — SEO technique production
**Points** : 2
**Agent** : DevOps + Dev

### Description
Finaliser le SEO technique pour le lancement.

### Critères d'acceptation
- [ ] `robots.txt` en place (autoriser crawl pages publiques, bloquer dashboard)
- [ ] `sitemap.xml` dynamique fonctionnel
- [ ] Structured data (JSON-LD) pour la landing page
- [ ] Canonical URLs configurées
- [ ] Score Lighthouse SEO > 95
