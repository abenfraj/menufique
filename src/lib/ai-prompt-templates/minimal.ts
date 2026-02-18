export const minimalTemplate: string = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .menu-page { width: 210mm; height: 297mm; padding: 14mm 16mm; box-sizing: border-box; overflow: hidden; background: #FFFFFF; position: relative; }
  .header { margin-bottom: 8mm; }
  .restaurant-name { font-family: 'DM Sans', sans-serif; font-size: 24pt; font-weight: 300; color: #111827; letter-spacing: -0.5px; margin: 0 0 1mm; }
  .header-rule { height: 1px; background: #111827; width: 100%; margin: 3mm 0 2mm; }
  .restaurant-address { font-family: 'DM Sans', sans-serif; font-size: 7pt; color: #9CA3AF; letter-spacing: 1.5px; text-transform: uppercase; margin: 0; }
  .category { margin-bottom: 6mm; }
  .category-title { font-family: 'DM Sans', sans-serif; font-size: 7.5pt; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #6B7280; margin-bottom: 3mm; }
  .dish { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3.5mm; }
  .dish-info { flex: 1; padding-right: 6mm; min-width: 0; }
  .dish-name { font-family: 'DM Sans', sans-serif; font-size: 11pt; font-weight: 400; color: #111827; display: block; }
  .dish-desc { font-family: 'DM Sans', sans-serif; font-size: 8pt; color: #9CA3AF; font-weight: 300; font-style: italic; display: block; margin-top: 1px; line-height: 1.4; }
  .dish-price { font-family: 'DM Sans', sans-serif; font-size: 11pt; font-weight: 300; color: #111827; white-space: nowrap; flex-shrink: 0; }
  .section-rule { height: 0.5px; background: #F3F4F6; margin-bottom: 3mm; }
  .allergens { font-family: 'DM Sans', sans-serif; font-size: 5.5pt; color: #D1D5DB; text-align: center; margin-top: 2mm; text-transform: uppercase; letter-spacing: 1px; }
  .footer { position: absolute; bottom: 12mm; left: 16mm; right: 16mm; display: flex; justify-content: space-between; }
  .footer span { font-family: 'DM Sans', sans-serif; font-size: 6.5pt; color: #9CA3AF; font-weight: 300; }
</style>
</head>
<body>
<div class="menu-page">
  <header class="header">
    <h1 class="restaurant-name">Le Jardin</h1>
    <div class="header-rule"></div>
    <p class="restaurant-address">12 Rue des Lilas · Paris 8e · 01 42 36 89 20</p>
  </header>
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
  <div class="section-rule"></div>
  <section class="category">
    <h2 class="category-title">Plats principaux</h2>
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
        <span class="dish-desc">Magret, jus d'agrumes, pommes sarladaises</span>
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
  <div class="section-rule"></div>
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
  <p class="allergens">G = Gluten · L = Lait · O = Œuf · P = Poisson · C = Crustacés</p>
  <footer class="footer">
    <span>Le Jardin</span>
    <span>contact@lejardin.fr</span>
  </footer>
</div>
</body>
</html>`;
