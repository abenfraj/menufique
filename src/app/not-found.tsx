import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF8F2] px-4 text-center">
      <div className="mb-6 text-8xl font-black text-primary opacity-20">404</div>
      <h1 className="mb-3 text-3xl font-bold text-foreground">
        Page introuvable
      </h1>
      <p className="mb-8 max-w-md text-base text-muted">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button variant="outline">Retour à l&apos;accueil</Button>
        </Link>
        <Link href="/dashboard">
          <Button>Mon tableau de bord</Button>
        </Link>
      </div>
      <div className="mt-12 text-5xl">🍽️</div>
    </div>
  );
}
