import {
  UtensilsCrossed,
  Clock,
  FileText,
  QrCode,
  Palette,
  Zap,
  Shield,
  Star,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: Clock,
    title: "5 minutes chrono",
    description: "Saisissez vos plats, choisissez un template, et votre menu est prêt.",
  },
  {
    icon: FileText,
    title: "PDF haute qualité",
    description: "Générez un menu PDF prêt à imprimer, format A4, qualité professionnelle.",
  },
  {
    icon: QrCode,
    title: "QR Code inclus",
    description: "Chaque menu a sa page web mobile accessible via un QR code unique.",
  },
  {
    icon: Sparkles,
    title: "Design par IA",
    description: "Notre IA génère un design unique adapté à votre restaurant en quelques secondes.",
  },
  {
    icon: Zap,
    title: "Mise à jour instantanée",
    description: "Modifiez vos plats et prix en temps réel, le menu se met à jour automatiquement.",
  },
  {
    icon: Shield,
    title: "14 allergènes EU",
    description: "Gestion intégrée des allergènes selon la réglementation européenne.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sophie L.",
    role: "Bistrot Le Coin, Paris",
    text: "J'ai créé mon menu en 3 minutes. Mes clients adorent scanner le QR code !",
    stars: 5,
  },
  {
    name: "Karim M.",
    role: "Food Truck K&Co",
    text: "Enfin un outil simple pour mettre à jour ma carte chaque semaine.",
    stars: 5,
  },
  {
    name: "Marie-Claire D.",
    role: "Restaurant gastronomique",
    text: "Le design IA est magnifique. Exactement ce qu'il me fallait.",
    stars: 5,
  },
];

const STEPS = [
  {
    step: "01",
    title: "Ajoutez vos plats",
    desc: "Catégories, noms, prix, allergènes. Simple comme bonjour.",
    color: "bg-primary text-white",
  },
  {
    step: "02",
    title: "Choisissez un design",
    desc: "L'IA génère un design personnalisé ou choisissez parmi nos templates.",
    color: "bg-sidebar text-white",
  },
  {
    step: "03",
    title: "Téléchargez & partagez",
    desc: "PDF prêt à imprimer + QR code pour le menu digital.",
    color: "bg-success text-white",
  },
];

const PRICING = [
  {
    name: "Gratuit",
    price: "0€",
    period: "pour toujours",
    description: "Pour découvrir Menufique",
    features: ["1 menu", "2 templates de base", "PDF avec filigrane", "QR Code", "14 allergènes"],
    cta: "Commencer gratuitement",
    href: "/register",
    popular: false,
  },
  {
    name: "Pro",
    price: "9€",
    period: "/mois",
    description: "Pour les restaurateurs sérieux",
    features: [
      "Menus illimités",
      "Tous les templates + IA",
      "PDF sans filigrane",
      "Logo personnalisé",
      "Couleurs et polices",
      "Import Deliveroo / Uber Eats",
      "Support prioritaire",
    ],
    cta: "Essayer Pro",
    href: "/register",
    popular: true,
  },
];

