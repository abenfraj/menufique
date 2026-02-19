# Epic 20 — Éditeur de design IA interactif

**Priorité** : High
**Agent principal** : Dev
**Dépendances** : Epic 18 (templates IA) — requis pour stabilité du HTML généré

---

## Contexte & problème

Aujourd'hui, quand un utilisateur génère un menu IA et veut changer quelque chose
(couleur, prix, titre, mise en page), il n'a qu'un seul choix : **tout régénérer**.

C'est lent (15-30s), coûteux en crédits IA, et frustrant quand le menu était "presque parfait".

Le but de cet epic est de transformer l'éditeur en un outil d'**édition itérative** :
modifier sans régénérer, corriger en 2 secondes, explorer des variantes, revenir en arrière.

---

## Analyse UX : ce que veulent vraiment les restaurateurs

D'après les cas d'usage les plus fréquents observés sur des outils similaires :

| Besoin réel | Fréquence | Ce qu'il faut |
|-------------|-----------|---------------|
| "Cette couleur ne ressemble pas à mon restaurant" | ⭐⭐⭐⭐⭐ | Palette swap 1-clic |
| "Le prix du plat est faux" / "Il y a une faute" | ⭐⭐⭐⭐⭐ | Édition inline texte |
| "Je veux undo, j'ai tout cassé" | ⭐⭐⭐⭐⭐ | Undo/Redo |
| "Peux-tu rendre les titres plus grands" | ⭐⭐⭐⭐ | Prompt IA itératif |
| "La police est trop classique pour mon resto" | ⭐⭐⭐ | Font swap |
| "Je veux voir une autre version avant de choisir" | ⭐⭐⭐ | Design variant |
| "Je veux retrouver la version d'hier" | ⭐⭐ | Snapshot history |
| "Je veux déplacer la section Desserts en premier" | ⭐⭐ | Reorder sections |

---

## Backlog priorisé

### P1 — Livrer en priorité absolue (sprint 1)

- **Story 20.1** — Prompt IA itératif (modifier sans régénérer)
- **Story 20.2** — Édition inline des textes dans la preview
- **Story 20.3** — Undo / Redo client-side
- **Story 20.4** — Quick palette swap (couleur accent en 1 clic)

### P2 — Sprint 2

- **Story 20.5** — Quick font swap (polices présets)
- **Story 20.6** — Snapshot history (versions sauvegardées)

### P3 — Backlog (si appétit post-sprint 2)

- **Story 20.7** — Design variant (1 alternative à la demande)
- **Story 20.8** — Réordonnancement des sections par drag-and-drop

---

## Story 20.1 — Prompt IA itératif

**Points** : 5
**Priorité** : P1
**Agent** : Dev

### Description

Permettre à l'utilisateur de décrire une modification en langage naturel et que
l'IA l'applique sur le HTML existant — **sans tout régénérer**.

> "Rends les titres de catégories plus grands"
> "Change la couleur principale en vert forêt"
> "Ajoute une ligne décorative entre les sections"
> "Mets le nom du restaurant en italique"

### API

`POST /api/ai/iterate-design`

```ts
// Request
{ menuId: string; prompt: string }

// Response
{ data: { html: string } }
```

**System prompt Claude :**
```
Tu es un éditeur de menus HTML. On te fournit le HTML complet d'un menu
et une instruction de modification. Tu dois :
1. Appliquer UNIQUEMENT la modification demandée
2. Ne changer RIEN d'autre (contenu, structure, polices, couleurs non mentionnées)
3. Retourner le HTML complet et valide
4. Conserver toutes les balises <style>, <link>, et la structure .menu-page
Ne génère pas de nouveau design. Modifie uniquement ce qui est demandé.
```

### UI

Dans le drawer IA (côté droit), après un menu IA généré :
- Nouvel onglet **"Modifier"** (3ème onglet, après "Nouveau design" et "Importer")
- Champ textarea : *"Décrivez la modification souhaitée..."*
- Exemples cliquables sous le champ (4 suggestions rapides)
- Bouton "Appliquer" — montre une mini progress animation (2-4s)
- La preview se rafraîchit avec le nouveau HTML
- Chaque application pousse dans l'historique undo (Story 20.3)

### Critères d'acceptation

- [ ] Route API `/api/ai/iterate-design` créée et fonctionnelle
- [ ] Claude reçoit le HTML actuel complet + le prompt utilisateur
- [ ] Le HTML retourné est sauvegardé en base (`menu.aiDesignHtml`)
- [ ] La preview iframe se rafraîchit après modification
- [ ] Les exemples rapides sont cliquables et pré-remplissent le champ
- [ ] Erreur affichée si la modif échoue (toast ou message inline)
- [ ] L'onglet "Modifier" n'est visible que si `templateId === "ai-custom"`

