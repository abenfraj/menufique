# Epic 18 — Templates de référence pour la génération IA

**Priorité** : High
**Agent principal** : Dev
**Dépendances** : Epic 12b (AI Design) — ✅ complété

## Problème actuel

Claude génère le HTML **from scratch** à partir d'un prompt texte. Conséquences :
- Structure HTML réinventée à chaque génération → incohérences
- Débordements A4 fréquents (min-height vs height, mauvaise gestion)
- Qualité très variable selon le "mood" de l'IA
- L'IA passe du temps à inventer la structure plutôt qu'à soigner le style

## Solution

Fournir à Claude des **templates HTML de référence complets** pour chaque style.
Claude adapte le template (couleurs, polices, ornements, contenu) au lieu de tout inventer.

### Approche technique

1. Créer `src/lib/ai-prompt-templates/` avec des fichiers HTML de référence
2. Chaque template = un menu fictif **complet et A4-correct** pour un style donné
3. Injecter le template pertinent dans le prompt : "Utilise cette structure comme base"
4. Claude se concentre sur l'adaptation (couleurs, polices, décorations) pas sur l'invention

---

## Story 18.1 — Créer les templates HTML de référence

**Points** : 8
**Agent** : Dev

### Templates à créer (6 styles)

| Fichier | Style | Caractéristiques |
|---------|-------|-----------------|
| `elegant.html` | Élégant/Gastronomique | Fond crème, serif, ornements, 2 colonnes |
| `modern.html` | Moderne/Minimaliste | Fond blanc, sans-serif, grille propre |
| `rustic.html` | Rustique/Bistrot | Fond brun foncé, textures CSS, tons chauds |
| `minimal.html` | Minimal/Épuré | Maximum d'espace blanc, typographie seule |
| `colorful.html` | Coloré/Festif | Accents forts, badges de couleur, emojis décoratifs |
| `luxe.html` | Luxe/Prestige | Fond noir/or, ornements CSS, multi-colonnes |

### Contenu de chaque template

Chaque template doit :
- Être un **menu fictif complet** (restaurant "Le Jardin", 3 catégories, ~10 plats)
- Respecter le format A4 **exact** : `.menu-page { width: 210mm; height: 297mm; overflow: hidden; }`
- Être **auto-suffisant** (Google Fonts via `<link>`, styles inline + `<style>`)
- Démontrer la **typographie, couleurs, ornements** caractéristiques du style
- Inclure : nom restaurant, adresse, catégories, plats avec prix et descriptions, légende allergènes

### Contraintes techniques (CRITIQUES)
- `body { margin: 0; padding: 0; }` — pas de padding sur le body
- `.menu-page { width: 210mm; height: 297mm; padding: 12mm; box-sizing: border-box; overflow: hidden; }`
- **PAS** de `min-height`, uniquement `height: 297mm` pour forcer la taille exacte
- Contenu qui tient en 1 page (fontes adaptées, 2 colonnes si besoin)
- `-webkit-print-color-adjust: exact; print-color-adjust: exact;` sur body

---

## Story 18.2 — Intégrer les templates dans le prompt Claude

**Points** : 3
**Agent** : Dev

### Description

Modifier `buildDesignPrompt()` dans `src/lib/ai.ts` pour :
1. Sélectionner le template de référence selon le style demandé
2. L'injecter dans le prompt avec des instructions claires
3. Claude adapte la structure plutôt qu'inventer

### Sélection du template

```
style "auto"     → template elegant (le plus polyvalent)
style "elegant"  → template elegant
style "modern"   → template modern
style "rustic"   → template rustic
style "minimal"  → template minimal
style "colorful" → template colorful
style "luxe"     → template luxe
complexity "luxe" → override avec template luxe
```

### Instructions à ajouter dans le prompt

```
## TEMPLATE DE RÉFÉRENCE (BASE OBLIGATOIRE)
Voici un template HTML qui définit la STRUCTURE et le STYLE de référence.
Tu DOIS utiliser cette structure comme point de départ et l'adapter :
- Remplace le contenu fictif par le vrai contenu du menu (restaurant + plats)
- Adapte les couleurs, polices, ornements selon les directives de style
- Conserve la structure A4 exacte (.menu-page width:210mm, height:297mm)
- Améliore le design si possible, mais ne casse pas la structure

[TEMPLATE HTML ICI]
```

### Critères d'acceptation

- [ ] Templates créés pour les 6 styles
- [ ] Chaque template validé : s'affiche correctement en A4 dans le navigateur
- [ ] `buildDesignPrompt()` injecte le bon template selon le style
- [ ] Taux d'erreur de génération réduit (moins de débordements A4)
- [ ] La qualité visuelle des résultats est plus consistante

---

## Notes pour le Dev

- Les templates sont des strings TypeScript (template literals) dans des fichiers `.ts`
  → Pas de fichiers `.html` séparés pour éviter les problèmes d'import dans Next.js
- Exemple : `src/lib/ai-prompt-templates/elegant.ts` exporte `export const elegantTemplate: string = \`...\``
- L'index `src/lib/ai-prompt-templates/index.ts` exporte une fonction `getTemplateByStyle(style)`
- Taille cible par template : ~100-150 lignes HTML (assez détaillé pour guider l'IA, pas trop long pour ne pas saturer le contexte)
- Les templates doivent être **beaux** — l'IA s'en inspire visuellement
