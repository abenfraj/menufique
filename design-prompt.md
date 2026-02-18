# Menufique — Prompts Design Pencil.dev

> Prompts ultra-détaillés pour la refonte complète UI/UX de Menufique.
> Langue UI : français. Stack : Next.js, Tailwind CSS, Lucide Icons.
> Coller chaque prompt directement dans pencil.dev.

---

## 0. DESIGN SYSTEM GLOBAL

```
Design a complete, world-class design system for "Menufique", a French SaaS platform that helps restaurant owners create professional menus in under 5 minutes. The brand is warm, premium, and trustworthy — think the sophistication of Linear.app meets the warmth of a Parisian brasserie.

═══════════════════════════════════════════
BRAND IDENTITY
═══════════════════════════════════════════

Product: Menufique — "Le menu pro en 5 minutes"
Audience: French independent restaurant owners, 30–60 years old, non-technical
Tone: Professional, warm, approachable, slightly premium
Reference products: Linear, Stripe, Notion — but warmer and more human

═══════════════════════════════════════════
COLOR SYSTEM
═══════════════════════════════════════════

Primary palette (Orange — the heart of the brand):
  --color-primary-50:  #FFF4EE
  --color-primary-100: #FFE4D0
  --color-primary-200: #FFC9A0
  --color-primary-300: #FFA870
  --color-primary-400: #FF8847
  --color-primary-500: #FF6B35  ← MAIN BRAND COLOR
  --color-primary-600: #E85520
  --color-primary-700: #C43E10
  --color-primary-800: #9E2E08
  --color-primary-900: #7A2004

Background system (warm whites — never cold):
  --color-bg-base:      #FFFCF9  ← page background
  --color-bg-elevated:  #FFF8F2  ← cards, panels
  --color-bg-sunken:    #FFF1E6  ← inputs, code blocks
  --color-bg-overlay:   rgba(26, 26, 46, 0.6)  ← modals backdrop

Text system:
  --color-text-primary:   #1A1A2E  ← headings, important labels
  --color-text-secondary: #4A4A6A  ← body text
  --color-text-tertiary:  #8888AA  ← captions, metadata
  --color-text-placeholder: #BBBBCC ← input placeholders
  --color-text-inverse:   #FFFFFF  ← text on dark backgrounds

Neutral palette (warm grays, not cold):
  --color-neutral-50:  #FAF9F8
  --color-neutral-100: #F2F0EE
  --color-neutral-200: #E6E3DF
  --color-neutral-300: #D4D0CA
  --color-neutral-400: #B8B3AB
  --color-neutral-500: #9A9490
  --color-neutral-600: #756E6A
  --color-neutral-700: #524E4B
  --color-neutral-800: #332F2D
  --color-neutral-900: #1C1A19

Semantic colors:
  --color-success-light: #ECFDF5
  --color-success:       #10B981
  --color-success-dark:  #047857
  --color-warning-light: #FFFBEB
  --color-warning:       #F59E0B
  --color-warning-dark:  #92400E
  --color-error-light:   #FEF2F2
  --color-error:         #EF4444
  --color-error-dark:    #991B1B
  --color-info-light:    #EFF6FF
  --color-info:          #3B82F6
  --color-info-dark:     #1E40AF

PRO badge gradient: linear-gradient(135deg, #FF6B35, #FF9A5C, #FFB347)
FREE badge: --color-neutral-200 with --color-neutral-600 text

═══════════════════════════════════════════
TYPOGRAPHY SYSTEM
═══════════════════════════════════════════

Heading font: "Playfair Display" (serif, elegant, restaurant-appropriate)
Body font: "Inter" (sans-serif, highly readable, modern)
Mono font: "JetBrains Mono" (for code, prices in tables)

Type scale:
  --text-xs:   11px / line-height: 1.5 / tracking: 0.02em
  --text-sm:   13px / line-height: 1.6 / tracking: 0.01em
  --text-base: 15px / line-height: 1.6 / tracking: 0
  --text-lg:   17px / line-height: 1.5 / tracking: -0.01em
  --text-xl:   20px / line-height: 1.4 / tracking: -0.02em
  --text-2xl:  24px / line-height: 1.3 / tracking: -0.02em
  --text-3xl:  30px / line-height: 1.25 / tracking: -0.03em
  --text-4xl:  36px / line-height: 1.2  / tracking: -0.03em
  --text-5xl:  48px / line-height: 1.1  / tracking: -0.04em
  --text-6xl:  64px / line-height: 1.05 / tracking: -0.05em

Font weights: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

Headings always use Playfair Display.
Body, labels, buttons always use Inter.

═══════════════════════════════════════════
SPACING & LAYOUT
═══════════════════════════════════════════

Base unit: 4px
Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px

Max content width: 1280px
Dashboard max width: 1100px
Form max width: 480px
Reading max width: 680px

Grid: 12-column, 24px gutters, 48px margin (desktop), 16px margin (mobile)

═══════════════════════════════════════════
BORDER RADIUS
═══════════════════════════════════════════

--radius-xs:  4px   (badges, tags)
--radius-sm:  6px   (buttons small, chips)
--radius-md:  10px  (buttons, inputs, small cards)
--radius-lg:  14px  (cards, panels, modals)
--radius-xl:  20px  (large cards, hero elements)
--radius-2xl: 28px  (feature cards, pricing)
--radius-full: 9999px (pills, avatars)

═══════════════════════════════════════════
SHADOWS
═══════════════════════════════════════════

--shadow-xs:  0 1px 2px rgba(26,26,46,0.04)
--shadow-sm:  0 2px 8px rgba(26,26,46,0.06), 0 1px 2px rgba(26,26,46,0.04)
--shadow-md:  0 4px 16px rgba(26,26,46,0.08), 0 2px 4px rgba(26,26,46,0.04)
--shadow-lg:  0 8px 32px rgba(26,26,46,0.10), 0 4px 8px rgba(26,26,46,0.06)
--shadow-xl:  0 20px 60px rgba(26,26,46,0.14), 0 8px 20px rgba(26,26,46,0.08)
--shadow-primary: 0 4px 20px rgba(255,107,53,0.25), 0 2px 8px rgba(255,107,53,0.15)
--shadow-primary-lg: 0 8px 40px rgba(255,107,53,0.30), 0 4px 12px rgba(255,107,53,0.20)

═══════════════════════════════════════════
ANIMATION SYSTEM
═══════════════════════════════════════════

Timing functions:
  --ease-default:   cubic-bezier(0.4, 0, 0.2, 1)   (standard)
  --ease-in:        cubic-bezier(0.4, 0, 1, 1)       (exits)
  --ease-out:       cubic-bezier(0, 0, 0.2, 1)       (entrances)
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1) (playful spring, use sparingly)
  --ease-smooth:    cubic-bezier(0.25, 0.46, 0.45, 0.94)

Durations:
  --duration-instant: 80ms
  --duration-fast:    150ms
  --duration-default: 220ms
  --duration-slow:    350ms
  --duration-slower:  500ms

Standard animations to use throughout:
  - fadeIn: opacity 0→1, translateY 8px→0, duration 220ms ease-out
  - slideUp: translateY 20px→0 + opacity 0→1, duration 300ms ease-out
  - slideDown: translateY -20px→0 + opacity 0→1, duration 300ms ease-out
  - scaleIn: scale 0.95→1 + opacity 0→1, duration 200ms ease-spring
  - shimmer: background gradient animation for loading skeletons (1.5s loop)

Micro-interactions:
  - All buttons: translateY -1px on hover, translateY 0 on active (press feel)
  - Cards: translateY -2px + shadow upgrade on hover
  - Links: underline slides in from left on hover
  - Toggles: smooth spring animation
  - Inputs: border color transitions with glow
  - Icons inside buttons: subtle scale 1.1 on hover
```

