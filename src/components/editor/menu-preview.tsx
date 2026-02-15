"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { getTemplate } from "@/templates";
import { TemplateData } from "@/templates/types";
import { formatPrice } from "@/lib/utils";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

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

interface MenuPreviewProps {
  menuName: string;
  templateId: string;
  categories: Category[];
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  customColors?: Record<string, string>;
  customFonts?: Record<string, string>;
  showWatermark?: boolean;
  aiDesignHtml?: string;
  aiBackgroundUrl?: string;
}

export function MenuPreview({
  menuName,
  templateId,
  categories,
  restaurantName = "Mon Restaurant",
  restaurantAddress,
  restaurantPhone,
  customColors,
  customFonts,
  showWatermark = false,
  aiDesignHtml,
  aiBackgroundUrl,
}: MenuPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(600);
  const isAiCustom = templateId === "ai-custom" && !!aiDesignHtml;

  const templateData: TemplateData = useMemo(
    () => ({
      restaurant: {
        name: restaurantName,
        address: restaurantAddress,
        phone: restaurantPhone,
      },
      menu: {
        name: menuName,
        categories: categories
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((cat) => ({
            name: cat.name,
            description: cat.description ?? undefined,
            dishes: cat.dishes
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((dish) => ({
                name: dish.name,
                description: dish.description ?? undefined,
                price: formatPrice(dish.price),
                allergens: dish.allergens,
                isAvailable: dish.isAvailable,
              })),
          })),
      },
      customization: {
        primaryColor: customColors?.primary ?? "#FF6B35",
        backgroundColor: customColors?.background ?? "#FFF8F2",
        textColor: customColors?.text ?? "#1A1A2E",
        headingFont: customFonts?.heading ?? "Playfair Display",
        bodyFont: customFonts?.body ?? "Inter",
      },
      branding: {
        showWatermark,
      },
      aiDesignHtml,
      aiBackgroundUrl,
    }),
    [
      menuName,
      categories,
      restaurantName,
      restaurantAddress,
      restaurantPhone,
      customColors,
      customFonts,
      showWatermark,
      aiDesignHtml,
      aiBackgroundUrl,
    ]
  );

  // Auto-scale to fit container
  const recalcScale = useCallback(() => {
    if (!containerRef.current || !isAiCustom) return;
    const containerWidth = containerRef.current.offsetWidth;
    // AI templates are designed at ~700px wide, scale to fit
    const idealWidth = 700;
    const newScale = Math.min(1, containerWidth / idealWidth);
    setScale(newScale);
  }, [isAiCustom]);

  useEffect(() => {
    recalcScale();
    window.addEventListener("resize", recalcScale);
    return () => window.removeEventListener("resize", recalcScale);
  }, [recalcScale]);

  // Receive height from iframe
  const handleIframeMessage = useCallback((e: MessageEvent) => {
    if (e.data?.type === "menuHeight") {
      setContentHeight(e.data.height);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, [handleIframeMessage]);

  const Template = getTemplate(templateId);

  return (
    <div className="animate-scale-in overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-gray-50 to-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </div>
          <p className="ml-2 text-xs font-medium text-muted">Aperçu en temps réel</p>
        </div>
        {isAiCustom && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setScale((s) => Math.max(0.3, s - 0.1))}
              className="rounded p-1 text-muted hover:bg-gray-100 hover:text-foreground"
              title="Zoom arrière"
            >
              <ZoomOut size={14} />
            </button>
            <span className="min-w-[3rem] text-center text-xs text-muted">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}
              className="rounded p-1 text-muted hover:bg-gray-100 hover:text-foreground"
              title="Zoom avant"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={recalcScale}
              className="rounded p-1 text-muted hover:bg-gray-100 hover:text-foreground"
              title="Ajuster à la taille"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className="overflow-auto bg-gray-100/50"
        style={{
          maxHeight: isAiCustom ? "calc(100vh - 200px)" : undefined,
        }}
      >
        {isAiCustom ? (
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: `${100 / scale}%`,
              height: contentHeight * scale,
              overflow: "hidden",
            }}
          >
            <Template data={templateData} />
          </div>
        ) : (
          <div className="p-6">
            <Template data={templateData} />
          </div>
        )}
      </div>
    </div>
  );
}
