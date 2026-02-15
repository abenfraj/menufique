import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
          <UtensilsCrossed size={24} />
        </div>
        <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-foreground">
          Menufique
        </span>
      </Link>
      {children}
    </div>
  );
}