---

## 1. COMPOSANTS PARTAGÉS

### 1.1 — Boutons

```
Design a complete button component system for Menufique with these exact specifications:

BUTTON VARIANTS:

1. PRIMARY BUTTON
   - Background: linear-gradient(135deg, #FF6B35 0%, #FF8547 100%)
   - Text: white, Inter 14px semibold, letter-spacing: 0.01em
   - Padding: 10px 20px (medium), 8px 16px (small), 12px 24px (large)
   - Border radius: 10px
   - Shadow: 0 4px 20px rgba(255,107,53,0.30), 0 2px 8px rgba(255,107,53,0.15)
   - Hover: gradient shifts slightly lighter, translateY -1px, shadow intensifies
   - Active: translateY 0px, shadow reduces
   - Transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)
   - Disabled: opacity 0.4, cursor not-allowed, no shadow
   - Loading state: animated 3-dot spinner appears inline, text grays slightly

2. OUTLINE BUTTON
   - Background: transparent
   - Border: 1.5px solid #E6E3DF
   - Text: #4A4A6A, Inter 14px medium
   - Hover: border-color #FF6B35, text-color #FF6B35, bg rgba(255,107,53,0.04)
   - Transition: all 150ms ease

3. GHOST BUTTON
   - Background: transparent
   - No border
   - Text: #8888AA, Inter 14px medium
   - Hover: bg #F2F0EE, text #4A4A6A
   - Active: bg #E6E3DF

4. DANGER BUTTON
   - Background: #EF4444
   - Text: white
   - Shadow: 0 4px 16px rgba(239,68,68,0.25)
   - Hover: #DC2626, translateY -1px

5. PRO UPGRADE BUTTON (special)
   - Background: linear-gradient(135deg, #FF6B35, #FF9A5C, #FFB347)
   - Background-size: 200% 200%
   - Animation: gradient-shift 3s ease infinite (subtle breathing)
   - Crown icon on the left, 16px
   - Text: white, semibold
   - Shadow: 0 6px 24px rgba(255,107,53,0.35)
   - Hover: scale 1.02, shadow intensifies

SIZES:
  - sm: height 32px, font 12px, padding 6px 12px, radius 8px
  - md: height 40px, font 14px, padding 10px 20px, radius 10px (DEFAULT)
  - lg: height 48px, font 15px, padding 12px 28px, radius 12px
  - xl: height 56px, font 16px, padding 16px 32px, radius 14px

STATES TO SHOW:
  Default, Hover, Active/Pressed, Disabled, Loading (with spinner),
  With leading icon, With trailing icon, Icon-only (square, circle variants)

Show all variants in a systematic grid: 5 variants × 4 sizes × all states.
Include the icon-only circular version for toolbar actions.
```

### 1.2 — Inputs & Formulaires

```
Design a premium form input system for Menufique:

TEXT INPUT
  - Height: 44px (medium), 36px (small), 52px (large)
  - Background: #FFFCF9 (slightly warm white)
  - Border: 1.5px solid #E6E3DF
  - Border radius: 10px
  - Padding: 0 14px
  - Font: Inter 14px, color #1A1A2E
  - Placeholder: #BBBBCC

  Label: Inter 13px semibold, color #4A4A6A, margin-bottom 6px

  Focus state:
    - Border: 1.5px solid #FF6B35
    - Box-shadow: 0 0 0 4px rgba(255,107,53,0.10)
    - Background: #FFFFFF
    - Transition: all 150ms ease
    - Label color shifts to #FF6B35

  Error state:
    - Border: 1.5px solid #EF4444
    - Box-shadow: 0 0 0 4px rgba(239,68,68,0.08)
    - Error message: 12px, #EF4444, with ⚠ icon, appears with fadeIn + slideUp animation

  Success state:
    - Border: 1.5px solid #10B981
    - Checkmark icon inside right edge, animated scale-in

  Disabled state:
    - Background: #F2F0EE
    - Text: #B8B3AB
    - Cursor: not-allowed

TEXTAREA
  - Same styling as input
  - Min-height: 120px
  - Resize: vertical only
  - Character counter in bottom-right (subtle, appears when user types)

SELECT / DROPDOWN
  - Same base as input
  - Custom chevron icon (replaces native arrow)
  - Dropdown panel: white bg, border, radius 12px, shadow-lg
  - Options: 40px height, hover bg #FFF4EE, selected bg #FFF4EE with orange left border
  - Search input inside dropdown for long lists

CHECKBOX
  - 18×18px custom checkbox
  - Unchecked: border 1.5px #D4D0CA, radius 5px
  - Checked: bg #FF6B35, white checkmark, spring scale animation
  - Hover: border #FF6B35, bg rgba(255,107,53,0.08)

TOGGLE / SWITCH
  - Width: 44px, Height: 24px
  - Track off: #E6E3DF
  - Track on: linear-gradient(135deg, #FF6B35, #FF8547)
  - Thumb: white circle, shadow, spring animation on toggle
  - Transition: 250ms cubic-bezier(0.34, 1.56, 0.64, 1)

FORM LAYOUT
  - Show a complete example form with: text input, email, password (with show/hide toggle),
    select, textarea, checkbox, submit button
  - Floating label variant (label slides up on focus/filled)
  - Error summary at top when multiple errors

Show all states, all variants, mobile and desktop.
```

### 1.3 — Cards

```
Design a multi-variant card component system for Menufique:

BASE CARD
  - Background: #FFFFFF
  - Border: 1px solid #E6E3DF
  - Border radius: 14px
  - Shadow: 0 2px 8px rgba(26,26,46,0.06)
  - Padding: 24px
  - Hover (interactive cards): translateY -2px, shadow-lg, border-color: #FF6B3530
  - Transition: all 220ms ease

MENU CARD (used on dashboard)
  - Size: ~320px wide, flexible height
  - Top accent: 3px gradient bar (primary to accent) at top border
  - Restaurant name in Playfair Display 16px bold
  - Status badge top-right: "Publié" (green pill) or "Brouillon" (gray pill)
  - Menu stats: categories count, dishes count (with icons)
  - Template badge: small chip showing template name
  - Last updated: subtle timestamp bottom-left
  - Quick actions bar on hover: slides up from bottom with Edit, Preview, Download PDF buttons
  - Hover: entire card lifts with shadow, warm border glow

STAT CARD (for dashboard summary)
  - Compact: ~200px wide
  - Large number (Playfair Display 36px bold, primary color)
  - Label below (Inter 13px, tertiary color)
  - Small trend indicator: +12% with up arrow (green) or down arrow (red)
  - Subtle icon background top-right corner

FEATURE CARD (for landing page)
  - Gradient background: subtle warm gradient
  - Icon in gradient circle (40px)
  - Title: Playfair 20px
  - Description: Inter 15px, secondary color
  - Border: 1px solid rgba(255,107,53,0.12)

PRICING CARD (for billing page)
  - FREE: white, neutral border
  - PRO: gradient border (2px, orange gradient), slightly elevated
    * "Recommandé" badge top-right: orange pill with star
    * Subtle warm background gradient
    * Features list with animated checkmarks
    * Price: Playfair 48px bold + "/mois" in regular weight

Show all card variants in a dashboard-like layout, with hover states.
```