### Notes techniques

- Token budget : limiter à ~2000 tokens output (le HTML modifié ne devrait pas grossir)
- Ajouter `model: "claude-haiku-4-5-20251001"` pour les itérations (moins cher, assez capable pour ce type de modif)
- Si le HTML résultant ne contient pas `.menu-page`, rejeter et retourner une erreur

---

## Story 20.2 — Édition inline des textes

**Points** : 5
**Priorité** : P1
**Agent** : Dev

### Description

Double-clic sur un texte dans la preview (nom de plat, prix, catégorie, nom du
restaurant) → champ d'édition inline → Entrée ou clic dehors → sauvegarde.

Aucune IA nécessaire : simple DOM manipulation + save du HTML modifié.

### Approche technique

L'iframe est **same-origin** (servi par `/api/menus/[id]/preview`), donc on peut
accéder à `iframeRef.current.contentDocument` directement.

**Injection au chargement de l'iframe :**

```ts
// Dans menu-editor.tsx, après l'événement onLoad de l'iframe
function injectInlineEditor(iframe: HTMLIFrameElement) {
  const doc = iframe.contentDocument;
  if (!doc) return;

  // Sélectionner tous les nœuds texte éditables
  const editableSelectors = [
    'h1', 'h2', 'h3', 'h4',     // Titres restaurant / catégories
    '.dish-name', '.dish-price', '.dish-description',  // Plats
    'p', 'span',                  // Textes génériques
  ];

  doc.querySelectorAll(editableSelectors.join(',')).forEach(el => {
    el.setAttribute('data-mf-editable', '1');
    el.style.cursor = 'text';

    el.addEventListener('dblclick', () => startEdit(el, iframe));
  });
}
```

**Édition inline :**
```ts
function startEdit(el: Element, iframe: HTMLIFrameElement) {
  const original = el.textContent ?? '';
  el.setAttribute('contenteditable', 'true');
  el.style.outline = '2px solid #FF6B35';
  el.style.outlineOffset = '2px';
  el.style.borderRadius = '3px';
  (el as HTMLElement).focus();

  el.addEventListener('blur', () => commitEdit(el, iframe, original), { once: true });
  el.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter' && !(e as KeyboardEvent).shiftKey) {
      (el as HTMLElement).blur();
    }
    if ((e as KeyboardEvent).key === 'Escape') {
      el.textContent = original;
      (el as HTMLElement).blur();
    }
  }, { once: true });
}

async function commitEdit(el: Element, iframe: HTMLIFrameElement, original: string) {
  el.removeAttribute('contenteditable');
  el.style.outline = '';
  el.style.outlineOffset = '';

  if (el.textContent === original) return; // pas de changement

  const newHtml = iframe.contentDocument!.documentElement.outerHTML;
  await saveAiDesignHtml(newHtml); // PUT /api/menus/[id] avec aiDesignHtml
  pushToUndoHistory(newHtml);     // Story 20.3
}
```

### UI

- Bouton toggle "✏️ Édition" dans la toolbar de la preview (à côté de "Rafraîchir")
- Quand actif : tous les textes montrent un curseur `text` au survol + léger highlight au hover
- Tooltip "Double-clic pour modifier" au premier hover
- Indicateur visuel "Modifications non sauvegardées" si l'utilisateur a édité sans encore blur

### Critères d'acceptation

- [ ] Double-clic sur un texte ouvre l'édition inline dans l'iframe
- [ ] Entrée/blur sauvegarde, Escape annule
- [ ] Sauvegarde appelle `PUT /api/menus/[id]` avec le nouveau HTML
- [ ] Undo stack est mis à jour après chaque sauvegarde
- [ ] Le mode édition est désactivé par défaut (toggle explicite)
- [ ] Fonctionne sur mobile (tap long ou tap double selon device)
- [ ] L'édition ne casse pas les styles CSS inline existants

---

## Story 20.3 — Undo / Redo

**Points** : 3
**Priorité** : P1
**Agent** : Dev

### Description

Permettre de revenir en arrière (et ré-avancer) après chaque modification du design.
Couverture : modifications AI (Stories 20.1, génération initiale), éditions inline (20.2),
palette swap (20.4), font swap (20.5).

### Approche technique

Stack client-side uniquement (pas de DB). Max 20 snapshots.