/* ------------------------------------------------------------------ */
/* Mock menu card — pure CSS, illustrates the product in the hero     */
/* ------------------------------------------------------------------ */
function MenuMockup() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* Shadow card behind */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl bg-primary/10" />
      <div className="relative rounded-3xl border border-border bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <UtensilsCrossed size={20} />
          </div>
          <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-foreground">
            Le Bistrot du Coin
          </h3>
          <p className="text-xs text-muted">Paris 6ème</p>
        </div>

        {/* Divider */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Entrées
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Items */}
        {[
          { name: "Soupe à l'oignon", price: "9,50 €" },
          { name: "Tartare de saumon", price: "14,00 €" },
          { name: "Foie gras maison", price: "18,00 €" },
        ].map((item) => (
          <div key={item.name} className="mb-2 flex items-baseline justify-between">
            <span className="text-sm text-foreground">{item.name}</span>
            <span className="text-sm font-semibold text-primary">{item.price}</span>
          </div>
        ))}

        {/* Badge */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-surface px-3 py-2">
          <span className="text-xs text-muted">Généré par IA</span>
          <span className="flex items-center gap-1 text-xs font-medium text-primary">
            <Sparkles size={10} />
            Menufique
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <UtensilsCrossed size={18} />
            </div>
            <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-foreground">
              Menufique
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="#pricing"
              className="hidden text-sm font-medium text-muted transition-colors hover:text-foreground sm:block"
            >
              Tarifs
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="hidden h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover sm:inline-flex"
            >
              Commencer <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:pb-24 sm:pt-28">
        {/* Background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/6 blur-3xl"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-light px-4 py-1.5 text-sm font-semibold text-primary">
              <Sparkles size={14} />
              IA incluse · Gratuit pour démarrer
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl lg:text-6xl">
              Le menu de votre restaurant,{" "}
              <span className="text-primary">simplement professionnel</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
              Saisissez vos plats, l&apos;IA génère un design magnifique. Obtenez un PDF
              prêt à imprimer et une page web avec QR code. En 5 minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Créer mon menu gratuitement
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#features"
                className="inline-flex h-12 items-center rounded-xl border-2 border-border px-7 text-base font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-white"
              >
                En savoir plus
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">
              ✓ Aucune carte bancaire · ✓ Prêt en 5 minutes · ✓ Gratuit à vie
            </p>
          </div>

          {/* Product mockup */}
          <div className="flex justify-center lg:justify-end">
            <MenuMockup />
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <div className="border-y border-border bg-white py-5">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </span>
              4,9 / 5
            </span>
            <span>·</span>
            <span>+500 restaurants</span>
            <span>·</span>
            <span>PDF qualité impression</span>
            <span>·</span>
            <span>100% français</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground sm:text-4xl">
              Tout ce qu&apos;il vous faut
            </h2>
            <p className="mt-3 text-muted">
              Simple, rapide, professionnel. Pas besoin d&apos;être designer ou développeur.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-white p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light transition-colors group-hover:bg-primary">
                  <feature.icon
                    size={22}
                    className="text-primary transition-colors group-hover:text-white"
                  />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-sidebar px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white sm:text-4xl">
              Comment ça marche ?
            </h2>
            <p className="mt-3 text-sidebar-muted">Trois étapes, c&apos;est tout.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((item) => (
              <div key={item.step} className="rounded-2xl border border-sidebar-border bg-white/5 p-6">
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-base font-black ${item.color}`}>
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-sidebar-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground sm:text-4xl">
              Ils utilisent Menufique
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-border p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-foreground">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground sm:text-4xl">
              Des tarifs simples
            </h2>
            <p className="mt-3 text-muted">
              Commencez gratuitement, passez Pro quand vous êtes prêt.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl border-2 p-7 ${
                  plan.popular
                    ? "border-primary bg-white shadow-xl"
                    : "border-border bg-white"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">
                    ★ Populaire
                  </span>
                )}
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  {plan.description}
                </p>
                <h3 className="mt-1 text-2xl font-bold text-foreground">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">{plan.price}</span>
                  <span className="text-muted">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check size={15} className="shrink-0 text-success" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`mt-7 flex h-11 items-center justify-center rounded-xl font-semibold transition-colors ${
                    plan.popular
                      ? "bg-primary text-white hover:bg-primary-hover"
                      : "border-2 border-border text-foreground hover:border-primary/40 hover:bg-primary-light"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="relative overflow-hidden bg-primary px-4 py-16 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white sm:text-4xl">
            Prêt à créer votre menu ?
          </h2>
          <p className="mt-3 text-base text-white/80">
            Rejoignez les restaurateurs qui font confiance à Menufique.
          </p>
          <Link
            href="/register"
            className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 font-semibold text-primary transition-colors hover:bg-gray-50"
          >
            Commencer gratuitement
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
              <UtensilsCrossed size={14} />
            </div>
            <span className="font-[family-name:var(--font-playfair)] font-bold text-foreground">
              Menufique
            </span>
          </Link>
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/login" className="hover:text-foreground">Connexion</Link>
            <Link href="/register" className="hover:text-foreground">Inscription</Link>
            <Link href="#pricing" className="hover:text-foreground">Tarifs</Link>
          </div>
          <p className="text-sm text-muted">&copy; 2026 Menufique. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
