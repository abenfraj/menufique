"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Email envoyé !</CardTitle>
          <CardDescription>
            Si un compte existe avec l&apos;adresse <strong>{email}</strong>,
            vous recevrez un lien de réinitialisation dans quelques minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-center text-sm text-muted">
            Pensez à vérifier votre dossier spam si vous ne le trouvez pas.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft size={16} className="mr-2" />
              Retour à la connexion
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Mot de passe oublié</CardTitle>
        <CardDescription>
          Entrez votre email pour recevoir un lien de réinitialisation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Envoyer le lien de réinitialisation
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link
            href="/login"
            className="flex items-center justify-center gap-1 font-medium text-primary hover:underline"
          >
            <ArrowLeft size={14} />
            Retour à la connexion
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