```ts
// Dans menu-editor.tsx
const undoStackRef = useRef<string[]>([]);
const undoIndexRef = useRef<number>(-1);

function pushToUndoHistory(html: string) {
  // Tronquer le futur si on était en undo
  undoStackRef.current = undoStackRef.current.slice(0, undoIndexRef.current + 1);
  undoStackRef.current.push(html);
  // Max 20 entrées
  if (undoStackRef.current.length > 20) {
    undoStackRef.current.shift();
  }
  undoIndexRef.current = undoStackRef.current.length - 1;
}

function undo() {
  if (undoIndexRef.current <= 0) return;
  undoIndexRef.current--;
  const html = undoStackRef.current[undoIndexRef.current];
  applyHtmlLocally(html); // met à jour menu.aiDesignHtml en local + refresh iframe
  saveAiDesignHtml(html); // persist en DB
}

function redo() {
  if (undoIndexRef.current >= undoStackRef.current.length - 1) return;
  undoIndexRef.current++;
  const html = undoStackRef.current[undoIndexRef.current];
  applyHtmlLocally(html);
  saveAiDesignHtml(html);
}
```

### UI

- Deux boutons `←` / `→` dans la toolbar de la preview (à côté de "Rafraîchir")
- Grisés quand undo/redo non disponible
- Raccourcis clavier : `Ctrl+Z` / `Cmd+Z` (undo), `Ctrl+Shift+Z` / `Cmd+Shift+Z` (redo)
- Tooltip au survol : "Annuler (Ctrl+Z)" / "Rétablir (Ctrl+Shift+Z)"
- Badge discret montrant la position dans la stack : "3/7" quand undo disponible

### Critères d'acceptation

- [ ] Undo/Redo fonctionnels après chaque type de modification
- [ ] Raccourcis clavier `Ctrl+Z` / `Cmd+Z` opérationnels
- [ ] Max 20 snapshots (FIFO, la plus ancienne est supprimée)
- [ ] Boutons grisés aux extrémités de la stack
- [ ] La sauvegarde DB se fait immédiatement à chaque undo/redo
- [ ] Le stack est vidé lors d'une nouvelle génération complète

---

## Story 20.4 — Quick palette swap

**Points** : 3
**Priorité** : P1
**Agent** : Dev

### Description

Changer la couleur accent du menu en 1 clic — **sans IA, sans régénération**.
Simple remplacement regex de la couleur primaire dans le HTML.