### 1.4 — Toast Notifications

```
Design a toast notification system for Menufique:

POSITION: Bottom-right corner, 16px from edges

VARIANTS (all same width: 380px max, min: 280px):

SUCCESS TOAST
  - Left accent bar: 4px, #10B981
  - Icon: CheckCircle, 20px, green
  - Title: Inter 14px semibold, #1A1A2E
  - Message: Inter 13px, #4A4A6A
  - Close button: top-right, ghost
  - Background: white
  - Border: 1px solid #E6E3DF
  - Shadow: 0 8px 32px rgba(0,0,0,0.12)
  - Border radius: 12px

ERROR TOAST — same structure, left accent #EF4444, icon AlertCircle red

WARNING TOAST — accent #F59E0B, icon AlertTriangle amber

INFO TOAST — accent #3B82F6, icon Info blue

ANIMATION:
  - Enter: slide in from right + fade, translateX(100%)→0, duration 350ms ease-out spring
  - Exit: slide out to right + fade, duration 250ms ease-in
  - Stack: multiple toasts stack vertically with 8px gap
  - Auto-dismiss: 5s, with thin progress bar at bottom draining left to right
  - Hover: pauses the progress bar

ACTION TOAST (with button):
  - Same as above but with an action button inline
  - Example: "Menu publié — Voir le menu →"

Show all 4 variants stacked, with and without actions, at different stages of the timer.
```

### 1.5 — Badges & Chips

```
Design badge and chip components for Menufique:

PLAN BADGES:
  FREE badge:
    - Background: #F2F0EE
    - Text: #756E6A, Inter 11px bold, uppercase, letter-spacing 0.08em
    - Padding: 3px 8px, radius: 6px

  PRO badge:
    - Background: linear-gradient(135deg, #FF6B35, #FFB347)
    - Text: white, Inter 11px bold, uppercase
    - Padding: 3px 10px, radius: 6px
    - Subtle shimmer animation: gradient moves right on hover
    - Optional: ✦ star icon before "PRO"

STATUS CHIPS:
  - "Publié": bg #ECFDF5, text #047857, dot left (green), radius full
  - "Brouillon": bg #F2F0EE, text #756E6A, dot left (gray), radius full
  - "Nouveau": bg #EFF6FF, text #1E40AF, radius full

TEMPLATE CHIP:
  - Small: bg #FFF4EE, text #E85520, border 1px #FFC9A0
  - Shows template name with small layout icon

ALLERGEN TAGS:
  - Tiny: 24px height, rounded full
  - Subtle: bg neutral-100, text neutral-600
  - Icon + text for each allergen
```

---

## 2. LANDING PAGE ( / )

