# Menufique — Guide des Templates de Menu

## Architecture des templates

Chaque template est un ensemble HTML/CSS qui sera hydraté avec les données du menu, puis rendu en PDF via Puppeteer.

### Structure d'un template

```
src/templates/
├── classic/
│   ├── template.html       # Structure HTML du menu
│   ├── styles.css           # Styles spécifiques au template
│   └── thumbnail.png        # Vignette pour le sélecteur (400x560px)
├── modern/
├── elegant/
├── bistrot/
└── minimal/
```

### Données injectées dans le template

Le moteur de rendu injecte les variables suivantes dans chaque template :

```typescript
interface TemplateData {
  restaurant: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
    openingHours?: Record<string, string>;
  };
  menu: {
    name: string;
    categories: {
      name: string;
      description?: string;
      dishes: {
        name: string;
        description?: string;
        price: string;          // Formaté : "14,50 €"
        allergens: string[];    // IDs des allergènes
        isAvailable: boolean;
      }[];
    }[];
  };
  customization: {
    primaryColor: string;       // ex: "#FF6B35"
    backgroundColor: string;    // ex: "#FFF8F2"
    textColor: string;          // ex: "#1A1A2E"
    headingFont: string;        // ex: "Playfair Display"
    bodyFont: string;           // ex: "Inter"
  };
  allergenLegend: {             // Légende allergènes en bas de page
    id: string;
    label: string;
    icon: string;               // URL de l'icône SVG
  }[];
  branding: {
    showWatermark: boolean;     // true pour plan gratuit
    watermarkText: string;      // "Créé avec Menufique"
  };
}
```

## Templates MVP

### 1. Classic (Gratuit)
- **Style** : Traditionnel, sobre, noir et blanc avec accents de couleur
- **Cible** : Restaurants traditionnels, brasseries
- **Layout** : Titre centré, catégories séparées par des filets, prix alignés à droite avec pointillés
- **Polices** : Serif pour les titres, sans-serif pour le corps

### 2. Minimal (Gratuit)
- **Style** : Ultra-épuré, beaucoup d'espace blanc, typographie moderne
- **Cible** : Restaurants branchés, bistronomie
- **Layout** : Aligné à gauche, catégories en majuscules, descriptions en gris clair
- **Polices** : Sans-serif partout, graisses contrastées

### 3. Bistrot (Pro)
- **Style** : Chaleureux, ardoise, rustique-chic
- **Cible** : Bistrots, bouchons lyonnais, cafés
- **Layout** : Fond sombre, texte clair, encadrés décoratifs, ornements
- **Polices** : Script pour le titre, serif pour le corps

### 4. Elegant (Pro)
- **Style** : Luxueux, épuré, beaucoup de marge, or/doré subtil
- **Cible** : Restaurants gastronomiques, hôtels
- **Layout** : Centré, grandes marges, filets fins, descriptions en italique
- **Polices** : Serif élégante (Playfair Display), espacement large

### 5. Modern (Pro)
- **Style** : Coloré, dynamique, asymétrique
- **Cible** : Food trucks, restaurants tendance, fast-casual
- **Layout** : Blocs de couleur, catégories en cards, prix en gros
- **Polices** : Sans-serif bold, contrastes forts

## Spécifications PDF

- **Format** : A4 portrait (210 × 297 mm)
- **Résolution** : 300 DPI (vectoriel via Puppeteer)
- **Marges** : 10 mm minimum sur chaque côté
- **Fond perdu** : 3 mm optionnel pour impression pro
- **Polices** : Embarquées dans le PDF (Google Fonts chargées en base64)
- **Images** : Logo embarqué en base64 dans le HTML avant rendu
- **Taille max** : Pagination automatique si le menu dépasse 1 page A4

## Rendu PDF — Pipeline technique

```typescript
// Pseudo-code du pipeline de génération
async function generateMenuPdf(menuId: string): Promise<string> {
  // 1. Charger les données du menu depuis la BDD
  const menuData = await getMenuWithRelations(menuId);

  // 2. Charger le template HTML/CSS
  const template = await loadTemplate(menuData.templateId);

  // 3. Hydrater le template avec les données
  const html = hydrateTemplate(template, menuData);

  // 4. Lancer Puppeteer et générer le PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
  });
  await browser.close();

  // 5. Ajouter watermark si plan gratuit
  if (menuData.user.plan === 'FREE') {
    addWatermark(pdfBuffer);
  }

  // 6. Upload sur S3/Supabase Storage
  const pdfUrl = await uploadToStorage(pdfBuffer, `menus/${menuId}.pdf`);

  // 7. Mettre à jour l'URL en BDD
  await updateMenuPdfUrl(menuId, pdfUrl);

  return pdfUrl;
}
```

## Règles de design des templates

1. **Responsive au contenu** : le template doit s'adapter de 3 plats à 50 plats
2. **Pagination** : si le contenu dépasse 1 page, paginer proprement (pas couper un plat en deux)
3. **Allergènes** : toujours afficher la légende des allergènes utilisés en bas de page
4. **Watermark plan gratuit** : texte discret "Créé avec Menufique" en bas de page, opacité 30%
5. **Logo** : affiché en haut si fourni, masqué sinon (pas de placeholder)
6. **Prix** : toujours formatés en euros avec virgule (14,50 €)
7. **Impression** : tester chaque template en impression réelle (laser A4, couleur et N&B)
