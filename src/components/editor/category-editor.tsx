"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DishEditor } from "./dish-editor";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, X, Check } from "lucide-react";

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

interface Category {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  dishes: Dish[];
}

interface CategoryEditorProps {
  menuId: string;
  category: Category;
  onUpdate: () => void;
}

export function CategoryEditor({
  menuId,
  category,
  onUpdate,
}: CategoryEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description || "");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddDish, setShowAddDish] = useState(false);

  async function handleSave() {
    try {
      const res = await fetch(
        `/api/menus/${menuId}/categories/${category.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description: description || undefined }),
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
        `/api/menus/${menuId}/categories/${category.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        onUpdate();
      }
    } catch {
      // Error handling
    }
  }

  async function handleAddDish(dish: {
    name: string;
    description?: string;
    price: number;
    allergens: string[];
  }) {
    try {
      const res = await fetch(
        `/api/menus/${menuId}/categories/${category.id}/dishes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dish),
        }
      );
      if (res.ok) {
        setShowAddDish(false);
        onUpdate();
      }
    } catch {
      // Error handling
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white">
      {/* Category header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted hover:text-foreground"
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {isEditing ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 text-sm"
              placeholder="Nom de la catégorie"
            />
            <button onClick={handleSave} className="text-green-600 hover:text-green-700">
              <Check size={18} />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setName(category.name);
              }}
              className="text-muted hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <>
            <h3 className="flex-1 font-semibold text-foreground">
              {category.name}
            </h3>
            <span className="text-xs text-muted">
              {category.dishes.length} plat{category.dishes.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-muted hover:text-foreground"
            >
              <Pencil size={16} />
            </button>
            {isDeleting ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => setIsDeleting(false)}
                  className="text-xs text-muted"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsDeleting(true)}
                className="text-muted hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Dishes */}
      {isExpanded && (
        <div className="p-4">
          {category.dishes.length === 0 && !showAddDish && (
            <p className="mb-4 text-center text-sm text-muted">
              Aucun plat dans cette catégorie
            </p>
          )}

          <div className="space-y-3">
            {category.dishes.map((dish) => (
              <DishEditor
                key={dish.id}
                menuId={menuId}
                categoryId={category.id}
                dish={dish}
                onUpdate={onUpdate}
              />
            ))}
          </div>

          {showAddDish ? (
            <AddDishForm
              onAdd={handleAddDish}
              onCancel={() => setShowAddDish(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddDish(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm text-muted transition-colors hover:border-primary hover:text-primary"
            >
              <Plus size={16} />
              Ajouter un plat
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AddDishForm({
  onAdd,
  onCancel,
}: {
  onAdd: (dish: {
    name: string;
    description?: string;
    price: number;
    allergens: string[];
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) return;
    onAdd({
      name,
      description: description || undefined,
      price: parseFloat(price),
      allergens: [],
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-lg border border-primary/20 bg-primary-light/30 p-4">
      <Input
        placeholder="Nom du plat"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        placeholder="Description (optionnel)"
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
        required
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Ajouter
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