```
Design a world-class SaaS landing page for "Menufique" — a French platform helping restaurant owners create professional menus in 5 minutes.

Reference aesthetic: Linear.app's clarity + Stripe's polish + warmth of French gastronomy.

═══════════════════════════════════════════
NAVIGATION BAR
═══════════════════════════════════════════

Height: 64px
Background: rgba(255,252,249,0.85), backdrop-filter: blur(16px) saturate(180%)
Border bottom: 1px solid rgba(230,227,223,0.6)
Position: sticky top 0, z-index 100

Left: "Menufique" wordmark — "Menu" in Inter 18px bold #1A1A2E + "fique" in Playfair Display 18px italic #FF6B35
Center: Nav links — "Fonctionnalités", "Templates", "Tarifs", "À propos" — Inter 14px medium, hover: #FF6B35 with smooth transition
Right: "Se connecter" (ghost button) + "Commencer gratuitement" (primary button, small size, shadow-primary)

Mobile: hamburger menu, full-screen overlay with links in large size, staggered fade-in animation

Scroll behavior: nav slightly shrinks (64px → 56px) and border becomes more visible on scroll.

═══════════════════════════════════════════
HERO SECTION
═══════════════════════════════════════════

Height: 100vh (min 700px)
Background:
  - Base: #FFFCF9
  - Radial gradient: from rgba(255,107,53,0.08) centered at 60% top, fading to transparent
  - Subtle grid pattern: 40px squares, 1px lines, rgba(255,107,53,0.05)
  - Floating orbs (blurred circles):
    * Top-right: 600px circle, rgba(255,107,53,0.06), blur 120px
    * Bottom-left: 400px circle, rgba(255,183,77,0.05), blur 80px

Layout: centered, max-width 800px

BADGE (above headline):
  Pill shape, border 1px solid rgba(255,107,53,0.25), bg rgba(255,107,53,0.06)
  "✦ Nouveau — Génération IA de menus disponible"
  Font: Inter 13px medium, color #E85520
  Subtle pulse animation on the ✦ icon
  Entry animation: fadeIn + scaleIn 600ms delay 200ms

HEADLINE:
  "Votre menu pro,
   en 5 minutes chrono"
  Font: Playfair Display, 72px (desktop) / 44px (mobile)
  Weight: 700
  Color: #1A1A2E
  "5 minutes" underlined with an organic orange brush stroke (SVG, animated draw-in on load)
  Line height: 1.1
  Entry: fadeIn + translateY 30px → 0, 700ms ease-out, delay 400ms

SUBHEADLINE:
  "Importez vos plats, choisissez un template, téléchargez votre menu PDF.
   Zéro compétence technique requise."
  Font: Inter 18px, color #8888AA, max-width 560px, centered
  Entry: fadeIn, delay 600ms

CTA GROUP:
  Primary: "Créer mon menu gratuitement →" — large primary button, shadow-primary-lg
  Secondary: "Voir un exemple" — ghost, with play icon (video preview trigger)
  Below: "✓ Gratuit · ✓ Sans carte bancaire · ✓ Menu en 5 min"
         Inter 12px, #8888AA, with checkmarks in primary color
  Entry: fadeIn + translateY 20px, delay 800ms

SOCIAL PROOF:
  Row of avatar circles (6 stacked, -8px overlap) + "Rejoignez 2 400+ restaurateurs"
  Stars: 5 orange stars ★★★★★ "4.9/5"
  Entry: fadeIn, delay 1000ms

HERO VISUAL:
  Right side (desktop) or below (mobile):
  A beautiful browser mockup / device frame showing the Menufique dashboard
  - Floating cards around it showing: PDF preview, QR code, menu card
  - These cards float with subtle CSS keyframe animation (translateY ±8px, 4s loop)
  - The main frame has a soft shadow: 0 40px 120px rgba(26,26,46,0.15)
  Entry: fadeIn + translateX(40px) → 0, delay 500ms, 800ms ease-out

═══════════════════════════════════════════
SOCIAL PROOF STRIP
═══════════════════════════════════════════

Below hero, full width
Background: #FFFFFF, border top + bottom 1px solid #E6E3DF
Content: "Ils nous font confiance" + logo strip of restaurants (grayscale, opacity 0.5, hover: color + opacity 1)
Auto-scrolling marquee: continuous scroll left, pausable on hover

═══════════════════════════════════════════
HOW IT WORKS — 3 STEPS
═══════════════════════════════════════════

Background: #FFFCF9
Title: "Un menu pro en 3 étapes" — Playfair Display 42px centered

3 Steps layout — large numbered cards in a row:

Step 1: "Saisissez vos plats"
  - Large "01" in Playfair Display 80px, very light (#F2F0EE), positioned behind
  - Icon: Edit3 in orange circle (56px)
  - Micro-illustration or UI screenshot
  - Short description

Step 2: "Choisissez votre template"
  - Same structure, "02"
  - Show 3 mini template thumbnails that animate in on scroll

Step 3: "Téléchargez votre menu PDF"
  - "03"
  - Show PDF + QR code floating

Arrow connectors between steps (dashed orange line, animated dash-offset)
Scroll trigger: each step animates in staggered (0ms, 200ms, 400ms delay)

═══════════════════════════════════════════
FEATURES SECTION
═══════════════════════════════════════════

Title: "Tout ce dont vous avez besoin" — Playfair Display 42px
Subtitle: Inter 17px, secondary color

Grid: 3 columns × 2 rows (6 feature cards)
Each card:
  - Icon in a gradient circle (48px, gradient: #FFF4EE → #FFE4D0)
  - Icon itself: Lucide, 24px, #FF6B35
  - Title: Inter 16px semibold
  - Description: Inter 14px, secondary color
  - Hover: card lifts, icon circle glows orange

Features:
  1. ⚡ "Création en 5 minutes" — "Importez, personnalisez, téléchargez"
  2. 🎨 "5 templates premium" — "Classique, Minimal, Bistrot, Moderne, Élégant"
  3. 🤖 "Design IA" — "Claude AI génère un design unique basé sur vos plats"
  4. 📱 "QR Code inclus" — "Page mobile pour vos clients, accessible partout"
  5. 📄 "PDF haute qualité" — "Prêt à imprimer chez votre imprimeur"
  6. 🌍 "Allergènes inclus" — "Conformité réglementaire automatique"

Scroll-triggered: cards animate in with staggered scaleIn + fadeIn

═══════════════════════════════════════════
TEMPLATES SHOWCASE
═══════════════════════════════════════════

Background: linear-gradient(180deg, #FFFCF9, #FFF8F2)
Title: "Des templates qui donnent faim"

Interactive carousel / grid showing 4 template previews:
  - Large: 3:4 ratio frames (like a real menu page)
  - Tabs above: "Classique · Minimal · Bistrot · IA Générative"
  - Active template: slightly enlarged, shadow-xl, centered
  - Transition between templates: smooth crossfade 300ms
  - Each preview is a real-looking menu with sample content

Below each template: badge (FREE or PRO), short description

CTA below: "Tous les templates →"

═══════════════════════════════════════════
PRICING SECTION
═══════════════════════════════════════════

Title: "Simple et transparent" — Playfair Display 42px
Toggle above: Monthly / Yearly (yearly = "2 mois offerts" badge)

Two pricing cards side by side:

FREE CARD:
  - White bg, neutral border
  - "Gratuit" — large, #1A1A2E
  - "0 €/mois" — Playfair Display 48px
  - Features list: 5 items with ✓ (green) and ✗ (gray)
  - CTA: "Commencer gratuitement" — outline button

PRO CARD:
  - Gradient border (2px, orange), warm bg tint, slightly elevated
  - "Recommandé" badge: orange gradient pill top-right
  - "9 €/mois" or "6,75 €/mois (facturé annuellement)"
  - Features: same list + MORE features with ✓ all green
  - CTA: "Démarrer l'essai Pro" — primary button large, shadow-primary
  - Below CTA: "Annulez à tout moment · Paiement sécurisé"
  - Subtle star decoration pattern in background

Yearly toggle: price updates with a flip animation

═══════════════════════════════════════════
TESTIMONIALS
═══════════════════════════════════════════

Background: #FFFFFF
Title: "Ce qu'ils en disent"

3 testimonial cards in a row:
  - Avatar (round, 48px)
  - Stars (5)
  - Quote in Playfair Display italic 17px
  - Name + Restaurant name below
  - Card: white, border, radius 16px, subtle hover lift

═══════════════════════════════════════════
FINAL CTA SECTION
═══════════════════════════════════════════

Background: #1A1A2E (dark, premium feel)
Or: large orange gradient area

Center-aligned:
  Title: "Votre menu pro vous attend" — Playfair Display 52px white
  Subtitle: Inter 18px, rgba(255,255,255,0.65)
  CTA: "Créer mon menu — c'est gratuit →" — primary button XL
  Below: avatar stack + "2 400+ restaurateurs nous font confiance"

Decorative: radial gradient orange glow behind the button

═══════════════════════════════════════════
FOOTER
═══════════════════════════════════════════

Background: #1A1A2E or #1C1A19
4 columns: Logo + tagline | Produit | Légal | Réseaux sociaux
Bottom bar: © 2026 Menufique · Made with ❤ en France
Subtle top border gradient (orange to transparent)
```

---

## 3. PAGES AUTH

### 3.1 — Login

