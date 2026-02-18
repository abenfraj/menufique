"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowLeft, Save, Store } from "lucide-react";
import Link from "next/link";

const DAYS = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
];

export default function RestaurantSettingsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [openingHours, setOpeningHours] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const fetchRestaurant = useCallback(async () => {
    try {
      const res = await fetch("/api/restaurant");
      if (res.ok) {
        const { data } = await res.json();
        setName(data.name || "");
        setAddress(data.address || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setWebsite(data.website || "");
        setOpeningHours(
          (data.openingHours as Record<string, string>) || {}
        );
      }
    } catch {
      // No restaurant yet — that's fine
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchRestaurant();
    }
  }, [status, router, fetchRestaurant]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/restaurant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address: address || undefined,
          phone: phone || undefined,
          email: email || undefined,
          website: website || undefined,
          openingHours:
            Object.keys(openingHours).length > 0 ? openingHours : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess("Restaurant sauvegardé avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  function updateHours(day: string, value: string) {
    setOpeningHours((prev) => {
      const next = { ...prev };
      if (value) {
        next[day] = value;
      } else {
        delete next[day];
      }
      return next;
    });
  }

  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-sm font-semibold text-foreground">Mon restaurant</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-error-light px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-success-light px-4 py-3 text-sm text-success">
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info de base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Store size={20} />
                Informations générales
              </CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur votre menu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                id="name"
                label="Nom du restaurant *"
                placeholder="Le Bistrot du Coin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                id="address"
                label="Adresse"
                placeholder="12 rue de la Paix, 75002 Paris"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="phone"
                  label="Téléphone"
                  type="tel"
                  placeholder="01 23 45 67 89"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="contact@restaurant.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Input
                id="website"
                label="Site web"
                type="url"
                placeholder="https://www.monrestaurant.fr"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Horaires */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Horaires d&apos;ouverture</CardTitle>
              <CardDescription>
                Laissez vide les jours de fermeture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {DAYS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-4">
                  <label
                    htmlFor={`hours-${key}`}
                    className="w-24 text-sm font-medium text-foreground"
                  >
                    {label}
                  </label>
                  <input
                    id={`hours-${key}`}
                    type="text"
                    placeholder="12h-14h, 19h-22h"
                    value={openingHours[key] || ""}
                    onChange={(e) => updateHours(key, e.target.value)}
                    className="flex h-10 flex-1 rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" isLoading={isLoading}>
              <Save size={18} />
              Sauvegarder
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
