"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Zap, Crown } from "lucide-react";
import { Suspense } from "react";

const PRO_FEATURES = [
  "Menus illimités",
  "Tous les templates premium",
  "Logo personnalisé",
  "Couleurs et polices personnalisées",
  "PDF sans watermark",
  "Support prioritaire",
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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Facturation</h1>
        <p className="mt-1 text-muted">Gérez votre abonnement Menufique.</p>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg p-4 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Plan actuel */}
      <div className="mb-6 rounded-xl border border-border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Plan actuel</p>
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
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {portalLoading ? "Chargement..." : "Gérer l'abonnement"}
            </button>
          )}
        </div>
      </div>

      {/* Upgrade — affiché uniquement si FREE */}
      {plan === "FREE" && (
        <div className="rounded-xl border-2 border-primary bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Crown size={22} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">Passer à Pro</h2>
          </div>

          <ul className="mb-6 space-y-2">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                <Check size={16} className="shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => handleCheckout(priceMonthly)}
              disabled={!!checkoutLoading}
              className="flex flex-col items-center rounded-lg bg-primary px-6 py-4 font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              <span className="text-lg font-bold">9 €</span>
              <span className="text-sm opacity-90">par mois</span>
              {checkoutLoading === priceMonthly && (
                <span className="mt-1 text-xs opacity-75">Redirection...</span>
              )}
            </button>

            <button
              onClick={() => handleCheckout(priceYearly)}
              disabled={!!checkoutLoading}
              className="flex flex-col items-center rounded-lg border-2 border-primary px-6 py-4 font-medium text-primary transition-colors hover:bg-primary-light disabled:opacity-50"
            >
              <span className="text-lg font-bold">81 €</span>
              <span className="text-sm">par an</span>
              <span className="mt-1 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                2 mois offerts
              </span>
              {checkoutLoading === priceYearly && (
                <span className="mt-1 text-xs text-primary opacity-75">Redirection...</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BillingClient(props: Props) {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-2xl animate-pulse space-y-4 p-8">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-32 rounded-xl bg-gray-200" />
        <div className="h-64 rounded-xl bg-gray-200" />
      </div>
    }>
      <BillingContent {...props} />
    </Suspense>
  );
}