```
Design a premium, conversion-optimized login page for Menufique.

LAYOUT:
  - Split screen (desktop): left 45% = branding panel, right 55% = form
  - Mobile: full screen form, logo at top

LEFT PANEL (desktop only):
  Background: linear-gradient(145deg, #1A1A2E 0%, #2D2040 50%, #1A2040 100%)
  + subtle noise texture overlay (SVG, 4% opacity)
  + radial orange glow (rgba(255,107,53,0.15), 600px, top-right)

  Content (centered):
  - Menufique logo (white wordmark) top-left
  - Large decorative element: floating menu card mockup with blur + glow
  - Quote/headline: "Votre menu pro en 5 minutes" Playfair Display 36px white
  - Below: 3 feature pills with checkmarks (small, white/semi-transparent)
  - Bottom: Avatar stack + "Rejoint par 2400+ restaurateurs"

  Floating elements: 2-3 abstract food emoji or icon elements, blurred, floating animation

RIGHT PANEL / FORM:
  Background: #FFFCF9
  Centered form, max-width 400px

  Top: "Menufique" small logo (mobile only) + "Bon retour 👋" heading (Playfair 28px)
  Subtext: "Pas encore de compte ? Créer un compte →" (small link)

  GOOGLE BUTTON (prominent):
    - Full width, height 48px
    - White bg, border 1.5px #E6E3DF, radius 12px
    - Google "G" logo left (20px) + "Continuer avec Google" Inter 15px medium
    - Hover: bg #F8F8F8, shadow-sm
    - This is the RECOMMENDED method — make it visually dominant

  DIVIDER: "ou" centered between two lines

  EMAIL INPUT: label "Adresse email", placeholder "vous@restaurant.fr"
  PASSWORD INPUT: label "Mot de passe", show/hide toggle icon, right side

  LINK "Mot de passe oublié ?" — right-aligned, small, #FF6B35

  SUBMIT BUTTON: "Se connecter" — full width, primary, height 48px, shadow-primary

  Below button: social proof line "Sécurisé · Données hébergées en Europe"

ANIMATION:
  - Form fields appear staggered: each field slides up + fades, 80ms delay each
  - On submit: button shows spinner, fields slightly dim
  - Error shake animation on failed login (horizontal shake 400ms)
  - Success: brief green flash, then router pushes to dashboard

ERROR STATE:
  - Red banner at top of form: "Email ou mot de passe incorrect"
  - Both fields get error border briefly
  - Message fades in with slideDown animation
```

### 3.2 — Register

```
Design the registration page for Menufique. Same split-screen layout as login.

LEFT PANEL: Same dark gradient branding panel as login.
  - Different illustration: shows the 3-step creation flow
  - Headline: "Votre premier menu en 5 minutes" Playfair 36px white

RIGHT PANEL:
  Top: "Créer mon compte" (Playfair 32px) + "Déjà un compte ? Se connecter →"

  GOOGLE BUTTON: Same as login, prominent, full width

  DIVIDER: "ou continuer avec votre email"

  FORM FIELDS (in order):
    1. Prénom — half width left
    2. Nom — half width right
    3. Adresse email — full width
    4. Mot de passe — full width, with strength indicator

  PASSWORD STRENGTH INDICATOR:
    - 4-segment bar below password field
    - Segments fill left to right with color: red → orange → yellow → green
    - Label: "Faible / Moyen / Fort / Très fort"
    - Smooth color transition as user types
    - Small checkmarks appear: "8+ caractères ✓", "Majuscule ✓", "Chiffre ✓"

  TERMS LINE: small checkbox + "J'accepte les Conditions d'utilisation et la Politique de confidentialité"

  SUBMIT: "Créer mon compte →" — full width, primary large

  BENEFITS BELOW FORM (small, subtle):
    "✓ Gratuit pour toujours · ✓ Aucune carte requise · ✓ Menu en 5 min"

ANIMATION:
  - Progress micro-animation: as user fills fields, a subtle progress indicator fills (5 steps)
  - Field validation icons appear inline (✓ green, ✗ red) as user types/blurs
```

### 3.3 — Forgot Password

```
Design a friendly, reassuring "forgot password" page for Menufique.

LAYOUT: Centered card on warm background (#FFFCF9)
Card: white, radius 20px, shadow-xl, max-width 440px, padding 40px

BACKGROUND:
  Subtle radial gradient: rgba(255,107,53,0.06) center
  Soft pattern: scattered small ✦ symbols, very light

CARD CONTENT:

ICON: Large centered icon — LockOpen, 48px, in a gradient circle (80px, #FFF4EE bg)
Animate: gentle bounce-in on load

TITLE: "Mot de passe oublié ?" Playfair Display 28px centered
SUBTITLE: "Entrez votre email — nous vous enverrons un lien pour réinitialiser votre mot de passe."
  Inter 14px, #8888AA, centered, max-width 340px

EMAIL INPUT: Full width, label "Votre adresse email"

SUBMIT BUTTON: "Envoyer le lien →" — primary, full width

BACK LINK: "← Retour à la connexion" — ghost, centered below

SUCCESS STATE (after submit):
  - Card content smoothly cross-fades
  - New content: ✉ icon (large, animated — envelope opening)
  - "Vérifiez votre boîte mail" Playfair 24px
  - "Un email a été envoyé à votre@email.fr. Cliquez sur le lien pour réinitialiser votre mot de passe."
  - "Vous n'avez rien reçu ? Renvoyer l'email" link
  - Transition: old content fades out, new content slides up
```

---

## 4. DASHBOARD ( /dashboard )

```
Design a beautiful, information-dense dashboard for Menufique restaurant owners.

═══════════════════════════════════════════
GLOBAL LAYOUT
═══════════════════════════════════════════

Top navigation bar: fixed, full width, height 60px
Content area: max-width 1100px, centered, padding 32px 24px

NAVIGATION BAR:
  Left: "Menufique" wordmark (small, 16px)
  Center: nothing (or breadcrumb if on sub-page)
  Right (items left to right):
    - Plan badge (FREE or PRO, animated shimmer if PRO)
    - "Passer Pro" button (if FREE): small, primary, with Crown icon, animated gradient
    - Separator
    - Paramètres icon button (Settings, ghost)
    - Avatar/initials circle (32px, gradient bg from username) with dropdown:
        → Mon profil
        → Paramètres
        → Déconnexion

  Dropdown menu: slides down, white card, shadow-lg, radius 12px

═══════════════════════════════════════════
DASHBOARD HEADER
═══════════════════════════════════════════

Left:
  "Bonjour, Marie 👋" — Playfair Display 32px (name from session)
  "Gérez vos menus depuis ici." — Inter 15px, tertiary color

Right:
  Primary "Nouveau menu" button with Plus icon (disabled + replaced by "Passer Pro" if FREE plan + 1 menu)

QUICK STATS STRIP (below header):
  3 stat cards in a row:
  - "1 menu créé" — with DocumentText icon
  - "23 plats" — with Fork icon
  - "QR Code actif" — with QrCode icon, green dot pulsing
  Each: small card, number large, label small, icon right side

═══════════════════════════════════════════
FREE PLAN BANNER (only for FREE users with 1 menu)
═══════════════════════════════════════════

Full-width, just below stats
Background: gradient from #FFF4EE to #FFF8F2, border 1px #FFC9A0
Left: Crown icon (orange) + "Passez à Pro — menus illimités, tous les templates, PDF sans watermark"
Right: "Voir les offres →" — primary button small
Dismissible: ✕ button, stays hidden for session
Entry animation: slideDown from above

═══════════════════════════════════════════
MENU LIST SECTION
═══════════════════════════════════════════

Section title: "Mes menus" — Inter 16px semibold + count badge

MENU CARDS GRID: 3 columns (desktop) / 2 columns (tablet) / 1 column (mobile)

MENU CARD:
  White bg, border, radius 16px, shadow-sm
  Hover: translateY -3px, shadow-lg, border becomes orange-tinted (rgba(255,107,53,0.2))
  Transition: 220ms ease

  Card header (40px height):
    Left: Template name chip (small, warm bg)
    Right: Status badge ("Publié" green / "Brouillon" gray)

  Card body:
    Menu name: Playfair Display 18px bold
    Restaurant name: Inter 13px, tertiary
    Stats row: "3 catégories · 17 plats" with icons

    Mini preview (80px height): shows first 2 dishes with prices
    Separator line (dashed, warm)

  Card footer:
    Left: "Il y a 2 heures" — timestamp, small gray
    Right: 3 quick action buttons (icon only):
      - Eye (voir public)
      - Pencil (éditer)
      - Download (PDF)
    These buttons appear on hover only (fade in), otherwise footer is minimal

  Active menu card: slightly different bg, primary accent on left border (3px)

EMPTY STATE (no menus yet):
  Centered in the grid area
  Large illustration: abstract menu/food illustration (warm tones)
  Title: "Votre premier menu vous attend" Playfair 24px
  Description: Inter 15px, secondary
  CTA: "Créer mon premier menu →" primary button large
  Below: "Ou importez depuis Deliveroo / Uber Eats" — small link
  Animation: illustration has subtle floating animation

═══════════════════════════════════════════
RESTAURANT BANNER (if not configured)
═══════════════════════════════════════════

Attention-grabbing card above menu list:
Orange left border (4px), warm bg, Store icon
"Configurez votre restaurant → " with chevron right
Hover: entire card translates right 2px

Show all states: with menus (2-3 cards), empty state, loading skeleton.
```