La couleur "primaire" est celle la plus visuellement dominante dans le design
(titres, prix, bordures, backgrounds d'accent).

### Approche technique

**Détection de la couleur primaire :**

```ts
function detectPrimaryColor(html: string): string | null {
  // Chercher la couleur la plus fréquente dans les styles (hex format)
  const hexMatches = html.match(/#[0-9A-Fa-f]{6}/g) ?? [];
  const freq = new Map<string, number>();
  for (const h of hexMatches) {
    const upper = h.toUpperCase();
    freq.set(upper, (freq.get(upper) ?? 0) + 1);
  }
  // Exclure les neutres (blanc, noir, gris)
  const neutrals = /^#(FFFFFF|000000|F[0-9A-F]{5}|[0-9A-F]{1,2}[0-9A-F]{1,2}[0-9A-F]{1,2})$/i;
  const candidates = [...freq.entries()]
    .filter(([hex]) => !neutrals.test(hex))
    .sort((a, b) => b[1] - a[1]);
  return candidates[0]?.[0] ?? null;
}

function swapColor(html: string, from: string, to: string): string {
  // Replace hex et variations rgb() correspondantes
  const regex = new RegExp(from.replace('#', '#?'), 'gi');
  return html.replace(regex, to);
}
```

**8 palettes présets** inspirées des cuisines courantes :

| Nom | Couleur | Usage typique |
|-----|---------|---------------|
| Orange signature | `#FF6B35` | Brasserie, fastfood |
| Rouge bordeaux | `#8B2635` | Gastronomique, viandes |
| Vert forêt | `#2D5A27` | Bio, végétarien |
| Bleu ardoise | `#2C4A6E` | Poissons, fruits de mer |
| Or champagne | `#C9A96E` | Luxe, traiteur |
| Noir élégant | `#1C1C1C` | Restaurant gastronomique |
| Rose poudré | `#C4748A` | Pâtisserie, salon de thé |
| Terracotta | `#B85C38` | Méditerranéen, tapas |

+ Un color picker `<input type="color">` pour une couleur libre.

### UI

Dans la preview toolbar, un nouveau bouton "🎨 Couleurs" ouvre un popover :
- 8 swatches cliquables (palette présets)
- 1 color picker libre
- Aperçu "Couleur actuelle détectée : ██"
- Application instantanée (optimistic update) + save DB

### Critères d'acceptation

- [ ] Couleur primaire détectée correctement sur les designs générés
- [ ] 8 palettes présets disponibles avec aperçu visuel
- [ ] Color picker libre fonctionnel
- [ ] Application instantanée (preview se rafraîchit < 200ms)
- [ ] Sauvegarde DB après chaque swap
- [ ] Undo/Redo intégré (chaque swap = 1 entrée dans le stack)
- [ ] Si la détection échoue, le color picker est affiché sans swatch "actuelle"

---

## Story 20.5 — Quick font swap

**Points** : 3
**Priorité** : P2
**Agent** : Dev

### Description

Changer la paire de polices du menu en 1 clic via des présets. Sans IA.

### 7 paires de polices présets

| Nom | Display (titres) | Body (texte) | Ambiance |
|-----|-----------------|--------------|----------|
| Classique raffiné | Playfair Display | Lato | Gastronomique |
| Moderne épuré | Montserrat | Open Sans | Contemporain |
| Rustique chaleureux | Libre Baskerville | Source Sans 3 | Bistrot |
| Élégance minimale | Cormorant Garamond | Inter | Luxe sobre |
| Festif audacieux | Abril Fatface | Nunito | Brasserie animée |
| Art déco | Poiret One | Josefin Sans | Années folles |
| Contemporain tech | DM Sans | DM Sans | Startup food |

### Approche technique

```ts
interface FontPair {
  name: string;
  display: string;
  body: string;
  googleFontsUrl: string;
}

function swapFonts(html: string, pair: FontPair): string {
  // 1. Remplacer le lien Google Fonts
  let result = html.replace(
    /https:\/\/fonts\.googleapis\.com\/css2\?[^"']*/,
    pair.googleFontsUrl
  );
  // 2. Remplacer les font-family dans les styles (heuristique)
  // La police d'affichage actuelle est détectée de la même façon que la couleur primaire
  return result;
}
```

### UI

Bouton "Aa Polices" dans la preview toolbar → popover avec :
- 7 cartes présets ("Aa — Nom de la paire" + aperçu "Le Jardin • Entrées • 12,50€")
- Clic = application instantanée + save

### Critères d'acceptation

- [ ] 7 paires de polices disponibles avec aperçu visuel
- [ ] Application instantanée, preview rafraîchie
- [ ] Google Fonts rechargées correctement dans l'iframe
- [ ] Sauvegarde DB après chaque swap
- [ ] Undo/Redo intégré

---

## Story 20.6 — Snapshot history (versions sauvegardées)

**Points** : 5
**Priorité** : P2
**Agent** : Dev

### Description

Sauvegarder des "snapshots" nommés du design pour pouvoir y revenir.
Différent de l'undo/redo (client-side, volatil) : les snapshots sont persistants en DB.

Use cases :
- "Je sauvegarde v1 avant d'expérimenter"
- "Je veux retrouver le design de la semaine dernière"
- "Je veux comparer deux versions côte à côte"

### Modèle de données

Ajouter une colonne `designSnapshots` (JSON) au modèle `Menu` :

```prisma
model Menu {
  // ... champs existants ...
  designSnapshots Json @default("[]")
  // Structure : [{ id, label, html, createdAt }]
}
```

Max 10 snapshots par menu (FIFO).

### API

```
POST /api/menus/[id]/snapshots     { label?: string }  → crée un snapshot
GET  /api/menus/[id]/snapshots                         → liste les snapshots
POST /api/menus/[id]/snapshots/[snapId]/restore        → restore un snapshot
DELETE /api/menus/[id]/snapshots/[snapId]              → supprime un snapshot
```

### Auto-snapshot

Snapshot automatique créé avant chaque **génération complète** (pas les itérations).
Label auto : `"Génération du {date}"`.

### UI

Bouton "🕐 Versions" dans la preview toolbar → panneau latéral (ou popover) :
- Liste des snapshots avec date et label
- Miniature thumbnails (screenshot base64 ou placeholder)
- Actions : "Restaurer" / "Supprimer" / "Renommer"
- Bouton "Sauvegarder cette version" avec champ de nom optionnel

### Critères d'acceptation

- [ ] Migration Prisma ajoutant `designSnapshots` au modèle Menu
- [ ] Auto-snapshot avant chaque génération complète
- [ ] Max 10 snapshots (le plus ancien supprimé si dépassé)
- [ ] Restauration applique le HTML + rafraîchit la preview
- [ ] Labels renommables inline
- [ ] La suppression demande confirmation

---

## Story 20.7 — Design variant à la demande

**Points** : 5
**Priorité** : P3
**Agent** : Dev

### Description

Générer **une variante alternative** du design actuel en 1 clic.
L'utilisateur peut ensuite basculer entre "Original" et "Variante" pour comparer,
puis choisir lequel garder.

### Approche

- Reprend les mêmes paramètres (style, couleurs, complexité) mais avec un `seed` différent
  dans le prompt pour obtenir une variation légère
- La variante est stockée temporairement en mémoire client (pas en DB tant que non confirmée)
- Deux onglets au-dessus de la preview : "Original" / "Variante ✦"
- Bouton "Garder cette variante" la sauvegarde en DB (et met l'original en snapshot)

### Critères d'acceptation

- [ ] Bouton "Générer une variante" disponible après une génération initiale
- [ ] Variante générée en ~15s (même pipeline que génération normale)
- [ ] Basculement Original/Variante instantané
- [ ] "Garder la variante" sauvegarde + crée snapshot de l'original
- [ ] Variante non confirmée perdue si l'utilisateur quitte la page (warning)

---

## Story 20.8 — Réordonnancement des sections

**Points** : 8
**Priorité** : P3
**Agent** : Dev

### Description

Permettre à l'utilisateur de glisser-déposer les sections (catégories) du menu
dans la preview pour en changer l'ordre.

### Approche technique

Cette story est la plus complexe : elle nécessite que le HTML généré par l'IA ait
une **structure consistante** (sections identifiables). Prérequis : Epic 18 stable.

```ts
// Détecter les sections dans l'iframe
function detectSections(doc: Document): Element[] {
  // Chercher les conteneurs de catégorie selon les patterns courants générés
  const selectors = [
    '[class*="category"]', '[class*="section"]',
    '[class*="menu-section"]', '[data-category]',
    '.category', '.section',
  ];
  for (const sel of selectors) {
    const found = [...doc.querySelectorAll(sel)];
    if (found.length >= 2) return found;
  }
  return [];
}
```

Overlay DnD (@dnd-kit/sortable) injecté au-dessus de l'iframe via position:absolute,
avec des handles visibles sur chaque section détectée.

### Critères d'acceptation

- [ ] Sections détectées automatiquement dans le HTML généré
- [ ] Drag handles visibles en mode "Réordonner" (toggle bouton)
- [ ] Drop réordonne les sections dans l'iframe en temps réel
- [ ] Sauvegarde du HTML réordonné en DB
- [ ] Fonctionnel uniquement si ≥ 2 sections détectées (sinon bouton grisé)
- [ ] Undo/Redo intégré

---

## Ordre d'implémentation recommandé

```
Sprint 1 (haute valeur, bases solides)
  20.3 Undo/Redo          ← socle pour tout le reste, simple à faire en premier
  20.4 Palette swap       ← pas d'IA, feedback immédiat, fort impact visuel
  20.1 Prompt itératif    ← feature star, couvre tous les cas "describe a change"
  20.2 Édition inline     ← fix rapide de typos/prix, très demandé

Sprint 2 (personnalisation avancée)
  20.5 Font swap          ← même pattern que palette swap, rapide
  20.6 Snapshot history   ← nécessite migration Prisma

Backlog (post-MVP)
  20.7 Variants           ← si appétit utilisateur confirmé
  20.8 Reorder sections   ← complexe, dépend fortement de la qualité HTML d'Epic 18
```

---

## Principes techniques communs

1. **Toujours pousser dans l'undo stack** avant d'appliquer une modification
2. **Optimistic UI** : mettre à jour la preview localement avant la confirmation DB
3. **Sauvegarder en DB** après chaque modification (pas de "brouillon" unsaved)
4. **Uniquement pour les menus `templateId === "ai-custom"`** — ces features n'ont
   pas de sens pour les templates classiques (Classic, Minimal, Bistrot)
5. **Rate limiting côté API** pour le prompt itératif (3 requêtes/minute/user)
   pour éviter les abus sur les appels Claude

---

## Métriques de succès

| Métrique | Cible |
|----------|-------|
| % d'utilisateurs Pro qui utilisent le prompt itératif | > 40% dans les 30j post-launch |
| Nbre moyen d'itérations avant export PDF | > 2 (indique engagement) |
| Taux de génération complète répétée (régénérer de zéro) | < 30% (baisse vs aujourd'hui) |
| NPS post-utilisation éditeur | > 40 |
