export const rusticTemplate: string = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .menu-page { width: 210mm; height: 297mm; padding: 12mm; box-sizing: border-box; overflow: hidden; background: #1C1008; position: relative; }
  .border-outer { position: absolute; inset: 6mm; border: 1px solid rgba(210,156,62,0.5); pointer-events: none; }
  .border-inner { position: absolute; inset: 7.5mm; border: 0.5px solid rgba(210,156,62,0.2); pointer-events: none; }
  .content { position: relative; z-index: 1; }
  .header { text-align: center; padding-bottom: 5mm; margin-bottom: 4mm; }
  .restaurant-name { font-family: 'Playfair Display', serif; font-size: 28pt; font-weight: 700; color: #D29C3E; letter-spacing: 4px; margin: 0; text-transform: uppercase; }
  .ornament-row { display: flex; align-items: center; justify-content: center; gap: 3mm; margin: 3mm 0 2mm; }
  .ornament-row span { color: #D29C3E; font-size: 9pt; letter-spacing: 4px; opacity: 0.9; }
  .ornament-row hr { flex: 1; border: none; border-top: 0.5px solid rgba(210,156,62,0.5); max-width: 20mm; }
  .restaurant-address { font-family: 'Lora', serif; font-size: 7.5pt; color: rgba(245,220,160,0.65); letter-spacing: 1.5px; margin: 0; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
  .category { margin-bottom: 4mm; }
  .category-title { font-family: 'Playfair Display', serif; font-size: 12pt; font-weight: 700; font-style: italic; color: #D29C3E; margin-bottom: 2.5mm; display: flex; align-items: center; gap: 3mm; }
  .category-title::after { content: ''; flex: 1; height: 0.5px; background: rgba(210,156,62,0.4); }
  .dish { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2.5mm; }
  .dish-info { flex: 1; padding-right: 4mm; min-width: 0; }
  .dish-name { font-family: 'Lora', serif; font-size: 10pt; color: #F5DCA0; display: block; }
  .dish-desc { font-family: 'Lora', serif; font-size: 7.5pt; font-style: italic; color: rgba(245,220,160,0.55); display: block; margin-top: 0.5mm; line-height: 1.4; }
  .dish-price { font-family: 'Playfair Display', serif; font-size: 10pt; font-weight: 700; color: #D29C3E; white-space: nowrap; flex-shrink: 0; }
  .allergens { font-family: 'Lora', serif; font-size: 6pt; color: rgba(245,220,160,0.35); text-align: center; margin-top: 2.5mm; letter-spacing: 0.5px; }
  .footer { position: absolute; bottom: 9mm; left: 12mm; right: 12mm; text-align: center; border-top: 0.5px solid rgba(210,156,62,0.3); padding-top: 2.5mm; }
  .footer p { font-family: 'Lora', serif; font-size: 6.5pt; color: rgba(210,156,62,0.65); letter-spacing: 2px; margin: 0; }
</style>
</head>
<body>
<div class="menu-page">
  <div class="border-outer"></div>
  <div class="border-inner"></div>
  <div class="content">
    <header class="header">
      <h1 class="restaurant-name">Le Jardin</h1>
      <div class="ornament-row">
        <hr><span>✦ ✦ ✦</span><hr>
      </div>
      <p class="restaurant-address">12 Rue des Lilas · 75008 Paris · 01 42 36 89 20</p>
    </header>
    <div class="columns">
      <div>
        <section class="category">
          <h2 class="category-title">Entrées</h2>
          <div class="dish">
            <div class="dish-info">
              <span class="dish-name">Soupe à l'oignon</span>
              <span class="dish-desc">Gratinée, croûton au gruyère</span>
            </div>
            <span class="dish-price">9 €</span>
          </div>
          <div class="dish">
            <div class="dish-info">
              <span class="dish-name">Carpaccio de bœuf</span>
              <span class="dish-desc">Roquette, parmesan, huile de truffe</span>
            </div>
            <span class="dish-price">14 €</span>
          </div>
          <div class="dish">
            <div class="dish-info">
              <span class="dish-name">Feuilleté d'escargots</span>
              <span class="dish-desc">Beurre persillé, ail confit</span>
            </div>
            <span class="dish-price">13 €</span>
          </div>
        </section>
        <section class="category">
          <h2 class="category-title">Desserts</h2>
          <div class="dish">
            <div class="dish-info">
              <span class="dish-name">Tarte Tatin</span>
              <span class="dish-desc">Crème fraîche, caramel beurre salé</span>
            </div>
            <span class="dish-price">10 €</span>
          </div>
          <div class="dish">
            <div class="dish-info">
              <span class="dish-name">Crème brûlée</span>
              <span class="dish-desc">Vanille Bourbon, cassonade</span>
            </div>
            <span class="dish-price">9 €</span>
          </div>
          <div class="dish">
            <div class="dish-info">
              <span class="dish-name">Fondant chocolat</span>
              <span class="dish-desc">Cœur coulant, glace vanille</span>
            </div>
            <span class="dish-price">11 €</span>
          </div>
        </section>
      </div>
      <div>
        <section class="category">
          <h2 class="category-title">Plats</h2>
          <div class="dish">
            <div class="dish-info">
              <span class="dish-name">Filet de bar</span>
              <span class="dish-desc">Légumes du marché, beurre blanc</span>
            </div>
            <span class="dish-price">24 €</span>
          </div>
          <div class="dish">
            <div class="dish-info">
              <span class="dish-name">Canard à l'orange</span>
              <span class="dish-desc">Magret, agrumes, pommes sarladaises</span>
            </div>
            <span class="dish-price">26 €</span>
          </div>
          <div class="dish">
            <div class="dish-info">
              <span class="dish-name">Entrecôte grillée</span>
              <span class="dish-desc">Sauce béarnaise, frites maison</span>
            </div>
            <span class="dish-price">28 €</span>
          </div>
          <div class="dish">
            <div class="dish-info">
              <span class="dish-name">Risotto aux cèpes</span>
              <span class="dish-desc">Parmesan affiné, huile de truffe</span>
            </div>
            <span class="dish-price">22 €</span>
          </div>
        </section>
      </div>
    </div>
    <p class="allergens">Allergènes : G = Gluten · L = Lait · O = Œuf · P = Poisson · C = Crustacés — Informations sur demande</p>
  </div>
  <footer class="footer">
    <p>Le Jardin · Bistrot Parisien · contact@lejardin.fr</p>
  </footer>
</div>
</body>
</html>`;