---

## 5. ÉDITEUR DE MENU ( /menus/[id] )

```
Design a professional split-view menu editor for Menufique — the most important and complex screen.

Think Notion editor meets Canva-lite. Left = editing, Right = live preview.

═══════════════════════════════════════════
EDITOR HEADER (sticky, 52px)
═══════════════════════════════════════════

Background: rgba(255,252,249,0.95), backdrop-blur 16px
Border bottom: 1px solid #E6E3DF
Full width, z-index 20

Left group:
  - Back arrow button (ArrowLeft, ghost, square)
  - Menu name inline editable (click to edit):
    * Display: Playfair Display 16px bold
    * Edit mode: input with underline only, focus ring orange
    * Auto-save indicator: tiny cloud icon, animates when saving

Center (desktop):
  - Template selector dropdown/button: shows current template name with layout icon

Right group (left to right):
  - "IA Design" button (PRO only): gradient bg with Sparkles icon, subtle shimmer animation
  - "Template" button: Palette icon
  - "PDF" button: Download icon
  - "Partager" button: Share icon (visible only when published)
  - SEPARATOR
  - "Dépublier" / "Publier" button: Globe icon (primary when unpublished, outline when published)

Status: small dot indicator — green pulse = published, gray = draft

═══════════════════════════════════════════
TEMPLATE SELECTOR (dropdown below header)
═══════════════════════════════════════════

Slides down from header, full width
Background: white, border bottom, shadow-md
Horizontal scrollable row of template chips

Each template chip:
  - 120px × 80px thumbnail preview (mini menu visual)
  - Name below, small badge "PRO" or "GRATUIT"
  - Selected: orange border 2px, shadow-primary
  - PRO template (for FREE user): slightly dimmed, lock icon overlay, hover shows "Passer Pro"
  - Transition: smooth border appear

═══════════════════════════════════════════
AI PANEL (slides down below header)
═══════════════════════════════════════════

Background: linear-gradient(135deg, #FFF8F2, #FFFCF9)
Border bottom: 1px solid rgba(255,107,53,0.15)
Padding: 20px 24px

Header: "Design IA" with Wand2 icon in gradient circle + tab switcher (Nouveau design / Importer)
Close button: top-right ✕

TABS CONTENT — "Nouveau design":
  6-column grid of option panels:
  1. Niveau (Simple / Détaillé / Luxe)
  2. Style (Auto / Élégant / Moderne / Rustique / Minimal / Coloré) — grid of icon buttons
  3. Couleurs (swatches)
  4. Images (Typographique / Emojis / Page de couverture)
  5. Pages (1/2/3/4 selector)
  6. Instructions (textarea, 500 chars)

Each option: small label uppercase tracking, option buttons with hover state
Selected option: orange border, white bg, shadow-sm

Generate button: "Générer le design →" — gradient primary, Sparkles icon, full width within panel

PROGRESS BAR (replaces AI panel during generation):
  Animated shimmer background (orange tones)
  Step indicator: "Analyse de vos plats..." → "Création du design..." → "Génération terminée !"
  Progress bar: thin (4px), orange gradient, smoothly fills
  Wand2 icon pulsing in a glowing circle

═══════════════════════════════════════════
SPLIT VIEW CONTENT (below header)
═══════════════════════════════════════════

Left half — EDITOR (scrollable):
  Background: #FFFCF9
  Padding: 20px 24px
  Max-width: content fits naturally

  CATEGORY CARDS (stacked vertically):
    Each category:
    - Header: drag handle (⋮⋮, appears on hover) + category name editable inline + dish count badge + collapse arrow + delete button
    - Background: white, border, radius 14px, shadow-xs
    - Expanded: shows dish list

    DISH ROWS (inside category):
      Each dish:
      - Drag handle left (⋮⋮)
      - Dish name (Inter 14px semibold)
      - Price (orange, tabular nums)
      - Edit (Pencil icon) + Delete (Trash icon) — appear on hover
      - Expand: shows full form with description, allergens, image

    DISH EDIT FORM (expanded inline):
      Smooth expand animation (max-height + opacity)
      Fields: Nom, Description, Prix, Allergènes (checkboxes grid), Photo
      Photo: upload zone or search button ("Chercher une photo")
      Save / Cancel buttons

  ADD CATEGORY BUTTON:
    Full width dashed border button, centered Plus icon + text
    Hover: dashed border becomes solid orange, bg warm tint

  JSON IMPORT: secondary small button, bottom

Left panel empty state:
  When no categories: large centered prompt with Sparkles illustration
  "Ajoutez votre première catégorie pour commencer"

Right half — PREVIEW (fixed height, non-scrollable):
  Background: #F2F0EE
  Header bar: "Aperçu" label left + "Rafraîchir" button right (RefreshCw)
  iframe filling the full height
  Subtle inner shadow at edges (inset 0 0 20px rgba(0,0,0,0.06))

  Loading state: skeleton shimmer matching an A4 page ratio

═══════════════════════════════════════════
MODALS
═══════════════════════════════════════════

SHARE BY EMAIL MODAL:
  Overlay: rgba(26,26,46,0.6) + backdrop blur 4px
  Card: white, 480px wide, radius 20px, shadow-xl

  Header: "Partager par email" + ✕ button
  Form: email input, send button
  Success: animated envelope icon, green checkmark, confetti micro-burst

SUCCESS/ERROR BANNERS (below header):
  Full width, 48px height
  Success: green bg, CheckCircle icon, message, dismissible
  Error: red bg, AlertCircle, message + ✕ button
  Both: slideDown animation from header

Show all states: editing, AI generating, AI success, AI error, share modal.
Mobile: stacked layout (tabs between edit/preview), bottom sheet for actions.
```

---

## 6. PARAMÈTRES RESTAURANT ( /settings/restaurant )

