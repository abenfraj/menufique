"use client";

import { useState } from "react";
import { Loader2, X, Globe, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImportDish {
  name: string;
  description?: string | null;
  price: number;
}

interface ImportCategory {
  name: string;
  description?: string | null;
  dishes: ImportDish[];
}

interface ImportFromUrlModalProps {
  menuId: string;
  onClose: () => void;
  onImported: () => void;
}

export function ImportFromUrlModal({ menuId, onClose, onImported }: ImportFromUrlModalProps) {
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ImportCategory[] | null>(null);

  const totalDishes = categories?.reduce((s, c) => s + c.dishes.length, 0) ?? 0;

  async function handleExtract() {
    if (!url.trim()) return;
    setError(null);
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
        setError(json.error ?? "Erreur lors de l'extraction.");
        return;
      }
      setCategories(json.data.categories);
    } catch {
      setError("Une erreur réseau est survenue.");
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleImport() {
    if (!categories) return;
    setIsImporting(true);
    setError(null);
    try {
      const res = await fetch(`/api/menus/${menuId}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erreur lors de l'import.");
        return;
      }
      onImported();
      onClose();
    } catch {
      setError("Une erreur réseau est survenue.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold text-gray-900">
              Importer depuis Deliveroo / Uber Eats
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* URL input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              URL de votre page restaurant
            </label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://deliveroo.fr/fr/menu/paris/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isExtracting && handleExtract()}
                disabled={isExtracting || isImporting}
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleExtract}
                disabled={!url.trim() || isExtracting || isImporting}
                className="shrink-0"
              >
                {isExtracting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Domaines acceptés : Deliveroo, Uber Eats, Just Eat
            </p>
          </div>

          {/* Extracting state */}
          {isExtracting && (
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl text-sm text-orange-700">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>Claude analyse votre menu...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview */}
          {categories && categories.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {totalDishes} plat{totalDishes > 1 ? "s" : ""} trouvé
                  {totalDishes > 1 ? "s" : ""} dans {categories.length} catégorie
                  {categories.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50 max-h-60 overflow-y-auto">
                {categories.map((cat, ci) => (
                  <div key={ci} className="px-4 py-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      {cat.name}
                      <span className="ml-1.5 font-normal normal-case">
                        ({cat.dishes.length} plat{cat.dishes.length > 1 ? "s" : ""})
                      </span>
                    </p>
                    <ul className="space-y-1">
                      {cat.dishes.map((dish, di) => (
                        <li
                          key={di}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <span className="text-gray-800 truncate">{dish.name}</span>
                          <span className="text-gray-500 shrink-0 text-xs">
                            {dish.price > 0 ? `${dish.price.toFixed(2)} €` : "—"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Annuler
          </button>
          <Button
            onClick={handleImport}
            disabled={!categories || isImporting || isExtracting}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Import en cours...
              </>
            ) : (
              <>
                Importer {totalDishes > 0 ? `${totalDishes} plat${totalDishes > 1 ? "s" : ""}` : ""}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
