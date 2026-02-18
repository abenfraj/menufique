export const modernTemplate: string = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .menu-page { width: 210mm; height: 297mm; padding: 12mm; box-sizing: border-box; overflow: hidden; background: #FFFFFF; position: relative; }
  .header { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 5mm; border-bottom: 2px solid #0F766E; margin-bottom: 5mm; }
  .restaurant-name { font-family: 'Montserrat', sans-serif; font-size: 22pt; font-weight: 700; color: #0F172A; letter-spacing: -0.5px; margin: 0 0 1mm; }
  .restaurant-address { font-family: 'Inter', sans-serif; font-size: 7pt; color: #64748B; font-weight: 300; margin: 0; }
  .header-badge { background: #0F766E; color: white; font-family: 'Montserrat', sans-serif; font-size: 6pt; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 2mm 3mm; border-radius: 4px; white-space: nowrap; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
  .category { margin-bottom: 5mm; }
  .category-header { display: flex; align-items: center; gap: 3mm; margin-bottom: 3mm; }
  .category-title { font-family: 'Montserrat', sans-serif; font-size: 9pt; font-weight: 700; color: #0F766E; text-transform: uppercase; letter-spacing: 1.5px; margin: 0; white-space: nowrap; }
  .category-line { flex: 1; height: 1px; background: #E2E8F0; }
  .dish { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 3.5mm; }
  .dish-info { flex: 1; padding-right: 3mm; min-width: 0; }
  .dish-name { font-family: 'Inter', sans-serif; font-size: 10pt; font-weight: 500; color: #1E293B; display: block; }
  .dish-desc { font-family: 'Inter', sans-serif; font-size: 7.5pt; color: #64748B; margin-top: 1px; display: block; font-weight: 300; line-height: 1.4; }
  .dish-price { font-family: 'Montserrat', sans-serif; font-size: 10pt; font-weight: 700; color: #0F766E; white-space: nowrap; flex-shrink: 0; }
  .allergens { font-family: 'Inter', sans-serif; font-size: 6pt; color: #94A3B8; text-align: center; margin-top: 3mm; border-top: 1px solid #F1F5F9; padding-top: 2mm; }
  .footer { position: absolute; bottom: 10mm; left: 12mm; right: 12mm; display: flex; justify-content: space-between; align-items: center; }
  .footer-left { font-family: 'Inter', sans-serif; font-size: 7pt; color: #64748B; font-weight: 300; }
  .footer-right { font-family: 'Montserrat', sans-serif; font-size: 6pt; font-weight: 700; color: #0F766E; text-transform: uppercase; letter-spacing: 2px; }
</style>
</head>
<body>
<div class="menu-page">
  <header class="header">
    <div>
      <h1 class="restaurant-name">Le Jardin</h1>
      <p class="restaurant-address">12 Rue des Lilas · 75008 Paris · 01 42 36 89 20</p>
    </div>
    <span class="header-badge">Restaurant</span>
  </header>
  <div class="columns">
    <div>
      <section class="category">
        <div class="category-header">
          <h2 class="category-title">Entrées</h2>
          <div class="category-line"></div>
        </div>
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
        <div class="category-header">
          <h2 class="category-title">Desserts</h2>
          <div class="category-line"></div>
        </div>
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
        <div class="category-header">
          <h2 class="category-title">Plats principaux</h2>
          <div class="category-line"></div>
        </div>
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
    </div>
  </div>
  <p class="allergens">G = Gluten · L = Lait · O = Œuf · P = Poisson · C = Crustacés — Informations disponibles sur demande</p>
  <footer class="footer">
    <span class="footer-left">12 Rue des Lilas, 75008 Paris · contact@lejardin.fr</span>
    <span class="footer-right">Le Jardin</span>
  </footer>
</div>
</body>
</html>`;
