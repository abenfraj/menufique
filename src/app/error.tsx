"use client";

import { useEffect } from "react";
import { UtensilsCrossed, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
          <UtensilsCrossed size={18} />
        </div>
        <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-foreground">
          Menufique
        </span>
      </Link>

      {/* Icon */}
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-error-light">
        <span className="text-4xl">⚠️</span>
      </div>

      <h1 className="text-2xl font-bold text-foreground">
        Une erreur est survenue
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
        Quelque chose s&apos;est mal passé. Notre équipe a été notifiée et
        travaille à résoudre le problème.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-white"
        >
          <Home size={15} />
          Accueil
        </Link>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          <RefreshCw size={15} />
          Réessayer
        </button>
      </div>

      {process.env.NODE_ENV === "development" && (
        <details className="mt-10 max-w-lg text-left">
          <summary className="cursor-pointer text-xs font-medium text-muted hover:text-foreground">
            Détails (dev uniquement)
          </summary>
          <pre className="mt-2 overflow-auto rounded-xl bg-gray-100 p-4 text-xs text-error">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
    </div>
  );
}
