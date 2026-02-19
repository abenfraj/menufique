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

type AIStyle = "auto" | "elegant" | "modern" | "rustic" | "minimal" | "colorful";
type AIColor = "auto" | "warm" | "cool" | "dark" | "pastel";
type AIComplexity = "simple" | "detailed" | "luxe";
type AIImageMode = "none" | "emojis";
type AITab = "options" | "import";

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

// ─── Component ───────────────────────────────

interface MenuEditorProps {
  menuId: string;
  userPlan?: string;
}

export function MenuEditor({ menuId, userPlan = "FREE" }: MenuEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // URL import state
  const [showImportUrlModal, setShowImportUrlModal] = useState(false);

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<"content" | "preview">("content");

  // Share state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [isSharingEmail, setIsSharingEmail] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

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

  // Auto-dismiss success message
  useEffect(() => {
    if (aiSuccess) {
      const t = setTimeout(() => setAiSuccess(false), 4000);
      return () => clearTimeout(t);
    }
  }, [aiSuccess]);

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
          setAiError(null);
          setShowTemplateSelector(false);
          // Redirect to billing
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
    setIsGeneratingAI(true);
    setAiError(null);
    setAiSuccess(false);
    setGenerationStep("analyzing");
    setShowAIPanel(false);
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
      fetchMenu();
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

  // ─── Ring progress computation ───────────────
  const currentStepInfo = GENERATION_STEPS.find((s) => s.key === generationStep);
  const generationProgress = currentStepInfo?.progress ?? 0;
  const RING_R = 80;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R; // ≈ 502.65
  const ringDashOffset = RING_CIRCUMFERENCE * (1 - generationProgress / 100);
  const tipRotationDeg = (generationProgress / 100) * 360;
  const visibleSteps = GENERATION_STEPS.filter((s) => s.key !== "cover" || aiIncludeCoverPage);
  const currentStepIdx = visibleSteps.findIndex((s) => s.key === generationStep);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            {/* Template */}
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

            {/* PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf || !hasDishes}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted transition-all hover:bg-surface hover:text-foreground disabled:opacity-40"
              title="Télécharger en PDF"
            >
              {isDownloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span className="hidden sm:inline">{isDownloadingPdf ? "PDF..." : "PDF"}</span>
            </button>

            {/* Share */}
            {menu.isPublished && (
              <button
                onClick={() => { setShowShareModal(true); setShareError(null); setShareSuccess(false); }}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted transition-all hover:bg-surface hover:text-foreground"
              >
                <Mail size={14} />
                <span className="hidden sm:inline">Partager</span>
              </button>
            )}

            {/* Divider */}
            <div className="h-5 w-px bg-border" />

            {/* Publish */}
            <button
              onClick={handleTogglePublish}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                menu.isPublished
                  ? "bg-success-light text-success hover:bg-green-100"
                  : "bg-primary text-white hover:bg-primary-hover"
              }`}
            >
              {menu.isPublished ? (
                <>
                  <Globe size={13} />
                  <span className="hidden sm:inline">Publié</span>
                </>
              ) : (
                <>
                  <Globe size={13} />
                  <span className="hidden sm:inline">Publier</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Template selector dropdown */}
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
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
            onClick={() => setShowAIPanel(false)}
          />

          {/* Drawer */}
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
                className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  aiTab === "options"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Sparkles size={14} />
                Nouveau design
              </button>
              <button
                onClick={() => setAiTab("import")}
                className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  aiTab === "import"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Upload size={14} />
                Importer un menu
              </button>
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

                  {/* Extracted text indicator */}
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
                    <Button
                      onClick={handleExtractMenu}
                      disabled={isExtracting}
                      className="w-full rounded-xl"
                    >
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
                        <Button
                          onClick={() => setExtractedText(null)}
                          size="sm"
                          variant="ghost"
                          className="rounded-xl"
                        >
                          Effacer
                        </Button>
                      </div>
                    </div>
                  )}
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

            {/* Top section — ring */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50/60 px-6 pb-6 pt-6">
              {/* Decorative background circles */}
              <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full border border-primary/8" />
              <div className="pointer-events-none absolute -right-7 -top-7 h-28 w-28 rounded-full border border-primary/12" />

              {/* Header */}
              <div className="relative mb-5 flex items-center gap-3">
                <div className="animate-pulse-glow flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-md shadow-primary/30">
                  <Wand2 size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Génération IA en cours…</p>
                  <p className="text-xs text-muted">Veuillez patienter quelques instants</p>
                </div>
              </div>

              {/* Circular progress ring */}
              <div className="relative flex justify-center">
                <div className="relative">
                  <svg
                    width="180" height="180"
                    viewBox="0 0 200 200"
                    className="overflow-visible"
                    aria-hidden="true"
                  >
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

                    {/* Outer pulse ring */}
                    <circle cx="100" cy="100" r="94" fill="none" stroke="#FF6B35" strokeWidth="1" opacity="0.15" className="animate-pulse" />

                    {/* Track */}
                    <circle cx="100" cy="100" r={RING_R} fill="none" stroke="#F0ECE8" strokeWidth="13" />

                    {/* Progress arc */}
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

                    {/* Glowing tip dot — rotates around center instead of lerping cx/cy */}
                    {generationProgress > 2 && (
                      <g
                        style={{
                          transformOrigin: "100px 100px",
                          transform: `rotate(${tipRotationDeg}deg)`,
                          transition: "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        {/* Outer glow halo */}
                        <circle cx="100" cy={100 - RING_R} r="10" fill="#FF6B35" opacity="0.25" />
                        {/* Main dot */}
                        <circle cx="100" cy={100 - RING_R} r="7" fill="#FF6B35" filter="url(#glow-filter)" />
                        {/* Inner white gleam */}
                        <circle cx="100" cy={100 - RING_R} r="3" fill="white" opacity="0.9" />
                      </g>
                    )}
                  </svg>

                  {/* Centered percentage */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-4xl font-bold tabular-nums text-foreground"
                      style={{ transition: "all 0.8s ease" }}
                    >
                      {generationProgress}
                    </span>
                    <span className="text-sm font-medium text-muted">%</span>
                  </div>
                </div>
              </div>

              {/* Current step label */}
              <div className="mt-4 text-center">
                <p className="text-sm font-semibold text-foreground" style={{ transition: "all 0.4s ease" }}>
                  {currentStepInfo?.label}
                </p>
                <p className="mt-0.5 text-xs text-muted" style={{ transition: "all 0.4s ease" }}>
                  {currentStepInfo?.sublabel}
                </p>
              </div>
            </div>

            {/* Step list */}
            <div className="space-y-2 px-6 py-5">
              {visibleSteps.filter((s) => s.key !== "done").map((step, idx) => {
                const isDone = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div
                    key={step.key}
                    className={`flex items-center gap-3 transition-all duration-500 ${
                      isCurrent ? "opacity-100" : isDone ? "opacity-70" : "opacity-30"
                    }`}
                  >
                    {/* Status dot */}
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isDone
                          ? "bg-green-500"
                          : isCurrent
                          ? "bg-primary shadow-sm shadow-primary/40"
                          : "border-2 border-border bg-white"
                      }`}
                    >
                      {isDone && (
                        <span className="text-[9px] font-black text-white">✓</span>
                      )}
                      {isCurrent && (
                        <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                      )}
                    </div>

                    {/* Label */}
                    <p className={`flex-1 text-xs font-medium ${isCurrent ? "text-foreground" : isDone ? "text-muted" : "text-muted/50"}`}>
                      {step.label}
                    </p>

                    {/* Spinner for current */}
                    {isCurrent && (
                      <Loader2 size={12} className="shrink-0 animate-spin text-primary" />
                    )}
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
            <p className="text-sm font-medium text-green-700">
              Design généré avec succès !
            </p>
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
            <button
              onClick={() => setAiError(null)}
              className="rounded-lg p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════ Mobile tab switcher ══════════════════ */}
      <div className="flex border-b border-border bg-white lg:hidden">
        <button
          onClick={() => setMobileTab("content")}
          className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
            mobileTab === "content"
              ? "border-b-2 border-primary text-primary"
              : "text-muted"
          }`}
        >
          Contenu
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
            mobileTab === "preview"
              ? "border-b-2 border-primary text-primary"
              : "text-muted"
          }`}
        >
          Aperçu
        </button>
      </div>

      {/* ══════════════════ Split layout ══════════════════ */}
      <div className="flex h-[calc(100vh-3.5rem-41px)] lg:h-[calc(100vh-3.5rem)]">

        {/* Left: Editor */}
        <div className={`flex flex-col overflow-hidden border-r border-border lg:w-[48%] ${
          mobileTab === "content" ? "w-full" : "hidden lg:flex"
        }`}>
          {/* Left toolbar */}
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-white px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted">
              Contenu
            </span>
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
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors ${
                  showJsonImport ? "bg-surface text-foreground" : "text-muted hover:bg-surface hover:text-foreground"
                }`}
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
                    <CategoryEditor
                      menuId={menuId}
                      category={category}
                      onUpdate={fetchMenu}
                    />
                  </div>
                ))}

              {/* Add category */}
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

              {/* Empty state — PRO */}
              {menu.categories.length === 0 && isPro && !showAddCategory && (
                <div className="mt-4 rounded-2xl border border-dashed border-primary/20 bg-gradient-to-br from-orange-50/50 to-white p-6 text-center">
                  <Sparkles size={28} className="mx-auto mb-3 text-primary/40" />
                  <p className="text-sm font-semibold text-foreground">
                    Ajoutez vos plats, l&apos;IA créera un design unique
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Ou importez une photo / URL de votre menu existant
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4"
                    onClick={() => { setShowAIPanel(true); setAiTab("import"); }}
                  >
                    <Upload size={13} />
                    Importer un menu existant
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className={`flex flex-col bg-[#e8eaed] lg:w-[52%] ${
          mobileTab === "preview" ? "w-full" : "hidden lg:flex"
        }`}>
          {/* Preview toolbar */}
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-white px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted">
                Aperçu
              </span>
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
            <button
              onClick={() => setPdfKey((k) => k + 1)}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              <RefreshCw size={12} />
              Rafraîchir
            </button>
          </div>

          {hasDishes ? (
            <iframe
              key={pdfKey}
              src={`/api/menus/${menuId}/preview`}
              className="flex-1 w-full"
              title="Aperçu du menu"
            />
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
          {isGeneratingAI ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          <span>
            {isGeneratingAI
              ? "Génération..."
              : menu.templateId === "ai-custom"
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
                  <Button
                    type="submit"
                    className="flex-1 rounded-lg"
                    isLoading={isSharingEmail}
                  >
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
