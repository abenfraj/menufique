import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getTemplate } from "@/templates";
import { TemplateData } from "@/templates/types";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

interface PublicMenuPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PublicMenuPageProps): Promise<Metadata> {
  const { slug } = await params;
  const menu = await prisma.menu.findUnique({
    where: { slug },
    include: { restaurant: true },
  });

  if (!menu || !menu.isPublished) return {};

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const menuUrl = `${appUrl}/m/${slug}`;

  return {
    title: `${menu.name} - ${menu.restaurant.name}`,
    description: `Consultez le menu de ${menu.restaurant.name}. ${menu.restaurant.address ?? ""}`.trim(),
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: "Menufique",
      title: `${menu.name} - ${menu.restaurant.name}`,
      description: `Consultez le menu de ${menu.restaurant.name}`,
      url: menuUrl,
    },
    twitter: {
      card: "summary",
      title: `${menu.name} - ${menu.restaurant.name}`,
      description: `Consultez le menu de ${menu.restaurant.name}`,
    },
  };
}

export default async function PublicMenuPage({ params }: PublicMenuPageProps) {
  const { slug } = await params;

  const menu = await prisma.menu.findUnique({
    where: { slug },
    include: {
      restaurant: true,
      user: { select: { plan: true } },
      categories: {
        include: { dishes: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!menu || !menu.isPublished) {
    notFound();
  }

  const customColors = (menu.customColors as Record<string, string>) ?? {};
  const customFonts = (menu.customFonts as Record<string, string>) ?? {};

  const templateData: TemplateData = {
    restaurant: {
      name: menu.restaurant.name,
      address: menu.restaurant.address ?? undefined,
      phone: menu.restaurant.phone ?? undefined,
      email: menu.restaurant.email ?? undefined,
      website: menu.restaurant.website ?? undefined,
      logoUrl: menu.restaurant.logoUrl ?? undefined,
    },
    menu: {
      name: menu.name,
      categories: menu.categories.map((cat) => ({
        name: cat.name,
        description: cat.description ?? undefined,
        dishes: cat.dishes.map((dish) => ({
          name: dish.name,
          description: dish.description ?? undefined,
          price: formatPrice(Number(dish.price)),
          allergens: dish.allergens,
          isAvailable: dish.isAvailable,
        })),
      })),
    },
    customization: {
      primaryColor: customColors.primary ?? "#FF6B35",
      backgroundColor: customColors.background ?? "#FFF8F2",
      textColor: customColors.text ?? "#1A1A2E",
      headingFont: customFonts.heading ?? "Playfair Display",
      bodyFont: customFonts.body ?? "Inter",
    },
    branding: {
      showWatermark: menu.user.plan === "FREE",
    },
    aiDesignHtml: menu.aiDesignHtml ?? undefined,
    aiBackgroundUrl: menu.aiBackgroundUrl ?? undefined,
  };

  const Template = getTemplate(menu.templateId);

  const isBistrot = menu.templateId === "bistrot";
  const isAiCustom = menu.templateId === "ai-custom";

  return (
    <div className={`min-h-screen ${isBistrot ? "bg-[#0E0A07]" : "bg-gray-100"}`}>
      <div className={`mx-auto p-4 sm:py-8 ${isAiCustom ? "max-w-2xl" : "max-w-lg"}`}>
        <div
          className={`overflow-hidden rounded-2xl shadow-lg ${
            isAiCustom ? "" : isBistrot ? "" : "bg-white p-6 sm:p-8"
          }`}
        >
          <Template data={templateData} />
        </div>
      </div>
    </div>
  );
}
