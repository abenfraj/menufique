"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ChevronDown } from "lucide-react";

interface SearchImage {
  id: string;
  thumb: string;
  full: string;
  alt: string;
}

interface ImageGalleryProps {
  query: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

const PAGE_SIZE = 16;

export function ImageGallery({ query, onSelect, onClose }: ImageGalleryProps) {
  const [allImages, setAllImages] = useState<SearchImage[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchImages = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    setVisibleCount(PAGE_SIZE);
    try {
      const res = await fetch(
        `/api/images/search?q=${encodeURIComponent(q)}&count=40`
      );
      if (res.ok) {
        const { data } = await res.json();
        setAllImages(data);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages(query);
  }, [query, fetchImages]);

  useEffect(() => {
    if (searchQuery === query) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchImages(searchQuery);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, query, fetchImages]);

  const visibleImages = allImages.slice(0, visibleCount);
  const hasMore = visibleCount < allImages.length;

  return (
    <div className="animate-scale-in rounded-xl border border-border bg-white p-3 shadow-lg">
      {/* Search bar */}
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une photo..."
            className="w-full rounded-lg border border-border bg-gray-50 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
            autoFocus
          />
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted hover:bg-gray-100 hover:text-foreground"
        >
          <X size={14} />
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      ) : visibleImages.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted">
          Aucune image trouvée
        </p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            {visibleImages.map((img) => (
              <button
                key={img.id}
                onClick={() => onSelect(img.full)}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border transition-all hover:border-primary hover:shadow-md"
              >
                <img
                  src={img.thumb}
                  alt={img.alt}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/10" />
              </button>
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-muted transition-colors hover:bg-gray-50 hover:text-foreground"
            >
              <ChevronDown size={14} />
              Voir plus d&apos;images
            </button>
          )}
        </>
      )}
    </div>
  );
}
