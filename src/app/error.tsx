"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to Sentry when available
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF8F2] px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle size={40} className="text-red-500" />
      </div>
      <h1 className="mb-3 text-2xl font-bold text-foreground">
        Une erreur est survenue
      </h1>
      <p className="mb-8 max-w-md text-base text-muted">
        Quelque chose s&apos;est mal passé. Notre équipe a été notifiée et travaille à résoudre le problème.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.location.href = "/"}>
          Retour à l&apos;accueil
        </Button>
        <Button onClick={reset}>
          Réessayer
        </Button>
      </div>
      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 max-w-lg text-left">
          <summary className="cursor-pointer text-sm font-medium text-muted hover:text-foreground">
            Détails de l&apos;erreur (dev uniquement)
          </summary>
          <pre className="mt-2 rounded-lg bg-gray-100 p-3 text-xs text-red-700 overflow-auto">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
    </div>
  );
}
