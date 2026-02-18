import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Plus,
  FileText,
  Globe,
  Pencil,
  Settings,
  Store,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [menus, restaurant, user] = await Promise.all([
    prisma.menu.findMany({
      where: { userId: session.user.id },
      include: {
        categories: {
          include: { dishes: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.restaurant.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    }),
  ]);

  const totalDishes = menus.reduce(
    (sum, menu) =>
      sum +
      menu.categories.reduce((catSum, cat) => catSum + cat.dishes.length, 0),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-foreground">
            Menufique
          </h1>
          <div className="flex items-center gap-4">
            {user?.plan !== "PRO" && (
              <Link
                href="/dashboard/billing"
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                <Crown size={14} />
                <span>Passer Pro</span>
              </Link>
            )}
            {user?.plan === "PRO" && (
              <Link
                href="/dashboard/billing"
                className="flex items-center gap-1.5 text-sm font-medium text-primary"
              >
                <Crown size={14} />
                <span className="hidden sm:inline">Pro</span>
              </Link>
            )}
            <Link
              href="/settings/restaurant"
              className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Paramètres</span>
            </Link>
            <span className="text-sm text-muted">
              {session.user.name ?? session.user.email}
            </span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-muted hover:text-foreground"
            >
              Déconnexion
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Restaurant banner if not configured */}
        {!restaurant && (
          <Link
            href="/settings/restaurant"
            className="mb-6 flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 transition-colors hover:bg-orange-100"
          >
            <Store size={20} className="text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">
                Configurez votre restaurant
              </p>
              <p className="text-sm text-muted">
                Ajoutez le nom, l&apos;adresse et les horaires de votre
                restaurant
              </p>
            </div>
          </Link>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Bonjour{session.user.name ? `, ${session.user.name}` : ""} !
            </h2>
            <p className="text-muted">
              {menus.length > 0
                ? `${menus.length} menu${menus.length > 1 ? "s" : ""} · ${totalDishes} plat${totalDishes > 1 ? "s" : ""}`
                : "Gérez vos menus de restaurant en un seul endroit."}
            </p>
          </div>
          <Link
            href="/menus/new"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 font-medium text-white transition-colors hover:bg-primary-hover"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nouveau menu</span>
          </Link>
        </div>

        {menus.length === 0 ? (
          /* Empty state */
          <Card className="py-12 text-center">
            <CardHeader className="items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
                <FileText size={32} className="text-primary" />
              </div>
              <CardTitle>Aucun menu pour l&apos;instant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted">
                Créez votre premier menu en quelques minutes.
              </p>
              <Link
                href="/menus/new"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 font-medium text-white transition-colors hover:bg-primary-hover"
              >
                <Plus size={20} />
                Créer mon premier menu
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Menu list */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menus.map((menu) => {
              const dishCount = menu.categories.reduce(
                (sum, cat) => sum + cat.dishes.length,
                0
              );
              return (
                <Link key={menu.id} href={`/menus/${menu.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="pt-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {menu.name}
                          </h3>
                          <p className="mt-1 text-sm text-muted">
                            {menu.categories.length} catégorie
                            {menu.categories.length !== 1 ? "s" : ""} ·{" "}
                            {dishCount} plat{dishCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {menu.isPublished && (
                          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                            <Globe size={12} />
                            Publié
                          </span>
                        )}
                      </div>

                      {/* Quick preview: first few dishes */}
                      {menu.categories.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {menu.categories.slice(0, 2).map((cat) => (
                            <div key={cat.id}>
                              <p className="text-xs font-medium uppercase text-muted tracking-wide">
                                {cat.name}
                              </p>
                              {cat.dishes.slice(0, 2).map((dish) => (
                                <div
                                  key={dish.id}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="truncate text-foreground">
                                    {dish.name}
                                  </span>
                                  <span className="shrink-0 text-primary">
                                    {formatPrice(Number(dish.price))}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-muted">
                          <Pencil size={10} />
                          {menu.templateId}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
