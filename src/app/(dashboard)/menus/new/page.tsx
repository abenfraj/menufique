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
import {
  ArrowLeft,
  PenLine,
  Globe,
  Loader2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

type Mode = "manual" | "import";

interface ImportCategory {
  name: string;
  description?: string | null;
  dishes: { name: string; description?: string | null; price: number }[];
}

export default function NewMenuPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("manual");

  // --- Manual mode ---
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // --- Import mode ---
  const [url, setUrl] = useState("");
  const [importName, setImportName] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ImportCategory[] | null>(null);

  const totalDishes = categories?.reduce((s, c) => s + c.dishes.length, 0) ?? 0;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setIsCreating(true);
    try {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error);
        return;
      }
      router.push(`/menus/${data.data.id}`);
    } catch {
      setCreateError("Une erreur est survenue");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleExtract() {
    if (!url.trim()) return;
    setExtractError(null);
    setCategories(null);
    setIsExtracting(true);
    try {
      const res = await fetch("/api/ai/extract-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setExtractError(json.error ?? "Erreur lors de l'extraction.");
        return;
      }
      setCategories(json.data.categories);
    } catch {
      setExtractError("Une erreur réseau est survenue.");
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleImport() {
    if (!categories) return;
    setIsImporting(true);
    setExtractError(null);
    try {
      // 1. Create the menu
      const createRes = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: importName || undefined }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        setExtractError(createData.error ?? "Erreur lors de la création.");
        return;
      }
      const menuId: string = createData.data.id;

      // 2. Import categories into the new menu
      const importRes = await fetch(`/api/menus/${menuId}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories }),
      });
      if (!importRes.ok) {
        const importData = await importRes.json();
        setExtractError(importData.error ?? "Erreur lors de l'import.");
        return;
      }

      router.push(`/menus/${menuId}`);
    } catch {
      setExtractError("Une erreur réseau est survenue.");
    } finally {
      setIsImporting(false);
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

      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Nouveau menu</h1>
          <p className="mt-2 text-sm text-muted">
            Créez votre menu de zéro ou importez-le depuis votre page en ligne
          </p>
        </div>

        {/* Mode selector */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode("manual")}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
              mode === "manual"
                ? "border-primary bg-primary/5"
                : "border-border bg-white hover:border-primary/40"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                mode === "manual" ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              <PenLine size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Créer manuellement</p>
              <p className="text-xs text-muted">Saisir vos plats</p>
            </div>
          </button>

          <button
            onClick={() => setMode("import")}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
              mode === "import"
                ? "border-primary bg-primary/5"
                : "border-border bg-white hover:border-primary/40"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                mode === "import" ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              <Globe size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Importer</p>
              <div className="mt-1 flex items-center gap-1.5">
                <img src="/brands/deliveroo.svg" alt="Deliveroo" className="h-3" />
                <span className="text-gray-300">·</span>
                <img src="/brands/ubereats.svg" alt="Uber Eats" className="h-4" />
                <span className="text-gray-300">·</span>
                <img src="/brands/justeat.svg" alt="Just Eat" className="h-3.5" />
              </div>
            </div>
          </button>
        </div>

        {/* Manual mode */}
        {mode === "manual" && (
          <Card>
            <CardHeader>
              <CardTitle>Créer un menu</CardTitle>
              <CardDescription>
                Donnez un nom à votre menu pour commencer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {createError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {createError}
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  id="name"
                  label="Nom du menu"
                  placeholder="Menu du midi, Carte des vins..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
                <Button type="submit" className="w-full" isLoading={isCreating}>
                  Créer le menu
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Import mode */}
        {mode === "import" && (
          <Card>
            <CardHeader>
              <CardTitle>Importer depuis une plateforme</CardTitle>
              <CardDescription>
                <span className="block mb-2">
                  Collez l&apos;URL de votre restaurant pour importer vos plats automatiquement
                </span>
                <span className="flex items-center gap-3">
                  <img src="/brands/deliveroo.svg" alt="Deliveroo" className="h-4" />
                  <img src="/brands/ubereats.svg" alt="Uber Eats" className="h-5" />
                  <img src="/brands/justeat.svg" alt="Just Eat" className="h-4" />
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* URL field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  URL de votre page restaurant
                </label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://deliveroo.fr/fr/menu/paris/..."
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setCategories(null);
                      setExtractError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && !isExtracting && handleExtract()}
                    disabled={isExtracting || isImporting}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleExtract}
                    disabled={!url.trim() || isExtracting || isImporting}
                    className="shrink-0"
                  >
                    {isExtracting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted">
                  Domaines acceptés : deliveroo.fr, ubereats.com, just-eat.fr
                </p>
              </div>

              {/* Extracting */}
              {isExtracting && (
                <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-4 text-sm text-orange-700">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  <span>Claude analyse votre menu, cela peut prendre 10–20 secondes…</span>
                </div>
              )}

              {/* Error */}
              {extractError && (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{extractError}</span>
                </div>
              )}

              {/* Preview */}
              {categories && categories.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {totalDishes} plat{totalDishes > 1 ? "s" : ""} trouvé
                      {totalDishes > 1 ? "s" : ""} dans {categories.length} catégorie
                      {categories.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="max-h-52 overflow-y-auto divide-y divide-gray-50 rounded-xl border border-gray-100">
                    {categories.map((cat, ci) => (
                      <div key={ci} className="px-4 py-3">
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {cat.name}{" "}
                          <span className="font-normal normal-case">
                            ({cat.dishes.length} plat{cat.dishes.length > 1 ? "s" : ""})
                          </span>
                        </p>
                        <ul className="space-y-1">
                          {cat.dishes.map((dish, di) => (
                            <li
                              key={di}
                              className="flex items-center justify-between gap-2 text-sm"
                            >
                              <span className="truncate text-gray-800">{dish.name}</span>
                              <span className="shrink-0 text-xs text-gray-500">
                                {dish.price > 0 ? `${dish.price.toFixed(2)} €` : "—"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Optional menu name */}
                  <Input
                    id="import-name"
                    label="Nom du menu (optionnel)"
                    placeholder="Mon menu Deliveroo"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                  />

                  <Button
                    className="w-full"
                    onClick={handleImport}
                    disabled={isImporting}
                    isLoading={isImporting}
                  >
                    Créer le menu avec {totalDishes} plat{totalDishes > 1 ? "s" : ""}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
