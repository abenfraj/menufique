# Workflow Sprint — Menufique

## Vue d'ensemble
Chaque sprint traite un ensemble de stories d'un ou plusieurs epics. Le SM orchestre, les agents spécialisés exécutent.

## Cycle d'une story

```
┌─────────────────────────────────────────────────────┐
│  1. SM sélectionne la prochaine story               │
│     → Vérifie les dépendances                       │
│     → Assigne à l'agent approprié                   │
├─────────────────────────────────────────────────────┤
│  2. Dev/Tester/DevOps implémente                    │
│     → Lit la story + critères d'acceptation         │
│     → Code / configure / teste                      │
│     → Auto-review (checklist code-review)           │
├─────────────────────────────────────────────────────┤
│  3. Architect review (si changement structurel)     │
│     → Vérifie la cohérence architecture             │
│     → Valide les patterns utilisés                  │
├─────────────────────────────────────────────────────┤
│  4. PO valide (si feature visible)                  │
│     → Vérifie les critères d'acceptation            │
│     → Teste sur mobile                              │
│     → Valide les textes français                    │
├─────────────────────────────────────────────────────┤
│  5. SM clôture                                      │
│     → Checklist DoD passée                          │
│     → Journal mis à jour                            │
│     → Story marquée "Done"                          │
└─────────────────────────────────────────────────────┘
```

## Invocation des agents

Pour activer un agent spécifique, utiliser le format :

```
@SM — lance le sprint / identifie la prochaine story
@PO — valide une feature / vérifie l'UX
@Architect — review architecture / décision technique
@Dev — implémente une story / fix un bug
@Tester — écrit et exécute des tests
@DevOps — configure infra / CI/CD / deploy
```

## Ordre de traitement recommandé

### Sprint 1 : Fondations
1. Epic 14 — Stories 14.1 (Toasts) + 14.3 (Erreurs)
2. Epic 13 — Stories 13.1 (Setup Resend) + 13.2 (Welcome) + 13.3 (Reset)

### Sprint 2 : Finitions
3. Epic 14 — Stories 14.2 (Animations) + 14.4 (SEO) + 14.5 (Responsive)
4. Epic 13 — Stories 13.4 (Confirmation Pro) + 13.5 (Partage)

### Sprint 3 : Qualité
5. Epic 15 — Stories 15.1 (Setup) + 15.2 (Unit) + 15.3 (Integration)

### Sprint 4 : Production
6. Epic 15 — Stories 15.4 (E2E) + 15.5 (Visual)
7. Epic 16 — Toutes les stories (Deploy)

## Règles du sprint
- **Max 3 stories en parallèle** pour garder le focus
- **Blocage = escalade** : si un agent est bloqué, il remonte au SM immédiatement
- **Validation humaine** : le PO ou l'utilisateur valide chaque feature visible
- **Pas de scope creep** : si une idée émerge, elle va dans le backlog, pas dans le sprint en cours
