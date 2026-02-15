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
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: Clock,
    title: "5 minutes chrono",
    description:
      "Saisissez vos plats, choisissez un template, et votre menu est prêt.",
  },
  {
    icon: FileText,
    title: "PDF haute qualité",
    description:
      "Générez un menu PDF prêt à imprimer, format A4, qualité professionnelle.",
  },
  {
    icon: QrCode,
    title: "QR Code inclus",
    description:
      "Chaque menu a sa page web mobile accessible via un QR code unique.",
  },
  {
    icon: Palette,
    title: "Templates élégants",
    description:
      "Des designs professionnels adaptés à tous les types de restaurants.",
  },
  {
    icon: Zap,
    title: "Mise à jour instantanée",
    description:
      "Modifiez vos plats et prix en temps réel, le menu se met à jour automatiquement.",
  },
  {
    icon: Shield,
    title: "14 allergènes EU",
    description:
      "Gestion intégrée des allergènes selon la réglementation européenne.",
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
    text: "Le template Elegant est magnifique. Exactement ce qu'il me fallait.",
    stars: 5,
  },
];

const PRICING = [
  {
    name: "Gratuit",
    price: "0€",
    period: "pour toujours",
    features: [
      "1 menu",
      "2 templates de base",
      "PDF avec filigrane",
      "QR Code",
      "14 allergènes",
    ],
    cta: "Commencer gratuitement",
    href: "/register",
    popular: false,
  },
  {
    name: "Pro",
    price: "9€",
    period: "/mois",
    features: [
      "Menus illimités",
      "Tous les templates",
      "PDF sans filigrane",
      "QR Code",
      "Logo personnalisé",
      "Couleurs et polices",
      "Support prioritaire",
    ],
    cta: "Essayer Pro",
    href: "/register",
    popular: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <UtensilsCrossed size={18} />
            </div>
            <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-foreground">
              Menufique
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="#pricing"
              className="hidden text-sm text-muted hover:text-foreground sm:block"
            >
              Tarifs
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-foreground hover:text-primary"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="hidden h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:inline-flex"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 py-20 text-center sm:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-1.5 text-sm font-medium text-primary">
            <Zap size={14} />
            Créez votre menu en 5 minutes
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl">
            Le menu de votre restaurant,{" "}
            <span className="text-primary">simplement professionnel</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            Saisissez vos plats, choisissez un template, et obtenez un menu PDF
            prêt à imprimer + une page web mobile avec QR code. Gratuit.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-8 text-base font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Créer mon menu gratuitement
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#features"
              className="inline-flex h-12 items-center rounded-lg border border-border px-8 text-base font-medium text-foreground transition-colors hover:bg-primary-light"
            >
              Voir les fonctionnalités
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted">
            Aucune carte bancaire requise. Prêt en 5 minutes.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
              Tout ce qu&apos;il faut pour votre menu
            </h2>
            <p className="mt-3 text-muted">
              Simple, rapide, professionnel. Pas besoin d&apos;être designer.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light">
                  <feature.icon size={24} className="text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
              Comment ça marche ?
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Ajoutez vos plats",
                desc: "Catégories, noms, prix, allergènes. C'est tout.",
              },
              {
                step: "2",
                title: "Choisissez un template",
                desc: "Classic, Minimal, Bistrot... Trouvez votre style.",
              },
              {
                step: "3",
                title: "Téléchargez & partagez",
                desc: "PDF prêt à imprimer + QR code pour le menu digital.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
              Ils utilisent Menufique
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-xl border border-border p-6">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="mb-4 text-sm text-foreground">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
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
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
              Des tarifs simples
            </h2>
            <p className="mt-3 text-muted">
              Commencez gratuitement, passez Pro quand vous en avez besoin.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border-2 p-6 ${
                  plan.popular
                    ? "border-primary bg-white shadow-lg"
                    : "border-border bg-white"
                }`}
              >
                {plan.popular && (
                  <span className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                    Populaire
                  </span>
                )}
                <h3 className="text-xl font-bold text-foreground">
                  {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check size={16} className="shrink-0 text-green-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`mt-6 flex h-11 items-center justify-center rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? "bg-primary text-white hover:bg-primary-hover"
                      : "border border-border text-foreground hover:bg-primary-light"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary px-4 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
            Prêt à créer votre menu ?
          </h2>
          <p className="mt-3 opacity-80">
            Rejoignez les restaurateurs qui font confiance à Menufique.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-white px-8 font-medium text-primary transition-colors hover:bg-gray-100"
          >
            Commencer gratuitement
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
              <UtensilsCrossed size={14} />
            </div>
            <span className="font-[family-name:var(--font-playfair)] font-bold text-foreground">
              Menufique
            </span>
          </div>
          <p className="text-sm text-muted">
            &copy; 2026 Menufique. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