```
Design a clean restaurant settings page for Menufique.

LAYOUT: Centered, max-width 680px, single column

HEADER:
  Back button "← Retour au dashboard"
  "Paramètres du restaurant" — Playfair Display 28px
  "Ces informations apparaîtront sur vos menus." — subtitle

SECTION CARDS (each in a white card, radius 16px, border):

CARD 1 — Informations générales:
  Logo upload zone (top):
    - Circular drop zone, 120px diameter
    - Center: camera icon + "Ajouter un logo" if empty
    - Filled: shows logo with overlay on hover ("Changer")
    - PRO badge if upload requires Pro plan
    - Dashed border animates to solid on drag-over

  Fields:
    - Nom du restaurant (required)
    - Adresse
    - Téléphone
    - Email de contact
    - Site web

CARD 2 — Horaires d'ouverture:
  7 rows (lundi → dimanche)
  Each row: day name (fixed width) + time input + "Fermé" toggle
  Compact, clean table-like layout
  "Fermé" toggle: when ON, time input grays out and shows "Fermé"

CARD 3 — (future) Réseaux sociaux / personnalisation

SAVE BUTTON:
  Fixed bottom bar (mobile) or inline (desktop):
  "Enregistrer les modifications" — primary, full width on mobile
  Auto-save indicator: small "✓ Sauvegardé" message appears with fade after save

UNSAVED CHANGES INDICATOR:
  Small orange dot on the save button when changes are pending
  Browser leave confirmation if unsaved

LOGO UPLOAD PRO GATE:
  If FREE: logo zone shows a lock overlay
  Hover: tooltip "Disponible avec le plan Pro"
  Click: redirects to billing
```

---

## 7. FACTURATION ( /dashboard/billing )

```
Design a beautiful, conversion-optimized billing page for Menufique.

LAYOUT: Centered, max-width 700px

HEADER:
  "← Retour" link
  "Facturation" — Playfair Display 28px
  "Gérez votre abonnement." — subtitle

SUCCESS/CANCEL BANNERS:
  Full-width alert card at top
  Success: gradient green bg, CheckCircle, confetti micro-animation, "Bienvenue dans Menufique Pro !"
  Cancel: neutral warning, "Paiement annulé, votre plan n'a pas changé."

═══════════════════════════════════════════
CURRENT PLAN CARD
═══════════════════════════════════════════

White card, border, radius 16px

FREE PLAN STATE:
  Left: Zap icon (gray) + "Plan Gratuit" Inter 18px + "0 €/mois"
  Right: nothing (upgrade below)

PRO PLAN STATE:
  Left: Crown icon (orange gradient) + "Plan Pro" Playfair 20px + price
  Background: subtle warm gradient
  Border: gradient (orange) — like a "premium" feel
  Right: "Gérer l'abonnement →" — outline button
  Shows: "Prochain renouvellement : 15 mars 2026"

═══════════════════════════════════════════
UPGRADE SECTION (FREE users only)
═══════════════════════════════════════════

"Passez à Menufique Pro" — Playfair 24px with Crown icon

FEATURES LIST:
  Two-column checklist, each item:
    ✓ with orange circle bg + feature text
    Items: Menus illimités / Tous les templates / Logo personnalisé / PDF sans watermark / Support prioritaire / IA Design

TOGGLE: Mensuel / Annuel (with "2 mois offerts" badge on Annual)

PRICING CARDS (side by side):

MONTHLY CARD:
  White, border 2px solid #E6E3DF
  "9 €" large (Playfair 52px) + "/mois" regular
  "Facturé mensuellement"
  CTA: "Choisir Mensuel" — primary button

YEARLY CARD (recommended):
  Gradient border (orange), slightly elevated
  "6,75 €" — Playfair 52px — + "/mois"
  "Soit 81 €/an — économisez 27 €"
  "2 MOIS OFFERTS" — prominent badge
  CTA: "Choisir Annuel" — primary button, bigger

Both buttons → redirect to Stripe Checkout with loading spinner

Below: "Paiement sécurisé par Stripe · Annulez à tout moment · Données en Europe"
Stripe badge + padlock icon

Show both states: FREE (with upgrade section) and PRO (with management button).
```

---

## 8. PAGE MENU PUBLIC ( /m/[slug] )

```
Design a stunning, mobile-first public menu page for restaurant customers.
This is what customers see when they scan the QR code. No login required.

CRITICAL: Must look like a real, premium restaurant menu. Delightful to use on mobile.

═══════════════════════════════════════════
MOBILE LAYOUT (375px — primary design target)
═══════════════════════════════════════════

TOP BAR (subtle, 44px):
  Center: Restaurant name — Inter 15px semibold
  Right: Share icon button (native share or copy link)
  Background: white/transparent (becomes opaque on scroll)

HERO SECTION:
  If restaurant has a logo:
    - Circular logo (80px), shadow, centered
    - Restaurant name: Playfair Display 28px, centered
    - Address: Inter 13px, gray

  If no logo:
    - Just name (36px) + address

  Background: subtle warm gradient

NAVIGATION (sticky tabs — if multiple categories):
  Horizontal scrollable pills below hero
  Each category: pill chip
  Active: orange bg, white text
  Inactive: gray bg, text
  Smooth scroll to category on tap
  Pills slightly shrink/grow when switching (spring animation)

CATEGORY SECTIONS:
  Section header: category name (Playfair 20px) + dish count
  Subtle divider above

DISH CARDS:
  Each dish in the list:
  - Layout: if has image (right-side square, 80×80px) / if no image (text only)
  - Dish name: Inter 15px semibold
  - Description: Inter 13px, gray, 2-line clamp
  - Price: Inter 15px semibold, orange
  - Allergen icons: small row of colored dots/icons below

  Dish card: white, radius 12px, shadow-xs, padding 12px
  Tap: slight scale down (0.98), show full description if clamped

  If dish is unavailable: grayed out, "Non disponible" badge

CATEGORY DIVIDER:
  Bold section with category name + optional emoji, warm gradient bg

═══════════════════════════════════════════
FOOTER
═══════════════════════════════════════════

Allergen legend (if any allergens):
  Small accordion: "Allergènes présents dans ce menu ▾"
  Expands to show full legend

Opening hours (if configured):
  Small card with clock icon + today's hours highlighted

Contact info: phone, website buttons

"Créer votre menu avec Menufique →" — subtle footer link (watermark-free for PRO, shown for FREE)

═══════════════════════════════════════════
DESKTOP LAYOUT (1280px)
═══════════════════════════════════════════

Two-column:
  Left sidebar (280px): restaurant info, category nav (sticky)
  Right content: menu scrolls

Background: #FFF8F2 page bg, white cards

ANIMATIONS:
  - Dish cards: fade-in + slide-up on scroll enter (Intersection Observer)
  - Category nav: active item has animated underline
  - Smooth scroll between sections
  - Loading skeleton: shows A4 shaped blocks while loading

EMPTY WATERMARK STATE (FREE plan):
  Small "Créé avec Menufique" at very bottom, subtle, not intrusive

Show: mobile and desktop side by side, with realistic French restaurant content.
```

