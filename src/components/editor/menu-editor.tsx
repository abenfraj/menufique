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

type GenerationStep = "analyzing" | "designing" | "generating-image" | "saving" | "done";

const STEP_LABELS: Record<GenerationStep, string> = {
  analyzing: "Analyse de vos plats...",
  designing: "Création du design par l'IA...",
  "generating-image": "Génération de la page de couverture...",
  saving: "Enregistrement...",
  done: "Terminé !",
};

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
      setTimeout(() => setGenerationStep("designing"), 2000);
      if (aiIncludeCoverPage) {
        setTimeout(() => setGenerationStep("generating-image"), 8000);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-100 hover:text-foreground"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                className="bg-transparent font-[family-name:var(--font-playfair)] text-base font-bold text-foreground outline-none transition-all focus:underline focus:decoration-primary/30"
              />
              {isSaving && (
                <Save size={14} className="animate-pulse text-muted" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* AI Button */}
            {isPro && (
              <button
                onClick={() => {
                  setShowAIPanel(!showAIPanel);
                  setShowTemplateSelector(false);
                }}
                disabled={isGeneratingAI}
                className={`group relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all disabled:opacity-50 ${
                  showAIPanel
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "border border-primary/20 bg-gradient-to-r from-primary/5 to-orange-50 text-primary hover:shadow-md hover:shadow-primary/10"
                }`}
              >
                {isGeneratingAI ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} className="transition-transform group-hover:scale-110" />
                )}
                <span className="hidden sm:inline">
                  {isGeneratingAI
                    ? "Génération..."
                    : menu.templateId === "ai-custom"
                      ? "Régénérer"
                      : "IA Design"}
                </span>
              </button>
            )}

            {/* Template selector */}
            <button
              onClick={() => {
                setShowTemplateSelector(!showTemplateSelector);
                setShowAIPanel(false);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm text-muted transition-all hover:border-primary/30 hover:text-foreground"
            >
              <Palette size={14} />
              <span className="hidden sm:inline">Template</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf || !hasDishes}
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm text-muted transition-all hover:border-primary/30 hover:text-foreground disabled:opacity-50"
              title="Télécharger en PDF"
            >
              {isDownloadingPdf ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              <span className="hidden sm:inline">
                {isDownloadingPdf ? "PDF..." : "PDF"}
              </span>
            </button>

            {/* Share by email */}
            {menu.isPublished && (
              <button
                onClick={() => { setShowShareModal(true); setShareError(null); setShareSuccess(false); }}
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm text-muted transition-all hover:border-primary/30 hover:text-foreground"
                title="Partager par email"
              >
                <Mail size={14} />
                <span className="hidden sm:inline">Partager</span>
              </button>
            )}

            {/* Publish */}
            <Button
              size="sm"
              variant={menu.isPublished ? "outline" : "primary"}
              onClick={handleTogglePublish}
              className="rounded-lg"
            >
              {menu.isPublished ? (
                <>
                  <EyeOff size={14} />
                  <span className="hidden sm:inline">Dépublier</span>
                </>
              ) : (
                <>
                  <Globe size={14} />
                  <span className="hidden sm:inline">Publier</span>
                </>
              )}
            </Button>
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

      {/* ══════════════════ AI Panel ══════════════════ */}
      {showAIPanel && (
        <div className="animate-slide-down border-b border-primary/15 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50">
          <div className="mx-auto max-w-[1600px] px-3 py-3">
            {/* Panel header + tabs */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-orange-500 shadow-sm">
                    <Wand2 size={14} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    Design IA
                  </h3>
                </div>
                {/* Tabs */}
                <div className="flex rounded-lg border border-border bg-white/80 p-0.5">
                  <button
                    onClick={() => setAiTab("options")}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                      aiTab === "options"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <Sparkles size={11} className="mr-1 inline" />
                    Nouveau design
                  </button>
                  <button
                    onClick={() => setAiTab("import")}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                      aiTab === "import"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <Upload size={11} className="mr-1 inline" />
                    Importer un menu
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowAIPanel(false)}
                className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Tab: Options ── */}
            {aiTab === "options" && (
              <div className="animate-fade-in">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                  {/* Complexity */}
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                      <Sparkles size={12} />
                      Niveau
                    </label>
                    <div className="flex flex-col gap-1">
                      {COMPLEXITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setAiComplexity(opt.value)}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all ${
                            aiComplexity === opt.value
                              ? "border-primary bg-white text-foreground shadow-sm shadow-primary/10"
                              : "border-transparent bg-white/60 text-muted hover:border-border hover:bg-white"
                          }`}
                        >
                          <span className="text-base leading-none">{opt.icon}</span>
                          <div>
                            <p className={`text-xs font-medium ${aiComplexity === opt.value ? "text-foreground" : "text-muted"}`}>{opt.label}</p>
                            <p className="text-[10px] text-muted">{opt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style */}
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                      <Paintbrush size={12} />
                      Style
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {STYLE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setAiStyle(opt.value)}
                          className={`group rounded-lg border p-1.5 text-center transition-all ${
                            aiStyle === opt.value
                              ? "border-primary bg-white text-primary shadow-sm shadow-primary/10"
                              : "border-transparent bg-white/60 text-muted hover:border-border hover:bg-white hover:shadow-sm"
                          }`}
                        >
                          <span className="block text-sm leading-none">{opt.icon}</span>
                          <span className="mt-0.5 block text-[10px] font-medium">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                      <Palette size={12} />
                      Couleurs
                    </label>
                    <div className="flex flex-col gap-1">
                      {COLOR_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setAiColor(opt.value)}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-all ${
                            aiColor === opt.value
                              ? "border-primary bg-white text-foreground shadow-sm shadow-primary/10"
                              : "border-transparent bg-white/60 text-muted hover:border-border hover:bg-white"
                          }`}
                        >
                          <span className="flex gap-0.5">
                            {opt.colors.map((c) => (
                              <span
                                key={c}
                                className="inline-block h-3.5 w-3.5 rounded-full shadow-sm"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </span>
                          <span className="text-xs font-medium">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Images — only Typographic and Emojis */}
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                      <Type size={12} />
                      Images
                    </label>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setAiImageMode("none")}
                        className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all ${
                          aiImageMode === "none"
                            ? "border-primary bg-white shadow-sm shadow-primary/10"
                            : "border-transparent bg-white/60 hover:border-border hover:bg-white"
                        }`}
                      >
                        <Type size={14} className={aiImageMode === "none" ? "text-primary" : "text-muted"} />
                        <div>
                          <p className={`text-xs font-medium ${aiImageMode === "none" ? "text-foreground" : "text-muted"}`}>Typographique</p>
                          <p className="text-[10px] text-muted">Polices et couleurs</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setAiImageMode("emojis")}
                        className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all ${
                          aiImageMode === "emojis"
                            ? "border-primary bg-white shadow-sm shadow-primary/10"
                            : "border-transparent bg-white/60 hover:border-border hover:bg-white"
                        }`}
                      >
                        <span className={`text-sm ${aiImageMode === "emojis" ? "" : "opacity-50"}`}>🍽️</span>
                        <div>
                          <p className={`text-xs font-medium ${aiImageMode === "emojis" ? "text-foreground" : "text-muted"}`}>Emojis</p>
                          <p className="text-[10px] text-muted">Icônes décoratives</p>
                        </div>
                      </button>

                      {/* Cover page toggle */}
                      <button
                        onClick={() => setAiIncludeCoverPage(!aiIncludeCoverPage)}
                        className={`mt-1 flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all ${
                          aiIncludeCoverPage
                            ? "border-primary bg-white shadow-sm shadow-primary/10"
                            : "border-transparent bg-white/60 hover:border-border hover:bg-white"
                        }`}
                      >
                        <FileImage size={14} className={aiIncludeCoverPage ? "text-primary" : "text-muted"} />
                        <div>
                          <p className={`text-xs font-medium ${aiIncludeCoverPage ? "text-foreground" : "text-muted"}`}>Page de couverture</p>
                          <p className="text-[10px] text-muted">Image hero + nom</p>
                        </div>
                      </button>

                      <p className="mt-1 text-[10px] text-muted/70">
                        Ajoutez des photos par plat via le bouton &quot;Chercher une photo&quot; dans l&apos;éditeur.
                      </p>
                    </div>
                  </div>

                  {/* Pages */}
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                      <FileText size={12} />
                      Pages
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {([1, 2, 3, 4] as const).map((n) => (
                        <button
                          key={n}
                          onClick={() => setAiMenuPageCount(n)}
                          className={`rounded-lg border px-2.5 py-2 text-center transition-all ${
                            aiMenuPageCount === n
                              ? "border-primary bg-white text-primary shadow-sm shadow-primary/10"
                              : "border-transparent bg-white/60 text-muted hover:border-border hover:bg-white"
                          }`}
                        >
                          <span className="block text-sm font-medium">{n}</span>
                          <span className="block text-[10px] text-muted">page{n > 1 ? "s" : ""}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                      <MessageSquare size={12} />
                      Instructions
                    </label>
                    <textarea
                      value={aiCustomInstructions}
                      onChange={(e) => setAiCustomInstructions(e.target.value)}
                      placeholder="Ex: style art déco avec du doré, bordures ornées..."
                      maxLength={500}
                      rows={4}
                      className="w-full resize-none rounded-lg border border-border bg-white px-2.5 py-2 text-xs text-foreground placeholder:text-muted/40 transition-colors focus:border-primary focus:outline-none"
                    />
                    <p className="mt-0.5 text-right text-[10px] text-muted">
                      {aiCustomInstructions.length}/500
                    </p>
                  </div>
                </div>

                {/* Extracted text indicator */}
                {extractedText && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-xs text-green-700">
                    <CheckCircle2 size={13} />
                    Menu importé joint aux instructions.
                  </div>
                )}

                {/* Generate button */}
                <div className="mt-3 flex items-center gap-3">
                  <Button
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="rounded-lg bg-gradient-to-r from-primary to-orange-500 px-5 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30"
                  >
                    {isGeneratingAI ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Sparkles size={15} />
                    )}
                    {isGeneratingAI ? "Génération en cours..." : "Générer le design"}
                  </Button>
                  <p className="text-xs text-muted">
                    L&apos;IA analyse vos plats et crée un design unique en ~15 secondes.
                  </p>
                </div>
              </div>
            )}

            {/* ── Tab: Import ── */}
            {aiTab === "import" && (
              <div className="animate-fade-in">
                <p className="mb-3 text-sm text-muted">
                  Importez une photo de votre ancien menu. L&apos;IA extraira le contenu et le redesignera.
                </p>

                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Upload zone */}
                  <div>
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
                          className="max-h-[250px] w-full object-contain"
                        />
                        <div className="absolute right-2 top-2 flex gap-1">
                          <button
                            onClick={() => {
                              setImportFile(null);
                              setImportPreview(null);
                              setExtractedText(null);
                            }}
                            className="rounded-lg bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="border-t border-border bg-gray-50 px-3 py-1.5">
                          <p className="truncate text-xs text-muted">{importFile?.name}</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-white/60 px-6 py-8 transition-all hover:border-primary/40 hover:bg-white"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <FileImage size={20} className="text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">
                            Cliquez pour importer
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            JPG, PNG ou WebP (max 10 Mo)
                          </p>
                        </div>
                      </button>
                    )}

                    {importFile && !extractedText && (
                      <Button
                        onClick={handleExtractMenu}
                        disabled={isExtracting}
                        size="sm"
                        className="mt-2 w-full rounded-lg"
                      >
                        {isExtracting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Wand2 size={14} />
                        )}
                        {isExtracting ? "Extraction en cours..." : "Extraire le contenu"}
                      </Button>
                    )}
                  </div>

                  {/* Extracted content */}
                  <div>
                    {extractedText ? (
                      <div className="animate-scale-in">
                        <div className="mb-2 flex items-center gap-2">
                          <CheckCircle2 size={15} className="text-green-600" />
                          <p className="text-xs font-semibold text-green-700">Contenu extrait</p>
                        </div>
                        <div className="max-h-[230px] overflow-y-auto rounded-xl border border-green-200 bg-green-50/50 p-3">
                          <pre className="whitespace-pre-wrap text-xs text-foreground">{extractedText}</pre>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Button
                            onClick={() => setAiTab("options")}
                            size="sm"
                            className="rounded-lg bg-gradient-to-r from-primary to-orange-500"
                          >
                            <Sparkles size={13} />
                            Redesigner avec l&apos;IA
                          </Button>
                          <Button
                            onClick={() => setExtractedText(null)}
                            size="sm"
                            variant="ghost"
                            className="rounded-lg"
                          >
                            Effacer
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border bg-white/40 p-6">
                        <div className="text-center">
                          <Upload size={28} className="mx-auto mb-2 text-muted/30" />
                          <p className="text-sm text-muted/60">
                            Le contenu extrait s&apos;affichera ici
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ Generation Progress Bar ══════════════════ */}
      {isGeneratingAI && (
        <div className="animate-slide-down border-b border-primary/20">
          <div className="animate-shimmer bg-gradient-to-r from-orange-50 via-primary/5 to-orange-50">
            <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-3 py-3">
              <div className="animate-pulse-glow flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-orange-500">
                <Wand2 size={16} className="animate-pulse text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {STEP_LABELS[generationStep]}
                </p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-primary/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-1000"
                    style={{
                      width:
                        generationStep === "analyzing" ? "15%" :
                        generationStep === "designing" ? "50%" :
                        generationStep === "generating-image" ? "75%" :
                        generationStep === "saving" ? "90%" : "100%",
                    }}
                  />
                </div>
              </div>
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

      {/* ══════════════════ Content: split layout like bolt.new ══════════════════ */}
      <div className="flex h-[calc(100vh-3rem)]">
        {/* Left: Editor (scrollable) */}
        <div className="w-1/2 overflow-y-auto border-r border-border p-4">
          <div className="mx-auto max-w-2xl">
            <div className="space-y-2">
              {menu.categories
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((category, idx) => (
                  <div key={category.id} className="animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                    <CategoryEditor
                      menuId={menuId}
                      category={category}
                      onUpdate={fetchMenu}
                    />
                  </div>
                ))}
            </div>

            {/* Add category */}
            {showAddCategory ? (
              <div className="animate-scale-in mt-3 flex items-center gap-2">
                <Input
                  placeholder="Nom de la catégorie (ex: Entrées, Plats, Desserts)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  className="rounded-lg"
                  autoFocus
                />
                <Button size="sm" onClick={handleAddCategory} className="rounded-lg">
                  Ajouter
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategoryName("");
                  }}
                  className="rounded-lg"
                >
                  Annuler
                </Button>
              </div>
            ) : (
              <>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-muted transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  <Plus size={16} />
                  Ajouter une catégorie
                </button>
                <button
                  onClick={() => setShowJsonImport(!showJsonImport)}
                  className={`flex items-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 transition-all ${
                    showJsonImport
                      ? "border-primary/40 bg-primary/5 text-primary"
                      : "border-border text-muted hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  }`}
                  title="Importer un menu JSON"
                >
                  <FileUp size={16} />
                  JSON
                </button>
              </div>

              {/* JSON import textarea */}
              {showJsonImport && (
                <div className="animate-scale-in mt-3 rounded-lg border border-border bg-white p-3">
                  <p className="mb-2 text-xs font-medium text-muted">
                    Collez votre JSON ci-dessous
                  </p>
                  <textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder='{"categories": [{"name": "Entrées", "dishes": [{"name": "...", "price": 12.00}]}]}'
                    rows={8}
                    className="w-full resize-none rounded-lg border border-border bg-gray-50 px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted/40 focus:border-primary focus:outline-none"
                    autoFocus
                  />
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" onClick={handleImportJson} disabled={!jsonText.trim()} className="rounded-lg">
                      <FileUp size={14} />
                      Importer
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setShowJsonImport(false); setJsonText(""); }}
                      className="rounded-lg"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
              </>
            )}

            {/* Empty state for PRO users */}
            {menu.categories.length === 0 && isPro && (
              <div className="mt-6 rounded-xl border border-dashed border-primary/20 bg-gradient-to-br from-orange-50/50 to-white p-6 text-center">
                <Sparkles size={28} className="mx-auto mb-2 text-primary/40" />
                <p className="text-sm font-medium text-foreground">
                  Ajoutez vos plats puis laissez l&apos;IA créer un design unique
                </p>
                <p className="mt-1 text-xs text-muted">
                  Ou importez une photo de votre ancien menu
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 rounded-lg"
                  onClick={() => {
                    setShowAIPanel(true);
                    setAiTab("import");
                  }}
                >
                  <Upload size={13} />
                  Importer un menu existant
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview (fixed, full height) */}
        <div className="flex w-1/2 flex-col bg-gray-50">
          <div className="flex items-center justify-between border-b border-border bg-white px-3 py-1.5">
            <p className="text-xs font-medium text-muted">Aperçu</p>
            <button
              onClick={() => setPdfKey((k) => k + 1)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-gray-100 hover:text-foreground"
            >
              <RefreshCw size={12} />
              Rafraîchir
            </button>
          </div>
          {hasDishes ? (
            <iframe
              key={pdfKey}
              src={`/api/menus/${menuId}/preview`}
              className="flex-1 w-full bg-white"
              title="Aperçu du menu"
            />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <FileText size={32} className="mx-auto mb-2 text-muted/30" />
                <p className="text-sm text-muted/60">
                  Ajoutez des plats pour voir l&apos;aperçu
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

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
