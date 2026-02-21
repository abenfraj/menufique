"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryEditor } from "./category-editor";
import { TEMPLATES } from "@/types/menu";
import {
  ArrowLeft,
  Plus,
  Save,
  Globe,
  EyeOff,
  Palette,
  Sparkles,
  RefreshCw,
  Loader2,
  X,
  Paintbrush,
  Type,
  MessageSquare,
  Upload,
  FileImage,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Download,
  FileText,
  FileUp,
  Mail,
  Send,
  Undo2,
  Redo2,
  Edit3,
  Clock,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
import { ImportFromUrlModal } from "./import-from-url-modal";

// ─── Types ───────────────────────────────────

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

interface Menu {
  id: string;
  name: string;
  slug: string;
  templateId: string;
  customColors: Record<string, string> | null;
  customFonts: Record<string, string> | null;
  isPublished: boolean;
  aiDesignHtml: string | null;
  aiBackgroundUrl: string | null;
  categories: Category[];
}

interface SnapshotMeta {
  id: string;
  label: string;
  createdAt: string;
}

type AIStyle = "auto" | "elegant" | "modern" | "rustic" | "minimal" | "colorful";
type AIColor = "auto" | "warm" | "cool" | "dark" | "pastel";
type AIComplexity = "simple" | "detailed" | "luxe";
type AIImageMode = "none" | "emojis";
type AITab = "options" | "import" | "modify";

// ─── Constants ───────────────────────────────

const STYLE_OPTIONS: { value: AIStyle; label: string; icon: string; desc: string }[] = [
  { value: "auto", label: "Auto", icon: "✨", desc: "L'IA choisit" },
  { value: "elegant", label: "Élégant", icon: "🎩", desc: "Raffiné, luxe" },
  { value: "modern", label: "Moderne", icon: "◼", desc: "Épuré, actuel" },
  { value: "rustic", label: "Rustique", icon: "🪵", desc: "Chaleureux" },
  { value: "minimal", label: "Minimal", icon: "○", desc: "Sobre, zen" },
  { value: "colorful", label: "Coloré", icon: "🎨", desc: "Vif, joyeux" },
];

const COLOR_OPTIONS: { value: AIColor; label: string; colors: string[] }[] = [
  { value: "auto", label: "Auto", colors: ["#FF6B35", "#4ECDC4", "#2C3E50"] },
  { value: "warm", label: "Chaud", colors: ["#D4553A", "#E8913A", "#8B4513"] },
  { value: "cool", label: "Froid", colors: ["#3B82F6", "#06B6D4", "#6366F1"] },
  { value: "dark", label: "Sombre", colors: ["#1C1410", "#2D2D2D", "#0F172A"] },
  { value: "pastel", label: "Pastel", colors: ["#FDB5B5", "#B5D8FD", "#D4B5FD"] },
];

const COMPLEXITY_OPTIONS: { value: AIComplexity; label: string; desc: string; icon: string }[] = [
  { value: "simple", label: "Simple", desc: "Épuré et lisible", icon: "○" },
  { value: "detailed", label: "Détaillé", desc: "Riche et pro", icon: "◈" },
  { value: "luxe", label: "Luxe", desc: "Spectaculaire", icon: "✦" },
];

// Story 20.4 — 8 palette presets
const PALETTE_PRESETS = [
  { name: "Orange signature", color: "#FF6B35" },
  { name: "Rouge bordeaux", color: "#8B2635" },
  { name: "Vert forêt", color: "#2D5A27" },
  { name: "Bleu ardoise", color: "#2C4A6E" },
  { name: "Or champagne", color: "#C9A96E" },
  { name: "Noir élégant", color: "#1C1C1C" },
  { name: "Rose poudré", color: "#C4748A" },
  { name: "Terracotta", color: "#B85C38" },
];

// Story 20.1 — Quick suggestion prompts
const ITERATE_SUGGESTIONS = [
  "Rends les titres de catégories plus grands",
  "Change la couleur principale en vert forêt",
  "Ajoute une ligne décorative entre les sections",
  "Mets le nom du restaurant en italique",
];

// Story 20.5 — 7 font pair presets
interface FontPair {
  name: string;
  display: string;
  body: string;
  preview: string;
  googleFontsUrl: string;
}

const FONT_PRESETS: FontPair[] = [
  {
    name: "Classique raffiné",
    display: "Playfair Display",
    body: "Lato",
    preview: "Gastronomique",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap",
  },
  {
    name: "Moderne épuré",
    display: "Montserrat",
    body: "Open Sans",
    preview: "Contemporain",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@300;400;600&display=swap",
  },
  {
    name: "Rustique chaleureux",
    display: "Libre Baskerville",
    body: "Source Sans 3",
    preview: "Bistrot",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600&display=swap",
  },
  {
    name: "Élégance minimale",
    display: "Cormorant Garamond",
    body: "Inter",
    preview: "Luxe sobre",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap",
  },
  {
    name: "Festif audacieux",
    display: "Abril Fatface",
    body: "Nunito",
    preview: "Brasserie animée",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Nunito:wght@300;400;600;700&display=swap",
  },
  {
    name: "Art déco",
    display: "Poiret One",
    body: "Josefin Sans",
    preview: "Années folles",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Poiret+One&family=Josefin+Sans:wght@300;400;600&display=swap",
  },
  {
    name: "Contemporain tech",
    display: "DM Sans",
    body: "DM Sans",
    preview: "Startup food",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap",
  },
];

// ─── Generation progress steps ──────────────

type GenerationStep = "analyzing" | "reading" | "designing" | "styling" | "coding" | "cover" | "saving" | "done";

const GENERATION_STEPS: { key: GenerationStep; label: string; sublabel: string; progress: number }[] = [
  { key: "analyzing", label: "Analyse du menu",                sublabel: "Lecture de vos plats et catégories",    progress: 8  },
  { key: "reading",   label: "Compréhension du contexte",      sublabel: "Cuisine, ambiance, style culinaire",     progress: 20 },
  { key: "designing", label: "Conception de la mise en page",  sublabel: "Structure et architecture du menu",      progress: 36 },
  { key: "styling",   label: "Styles visuels",                 sublabel: "Typographie, couleurs, ornements",       progress: 52 },
  { key: "coding",    label: "Génération du design",           sublabel: "Code HTML et CSS personnalisé",          progress: 68 },
  { key: "cover",     label: "Page de couverture",             sublabel: "Image hero générée par DALL·E",          progress: 82 },
  { key: "saving",    label: "Enregistrement",                 sublabel: "Sauvegarde de votre design",             progress: 94 },
  { key: "done",      label: "Design terminé !",               sublabel: "Votre menu est prêt",                    progress: 100 },
];

// ─── Helpers ─────────────────────────────────

/** Detect the most prominent non-neutral hex color in an HTML string */
function detectPrimaryColor(html: string): string | null {
  const hexMatches = html.match(/#[0-9A-Fa-f]{6}\b/g) ?? [];
  const freq = new Map<string, number>();
  for (const h of hexMatches) {
    const upper = h.toUpperCase();
    freq.set(upper, (freq.get(upper) ?? 0) + 1);
  }
  const candidates = [...freq.entries()]
    .filter(([hex]) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      if (r > 220 && g > 220 && b > 220) return false; // near-white
      if (r < 35 && g < 35 && b < 35) return false;    // near-black
      if (Math.max(r, g, b) - Math.min(r, g, b) < 30) return false; // grey
      return true;
    })
    .sort((a, b) => b[1] - a[1]);
  return candidates[0]?.[0] ?? null;
}

/** Replace all occurrences of a hex color in HTML (case-insensitive) */
function replaceHexColor(html: string, from: string, to: string): string {
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.replace(new RegExp(escaped, "gi"), to.toUpperCase());
}

/** Strip preview injections before saving back to DB */
function stripPreviewInjections(html: string): string {
  return html
    .replace(/<style id="preview-normalizer">[\s\S]*?<\/style>/i, "")
    .replace(/<script data-mf-scaler="1">[\s\S]*?<\/script>/i, "");
}

// ─── Component ───────────────────────────────

interface MenuEditorProps {
  menuId: string;
  userPlan?: string;
}

export function MenuEditor({ menuId, userPlan = "FREE" }: MenuEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const palettePopoverRef = useRef<HTMLDivElement>(null);
  const fontPopoverRef = useRef<HTMLDivElement>(null);

  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [menu, setMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuName, setMenuName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // AI state
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiTab, setAiTab] = useState<AITab>("options");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generationStep, setGenerationStep] = useState<GenerationStep>("analyzing");
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState(false);

  // AI options
  const [aiStyle, setAiStyle] = useState<AIStyle>("auto");
  const [aiColor, setAiColor] = useState<AIColor>("auto");
  const [aiComplexity, setAiComplexity] = useState<AIComplexity>("detailed");
  const [aiImageMode, setAiImageMode] = useState<AIImageMode>("none");
  const [aiIncludeCoverPage, setAiIncludeCoverPage] = useState(false);
  const [aiCustomInstructions, setAiCustomInstructions] = useState("");
  const [aiMenuPageCount, setAiMenuPageCount] = useState(1);

  // PDF preview state
  const [pdfKey, setPdfKey] = useState(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [showImportUrlModal, setShowImportUrlModal] = useState(false);

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<"content" | "preview">("content");

  // Share state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [isSharingEmail, setIsSharingEmail] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  // ── Story 20.3 — Undo / Redo ──────────────
  const undoStackRef = useRef<string[]>([]);
  const undoIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [undoPosition, setUndoPosition] = useState(""); // e.g. "3/7"

  // ── Story 20.4 — Palette swap ─────────────
  const [showPalettePopover, setShowPalettePopover] = useState(false);

  // ── Story 20.5 — Font swap ────────────────
  const [showFontPopover, setShowFontPopover] = useState(false);

  // ── Story 20.2 — Inline editing ──────────
  const [editMode, setEditMode] = useState(false);

  // ── Story 20.1 — Iterative AI ────────────
  const [iteratePrompt, setIteratePrompt] = useState("");
  const [isIterating, setIsIterating] = useState(false);
  const [iterateError, setIterateError] = useState<string | null>(null);
  const [iterateSuccess, setIterateSuccess] = useState(false);

  // ── Story 20.6 — Snapshot history ────────
  const [showSnapshotPanel, setShowSnapshotPanel] = useState(false);
  const [snapshots, setSnapshots] = useState<SnapshotMeta[]>([]);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState(false);
  const [snapshotLabelInput, setSnapshotLabelInput] = useState("");
  const [renamingSnapId, setRenamingSnapId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDeleteSnapId, setConfirmDeleteSnapId] = useState<string | null>(null);

  // ── Story 20.8 — Section reorder ─────────
  const [reorderMode, setReorderMode] = useState(false);
  const [detectedSections, setDetectedSections] = useState<string[]>([]);

  // ── Zoom controls ─────────────────────────
  const [previewZoom, setPreviewZoom] = useState(1.0);

  // ── Layout editor (drag + resize frames) ──
  const [layoutMode, setLayoutMode] = useState(false);

  // ─────────────────────────────────────────
  //  Data fetching
  // ─────────────────────────────────────────

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch(`/api/menus/${menuId}`);
      if (!res.ok) {
        router.push("/dashboard");
        return;
      }
      const { data } = await res.json();
      setMenu(data);
      setMenuName(data.name);
    } catch {
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [menuId, router]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Initialize undo stack with current AI HTML when menu loads
  useEffect(() => {
    if (menu?.aiDesignHtml && undoStackRef.current.length === 0) {
      undoStackRef.current = [menu.aiDesignHtml];
      undoIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
      setUndoPosition("");
    }
  }, [menu?.aiDesignHtml]);

  // Auto-dismiss success messages
  useEffect(() => {
    if (aiSuccess) {
      const t = setTimeout(() => setAiSuccess(false), 4000);
      return () => clearTimeout(t);
    }
  }, [aiSuccess]);

  useEffect(() => {
    if (iterateSuccess) {
      const t = setTimeout(() => setIterateSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [iterateSuccess]);

  // Close popovers when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        palettePopoverRef.current &&
        !palettePopoverRef.current.contains(e.target as Node)
      ) {
        setShowPalettePopover(false);
      }
      if (
        fontPopoverRef.current &&
        !fontPopoverRef.current.contains(e.target as Node)
      ) {
        setShowFontPopover(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─────────────────────────────────────────
  //  Story 20.3 — Undo / Redo helpers
  // ─────────────────────────────────────────

  function pushToUndoHistory(html: string) {
    const stack = undoStackRef.current.slice(0, undoIndexRef.current + 1);
    stack.push(html);
    if (stack.length > 20) stack.shift();
    undoStackRef.current = stack;
    undoIndexRef.current = stack.length - 1;
    const idx = undoIndexRef.current;
    const total = stack.length;
    setCanUndo(idx > 0);
    setCanRedo(false);
    setUndoPosition(total > 1 ? `${idx + 1}/${total}` : "");
  }

  function applyHtmlWithReload(html: string) {
    setMenu((prev) => (prev ? { ...prev, aiDesignHtml: html } : prev));
    setPdfKey((k) => k + 1);
  }

  async function saveAiDesignHtml(html: string) {
    await fetch(`/api/menus/${menuId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiDesignHtml: html }),
    });
  }

  function syncUndoState() {
    const idx = undoIndexRef.current;
    const total = undoStackRef.current.length;
    setCanUndo(idx > 0);
    setCanRedo(idx < total - 1);
    setUndoPosition(total > 1 ? `${idx + 1}/${total}` : "");
  }

  function undo() {
    if (undoIndexRef.current <= 0) return;
    undoIndexRef.current--;
    const html = undoStackRef.current[undoIndexRef.current];
    applyHtmlWithReload(html);
    saveAiDesignHtml(html);
    syncUndoState();
  }

  function redo() {
    if (undoIndexRef.current >= undoStackRef.current.length - 1) return;
    undoIndexRef.current++;
    const html = undoStackRef.current[undoIndexRef.current];
    applyHtmlWithReload(html);
    saveAiDesignHtml(html);
    syncUndoState();
  }

  // Keyboard shortcuts for undo/redo
  const undoRef = useRef(undo);
  const redoRef = useRef(redo);
  undoRef.current = undo;
  redoRef.current = redo;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isUndo =
        (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z";
      const isRedo =
        (e.ctrlKey || e.metaKey) &&
        (e.shiftKey ? e.key === "z" : e.key === "y");
      if (isUndo) { e.preventDefault(); undoRef.current(); }
      else if (isRedo) { e.preventDefault(); redoRef.current(); }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ─────────────────────────────────────────
  //  Story 20.4 — Palette swap
  // ─────────────────────────────────────────

  async function handleSwapColor(newColor: string) {
    if (!menu?.aiDesignHtml) return;
    const primaryColor = detectPrimaryColor(menu.aiDesignHtml);
    if (!primaryColor) {
      setAiError("Impossible de détecter la couleur principale du design.");
      return;
    }
    const newHtml = replaceHexColor(menu.aiDesignHtml, primaryColor, newColor);
    pushToUndoHistory(newHtml);
    applyHtmlWithReload(newHtml);
    setShowPalettePopover(false);
    await saveAiDesignHtml(newHtml);
  }

  // ─────────────────────────────────────────
  //  Story 20.5 — Font swap
  // ─────────────────────────────────────────

  async function handleSwapFont(pair: FontPair) {
    if (!menu?.aiDesignHtml) return;
    let newHtml = menu.aiDesignHtml;

    // 1. Replace Google Fonts link
    newHtml = newHtml.replace(
      /https:\/\/fonts\.googleapis\.com\/css2\?[^"']*/,
      pair.googleFontsUrl
    );

    // 2. Detect current display font (first quoted font-family in the CSS block)
    const fontMatch = newHtml.match(/font-family\s*:\s*['"]([^'"]+)['"]/);
    const currentDisplayFont = fontMatch?.[1];
    if (currentDisplayFont && currentDisplayFont !== pair.display) {
      newHtml = newHtml.replace(
        new RegExp(`(['"])${currentDisplayFont.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\1`, "g"),
        `'${pair.display}'`
      );
    }

    pushToUndoHistory(newHtml);
    applyHtmlWithReload(newHtml);
    setShowFontPopover(false);
    await saveAiDesignHtml(newHtml);
  }

  // ─────────────────────────────────────────
  //  Story 20.2 — Inline editing
  // ─────────────────────────────────────────

  function injectInlineEditor(iframe: HTMLIFrameElement) {
    const doc = iframe.contentDocument;
    if (!doc) return;

    const editableSelectors = [
      "h1", "h2", "h3", "h4",
      ".dish-name", ".dish-price", ".dish-description",
      "p", "span",
    ].join(",");

    doc.querySelectorAll<HTMLElement>(editableSelectors).forEach((el) => {
      if (el.querySelector(editableSelectors)) return; // skip parent containers
      el.setAttribute("data-mf-editable", "1");
      el.style.cursor = "text";
      el.title = "Double-clic pour modifier";

      el.addEventListener("dblclick", () => startInlineEdit(el, iframe));

      el.addEventListener("mouseenter", () => {
        if (el.getAttribute("data-mf-editable")) {
          el.style.outline = "1px dashed rgba(255,107,53,0.4)";
          el.style.outlineOffset = "2px";
        }
      });
      el.addEventListener("mouseleave", () => {
        if (!el.isContentEditable) {
          el.style.outline = "";
          el.style.outlineOffset = "";
        }
      });
    });
  }

  function startInlineEdit(el: HTMLElement, iframe: HTMLIFrameElement) {
    const original = el.textContent ?? "";
    el.setAttribute("contenteditable", "true");
    el.style.outline = "2px solid #FF6B35";
    el.style.outlineOffset = "2px";
    el.style.borderRadius = "3px";
    el.focus();

    function commit() {
      el.removeAttribute("contenteditable");
      el.style.outline = "";
      el.style.outlineOffset = "";
      el.style.borderRadius = "";
      if (el.textContent === original) return;
      const rawHtml = iframe.contentDocument?.documentElement.outerHTML ?? "";
      const newHtml = stripPreviewInjections(rawHtml);
      setMenu((prev) => (prev ? { ...prev, aiDesignHtml: newHtml } : prev));
      pushToUndoHistory(newHtml);
      saveAiDesignHtml(newHtml);
    }

    el.addEventListener("blur", commit, { once: true });
    el.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          el.blur();
        }
        if (e.key === "Escape") {
          el.textContent = original;
          el.blur();
        }
      },
      { once: true }
    );
  }

  // Apply zoom level to the iframe document
  function applyZoomToIframe(zoom: number) {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc?.documentElement) {
        doc.documentElement.style.zoom = String(zoom);
      }
    } catch {
      // cross-origin or not yet loaded — no-op
    }
  }

  // ── Layout editor: drag + resize category frames ──────────────────────────

  function injectLayoutEditor(iframe: HTMLIFrameElement) {
    const doc = iframe.contentDocument;
    if (!doc) return;

    // Remove any previous injection
    doc.getElementById("mf-layout-style")?.remove();
    doc.getElementById("mf-layout-script")?.remove();

    const styleEl = doc.createElement("style");
    styleEl.id = "mf-layout-style";
    styleEl.textContent = `
      .mf-page-host { position:relative!important; overflow:visible!important; }
      .mf-draggable {
        position:absolute!important; box-sizing:border-box!important;
        outline:2px dashed #FF6B35; outline-offset:2px; transition:outline 0.1s;
      }
      .mf-draggable.mf-selected { outline:2px solid #FF6B35; box-shadow:0 0 0 4px rgba(255,107,53,0.15); }
      .mf-drag-handle {
        position:absolute; top:0; left:0; right:0; height:22px;
        background:linear-gradient(90deg,#FF6B35,#f59e0b);
        border-radius:6px 6px 0 0; cursor:grab; z-index:10001;
        display:flex; align-items:center; padding:0 8px; gap:5px;
        user-select:none; pointer-events:auto;
      }
      .mf-drag-handle:active { cursor:grabbing; }
      .mf-drag-handle .mf-hname {
        color:#fff; font-size:10px; font-weight:700;
        font-family:system-ui,sans-serif; text-transform:uppercase;
        letter-spacing:.5px; white-space:nowrap; overflow:hidden;
        text-overflow:ellipsis; pointer-events:none;
      }
      .mf-drag-handle .mf-hdots {
        color:rgba(255,255,255,.8); font-size:13px; pointer-events:none; flex-shrink:0;
      }
      .mf-resize-se {
        position:absolute; bottom:-1px; right:-1px; width:18px; height:18px;
        background:#FF6B35; border-radius:50% 0 4px 0; cursor:se-resize;
        z-index:10001; display:flex; align-items:center; justify-content:center;
      }
      .mf-resize-se::after {
        content:''; width:6px; height:6px;
        border-right:2px solid #fff; border-bottom:2px solid #fff; border-radius:0 0 2px 0;
      }
    `;
    doc.head.appendChild(styleEl);

    const scriptEl = doc.createElement("script");
    scriptEl.id = "mf-layout-script";
    scriptEl.textContent = `
(function(){
  var SEL=[".menu-section","[class*='category']","[class*='section']",".category",".section"];
  var sections=[];
  for(var i=0;i<SEL.length;i++){
    var found=Array.from(document.querySelectorAll(SEL[i]));
    if(found.length<2)continue;
    var groups=new Map();
    found.forEach(function(el){
      var p=el.parentElement;if(!p)return;
      if(!groups.has(p))groups.set(p,[]);groups.get(p).push(el);
    });
    var best=[];
    groups.forEach(function(els){if(els.length>best.length)best=els;});
    if(best.length>=2){sections=best;break;}
  }
  if(!sections.length){console.warn('[MF Layout] aucune section trouvée');return;}

  // Use menu-page as position host (or fallback to section parent)
  var host=document.querySelector('.menu-page')||sections[0].parentElement;
  host.classList.add('mf-page-host');

  var hostRect=host.getBoundingClientRect();

  // Neutralize mf-scaler transform so positions are real
  var scalerWrap=host.querySelector('[style*="transform:scale"]');
  var scaleValue=1;
  if(scalerWrap){
    var m=scalerWrap.style.transform.match(/scale\\(([^)]+)\\)/);
    if(m)scaleValue=parseFloat(m[1]);
  }

  var positions=sections.map(function(s){
    var r=s.getBoundingClientRect();
    return{
      left:(r.left-hostRect.left)/scaleValue,
      top:(r.top-hostRect.top)/scaleValue,
      width:r.width/scaleValue,
      height:r.height/scaleValue
    };
  });

  // Ensure host is tall enough
  var maxBot=Math.max.apply(null,positions.map(function(p){return p.top+p.height;}));
  if(parseFloat(host.style.height||0)<maxBot+40)host.style.minHeight=(maxBot+40)+'px';

  sections.forEach(function(sec,i){
    var pos=positions[i];
    sec.dataset.mfOrigPt=sec.style.paddingTop||'';
    sec.style.left=pos.left+'px';
    sec.style.top=pos.top+'px';
    sec.style.width=pos.width+'px';
    sec.style.paddingTop='22px';
    sec.classList.add('mf-draggable');

    var titleEl=sec.querySelector('h1,h2,h3,h4,.category-name,.section-title,.menu-title');
    var title=titleEl?titleEl.textContent.trim().slice(0,28):('Section '+(i+1));

    var handle=document.createElement('div');
    handle.className='mf-drag-handle';
    handle.innerHTML='<span class="mf-hdots">⠿</span><span class="mf-hname">'+title+'</span>';
    sec.insertBefore(handle,sec.firstChild);

    var resizer=document.createElement('div');
    resizer.className='mf-resize-se';
    sec.appendChild(resizer);
  });

  var action=null;
  document.addEventListener('mousedown',function(e){
    var handle=e.target.classList.contains('mf-drag-handle')?e.target:(e.target.closest&&e.target.closest('.mf-drag-handle'));
    var resizer=e.target.classList.contains('mf-resize-se')?e.target:null;
    if(!handle&&!resizer)return;
    var draggable=handle?handle.parentElement:(resizer?resizer.parentElement:null);
    if(!draggable||!draggable.classList.contains('mf-draggable'))return;
    document.querySelectorAll('.mf-selected').forEach(function(el){el.classList.remove('mf-selected');});
    draggable.classList.add('mf-selected');
    draggable.style.zIndex='1000';
    if(handle){
      action={type:'drag',el:draggable,sx:e.clientX,sy:e.clientY,
        ol:parseInt(draggable.style.left)||0,ot:parseInt(draggable.style.top)||0};
    } else {
      action={type:'resize',el:draggable,sx:e.clientX,sy:e.clientY,
        ow:draggable.getBoundingClientRect().width/scaleValue,
        oh:draggable.getBoundingClientRect().height/scaleValue};
    }
    e.preventDefault();e.stopPropagation();
  },true);

  document.addEventListener('mousemove',function(e){
    if(!action)return;
    var dx=(e.clientX-action.sx)/scaleValue,dy=(e.clientY-action.sy)/scaleValue;
    if(action.type==='drag'){
      action.el.style.left=Math.max(0,action.ol+dx)+'px';
      action.el.style.top=Math.max(0,action.ot+dy)+'px';
    } else {
      action.el.style.width=Math.max(80,action.ow+dx)+'px';
      action.el.style.height=Math.max(40,action.oh+dy)+'px';
      action.el.style.overflow='hidden';
    }
    e.preventDefault();
  },true);

  document.addEventListener('mouseup',function(){
    if(action){action.el.style.zIndex='';action=null;}
  },true);

  document.addEventListener('click',function(e){
    if(!e.target.closest('.mf-draggable')){
      document.querySelectorAll('.mf-selected').forEach(function(el){el.classList.remove('mf-selected');});
    }
  });
})();
    `;
    doc.body.appendChild(scriptEl);
  }

  async function saveLayoutAndExit() {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) { setLayoutMode(false); return; }

    // Strip editor UI from the DOM before reading HTML
    doc.getElementById("mf-layout-style")?.remove();
    doc.getElementById("mf-layout-script")?.remove();
    doc.querySelectorAll(".mf-drag-handle").forEach((el) => el.remove());
    doc.querySelectorAll(".mf-resize-se").forEach((el) => el.remove());
    doc.querySelectorAll(".mf-draggable").forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.paddingTop = htmlEl.dataset.mfOrigPt ?? "";
      delete htmlEl.dataset.mfOrigPt;
      htmlEl.classList.remove("mf-draggable", "mf-selected");
    });
    doc.querySelectorAll(".mf-page-host").forEach((el) => {
      el.classList.remove("mf-page-host");
    });

    const rawHtml = `<!DOCTYPE html>\n` + doc.documentElement.outerHTML;
    const cleanHtml = stripPreviewInjections(rawHtml);

    pushToUndoHistory(menu?.aiDesignHtml ?? "");
    setMenu((prev) => prev ? { ...prev, aiDesignHtml: cleanHtml } : prev);
    await saveAiDesignHtml(cleanHtml);
    setLayoutMode(false);
    setPdfKey((k) => k + 1);
  }

  // Re-inject inline editor when iframe loads and editMode is on
  function handleIframeLoad() {
    if (editMode && iframeRef.current) {
      injectInlineEditor(iframeRef.current);
    }
    // Also detect sections for reorder mode
    if (reorderMode && iframeRef.current) {
      detectSectionsInIframe();
    }
    // Re-inject layout editor if active
    if (layoutMode && iframeRef.current) {
      injectLayoutEditor(iframeRef.current);
    }
    // Re-apply zoom after reload
    applyZoomToIframe(previewZoom);
  }

  useEffect(() => {
    if (editMode && iframeRef.current) {
      // Attempt to inject if iframe is already loaded
      try {
        injectInlineEditor(iframeRef.current);
      } catch {
        // Will be injected on next onLoad
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode]);

  // Apply zoom whenever it changes (without reloading the iframe)
  useEffect(() => {
    applyZoomToIframe(previewZoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewZoom]);

  // Inject / remove layout editor when layoutMode toggles
  useEffect(() => {
    if (!iframeRef.current) return;
    if (layoutMode) {
      injectLayoutEditor(iframeRef.current);
    } else {
      // If user exits without saving, just remove injected elements
      const doc = iframeRef.current.contentDocument;
      if (!doc) return;
      doc.getElementById("mf-layout-style")?.remove();
      doc.getElementById("mf-layout-script")?.remove();
      doc.querySelectorAll(".mf-drag-handle").forEach((el) => el.remove());
      doc.querySelectorAll(".mf-resize-se").forEach((el) => el.remove());
      doc.querySelectorAll(".mf-draggable").forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.paddingTop = htmlEl.dataset.mfOrigPt ?? "";
        delete htmlEl.dataset.mfOrigPt;
        htmlEl.classList.remove("mf-draggable", "mf-selected");
      });
      doc.querySelectorAll(".mf-page-host").forEach((el) => {
        el.classList.remove("mf-page-host");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutMode]);

  // ─────────────────────────────────────────
  //  Story 20.1 — Iterative AI prompt
  // ─────────────────────────────────────────

  async function handleIterateDesign() {
    if (!iteratePrompt.trim() || !menu?.aiDesignHtml) return;
    setIsIterating(true);
    setIterateError(null);
    setIterateSuccess(false);
    try {
      const res = await fetch("/api/ai/iterate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuId, prompt: iteratePrompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIterateError(data.error ?? "Erreur lors de la modification");
        return;
      }
      const newHtml = data.data.html as string;
      pushToUndoHistory(newHtml);
      applyHtmlWithReload(newHtml);
      setIteratePrompt("");
      setIterateSuccess(true);
    } catch {
      setIterateError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsIterating(false);
    }
  }

  // ─────────────────────────────────────────
  //  Story 20.6 — Snapshot history
  // ─────────────────────────────────────────

  async function fetchSnapshots() {
    if (!menu?.aiDesignHtml) return;
    setIsLoadingSnapshots(true);
    try {
      const res = await fetch(`/api/menus/${menuId}/snapshots`);
      const data = await res.json();
      if (res.ok) setSnapshots(data.data ?? []);
    } catch {
      // ignore
    } finally {
      setIsLoadingSnapshots(false);
    }
  }

  async function handleCreateSnapshot() {
    if (!menu?.aiDesignHtml) return;
    setIsSavingSnapshot(true);
    try {
      const res = await fetch(`/api/menus/${menuId}/snapshots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: snapshotLabelInput.trim() || undefined }),
      });
      if (res.ok) {
        setSnapshotLabelInput("");
        await fetchSnapshots();
      }
    } catch {
      // ignore
    } finally {
      setIsSavingSnapshot(false);
    }
  }

  async function handleRestoreSnapshot(snapId: string) {
    try {
      const res = await fetch(
        `/api/menus/${menuId}/snapshots/${snapId}/restore`,
        { method: "POST" }
      );
      const data = await res.json();
      if (res.ok) {
        const html = data.data.html as string;
        pushToUndoHistory(html);
        applyHtmlWithReload(html);
      }
    } catch {
      // ignore
    }
  }

  async function handleDeleteSnapshot(snapId: string) {
    try {
      await fetch(`/api/menus/${menuId}/snapshots/${snapId}`, {
        method: "DELETE",
      });
      setSnapshots((prev) => prev.filter((s) => s.id !== snapId));
      setConfirmDeleteSnapId(null);
    } catch {
      // ignore
    }
  }

  async function handleRenameSnapshot(snapId: string) {
    if (!renameValue.trim()) return;
    try {
      await fetch(`/api/menus/${menuId}/snapshots/${snapId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: renameValue }),
      });
      setSnapshots((prev) =>
        prev.map((s) => (s.id === snapId ? { ...s, label: renameValue } : s))
      );
      setRenamingSnapId(null);
      setRenameValue("");
    } catch {
      // ignore
    }
  }

  async function autoSnapshotBeforeGeneration() {
    if (!menu?.aiDesignHtml) return;
    await fetch(`/api/menus/${menuId}/snapshots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: `Génération du ${new Date().toLocaleDateString("fr-FR")}`,
      }),
    });
  }

  useEffect(() => {
    if (showSnapshotPanel) fetchSnapshots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSnapshotPanel]);

  // ─────────────────────────────────────────
  //  Story 20.8 — Section reorder
  // ─────────────────────────────────────────

  function detectSectionsInIframe() {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const selectors = [
      "[class*='category']",
      "[class*='section']",
      "[class*='menu-section']",
      "[data-category]",
      ".category",
      ".section",
    ];
    for (const sel of selectors) {
      const found = [...doc.querySelectorAll(sel)];
      if (found.length >= 2) {
        setDetectedSections(
          found.map((el, i) => {
            const heading = el.querySelector("h2,h3,h4");
            return heading?.textContent?.trim() || `Section ${i + 1}`;
          })
        );
        return;
      }
    }
    setDetectedSections([]);
  }

  function moveSectionUp(index: number) {
    if (index === 0) return;
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    const selectors = [
      "[class*='category']",
      "[class*='section']",
      "[class*='menu-section']",
      ".category",
      ".section",
    ];
    let sections: Element[] = [];
    for (const sel of selectors) {
      const found = [...doc.querySelectorAll(sel)];
      if (found.length >= 2) { sections = found; break; }
    }
    if (sections.length < 2) return;

    const el = sections[index];
    const prev = sections[index - 1];
    el.parentNode?.insertBefore(el, prev);

    const newHtml = stripPreviewInjections(
      doc.documentElement.outerHTML
    );
    setMenu((prev) => (prev ? { ...prev, aiDesignHtml: newHtml } : prev));
    pushToUndoHistory(newHtml);
    saveAiDesignHtml(newHtml);
    // Update detected names
    const newNames = [...detectedSections];
    [newNames[index - 1], newNames[index]] = [newNames[index], newNames[index - 1]];
    setDetectedSections(newNames);
  }

  function moveSectionDown(index: number) {
    if (index >= detectedSections.length - 1) return;
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    const selectors = [
      "[class*='category']",
      "[class*='section']",
      "[class*='menu-section']",
      ".category",
      ".section",
    ];
    let sections: Element[] = [];
    for (const sel of selectors) {
      const found = [...doc.querySelectorAll(sel)];
      if (found.length >= 2) { sections = found; break; }
    }
    if (sections.length < 2) return;

    const el = sections[index];
    const next = sections[index + 1];
    next.parentNode?.insertBefore(next, el);

    const newHtml = stripPreviewInjections(
      doc.documentElement.outerHTML
    );
    setMenu((prev) => (prev ? { ...prev, aiDesignHtml: newHtml } : prev));
    pushToUndoHistory(newHtml);
    saveAiDesignHtml(newHtml);
    const newNames = [...detectedSections];
    [newNames[index], newNames[index + 1]] = [newNames[index + 1], newNames[index]];
    setDetectedSections(newNames);
  }

  useEffect(() => {
    if (reorderMode) detectSectionsInIframe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reorderMode]);

  // ─────────────────────────────────────────
  //  Standard CRUD handlers
  // ─────────────────────────────────────────

  async function handleSaveName() {
    if (!menuName.trim() || menuName === menu?.name) return;
    setIsSaving(true);
    try {
      await fetch(`/api/menus/${menuId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: menuName }),
      });
      fetchMenu();
    } catch {
      // Error
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch(`/api/menus/${menuId}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (res.ok) {
        setNewCategoryName("");
        setShowAddCategory(false);
        fetchMenu();
      }
    } catch {
      // Error
    }
  }

  async function handleTogglePublish() {
    if (!menu) return;
    try {
      await fetch(`/api/menus/${menuId}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !menu.isPublished }),
      });
      fetchMenu();
    } catch {
      // Error
    }
  }

  async function handleDownloadPdf() {
    if (!menu) return;
    setIsDownloadingPdf(true);
    try {
      const res = await fetch("/api/generate/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAiError(data.error ?? "Erreur lors de la génération du PDF");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${menu.slug}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setAiError("Erreur de connexion lors du téléchargement du PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  async function handleShareByEmail(e: React.FormEvent) {
    e.preventDefault();
    setShareError(null);
    setIsSharingEmail(true);
    try {
      const res = await fetch(`/api/menus/${menuId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: shareEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setShareError(data.error ?? "Erreur lors du partage");
      } else {
        setShareSuccess(true);
        setTimeout(() => {
          setShowShareModal(false);
          setShareSuccess(false);
          setShareEmail("");
        }, 2500);
      }
    } catch {
      setShareError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSharingEmail(false);
    }
  }

  async function handleChangeTemplate(templateId: string) {
    try {
      const res = await fetch(`/api/menus/${menuId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.upgrade) {
          setShowTemplateSelector(false);
          window.location.href = "/dashboard/billing";
          return;
        }
        setAiError(data.error ?? "Erreur lors du changement de template");
        setShowTemplateSelector(false);
        return;
      }
      fetchMenu();
      setShowTemplateSelector(false);
      setPdfKey((k) => k + 1);
    } catch {
      setAiError("Erreur de connexion. Veuillez réessayer.");
    }
  }

  async function handleGenerateAI() {
    // Auto-snapshot before new generation (Story 20.6)
    if (menu?.aiDesignHtml) {
      await autoSnapshotBeforeGeneration();
    }

    setIsGeneratingAI(true);
    setAiError(null);
    setAiSuccess(false);
    setGenerationStep("analyzing");
    setShowAIPanel(false);

    // Reset undo stack for new generation
    undoStackRef.current = [];
    undoIndexRef.current = -1;
    setCanUndo(false);
    setCanRedo(false);
    setUndoPosition("");

    try {
      setTimeout(() => setGenerationStep("reading"),   1800);
      setTimeout(() => setGenerationStep("designing"), 4000);
      setTimeout(() => setGenerationStep("styling"),   7500);
      setTimeout(() => setGenerationStep("coding"),    11000);
      if (aiIncludeCoverPage) {
        setTimeout(() => setGenerationStep("cover"), 15000);
      }

      const instructions = extractedText
        ? `${aiCustomInstructions}\n\nContenu importé depuis un ancien menu :\n${extractedText}`
        : aiCustomInstructions;

      const res = await fetch("/api/ai/generate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuId,
          options: {
            style: aiStyle,
            imageMode: aiImageMode,
            colorPreference: aiColor,
            complexity: aiComplexity,
            includeCoverPage: aiIncludeCoverPage,
            menuPageCount: aiMenuPageCount,
            customInstructions: instructions || undefined,
          },
        }),
      });

      setGenerationStep("saving");
      const data = await res.json();

      if (!res.ok) {
        setAiError(data.error ?? "Une erreur est survenue");
        return;
      }

      setGenerationStep("done");
      setAiSuccess(true);
      setExtractedText(null);
      setImportFile(null);
      setImportPreview(null);

      fetchMenu().then(() => {
        // Push initial undo state after generation
        if (data.design?.html) {
          undoStackRef.current = [data.design.html];
          undoIndexRef.current = 0;
          setCanUndo(false);
          setCanRedo(false);
          setUndoPosition("");
        }
      });
      setPdfKey((k) => k + 1);
    } catch {
      setAiError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsGeneratingAI(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setAiError("Format non supporté. Utilisez JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAiError("Fichier trop volumineux (max 10 Mo)");
      return;
    }
    setImportFile(file);
    setExtractedText(null);
    const reader = new FileReader();
    reader.onload = () => setImportPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleImportJson() {
    if (!jsonText.trim()) return;
    try {
      const data = JSON.parse(jsonText);
      const res = await fetch(`/api/menus/${menuId}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setShowJsonImport(false);
        setJsonText("");
        fetchMenu();
        setPdfKey((k) => k + 1);
      } else {
        const json = await res.json().catch(() => ({}));
        setAiError(json.error ?? "Erreur lors de l'import JSON");
      }
    } catch {
      setAiError("JSON invalide. Vérifiez le format.");
    }
  }

  async function handleExtractMenu() {
    if (!importFile) return;
    setIsExtracting(true);
    setAiError(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await fetch("/api/ai/extract-menu", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        setAiError(json.error ?? "Erreur lors de l'extraction");
        return;
      }
      setExtractedText(json.data.extractedText);
    } catch {
      setAiError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsExtracting(false);
    }
  }

  // ─────────────────────────────────────────
  //  Render guards
  // ─────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  if (!menu) return null;

  const isPro = userPlan === "PRO";
  const hasDishes = menu.categories.some((c) => c.dishes.length > 0);
  const isAiMenu = menu.templateId === "ai-custom" && !!menu.aiDesignHtml;

  // ─── Ring progress computation ───────────────
  const currentStepInfo = GENERATION_STEPS.find((s) => s.key === generationStep);
  const generationProgress = currentStepInfo?.progress ?? 0;
  const RING_R = 80;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;
  const ringDashOffset = RING_CIRCUMFERENCE * (1 - generationProgress / 100);
  const tipRotationDeg = (generationProgress / 100) * 360;
  const visibleSteps = GENERATION_STEPS.filter((s) => s.key !== "cover" || aiIncludeCoverPage);
  const currentStepIdx = visibleSteps.findIndex((s) => s.key === generationStep);

  // Detected primary color
  const detectedColor = isAiMenu ? detectPrimaryColor(menu.aiDesignHtml!) : null;

  // Current preview src
  const previewSrc = `/api/menus/${menuId}/preview`;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-3 px-4">
          {/* Left: back + name */}
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/dashboard"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              <ArrowLeft size={17} />
            </Link>
            <div className="h-4 w-px shrink-0 bg-border" />
            <div className="flex min-w-0 items-center gap-1.5">
              <input
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                className="min-w-0 max-w-[200px] truncate bg-transparent text-sm font-semibold text-foreground outline-none transition-all focus:underline focus:decoration-primary/30 sm:max-w-xs"
              />
              {isSaving && <Loader2 size={12} className="shrink-0 animate-spin text-muted" />}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => { setShowTemplateSelector(!showTemplateSelector); setShowAIPanel(false); }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-all ${
                showTemplateSelector
                  ? "bg-surface text-foreground"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              <Palette size={14} />
              <span className="hidden sm:inline">Template</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf || !hasDishes}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted transition-all hover:bg-surface hover:text-foreground disabled:opacity-40"
              title="Télécharger en PDF"
            >
              {isDownloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span className="hidden sm:inline">{isDownloadingPdf ? "PDF..." : "PDF"}</span>
            </button>

            {menu.isPublished && (
              <button
                onClick={() => { setShowShareModal(true); setShareError(null); setShareSuccess(false); }}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted transition-all hover:bg-surface hover:text-foreground"
              >
                <Mail size={14} />
                <span className="hidden sm:inline">Partager</span>
              </button>
            )}

            <div className="h-5 w-px bg-border" />

            <button
              onClick={handleTogglePublish}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                menu.isPublished
                  ? "bg-success-light text-success hover:bg-green-100"
                  : "bg-primary text-white hover:bg-primary-hover"
              }`}
            >
              <Globe size={13} />
              <span className="hidden sm:inline">
                {menu.isPublished ? "Publié" : "Publier"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Template selector */}
      {showTemplateSelector && (
        <div className="animate-slide-down border-b border-border bg-white">
          <div className="mx-auto flex max-w-[1600px] gap-2 overflow-x-auto px-3 py-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleChangeTemplate(t.id)}
                className={`shrink-0 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                  menu.templateId === t.id
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-border hover:border-primary/40 hover:shadow-sm"
                }`}
              >
                <span>{t.name}</span>
                {t.isPro && (
                  <span className="ml-1.5 rounded-full bg-gradient-to-r from-primary to-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    PRO
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════ AI Right Drawer ══════════════════ */}
      {showAIPanel && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
            onClick={() => setShowAIPanel(false)}
          />
          <div className="animate-slide-in-right fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col bg-white shadow-2xl sm:w-[440px]">
            {/* Drawer header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-md shadow-primary/25">
                  <Wand2 size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Design IA</h2>
                  <p className="text-xs text-muted">Design unique pour votre restaurant</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIPanel(false)}
                className="rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex shrink-0 border-b border-border">
              <button
                onClick={() => setAiTab("options")}
                className={`flex flex-1 items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${
                  aiTab === "options"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Sparkles size={13} />
                Nouveau design
              </button>
              <button
                onClick={() => setAiTab("import")}
                className={`flex flex-1 items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${
                  aiTab === "import"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Upload size={13} />
                Importer
              </button>
              {isAiMenu && (
                <button
                  onClick={() => setAiTab("modify")}
                  className={`flex flex-1 items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${
                    aiTab === "modify"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Edit3 size={13} />
                  Modifier
                </button>
              )}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Tab: Options ── */}
              {aiTab === "options" && (
                <div className="space-y-5 p-5">
                  {/* Complexity */}
                  <div>
                    <label className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                      <Sparkles size={12} />
                      Niveau de détail
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {COMPLEXITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setAiComplexity(opt.value)}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                            aiComplexity === opt.value
                              ? "border-primary bg-primary/5 text-primary shadow-sm"
                              : "border-border bg-white text-muted hover:border-primary/40"
                          }`}
                        >
                          <span className="text-xl leading-none">{opt.icon}</span>
                          <p className="text-xs font-semibold">{opt.label}</p>
                          <p className="text-[10px] leading-tight text-muted">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style */}
                  <div>
                    <label className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                      <Paintbrush size={12} />
                      Style
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {STYLE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setAiStyle(opt.value)}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                            aiStyle === opt.value
                              ? "border-primary bg-primary/5 text-primary shadow-sm"
                              : "border-border bg-white text-muted hover:border-primary/40"
                          }`}
                        >
                          <span className="text-xl leading-none">{opt.icon}</span>
                          <p className="text-xs font-semibold">{opt.label}</p>
                          <p className="text-[10px] text-muted">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                      <Palette size={12} />
                      Couleurs
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {COLOR_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setAiColor(opt.value)}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                            aiColor === opt.value
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-white hover:border-primary/40"
                          }`}
                        >
                          <div className="flex gap-1">
                            {opt.colors.map((c) => (
                              <span
                                key={c}
                                className="h-4 w-4 rounded-full shadow-sm"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                          <span className={`text-sm font-medium ${aiColor === opt.value ? "text-foreground" : "text-muted"}`}>
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Images & Cover */}
                  <div>
                    <label className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                      <Type size={12} />
                      Images &amp; couverture
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setAiImageMode("none")}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                          aiImageMode === "none"
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-white hover:border-primary/40"
                        }`}
                      >
                        <Type size={16} className={aiImageMode === "none" ? "text-primary" : "text-muted"} />
                        <div>
                          <p className={`text-sm font-medium ${aiImageMode === "none" ? "text-foreground" : "text-muted"}`}>Typographique</p>
                          <p className="text-xs text-muted">Polices et couleurs uniquement</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setAiImageMode("emojis")}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                          aiImageMode === "emojis"
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-white hover:border-primary/40"
                        }`}
                      >
                        <span className={`text-lg ${aiImageMode === "emojis" ? "" : "opacity-40"}`}>🍽️</span>
                        <div>
                          <p className={`text-sm font-medium ${aiImageMode === "emojis" ? "text-foreground" : "text-muted"}`}>Emojis</p>
                          <p className="text-xs text-muted">Icônes décoratives par plat</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setAiIncludeCoverPage(!aiIncludeCoverPage)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                          aiIncludeCoverPage
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-white hover:border-primary/40"
                        }`}
                      >
                        <FileImage size={16} className={aiIncludeCoverPage ? "text-primary" : "text-muted"} />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${aiIncludeCoverPage ? "text-foreground" : "text-muted"}`}>Page de couverture</p>
                          <p className="text-xs text-muted">Image hero + nom du restaurant</p>
                        </div>
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${aiIncludeCoverPage ? "border-primary bg-primary" : "border-border"}`}>
                          {aiIncludeCoverPage && <span className="text-[9px] font-bold text-white">✓</span>}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Pages */}
                  <div>
                    <label className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                      <FileText size={12} />
                      Nombre de pages
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {([1, 2, 3, 4] as const).map((n) => (
                        <button
                          key={n}
                          onClick={() => setAiMenuPageCount(n)}
                          className={`flex flex-col items-center rounded-xl border py-3 transition-all ${
                            aiMenuPageCount === n
                              ? "border-primary bg-primary/5 text-primary shadow-sm"
                              : "border-border bg-white text-muted hover:border-primary/40"
                          }`}
                        >
                          <span className="text-lg font-bold">{n}</span>
                          <span className="text-[10px]">page{n > 1 ? "s" : ""}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                      <MessageSquare size={12} />
                      Instructions personnalisées
                    </label>
                    <textarea
                      value={aiCustomInstructions}
                      onChange={(e) => setAiCustomInstructions(e.target.value)}
                      placeholder="Ex: style art déco avec du doré, bordures ornées..."
                      maxLength={500}
                      rows={4}
                      className="w-full resize-none rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:border-primary focus:outline-none"
                    />
                    <p className="mt-1 text-right text-xs text-muted">{aiCustomInstructions.length}/500</p>
                  </div>

                  {extractedText && (
                    <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-sm text-green-700">
                      <CheckCircle2 size={15} />
                      Menu importé joint aux instructions.
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: Import ── */}
              {aiTab === "import" && (
                <div className="space-y-4 p-5">
                  <p className="text-sm text-muted">
                    Importez une photo de votre ancien menu. L&apos;IA extraira le contenu et le redesignera.
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {importPreview ? (
                    <div className="relative overflow-hidden rounded-xl border border-border bg-white">
                      <img
                        src={importPreview}
                        alt="Aperçu du menu importé"
                        className="max-h-[300px] w-full object-contain"
                      />
                      <div className="absolute right-2 top-2">
                        <button
                          onClick={() => { setImportFile(null); setImportPreview(null); setExtractedText(null); }}
                          className="rounded-lg bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="border-t border-border bg-gray-50 px-3 py-2">
                        <p className="truncate text-xs text-muted">{importFile?.name}</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-white px-6 py-10 transition-all hover:border-primary/40 hover:bg-primary/5"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <FileImage size={24} className="text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Cliquez pour importer</p>
                        <p className="mt-0.5 text-xs text-muted">JPG, PNG ou WebP · max 10 Mo</p>
                      </div>
                    </button>
                  )}

                  {importFile && !extractedText && (
                    <Button onClick={handleExtractMenu} disabled={isExtracting} className="w-full rounded-xl">
                      {isExtracting ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                      {isExtracting ? "Extraction en cours..." : "Extraire le contenu"}
                    </Button>
                  )}

                  {extractedText && (
                    <div className="animate-scale-in">
                      <div className="mb-2 flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-green-600" />
                        <p className="text-sm font-semibold text-green-700">Contenu extrait</p>
                      </div>
                      <div className="max-h-[240px] overflow-y-auto rounded-xl border border-green-200 bg-green-50/50 p-3">
                        <pre className="whitespace-pre-wrap text-xs text-foreground">{extractedText}</pre>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          onClick={() => setAiTab("options")}
                          size="sm"
                          className="rounded-xl bg-gradient-to-r from-primary to-orange-500"
                        >
                          <Sparkles size={13} />
                          Redesigner avec l&apos;IA
                        </Button>
                        <Button onClick={() => setExtractedText(null)} size="sm" variant="ghost" className="rounded-xl">
                          Effacer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: Modify (Story 20.1) ── */}
              {aiTab === "modify" && isAiMenu && (
                <div className="space-y-4 p-5">
                  <p className="text-sm text-muted">
                    Décrivez une modification en langage naturel. L&apos;IA l&apos;applique sur votre design sans tout régénérer.
                  </p>

                  {/* Quick suggestions */}
                  <div className="flex flex-wrap gap-2">
                    {ITERATE_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setIteratePrompt(s)}
                        className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={iteratePrompt}
                    onChange={(e) => setIteratePrompt(e.target.value)}
                    placeholder="Ex: Rends les titres plus grands, change le fond en crème..."
                    maxLength={300}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:border-primary focus:outline-none"
                  />
                  <p className="mt-1 text-right text-xs text-muted">{iteratePrompt.length}/300</p>

                  {iterateError && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                      <AlertCircle size={14} />
                      {iterateError}
                    </div>
                  )}
                  {iterateSuccess && (
                    <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
                      <CheckCircle2 size={14} />
                      Modification appliquée !
                    </div>
                  )}

                  <Button
                    onClick={handleIterateDesign}
                    disabled={isIterating || !iteratePrompt.trim()}
                    className="w-full rounded-xl"
                  >
                    {isIterating ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Application en cours...
                      </>
                    ) : (
                      <>
                        <Wand2 size={15} />
                        Appliquer la modification
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted">Modification en ~3 secondes · 3 requêtes/min</p>
                </div>
              )}
            </div>

            {/* Footer — Generate button (only on options tab) */}
            {aiTab === "options" && (
              <div className="shrink-0 border-t border-border bg-white p-5">
                <Button
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI}
                  className="w-full rounded-xl bg-gradient-to-r from-primary to-orange-500 py-3 text-base shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                >
                  {isGeneratingAI ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  {isGeneratingAI ? "Génération en cours..." : "Générer le design"}
                </Button>
                <p className="mt-2 text-center text-xs text-muted">
                  L&apos;IA crée un design unique en ~15 secondes
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════════ Generation Progress Modal ══════════════════ */}
      {isGeneratingAI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="animate-scale-in mx-4 w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50/60 px-6 pb-6 pt-6">
              <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full border border-primary/8" />
              <div className="pointer-events-none absolute -right-7 -top-7 h-28 w-28 rounded-full border border-primary/12" />
              <div className="relative mb-5 flex items-center gap-3">
                <div className="animate-pulse-glow flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-md shadow-primary/30">
                  <Wand2 size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Génération IA en cours…</p>
                  <p className="text-xs text-muted">Veuillez patienter quelques instants</p>
                </div>
              </div>
              <div className="relative flex justify-center">
                <div className="relative">
                  <svg width="180" height="180" viewBox="0 0 200 200" className="overflow-visible" aria-hidden="true">
                    <defs>
                      <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF6B35" />
                        <stop offset="100%" stopColor="#FBBF24" />
                      </linearGradient>
                      <filter id="glow-filter" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <circle cx="100" cy="100" r="94" fill="none" stroke="#FF6B35" strokeWidth="1" opacity="0.15" className="animate-pulse" />
                    <circle cx="100" cy="100" r={RING_R} fill="none" stroke="#F0ECE8" strokeWidth="13" />
                    <circle
                      cx="100" cy="100" r={RING_R}
                      fill="none"
                      stroke="url(#ring-gradient)"
                      strokeWidth="13"
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset={ringDashOffset}
                      transform="rotate(-90 100 100)"
                      filter="url(#glow-filter)"
                      style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
                    />
                    {generationProgress > 2 && (
                      <g style={{ transformOrigin: "100px 100px", transform: `rotate(${tipRotationDeg}deg)`, transition: "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                        <circle cx="100" cy={100 - RING_R} r="10" fill="#FF6B35" opacity="0.25" />
                        <circle cx="100" cy={100 - RING_R} r="7" fill="#FF6B35" filter="url(#glow-filter)" />
                        <circle cx="100" cy={100 - RING_R} r="3" fill="white" opacity="0.9" />
                      </g>
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold tabular-nums text-foreground" style={{ transition: "all 0.8s ease" }}>
                      {generationProgress}
                    </span>
                    <span className="text-sm font-medium text-muted">%</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm font-semibold text-foreground">{currentStepInfo?.label}</p>
                <p className="mt-0.5 text-xs text-muted">{currentStepInfo?.sublabel}</p>
              </div>
            </div>
            <div className="space-y-2 px-6 py-5">
              {visibleSteps.filter((s) => s.key !== "done").map((step, idx) => {
                const isDone = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={step.key} className={`flex items-center gap-3 transition-all duration-500 ${isCurrent ? "opacity-100" : isDone ? "opacity-70" : "opacity-30"}`}>
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isDone ? "bg-green-500" : isCurrent ? "bg-primary shadow-sm shadow-primary/40" : "border-2 border-border bg-white"}`}>
                      {isDone && <span className="text-[9px] font-black text-white">✓</span>}
                      {isCurrent && <div className="h-2 w-2 animate-pulse rounded-full bg-white" />}
                    </div>
                    <p className={`flex-1 text-xs font-medium ${isCurrent ? "text-foreground" : isDone ? "text-muted" : "text-muted/50"}`}>{step.label}</p>
                    {isCurrent && <Loader2 size={12} className="shrink-0 animate-spin text-primary" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Success banner */}
      {aiSuccess && (
        <div className="animate-slide-down border-b border-green-200 bg-green-50">
          <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-3 py-2">
            <CheckCircle2 size={16} className="text-green-600" />
            <p className="text-sm font-medium text-green-700">Design généré avec succès !</p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {aiError && (
        <div className="animate-slide-down border-b border-red-200 bg-red-50">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-red-500" />
              <p className="text-sm text-red-600">{aiError}</p>
            </div>
            <button onClick={() => setAiError(null)} className="rounded-lg p-1 text-red-400 hover:bg-red-100 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════ Mobile tab switcher ══════════════════ */}
      <div className="flex border-b border-border bg-white lg:hidden">
        <button
          onClick={() => setMobileTab("content")}
          className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${mobileTab === "content" ? "border-b-2 border-primary text-primary" : "text-muted"}`}
        >
          Contenu
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${mobileTab === "preview" ? "border-b-2 border-primary text-primary" : "text-muted"}`}
        >
          Aperçu
        </button>
      </div>

      {/* ══════════════════ Split layout ══════════════════ */}
      <div className="flex h-[calc(100vh-3.5rem-41px)] lg:h-[calc(100vh-3.5rem)]">

        {/* ── Left: Editor ── */}
        <div className={`flex flex-col overflow-hidden border-r border-border lg:w-[48%] ${mobileTab === "content" ? "w-full" : "hidden lg:flex"}`}>
          {/* Left toolbar */}
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-white px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted">Contenu</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowImportUrlModal(true)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-surface hover:text-foreground"
                title="Importer depuis Deliveroo / Uber Eats"
              >
                <Globe size={12} />
                <span>Import URL</span>
              </button>
              <button
                onClick={() => setShowJsonImport(!showJsonImport)}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors ${showJsonImport ? "bg-surface text-foreground" : "text-muted hover:bg-surface hover:text-foreground"}`}
              >
                <FileUp size={12} />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* JSON import */}
          {showJsonImport && (
            <div className="animate-slide-down shrink-0 border-b border-border bg-surface px-4 py-3">
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{"categories": [{"name": "Entrées", "dishes": [{"name": "...", "price": 12.00}]}]}'
                rows={5}
                className="w-full resize-none rounded-xl border border-border bg-white px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted/40 focus:border-primary focus:outline-none"
                autoFocus
              />
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={handleImportJson} disabled={!jsonText.trim()} className="rounded-xl">
                  <FileUp size={13} /> Importer
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowJsonImport(false); setJsonText(""); }} className="rounded-xl">
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {/* Scrollable categories */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mx-auto max-w-xl space-y-2">
              {menu.categories
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((category, idx) => (
                  <div key={category.id} className="animate-slide-up" style={{ animationDelay: `${idx * 40}ms` }}>
                    <CategoryEditor menuId={menuId} category={category} onUpdate={fetchMenu} />
                  </div>
                ))}

              {showAddCategory ? (
                <div className="animate-scale-in mt-2 flex items-center gap-2">
                  <Input
                    placeholder="Ex: Entrées, Plats, Desserts..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                    autoFocus
                  />
                  <Button size="sm" onClick={handleAddCategory}>Ajouter</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowAddCategory(false); setNewCategoryName(""); }}>
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-4 text-sm text-muted transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  <Plus size={16} />
                  Ajouter une catégorie
                </button>
              )}

              {menu.categories.length === 0 && isPro && !showAddCategory && (
                <div className="mt-4 rounded-2xl border border-dashed border-primary/20 bg-gradient-to-br from-orange-50/50 to-white p-6 text-center">
                  <Sparkles size={28} className="mx-auto mb-3 text-primary/40" />
                  <p className="text-sm font-semibold text-foreground">
                    Ajoutez vos plats, l&apos;IA créera un design unique
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Ou importez une photo / URL de votre menu existant
                  </p>
                  <Button size="sm" variant="outline" className="mt-4" onClick={() => { setShowAIPanel(true); setAiTab("import"); }}>
                    <Upload size={13} />
                    Importer un menu existant
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Preview ── */}
        <div className={`flex flex-col bg-[#e8eaed] lg:w-[52%] ${mobileTab === "preview" ? "w-full" : "hidden lg:flex"}`}>

          {/* Preview toolbar */}
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted">Aperçu</span>
              {menu.isPublished && (
                <a
                  href={`/m/${menu.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-[10px] font-medium text-success transition-colors hover:bg-green-100"
                >
                  <Globe size={10} />
                  Voir la page publique
                </a>
              )}

            </div>

            {/* Preview toolbar actions */}
            <div className="flex items-center gap-1">
              {isAiMenu && (
                <>
                  {/* Story 20.3 — Undo/Redo */}
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    title="Annuler (Ctrl+Z)"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground disabled:opacity-30"
                  >
                    <Undo2 size={13} />
                  </button>
                  <button
                    onClick={redo}
                    disabled={!canRedo}
                    title="Rétablir (Ctrl+Shift+Z)"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground disabled:opacity-30"
                  >
                    <Redo2 size={13} />
                  </button>
                  {undoPosition && (
                    <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted">
                      {undoPosition}
                    </span>
                  )}

                  <div className="h-4 w-px bg-border" />

                  {/* Story 20.4 — Palette swap */}
                  <div className="relative" ref={palettePopoverRef}>
                    <button
                      onClick={() => { setShowPalettePopover(!showPalettePopover); setShowFontPopover(false); }}
                      title="Changer la couleur"
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${showPalettePopover ? "bg-surface text-foreground" : "text-muted hover:bg-surface hover:text-foreground"}`}
                    >
                      {detectedColor && (
                        <span className="inline-block h-3 w-3 rounded-full border border-border/50 shadow-sm" style={{ backgroundColor: detectedColor }} />
                      )}
                      <Palette size={12} />
                      <span className="hidden sm:inline">Couleurs</span>
                    </button>

                    {showPalettePopover && (
                      <div className="absolute right-0 top-full z-30 mt-1.5 w-64 rounded-xl border border-border bg-white p-3 shadow-xl">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Palette présets</p>
                        <div className="grid grid-cols-4 gap-2">
                          {PALETTE_PRESETS.map((p) => (
                            <button
                              key={p.color}
                              onClick={() => handleSwapColor(p.color)}
                              title={p.name}
                              className="group relative flex flex-col items-center gap-1"
                            >
                              <span
                                className="h-8 w-8 rounded-full border-2 border-transparent shadow-sm transition-all group-hover:scale-110 group-hover:border-white group-hover:shadow-md"
                                style={{ backgroundColor: p.color }}
                              />
                              <span className="text-[9px] text-muted">{p.name.split(" ")[0]}</span>
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 border-t border-border pt-3">
                          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Couleur libre</p>
                          <input
                            type="color"
                            defaultValue={detectedColor ?? "#FF6B35"}
                            onChange={(e) => {}}
                            onBlur={(e) => handleSwapColor(e.target.value)}
                            className="h-9 w-full cursor-pointer rounded-lg border border-border"
                          />
                        </div>
                        {detectedColor && (
                          <p className="mt-2 text-[10px] text-muted">
                            Couleur actuelle : <span className="font-mono font-semibold">{detectedColor}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Story 20.5 — Font swap */}
                  <div className="relative" ref={fontPopoverRef}>
                    <button
                      onClick={() => { setShowFontPopover(!showFontPopover); setShowPalettePopover(false); }}
                      title="Changer la police"
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${showFontPopover ? "bg-surface text-foreground" : "text-muted hover:bg-surface hover:text-foreground"}`}
                    >
                      <Type size={12} />
                      <span className="hidden sm:inline">Polices</span>
                    </button>

                    {showFontPopover && (
                      <div className="absolute right-0 top-full z-30 mt-1.5 w-72 rounded-xl border border-border bg-white p-3 shadow-xl">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Paires de polices</p>
                        <div className="space-y-1.5">
                          {FONT_PRESETS.map((pair) => (
                            <button
                              key={pair.name}
                              onClick={() => handleSwapFont(pair)}
                              className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
                            >
                              <div>
                                <p className="text-xs font-semibold text-foreground">{pair.name}</p>
                                <p className="text-[10px] text-muted">{pair.display} · {pair.body}</p>
                              </div>
                              <span className="text-[10px] font-medium text-muted/60">{pair.preview}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Story 20.2 — Edit mode */}
                  <button
                    onClick={() => setEditMode(!editMode)}
                    title={editMode ? "Désactiver l'édition inline" : "Activer l'édition inline (double-clic)"}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${editMode ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface hover:text-foreground"}`}
                  >
                    <Edit3 size={12} />
                    <span className="hidden sm:inline">{editMode ? "Édition ✓" : "Éditer"}</span>
                  </button>

                  {/* Story 20.6 — Snapshot history */}
                  <button
                    onClick={() => setShowSnapshotPanel(!showSnapshotPanel)}
                    title="Versions sauvegardées"
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${showSnapshotPanel ? "bg-surface text-foreground" : "text-muted hover:bg-surface hover:text-foreground"}`}
                  >
                    <Clock size={12} />
                    <span className="hidden lg:inline">Versions</span>
                  </button>

                  {/* Story 20.8 — Reorder sections */}
                  <button
                    onClick={() => {
                      const next = !reorderMode;
                      setReorderMode(next);
                      if (next) detectSectionsInIframe();
                    }}
                    disabled={!iframeRef.current}
                    title="Réordonner les sections"
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${reorderMode ? "bg-surface text-foreground" : "text-muted hover:bg-surface hover:text-foreground"} disabled:opacity-30`}
                  >
                    <GripVertical size={12} />
                    <span className="hidden lg:inline">Réordonner</span>
                  </button>

                  {/* Layout editor — drag & resize frames */}
                  <button
                    onClick={() => setLayoutMode(!layoutMode)}
                    disabled={!iframeRef.current}
                    title={layoutMode ? "Quitter la mise en page" : "Déplacer et redimensionner les cadres"}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${layoutMode ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface hover:text-foreground"} disabled:opacity-30`}
                  >
                    <ZoomIn size={12} />
                    <span className="hidden lg:inline">{layoutMode ? "Mise en page ✓" : "Mise en page"}</span>
                  </button>

                  <div className="h-4 w-px bg-border" />
                </>
              )}

              {/* Zoom controls */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setPreviewZoom((z) => Math.max(0.3, Math.round((z - 0.1) * 10) / 10))}
                  title="Dézoomer"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground"
                >
                  <ZoomOut size={13} />
                </button>
                <button
                  onClick={() => setPreviewZoom(1.0)}
                  title="Réinitialiser le zoom"
                  className="min-w-[2.5rem] rounded-lg px-1.5 py-0.5 text-center text-[10px] font-medium tabular-nums text-muted transition-colors hover:bg-surface hover:text-foreground"
                >
                  {Math.round(previewZoom * 100)}%
                </button>
                <button
                  onClick={() => setPreviewZoom((z) => Math.min(2.0, Math.round((z + 0.1) * 10) / 10))}
                  title="Zoomer"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground"
                >
                  <ZoomIn size={13} />
                </button>
              </div>

              <div className="h-4 w-px bg-border" />

              {/* Refresh */}
              <button
                onClick={() => setPdfKey((k) => k + 1)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <RefreshCw size={12} />
                <span className="hidden sm:inline">Rafraîchir</span>
              </button>
            </div>
          </div>

          {/* ── Story 20.6 — Snapshot panel ── */}
          {showSnapshotPanel && isAiMenu && (
            <div className="shrink-0 border-b border-border bg-white">
              <div className="px-4 py-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Versions sauvegardées</p>
                  <button onClick={() => setShowSnapshotPanel(false)} className="text-muted hover:text-foreground">
                    <X size={14} />
                  </button>
                </div>

                {/* Save current */}
                <div className="mb-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nom de la version (optionnel)"
                    value={snapshotLabelInput}
                    onChange={(e) => setSnapshotLabelInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateSnapshot()}
                    className="flex-1 rounded-lg border border-border px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                  />
                  <Button size="sm" onClick={handleCreateSnapshot} disabled={isSavingSnapshot} className="rounded-lg text-xs">
                    {isSavingSnapshot ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    Sauvegarder
                  </Button>
                </div>

                {/* Snapshots list */}
                {isLoadingSnapshots ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 size={16} className="animate-spin text-muted" />
                  </div>
                ) : snapshots.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted">Aucune version sauvegardée</p>
                ) : (
                  <div className="max-h-48 space-y-1.5 overflow-y-auto">
                    {[...snapshots].reverse().map((snap) => (
                      <div
                        key={snap.id}
                        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2"
                      >
                        {renamingSnapId === snap.id ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => handleRenameSnapshot(snap.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRenameSnapshot(snap.id);
                              if (e.key === "Escape") { setRenamingSnapId(null); setRenameValue(""); }
                            }}
                            className="flex-1 rounded bg-white px-1.5 py-0.5 text-xs border border-border focus:outline-none"
                          />
                        ) : (
                          <div className="flex-1 min-w-0">
                            <p
                              className="truncate text-xs font-medium text-foreground cursor-pointer hover:text-primary"
                              onDoubleClick={() => { setRenamingSnapId(snap.id); setRenameValue(snap.label); }}
                              title="Double-clic pour renommer"
                            >
                              {snap.label}
                            </p>
                            <p className="text-[10px] text-muted">
                              {new Date(snap.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        )}
                        <button
                          onClick={() => handleRestoreSnapshot(snap.id)}
                          title="Restaurer cette version"
                          className="shrink-0 rounded px-1.5 py-1 text-[10px] font-medium text-primary hover:bg-primary/10"
                        >
                          <RotateCcw size={11} />
                        </button>
                        {confirmDeleteSnapId === snap.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteSnapshot(snap.id)}
                              className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                            >
                              Oui
                            </button>
                            <button
                              onClick={() => setConfirmDeleteSnapId(null)}
                              className="rounded px-1.5 py-0.5 text-[10px] text-muted hover:bg-surface"
                            >
                              Non
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteSnapId(snap.id)}
                            title="Supprimer"
                            className="shrink-0 rounded p-1 text-muted hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Story 20.8 — Section reorder panel ── */}
          {reorderMode && isAiMenu && (
            <div className="shrink-0 border-b border-border bg-white px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Réordonner les sections</p>
                <button onClick={() => setReorderMode(false)} className="text-muted hover:text-foreground">
                  <X size={14} />
                </button>
              </div>
              {detectedSections.length < 2 ? (
                <p className="py-2 text-xs text-muted">Sections non détectées dans ce design. Essayez de rafraîchir.</p>
              ) : (
                <div className="space-y-1">
                  {detectedSections.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                      <GripVertical size={13} className="shrink-0 text-muted/40" />
                      <span className="flex-1 truncate text-xs font-medium text-foreground">{name}</span>
                      <button
                        onClick={() => moveSectionUp(idx)}
                        disabled={idx === 0}
                        className="rounded p-0.5 text-muted hover:bg-surface hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        onClick={() => moveSectionDown(idx)}
                        disabled={idx === detectedSections.length - 1}
                        className="rounded p-0.5 text-muted hover:bg-surface hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronDown size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Layout mode save bar ── */}
          {layoutMode && isAiMenu && (
            <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
              <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-white px-4 py-2.5 shadow-xl">
                <span className="text-xs font-medium text-foreground">
                  Glissez et redimensionnez les cadres
                </span>
                <div className="h-4 w-px bg-border" />
                <button
                  onClick={saveLayoutAndExit}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  <CheckCircle2 size={12} />
                  Sauvegarder
                </button>
                <button
                  onClick={() => setLayoutMode(false)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-surface hover:text-foreground"
                >
                  <X size={12} />
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* ── Iterating overlay ── */}
          {isIterating && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-400">
                  <Wand2 size={22} className="animate-pulse text-white" />
                </div>
                <p className="text-sm font-semibold text-foreground">Modification en cours…</p>
                <p className="text-xs text-muted">L&apos;IA applique votre instruction</p>
              </div>
            </div>
          )}

          {/* Preview */}
          {hasDishes ? (
            <div className="relative flex-1">
              <iframe
                key={pdfKey}
                ref={iframeRef}
                src={previewSrc}
                className="h-full w-full"
                title="Aperçu du menu"
                onLoad={handleIframeLoad}
              />
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <FileText size={28} className="text-muted/40" />
                </div>
                <p className="text-sm font-medium text-muted/70">
                  Ajoutez des plats pour voir l&apos;aperçu
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════ Floating AI button ══════════════════ */}
      {isPro && !showAIPanel && (
        <button
          onClick={() => { setShowAIPanel(true); setShowTemplateSelector(false); }}
          disabled={isGeneratingAI}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary to-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGeneratingAI ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          <span>
            {isGeneratingAI
              ? "Génération..."
              : isAiMenu
              ? "Régénérer avec IA"
              : "Générer avec IA"}
          </span>
        </button>
      )}

      {/* Import from URL modal */}
      {showImportUrlModal && (
        <ImportFromUrlModal
          menuId={menuId}
          onClose={() => setShowImportUrlModal(false)}
          onImported={() => {
            fetchMenu();
            setPdfKey((k) => k + 1);
          }}
        />
      )}

      {/* Share by email modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowShareModal(false); setShareSuccess(false); setShareError(null); } }}
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Partager par email</h2>
              <button
                onClick={() => { setShowShareModal(false); setShareSuccess(false); setShareError(null); }}
                className="rounded-full p-1 text-muted hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {shareSuccess ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 size={40} className="text-green-500" />
                <p className="font-medium text-foreground">Email envoyé avec succès !</p>
                <p className="text-sm text-muted">Le menu a été partagé avec {shareEmail}</p>
              </div>
            ) : (
              <form onSubmit={handleShareByEmail} className="space-y-4">
                <p className="text-sm text-muted">
                  Entrez l&apos;adresse email du destinataire pour lui partager le lien de votre menu.
                </p>
                {shareError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{shareError}</div>
                )}
                <Input
                  id="share-email"
                  label="Email du destinataire"
                  type="email"
                  placeholder="client@exemple.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  required
                />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-lg"
                    onClick={() => { setShowShareModal(false); setShareError(null); }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1 rounded-lg" isLoading={isSharingEmail}>
                    <Send size={14} />
                    Envoyer
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
