import Link from "next/link";
import { UtensilsCrossed, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
          <UtensilsCrossed size={18} />
        </div>
        <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-foreground">
          Menufique
        </span>
      </Link>

      {/* Big 404 */}
      <div className="mb-2 font-[family-name:var(--font-playfair)] text-[120px] font-black leading-none text-primary/10 select-none">
        404
      </div>

      <h1 className="mt-2 text-2xl font-bold text-foreground">
        Page introuvable
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
        Vérifiez l&apos;URL ou retournez à l&apos;accueil.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-white"
        >
          <Home size={15} />
          Accueil
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          <ArrowLeft size={15} />
          Mon tableau de bord
        </Link>
      </div>
    </div>
  );
}
