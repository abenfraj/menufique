export const colorfulTemplate: string = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .menu-page { width: 210mm; height: 297mm; padding: 10mm; box-sizing: border-box; overflow: hidden; background: #FFF9F5; position: relative; }
  .header { background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 60%, #FFA559 100%); border-radius: 12px; padding: 5mm 7mm; margin-bottom: 5mm; text-align: center; }
  .restaurant-name { font-family: 'Nunito', sans-serif; font-size: 26pt; font-weight: 800; color: #FFFFFF; margin: 0 0 1mm; letter-spacing: -0.5px; }
  .restaurant-subtitle { font-family: 'Nunito', sans-serif; font-size: 8pt; color: rgba(255,255,255,0.9); margin: 0 0 1mm; font-weight: 600; letter-spacing: 0.5px; }
  .restaurant-address { font-family: 'Nunito', sans-serif; font-size: 7pt; color: rgba(255,255,255,0.75); margin: 0; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
  .category { background: white; border-radius: 10px; padding: 4mm; box-shadow: 0 2px 8px rgba(255,107,53,0.1); margin-bottom: 4mm; }
  .category-header { display: flex; align-items: center; gap: 2mm; margin-bottom: 3mm; border-bottom: 1.5px solid #FFF0EA; padding-bottom: 2mm; }
  .category-emoji { font-size: 14pt; line-height: 1; }
  .category-title { font-family: 'Nunito', sans-serif; font-size: 10pt; font-weight: 800; color: #FF6B35; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
  .dish { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5mm; padding-bottom: 2.5mm; border-bottom: 1px dashed #F3F4F6; }
  .dish:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
  .dish-info { flex: 1; padding-right: 2mm; min-width: 0; }
  .dish-name { font-family: 'Nunito', sans-serif; font-size: 9.5pt; font-weight: 700; color: #1F2937; display: block; }
  .dish-desc { font-family: 'Nunito', sans-serif; font-size: 7.5pt; color: #9CA3AF; font-style: italic; display: block; margin-top: 0.5px; line-height: 1.3; }
  .dish-price { font-family: 'Nunito', sans-serif; font-size: 9.5pt; font-weight: 800; color: #FF6B35; white-space: nowrap; flex-shrink: 0; background: #FFF0EA; border-radius: 6px; padding: 0.5mm 2mm; align-self: flex-start; }
  .allergens { font-family: 'Nunito', sans-serif; font-size: 6pt; color: #D1D5DB; text-align: center; margin-top: 2mm; }
  .footer { position: absolute; bottom: 8mm; left: 10mm; right: 10mm; text-align: center; }
  .footer p { font-family: 'Nunito', sans-serif; font-size: 7pt; color: #9CA3AF; font-weight: 600; margin: 0; }
</style>
</head>
<body>
<div class="menu-page">
  <header class="header">
    <h1 class="restaurant-name">🌿 Le Jardin</h1>
    <p class="restaurant-subtitle">Cuisine généreuse &amp; conviviale</p>
    <p class="restaurant-address">12 Rue des Lilas · 75008 Paris · 01 42 36 89 20</p>
  </header>
  <div class="columns">
    <div>
      <section class="category">
        <div class="category-header">
          <span class="category-emoji">🥗</span>
          <h2 class="category-title">Entrées</h2>
        </div>
        <div class="dish">
          <div class="dish-info">
            <span class="dish-name">Soupe à l'oignon</span>
            <span class="dish-desc">Gratinée, croûton gruyère</span>
          </div>
          <span class="dish-price">9 €</span>
        </div>
        <div class="dish">
          <div class="dish-info">
            <span class="dish-name">Carpaccio de bœuf</span>
            <span class="dish-desc">Roquette, parmesan, truffe</span>
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
          <span class="category-emoji">🍮</span>
          <h2 class="category-title">Desserts</h2>
        </div>
        <div class="dish">
          <div class="dish-info">
            <span class="dish-name">Tarte Tatin</span>
            <span class="dish-desc">Crème fraîche, caramel salé</span>
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
          <span class="category-emoji">🍽️</span>
          <h2 class="category-title">Plats principaux</h2>
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
            <span class="dish-desc">Parmesan, huile de truffe</span>
          </div>
          <span class="dish-price">22 €</span>
        </div>
      </section>
    </div>
  </div>
  <p class="allergens">G = Gluten · L = Lait · O = Œuf · P = Poisson · C = Crustacés</p>
  <footer class="footer">
    <p>12 Rue des Lilas · 75008 Paris · contact@lejardin.fr</p>
  </footer>
</div>
</body>
</html>`;
