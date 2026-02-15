# Menufique — Product Requirements Document (PRD)

## 1. Problème

Les restaurateurs indépendants perdent du temps et de l'argent à créer et mettre à jour leurs cartes avec des outils inadaptés (Word, Canva, graphiste). Les solutions existantes sont soit trop complexes, soit trop chères, soit insuffisamment localisées pour le marché français.

## 2. Solution

Menufique : saisir ses plats, choisir un template, obtenir instantanément un menu PDF + QR code. Création en moins de 5 minutes, 100% self-service.

## 3. Personas

### Sophie — Restauratrice indépendante
- 42 ans, gérante d'un bistrot à Lyon (25 couverts)
- Passe 2h sur Word chaque semaine pour mettre à jour sa carte du jour
- Compétence tech : faible (Facebook + smartphone)
- Attente : taper ses plats → menu pro en 5 min, version papier + QR code

### Karim — Gérant de food truck
- 29 ans, food truck de burgers à Bordeaux
- Change son menu chaque semaine selon les approvisionnements
- Compétence tech : moyenne (smartphone, peu desktop)
- Attente : QR code propre + menu Instagram-friendly

### Marie-Claire — Directrice restaurant gastronomique
- 55 ans, restaurant étoilé à Paris
- Paye un graphiste 150€ à chaque changement de carte saisonnière
- Compétence tech : très faible
- Attente : templates élégants, rendu premium, PDF haute qualité

## 4. Fonctionnalités MVP

### 4.1 Authentification
- Inscription email + mot de passe (hash bcrypt, cost 12)
- Connexion Google OAuth
- Mot de passe oublié (email de reset via Resend)
- Session via JWT httpOnly cookies
- Déconnexion

### 4.2 Gestion du restaurant
- Formulaire : nom, adresse, téléphone, email, site web, horaires d'ouverture
- Upload logo (PNG/JPG/SVG, max 5 Mo)
- Toutes les infos sont optionnelles sauf le nom

### 4.3 Gestion du menu (cœur fonctionnel)
- Créer / renommer / supprimer un menu
- Ajouter / réordonner / supprimer des catégories (ex: Entrées, Plats, Desserts)
- Ajouter / modifier / supprimer des plats dans une catégorie
- Chaque plat : nom (requis), description (optionnel), prix (requis), allergènes (checkboxes)
- Drag & drop pour réordonner catégories et plats
- Sauvegarde automatique (debounce 2s)

### 4.4 Les 14 allergènes réglementaires (Règlement INCO 1169/2011)
1. Gluten
2. Crustacés
3. Œufs
4. Poissons
5. Arachides
6. Soja
7. Lait
8. Fruits à coque
9. Céleri
10. Moutarde
11. Sésame
12. Sulfites
13. Lupin
14. Mollusques

Affichage : pictos normalisés ou légende en bas de page selon le template.

### 4.5 Templates et personnalisation
- 5 à 8 templates de menu inclus
- Plan Gratuit : accès à 2 templates basiques
- Plan Pro : accès à tous les templates + personnalisation couleurs/polices
- Prévisualisation temps réel pendant l'édition

### 4.6 Génération et export
- Génération PDF A4 haute résolution (vectoriel via Puppeteer)
- Génération QR code (SVG/PNG) pointant vers la page web du menu
- Page web publique mobile-first accessible via QR code
- Plan Gratuit : watermark "Menufique" sur le PDF, limité à 1 menu
- Plan Pro : sans watermark, menus illimités

### 4.7 Dashboard
- Liste des menus (cards avec aperçu, date, statut)
- Actions rapides : éditer, télécharger PDF, copier lien, télécharger QR
- Section "Mon abonnement" → redirection vers Stripe Customer Portal
- Section "Mon restaurant" → édition des infos

## 5. Parcours utilisateur principal (Happy Path)

```
Landing Page → Inscription (email ou Google) → Onboarding wizard (3 étapes) →
Éditeur de menu → Choix template → Prévisualisation → Génération →
Téléchargement PDF + QR code
```

### Détail des étapes :
1. **Landing Page** : Hero + CTA "Créer mon menu gratuitement"
2. **Inscription** : Email + mdp OU Google. Pas de formulaire long.
3. **Onboarding** : Wizard 3 étapes — (a) Infos restaurant, (b) Logo, (c) Premier menu rapide
4. **Éditeur** : 2 colonnes — formulaire à gauche, preview temps réel à droite
5. **Template** : Grille de vignettes, clic = preview instantanée
6. **Prévisualisation** : Vue complète du menu final
7. **Génération** : Animation (2-3s) puis boutons téléchargement
8. **Partage** : Copier lien, télécharger QR, imprimer PDF

### Parcours secondaires :
- **Mise à jour** : Dashboard → Sélectionner → Éditer → Sauvegarder → Regénérer (QR code inchangé)
- **Upgrade Pro** : Paywall au 2e export ou retrait watermark → Stripe Checkout
- **Gestion abo** : Dashboard → Mon abonnement → Stripe Customer Portal

## 6. Écrans clés (wireframes)

1. **Landing Page** : Hero, "Comment ça marche" (3 étapes), exemples de menus, témoignages, pricing, footer
2. **Inscription / Connexion** : Formulaire centré minimal, bouton Google, lien "Mot de passe oublié"
3. **Onboarding Wizard** : Stepper horizontal, 3 étapes
4. **Éditeur de menu** : Layout 2 colonnes (formulaire | preview), toolbar template/couleurs/polices
5. **Sélecteur de template** : Grille de vignettes
6. **Page génération** : Animation puis boutons téléchargement
7. **Dashboard** : Liste de menus en cards
8. **Page menu public** : Page responsive, logo, nom restaurant, menu complet, footer "Propulsé par Menufique"

## 7. KPIs de succès

### Produit
- Temps de création premier menu < 5 minutes
- Taux de complétion onboarding > 70%
- Taux de génération (menu créé → PDF généré) > 80%

### Business
- 500 utilisateurs actifs en 6 mois
- Taux de conversion gratuit → Pro > 5%
- MRR cible mois 6 : 500€
- Churn mensuel < 5%
