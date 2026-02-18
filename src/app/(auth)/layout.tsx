import { UtensilsCrossed, Star } from "lucide-react";
import Link from "next/link";

const TESTIMONIAL = {
  text: "J'ai créé mon menu en 3 minutes. Mes clients adorent scanner le QR code !",
  author: "Sophie L.",
  role: "Bistrot Le Coin, Paris",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between bg-sidebar px-12 py-10 shrink-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <UtensilsCrossed size={20} />
          </div>
          <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">
            Menufique
          </span>
        </Link>

        {/* Value props */}
        <div className="space-y-6">
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold leading-tight text-white">
              Votre menu professionnel
              <br />
              <span className="text-primary">en 5 minutes.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-sidebar-muted">
              Saisissez vos plats, choisissez un design, et obtenez un PDF
              prêt à imprimer avec QR code inclus.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {["PDF haute qualité", "QR Code", "14 allergènes", "IA incluse", "Gratuit"].map((f) => (
              <span
                key={f}
                className="rounded-full border border-sidebar-border px-3 py-1 text-xs font-medium text-sidebar-muted"
              >
                {f}
              </span>
            ))}
          </div>

          {/* Testimonial */}
          <div className="rounded-2xl border border-sidebar-border bg-white/5 p-5">
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm leading-relaxed text-white/80">
              &ldquo;{TESTIMONIAL.text}&rdquo;
            </p>
            <div className="mt-3">
              <p className="text-sm font-semibold text-white">{TESTIMONIAL.author}</p>
              <p className="text-xs text-sidebar-muted">{TESTIMONIAL.role}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-sidebar-muted">
          &copy; 2026 Menufique
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