---

## 9. PAGES UTILITAIRES

### 9.1 — 404

```
Design a beautiful, on-brand 404 page for Menufique.

Background: #FFFCF9 with subtle warm gradient

Center content (max-width 500px, vertically centered):

Large "404" in Playfair Display:
  - Massive font (160px), very light color (#F2F0EE)
  - Positioned behind the main content (relative)

On top: 🍽️ emoji (large, 64px) with gentle floating animation

Title: "Table non trouvée" — Playfair Display 32px, #1A1A2E
Subtitle: "La page que vous cherchez n'existe pas ou a été déplacée."
          Inter 16px, #8888AA

Buttons:
  "← Retour à l'accueil" — primary
  "Ouvrir un menu exemple" — ghost

Small illustration below: empty plate with fork and knife, minimalist SVG style

Animation: the 404 number has a subtle pulse, the emoji floats
```

### 9.2 — Error Page

```
Design a friendly error/crash page for Menufique.

Same centered layout as 404 but:
  Icon: 🔧 or ⚡ emoji (large)
  Title: "Oups, quelque chose s'est mal passé"
  Subtitle: "Une erreur inattendue s'est produite. Notre équipe a été prévenue."

  "Réessayer" button (primary) — triggers error boundary reset
  "Retour à l'accueil" — ghost button

  Developer mode: collapsible error details box (monospace, red-tinted bg)

Color: slightly cooler than 404, error indication without being alarming
```

---

## 10. MICRO-INTERACTIONS & ANIMATIONS GLOBALES

```
Design a comprehensive micro-interaction and animation system for Menufique.
These apply across the entire application and define the "feel" of the product.

═══════════════════════════════════════════
PAGE TRANSITIONS
═══════════════════════════════════════════

Route change:
  - Exit: current page fades out (opacity 1→0.8, translateY 0→-8px, 200ms)
  - Enter: new page fades in (opacity 0→1, translateY 12px→0, 300ms ease-out)
  - Loading: thin orange progress bar at very top of viewport (NProgress style)

═══════════════════════════════════════════
SCROLL ANIMATIONS
═══════════════════════════════════════════

Landing page only (not app):
  Elements use IntersectionObserver
  Default: fadeIn + translateY 24px → 0, duration 500ms, ease-out
  Stagger: each child 100ms delay
  Threshold: 0.1 (triggers early)
  Once: only animate on first viewport enter

═══════════════════════════════════════════
BUTTON INTERACTIONS
═══════════════════════════════════════════

All primary buttons:
  - Hover: translateY -1.5px, shadow intensifies
  - Active (click): translateY 0.5px, brief scale 0.98
  - Click ripple: expanding circle from click point, rgba(255,255,255,0.3)

Destructive buttons (delete):
  - Require hold or confirm
  - Red fill animation on hold: border fills with red, 1.5s, then confirms

═══════════════════════════════════════════
FORM INTERACTIONS
═══════════════════════════════════════════

Input focus:
  - Border transitions 150ms: neutral → orange
  - Subtle glow: box-shadow 0 0 0 4px rgba(255,107,53,0.10)
  - Label slides up and shrinks (floating label variant)
  - Icon inside (if any) shifts to orange

Input validation (on blur):
  - Valid: green checkmark slides in from right, border briefly flashes green
  - Invalid: red ✗ with shake animation (horizontal, 3 cycles, 300ms total)
  - Error message: slideDown + fadeIn, 200ms

Form submit:
  - Button transforms: text fades, spinner appears (scale-in from center)
  - Inputs: opacity 0.7, pointer-events none
  - Success: button briefly turns green with checkmark, then redirects

═══════════════════════════════════════════
DRAG & DROP (editor)
═══════════════════════════════════════════

Drag handle appears: opacity 0→1, translateX -4px→0 on hover of draggable item
Dragging item:
  - Original: placeholder ghost (dashed border, same size)
  - Dragged copy: elevated shadow, slight rotation (2deg), opacity 0.95
Drop target highlight:
  - Blue/orange line appears between items, 2px, animated pulse
On drop: spring animation to final position

═══════════════════════════════════════════
LOADING STATES
═══════════════════════════════════════════

Skeleton screens (ALWAYS use instead of spinners for content):
  - Same layout as actual content but gray rounded rectangles
  - Shimmer animation: gradient moves right, 1.5s loop, ease-in-out
  - Warm-tinted skeleton: rgba(255,107,53,0.06) shimmer instead of cold gray

Inline loaders (for buttons, small areas):
  - 3 dots bouncing (staggered, 300ms each)
  - Or spinning circle, 20px, primary color, 2px stroke

Full page loading:
  - Logo centered, subtle pulse + orange gradient below it
  - NProgress bar at top

═══════════════════════════════════════════
SUCCESS MICRO-MOMENTS
═══════════════════════════════════════════

Menu saved: small "Sauvegardé ✓" toast, disappears after 3s
Menu published: confetti burst (50 particles, orange/yellow, falls from button)
Upgrade to Pro: full-screen celebration: confetti + "Bienvenue Pro !" modal with Crown animation
PDF downloaded: download progress shimmer on button, then "Téléchargé !" brief state

═══════════════════════════════════════════
EMPTY STATES
═══════════════════════════════════════════

Each empty state should:
  - Have a unique warm illustration (SVG, simple, matches the context)
  - Floating animation on the illustration (subtle, 4s loop)
  - Clear headline + description
  - 1-2 action CTAs
  - Never feel like a dead end

Dashboard empty: chef's hat illustration + "Créez votre premier menu"
Category empty: fork illustration + "Ajoutez votre premier plat"
No search results: magnifier illustration + "Aucun résultat pour '...'"

Show comprehensive animation spec sheet: timing curves visualized,
all transition types demonstrated, before/after states.
```

---

## INSTRUCTIONS FINALES POUR PENCIL.DEV

```
Global constraints applying to every design:

1. LANGUE: Tous les textes UI en français (naturel, pas de traduction littérale)
2. ICONS: Lucide Icons library uniquement (outline style, stroke 1.5px)
3. FONTS: Playfair Display (headings) + Inter (body) via Google Fonts
4. RESPONSIVE: Toujours designer mobile-first (375px) puis desktop (1280px)
5. ACCESSIBILITÉ: Contraste WCAG AA minimum sur tous les textes
6. COHÉRENCE: Même radius, shadows, transitions partout
7. CHALEUR: Pas de blanc pur (#FFFFFF) comme fond principal — toujours #FFFCF9
8. DENSITÉ: Mobile = aéré / Desktop = plus dense mais jamais surchargé
9. ANIMATIONS: prefers-reduced-motion doit désactiver toutes les animations non-essentielles
10. MARQUE: L'orange #FF6B35 est SACRÉ — ne jamais le remplacer, juste l'utiliser avec modération

Priorité d'implémentation:
  1. Design System (tokens, composants)
  2. Pages Auth (login, register)
  3. Dashboard
  4. Éditeur de menu
  5. Landing page
  6. Menu public
  7. Billing
  8. Pages utilitaires
```
