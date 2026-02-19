import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  Plus,
  FileText,
  Globe,
  Settings,
  Crown,
  ChefHat,
  LayoutTemplate,
  UtensilsCrossed,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

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
    prisma.restaurant.findUnique({ where: { userId: session.user.id } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    }),
  ]);

  const totalDishes = menus.reduce(
    (sum, menu) =>
      sum + menu.categories.reduce((s, c) => s + c.dishes.length, 0),
    0
  );
  const publishedCount = menus.filter((m) => m.isPublished).length;
  const isPro = user?.plan === "PRO";
  const initials = session.user.name
    ? session.user.name.slice(0, 2).toUpperCase()
    : (session.user.email ?? "??").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <UtensilsCrossed size={16} />
            </div>
            <span className="font-[family-name:var(--font-playfair)] text-lg font-bold text-foreground">
              Menufique
            </span>
          </Link>

          {/* Right nav */}
          <div className="flex items-center gap-1">
            {!isPro && (
              <Link
                href="/dashboard/billing"
                className="mr-2 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                <Crown size={13} />
                Passer Pro
              </Link>
            )}
            {isPro && (
              <Link
                href="/dashboard/billing"
                className="mr-2 flex items-center gap-1.5 rounded-lg bg-primary-light px-3 py-1.5 text-sm font-semibold text-primary"
              >
                <Crown size={13} />
                Pro
              </Link>
            )}
            <Link
              href="/settings/restaurant"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground"
              title="Paramètres"
            >
              <Settings size={18} />
            </Link>
            <Link
              href="/api/auth/signout"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground"
              title="Déconnexion"
            >
              <LogOut size={18} />
            </Link>
            <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {initials}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Restaurant setup banner */}
        {!restaurant && (
          <Link
            href="/settings/restaurant"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary-light px-5 py-4 transition-colors hover:bg-primary-100"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <ChefHat size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">Configurez votre restaurant</p>
              <p className="text-sm text-muted">
                Ajoutez le nom, l&apos;adresse et les coordonnées
              </p>
            </div>
            <span className="shrink-0 text-sm font-medium text-primary">
              Commencer →
            </span>
          </Link>
        )}

        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bonjour{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""} 👋
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              {restaurant ? restaurant.name : "Vos menus"}
            </p>
          </div>
          <Link
            href="/menus/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nouveau menu</span>
          </Link>
        </div>

        {/* Stats strip */}
        {menus.length > 0 && (
          <div className="mb-8 grid grid-cols-3 gap-3">
            {[
              { icon: LayoutTemplate, label: "Menus", value: menus.length },
              { icon: ChefHat, label: "Plats", value: totalDishes },
              { icon: Globe, label: "Publiés", value: publishedCount },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-card"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light">
                  <Icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground leading-none">{value}</p>
                  <p className="text-xs text-muted mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {menus.length === 0 && (
          <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-border bg-white py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-light">
              <FileText size={36} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Aucun menu pour l&apos;instant
            </h2>
            <p className="mt-2 max-w-xs text-sm text-muted">
              Créez votre premier menu en quelques minutes. Gratuit, sans carte bancaire.
            </p>
            <Link
              href="/menus/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <Plus size={20} />
              Créer mon premier menu
            </Link>
          </div>
        )}

        {/* Menu grid */}
        {menus.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menus.map((menu) => {
              const dishCount = menu.categories.reduce(
                (sum, cat) => sum + cat.dishes.length,
                0
              );
              const previewDishes = menu.categories
                .flatMap((c) => c.dishes.slice(0, 2))
                .slice(0, 3);

              return (
                <Link key={menu.id} href={`/menus/${menu.id}`} className="group">
                  <div className="flex h-full flex-col rounded-2xl border border-border bg-white p-5 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                    {/* Card header */}
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {menu.name}
                      </h3>
                      {menu.isPublished && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-xs font-medium text-success">
                          <Globe size={10} />
                          Publié
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <p className="mb-3 text-xs text-muted">
                      {menu.categories.length} catégorie{menu.categories.length !== 1 ? "s" : ""}{" "}
                      · {dishCount} plat{dishCount !== 1 ? "s" : ""}
                    </p>

                    {/* Dish preview */}
                    {previewDishes.length > 0 && (
                      <div className="mb-4 flex-1 space-y-1.5 rounded-xl bg-surface px-3 py-2.5">
                        {previewDishes.map((dish) => (
                          <div
                            key={dish.id}
                            className="flex items-baseline justify-between gap-2 text-xs"
                          >
                            <span className="truncate text-foreground">{dish.name}</span>
                            <span className="shrink-0 font-medium text-primary">
                              {formatPrice(Number(dish.price))}
                            </span>
                          </div>
                        ))}
                        {dishCount > previewDishes.length && (
                          <p className="text-xs text-muted">
                            +{dishCount - previewDishes.length} autres…
                          </p>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      {menu.templateId === "ai-custom" ? (
                        <span className="rounded-lg bg-gradient-to-r from-primary/10 to-orange-50 px-2 py-1 text-xs font-semibold text-primary">
                          ✦ IA Design
                        </span>
                      ) : (
                        <span className="rounded-lg bg-surface px-2 py-1 text-xs font-medium capitalize text-muted">
                          {menu.templateId}
                        </span>
                      )}
                      <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Modifier →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
