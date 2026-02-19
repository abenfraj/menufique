import { UtensilsCrossed, Star, FileText, QrCode, Sparkles, Printer } from "lucide-react";
import Link from "next/link";

const TESTIMONIALS = [
  {
    text: "J'ai créé mon menu en 3 minutes. Mes clients adorent scanner le QR code !",
    author: "Sophie L.",
    role: "Bistrot Le Coin, Paris",
  },
  {
    text: "Le design IA est magnifique. Exactement ce qu'il me fallait.",
    author: "Marie-Claire D.",
    role: "Restaurant gastronomique",
  },
];

const FEATURES = [
  { icon: FileText, text: "PDF haute qualité, prêt à imprimer" },
  { icon: QrCode, text: "QR Code inclus, page web mobile" },
  { icon: Sparkles, text: "Design IA unique par restaurant" },
  { icon: Printer, text: "14 allergènes EU intégrés" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col bg-sidebar px-12 py-10 shrink-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <UtensilsCrossed size={20} />
          </div>
          <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">
            Menufique
          </span>
        </Link>

        {/* Value props — vertically centered */}
        <div className="flex flex-1 flex-col justify-center space-y-8">
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold leading-tight text-white">
              Votre menu professionnel
              <br />
              <span className="text-primary">en 5 minutes.</span>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-sidebar-muted">
              Saisissez vos plats, choisissez un design, et obtenez un PDF
              prêt à imprimer avec QR code inclus.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon size={15} className="text-primary" />
                </div>
                <span className="text-sm text-sidebar-muted">{text}</span>
              </div>
            ))}
          </div>

          {/* Stars rating */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-xs text-sidebar-muted">4,9/5 · +500 restaurants</span>
          </div>

          {/* Testimonial */}
          <div className="rounded-2xl border border-sidebar-border bg-white/5 p-5">
            <p className="text-sm leading-relaxed text-white/80">
              &ldquo;{TESTIMONIALS[0].text}&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {TESTIMONIALS[0].author.slice(0, 1)}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{TESTIMONIALS[0].author}</p>
                <p className="text-xs text-sidebar-muted">{TESTIMONIALS[0].role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-sidebar-muted">
          &copy; 2026 Menufique · Gratuit pour démarrer
        </p>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        {/* Mobile logo */}
        <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <UtensilsCrossed size={20} />
          </div>
          <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-foreground">
            Menufique
          </span>
        </Link>
        {children}
      </div>
    </div>
  );
}
