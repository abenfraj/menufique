"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Crown, ArrowLeft, Zap, Star, Shield, Loader2 } from "lucide-react";
import Link from "next/link";

const PRO_FEATURES = [
  { icon: "∞", text: "Menus illimités" },
  { icon: "✦", text: "Tous les templates + IA Design" },
  { icon: "⬇", text: "PDF sans filigrane" },
  { icon: "🖼", text: "Logo personnalisé" },
  { icon: "🎨", text: "Couleurs et polices personnalisées" },
  { icon: "🛵", text: "Import Deliveroo / Uber Eats" },
  { icon: "⚡", text: "Support prioritaire" },
];

interface Props {
  plan: "FREE" | "PRO";
  hasCustomer: boolean;
  priceMonthly: string;
  priceYearly: string;
}

function BillingContent({ plan, hasCustomer, priceMonthly, priceYearly }: Props) {
  const searchParams = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (searchParams.get("success")) {
      setMessage({ type: "success", text: "Bienvenue dans Menufique Pro ! Votre abonnement est actif." });
    } else if (searchParams.get("canceled")) {
      setMessage({ type: "error", text: "Paiement annulé. Votre plan n'a pas changé." });
    }
  }, [searchParams]);

  async function handleCheckout(priceId: string) {
    setCheckoutLoading(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: "error", text: data.error ?? "Erreur inattendue" });
        setCheckoutLoading(null);
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau, réessayez." });
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: "error", text: data.error ?? "Erreur inattendue" });
        setPortalLoading(false);
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau, réessayez." });
      setPortalLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-4 px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Tableau de bord
          </Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-sm font-semibold text-foreground">Facturation</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "bg-success-light text-success"
                : "bg-error-light text-error"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Current plan */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-border bg-white px-5 py-4 shadow-card">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Plan actuel</p>
            <div className="mt-1 flex items-center gap-2">
              {plan === "PRO" ? (
                <Crown size={20} className="text-primary" />
              ) : (
                <Zap size={20} className="text-muted" />
              )}
              <span className="text-xl font-bold text-foreground">
                {plan === "PRO" ? "Pro" : "Gratuit"}
              </span>
            </div>
          </div>
          {plan === "PRO" && hasCustomer && (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-50"
            >
              {portalLoading && <Loader2 size={14} className="animate-spin" />}
              {portalLoading ? "Chargement..." : "Gérer l'abonnement"}
            </button>
          )}
        </div>

        {/* Pro active state */}
        {plan === "PRO" && (
          <div className="rounded-2xl border border-primary/20 bg-primary-light px-6 py-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
              <Crown size={28} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Vous êtes Pro !</h2>
            <p className="mt-2 text-sm text-muted">
              Profitez de tous les avantages Menufique Pro sans limitation.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 text-left sm:grid-cols-3">
              {PRO_FEATURES.map((f) => (
                <div key={f.text} className="flex items-center gap-2 text-sm text-foreground">
                  <Check size={14} className="shrink-0 text-success" />
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade section */}
        {plan === "FREE" && (
          <div className="space-y-5">
            {/* Value headline */}
            <div className="rounded-2xl bg-sidebar px-6 py-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
                <Crown size={28} />
              </div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
                Passez à Pro
              </h2>
              <p className="mt-2 text-sm text-sidebar-muted">
                Débloquez toutes les fonctionnalités pour créer des menus professionnels illimités.
              </p>

              {/* Reviews */}
              <div className="mt-4 flex items-center justify-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-1 text-xs text-sidebar-muted">4,9/5 · +500 restaurants</span>
              </div>
            </div>

            {/* Features */}
            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Tout ce que vous obtenez :</h3>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {PRO_FEATURES.map((f) => (
                  <div key={f.text} className="flex items-center gap-2.5 text-sm text-foreground">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-light">
                      <Check size={12} className="text-success" />
                    </div>
                    {f.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Monthly */}
              <button
                onClick={() => handleCheckout(priceMonthly)}
                disabled={!!checkoutLoading}
                className="group relative flex flex-col items-center rounded-2xl border-2 border-border bg-white px-6 py-6 text-center transition-all hover:border-primary/40 hover:shadow-md disabled:opacity-50"
              >
                {checkoutLoading === priceMonthly && (
                  <Loader2 size={16} className="absolute right-4 top-4 animate-spin text-primary" />
                )}
                <span className="text-xs font-semibold uppercase tracking-widest text-muted">Mensuel</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">9 €</span>
                  <span className="text-muted">/mois</span>
                </div>
                <span className="mt-4 flex h-10 w-full items-center justify-center rounded-xl border-2 border-primary text-sm font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  Choisir mensuel
                </span>
              </button>

              {/* Yearly — recommended */}
              <button
                onClick={() => handleCheckout(priceYearly)}
                disabled={!!checkoutLoading}
                className="group relative flex flex-col items-center rounded-2xl border-2 border-primary bg-white px-6 py-6 text-center shadow-md transition-all hover:shadow-lg disabled:opacity-50"
              >
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                  2 mois offerts
                </span>
                {checkoutLoading === priceYearly && (
                  <Loader2 size={16} className="absolute right-4 top-4 animate-spin text-primary" />
                )}
                <span className="text-xs font-semibold uppercase tracking-widest text-muted">Annuel</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">81 €</span>
                  <span className="text-muted">/an</span>
                </div>
                <span className="mt-1 text-xs text-success">= 6,75 €/mois</span>
                <span className="mt-3 flex h-10 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white transition-colors group-hover:bg-primary-hover">
                  Choisir annuel
                </span>
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <Shield size={13} className="text-success" />
                Paiement sécurisé Stripe
              </span>
              <span>·</span>
              <span>Annulez à tout moment</span>
              <span>·</span>
              <span>Sans engagement</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BillingClient(props: Props) {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-3xl animate-pulse space-y-4 p-8">
        <div className="h-6 w-48 rounded-xl bg-gray-200" />
        <div className="h-24 rounded-2xl bg-gray-200" />
        <div className="h-64 rounded-2xl bg-gray-200" />
        <div className="h-48 rounded-2xl bg-gray-200" />
      </div>
    }>
      <BillingContent {...props} />
    </Suspense>
  );
}
