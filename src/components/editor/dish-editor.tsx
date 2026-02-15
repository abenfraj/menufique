"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, X, Check, AlertTriangle, Camera, Search, Loader2 } from "lucide-react";
import { ALLERGENS } from "@/types/menu";
import { formatPrice } from "@/lib/utils";
import { ImageGallery } from "./image-gallery";

interface Dish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  allergens: string[];
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
}

interface DishEditorProps {
  menuId: string;
  categoryId: string;
  dish: Dish;
  onUpdate: () => void;
}

export function DishEditor({
  menuId,
  categoryId,
  dish,
  onUpdate,
}: DishEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(dish.name);
  const [description, setDescription] = useState(dish.description || "");
  const [price, setPrice] = useState(String(dish.price));
  const [allergens, setAllergens] = useState<string[]>(dish.allergens);
  const [showAllergens, setShowAllergens] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    try {
      const res = await fetch(
        `/api/menus/${menuId}/categories/${categoryId}/dishes/${dish.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description: description || undefined,
            price: parseFloat(price),
            allergens,
          }),
        }
      );
      if (res.ok) {
        setIsEditing(false);
        onUpdate();
      }
    } catch {
      // Error handling
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(
        `/api/menus/${menuId}/categories/${categoryId}/dishes/${dish.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        onUpdate();
      }
    } catch {
      // Error handling
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `/api/menus/${menuId}/categories/${categoryId}/dishes/${dish.id}/image`,
        { method: "POST", body: formData }
      );

      if (res.ok) {
        onUpdate();
      }
    } catch {
      // Error handling
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteImage() {
    try {
      const res = await fetch(
        `/api/menus/${menuId}/categories/${categoryId}/dishes/${dish.id}/image`,
        { method: "DELETE" }
      );
      if (res.ok) {
        onUpdate();
      }
    } catch {
      // Error handling
    }
  }

  async function handleSelectGalleryImage(url: string) {
    try {
      const res = await fetch(
        `/api/menus/${menuId}/categories/${categoryId}/dishes/${dish.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url }),
        }
      );
      if (res.ok) {
        setShowGallery(false);
        onUpdate();
      }
    } catch {
      // Error handling
    }
  }

  function toggleAllergen(id: string) {
    setAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-3 rounded-lg border border-primary/20 bg-primary-light/30 p-3">
        <Input
          placeholder="Nom du plat"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Prix (€)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* Photo upload + gallery */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            {dish.imageUrl ? (
              <div className="relative">
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="h-16 w-16 rounded-lg object-cover border border-border"
                />
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white shadow-sm hover:bg-red-600"
                >
                  <X size={10} />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {isUploadingImage ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Camera size={14} />
                  )}
                  {isUploadingImage ? "Upload..." : "Upload"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGallery(!showGallery)}
                  className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Search size={14} />
                  Chercher une photo
                </button>
              </>
            )}
          </div>
          {showGallery && !dish.imageUrl && (
            <ImageGallery
              query={name || dish.name}
              onSelect={handleSelectGalleryImage}
              onClose={() => setShowGallery(false)}
            />
          )}
        </div>

        {/* Allergens */}
        <div>
          <button
            type="button"
            onClick={() => setShowAllergens(!showAllergens)}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
          >
            <AlertTriangle size={14} />
            Allergènes ({allergens.length})
          </button>
          {showAllergens && (
            <div className="mt-2 flex flex-wrap gap-2">
              {ALLERGENS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAllergen(a.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    allergens.includes(a.id)
                      ? "bg-primary text-white"
                      : "bg-white text-muted border border-border hover:border-primary"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>
            <Check size={14} />
            Sauvegarder
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsEditing(false);
              setName(dish.name);
              setDescription(dish.description || "");
              setPrice(String(dish.price));
              setAllergens(dish.allergens);
            }}
          >
            <X size={14} />
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-gray-50">
      {/* Dish thumbnail */}
      {dish.imageUrl && (
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="h-10 w-10 shrink-0 rounded-lg object-cover border border-border"
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-foreground">{dish.name}</span>
          <span className="text-sm font-semibold text-primary">
            {formatPrice(dish.price)}
          </span>
        </div>
        {dish.description && (
          <p className="mt-0.5 text-sm text-muted truncate">{dish.description}</p>
        )}
        {dish.allergens.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {dish.allergens.map((a) => {
              const allergen = ALLERGENS.find((al) => al.id === a);
              return (
                <span
                  key={a}
                  className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-700"
                >
                  {allergen?.label ?? a}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 text-muted hover:text-foreground"
        >
          <Pencil size={14} />
        </button>
        {isDeleting ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              className="rounded bg-red-600 px-2 py-0.5 text-[10px] text-white"
            >
              OK
            </button>
            <button
              onClick={() => setIsDeleting(false)}
              className="text-[10px] text-muted"
            >
              Non
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsDeleting(true)}
            className="p-1 text-muted hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
