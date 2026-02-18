export const luxeTemplate: string = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .menu-page { width: 210mm; height: 297mm; padding: 10mm; box-sizing: border-box; overflow: hidden; background: #080808; position: relative; }
  .frame-outer { position: absolute; inset: 5mm; border: 1px solid #C9A84C; pointer-events: none; }
  .frame-inner { position: absolute; inset: 6.5mm; border: 0.5px solid rgba(201,168,76,0.35); pointer-events: none; }
  .corner { position: absolute; width: 6mm; height: 6mm; border-color: #C9A84C; border-style: solid; }
  .corner-tl { top: 4mm; left: 4mm; border-width: 1.5px 0 0 1.5px; }
  .corner-tr { top: 4mm; right: 4mm; border-width: 1.5px 1.5px 0 0; }
  .corner-bl { bottom: 4mm; left: 4mm; border-width: 0 0 1.5px 1.5px; }
  .corner-br { bottom: 4mm; right: 4mm; border-width: 0 1.5px 1.5px 0; }
  .content { position: relative; z-index: 1; padding: 5mm; }
  .header { text-align: center; padding-bottom: 4mm; margin-bottom: 3mm; }
  .header-ornament { color: #C9A84C; font-size: 8pt; letter-spacing: 8px; margin-bottom: 2mm; }
  .restaurant-name { font-family: 'Cinzel', serif; font-size: 22pt; font-weight: 700; color: #C9A84C; letter-spacing: 8px; text-transform: uppercase; margin: 0 0 2mm; }
  .restaurant-subtitle { font-family: 'Cormorant Garamond', serif; font-size: 9pt; font-style: italic; color: rgba(201,168,76,0.75); letter-spacing: 3px; margin: 0 0 2.5mm; }
  .divider { display: flex; align-items: center; gap: 3mm; margin: 1.5mm 0; }
  .divider-line { flex: 1; height: 0.5px; background: linear-gradient(to right, transparent, #C9A84C, transparent); }
  .divider-ornament { color: #C9A84C; font-size: 9pt; letter-spacing: 3px; flex-shrink: 0; }
  .restaurant-address { font-family: 'Cormorant Garamond', serif; font-size: 7.5pt; color: rgba(201,168,76,0.6); letter-spacing: 2px; margin: 2mm 0 0; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
  .category { margin-bottom: 4mm; }
  .category-title { font-family: 'Cinzel', serif; font-size: 8.5pt; font-weight: 600; color: #C9A84C; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 1.5mm; text-align: center; }
  .category-rule { height: 0.5px; background: rgba(201,168,76,0.35); margin-bottom: 2.5mm; }
  .dish { margin-bottom: 2.5mm; }
  .dish-row { display: flex; align-items: flex-end; gap: 3px; }
  .dish-name { font-family: 'Cormorant Garamond', serif; font-size: 10pt; color: #E8D5A3; flex-shrink: 0; max-width: 68%; }
  .dish-dots { flex: 1; border-bottom: 1px dotted rgba(201,168,76,0.35); margin-bottom: 3px; min-width: 6px; }
  .dish-price { font-family: 'Cinzel', serif; font-size: 9pt; color: #C9A84C; white-space: nowrap; flex-shrink: 0; }
  .dish-desc { font-family: 'Cormorant Garamond', serif; font-size: 7.5pt; font-style: italic; color: rgba(232,213,163,0.5); display: block; margin-top: 0.5mm; line-height: 1.4; }
  .allergens { font-family: 'Cormorant Garamond', serif; font-size: 6pt; color: rgba(201,168,76,0.4); text-align: center; margin-top: 2mm; letter-spacing: 1px; }
  .footer { position: absolute; bottom: 8mm; left: 10mm; right: 10mm; text-align: center; border-top: 0.5px solid rgba(201,168,76,0.3); padding-top: 2.5mm; }
  .footer p { font-family: 'Cinzel', serif; font-size: 5.5pt; color: rgba(201,168,76,0.6); letter-spacing: 3px; text-transform: uppercase; margin: 0; }
</style>
</head>
<body>
<div class="menu-page">
  <div class="frame-outer"></div>
  <div class="frame-inner"></div>
  <div class="corner corner-tl"></div>
  <div class="corner corner-tr"></div>
  <div class="corner corner-bl"></div>
  <div class="corner corner-br"></div>
  <div class="content">
    <header class="header">
      <p class="header-ornament">✦ ✦ ✦</p>
      <h1 class="restaurant-name">Le Jardin</h1>
      <p class="restaurant-subtitle">Haute Gastronomie Française</p>
      <div class="divider">
        <div class="divider-line"></div>
        <span class="divider-ornament">◆</span>
        <div class="divider-line"></div>
      </div>
      <p class="restaurant-address">12 Rue des Lilas · Paris 8ème · 01 42 36 89 20</p>
    </header>
    <div class="columns">
      <div>
        <section class="category">
          <h2 class="category-title">Entrées</h2>
          <div class="category-rule"></div>
          <div class="dish">
            <div class="dish-row">
              <span class="dish-name">Soupe à l'oignon</span>
              <span class="dish-dots"></span>
              <span class="dish-price">9 €</span>
            </div>
            <span class="dish-desc">Gratinée, croûton au gruyère</span>
          </div>
          <div class="dish">
            <div class="dish-row">
              <span class="dish-name">Carpaccio de bœuf</span>
              <span class="dish-dots"></span>
              <span class="dish-price">14 €</span>
            </div>
            <span class="dish-desc">Roquette, parmesan, truffe</span>
          </div>
          <div class="dish">
            <div class="dish-row">
              <span class="dish-name">Feuilleté escargots</span>
              <span class="dish-dots"></span>
              <span class="dish-price">13 €</span>
            </div>
            <span class="dish-desc">Beurre persillé, ail confit</span>
          </div>
        </section>
        <section class="category">
          <h2 class="category-title">Desserts</h2>
          <div class="category-rule"></div>
          <div class="dish">
            <div class="dish-row">
              <span class="dish-name">Tarte Tatin</span>
              <span class="dish-dots"></span>
              <span class="dish-price">10 €</span>
            </div>
            <span class="dish-desc">Crème fraîche, caramel salé</span>
          </div>
          <div class="dish">
            <div class="dish-row">
              <span class="dish-name">Crème brûlée</span>
              <span class="dish-dots"></span>
              <span class="dish-price">9 €</span>
            </div>
            <span class="dish-desc">Vanille Bourbon, cassonade</span>
          </div>
          <div class="dish">
            <div class="dish-row">
              <span class="dish-name">Fondant chocolat</span>
              <span class="dish-dots"></span>
              <span class="dish-price">11 €</span>
            </div>
            <span class="dish-desc">Cœur coulant, glace vanille</span>
          </div>
        </section>
      </div>
      <div>
        <section class="category">
          <h2 class="category-title">Plats Principaux</h2>
          <div class="category-rule"></div>
          <div class="dish">
            <div class="dish-row">
              <span class="dish-name">Filet de bar</span>
              <span class="dish-dots"></span>
              <span class="dish-price">24 €</span>
            </div>
            <span class="dish-desc">Légumes du marché, beurre blanc</span>
          </div>
          <div class="dish">
            <div class="dish-row">
              <span class="dish-name">Canard à l'orange</span>
              <span class="dish-dots"></span>
              <span class="dish-price">26 €</span>
            </div>
            <span class="dish-desc">Magret, agrumes, pommes sarladaises</span>
          </div>
          <div class="dish">
            <div class="dish-row">
              <span class="dish-name">Entrecôte grillée</span>
              <span class="dish-dots"></span>
              <span class="dish-price">28 €</span>
            </div>
            <span class="dish-desc">Sauce béarnaise, frites maison</span>
          </div>
          <div class="dish">
            <div class="dish-row">
              <span class="dish-name">Risotto aux cèpes</span>
              <span class="dish-dots"></span>
              <span class="dish-price">22 €</span>
            </div>
            <span class="dish-desc">Parmesan affiné, huile de truffe</span>
          </div>
        </section>
      </div>
    </div>
    <p class="allergens">G = Gluten · L = Lait · O = Œuf · P = Poisson · C = Crustacés — Information disponible sur demande</p>
  </div>
  <footer class="footer">
    <p>Le Jardin · 12 Rue des Lilas · Paris · contact@lejardin.fr</p>
  </footer>
</div>
</body>
</html>`;
