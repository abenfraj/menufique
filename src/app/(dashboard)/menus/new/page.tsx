"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewMenuPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      // Redirect to the editor
      router.push(`/menus/${data.data.id}`);
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-4 px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-muted hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Nouveau menu</CardTitle>
            <CardDescription>
              Donnez un nom à votre menu pour commencer
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
                id="name"
                label="Nom du menu"
                placeholder="Menu du midi, Carte des vins..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Créer le menu
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
