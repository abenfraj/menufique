import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // Dynamic public menus
  let menuPages: MetadataRoute.Sitemap = [];
  try {
    const menus = await prisma.menu.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    menuPages = menus.map((menu) => ({
      url: `${appUrl}/m/${menu.slug}`,
      lastModified: menu.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable at build time — return static pages only
  }

  return [...staticPages, ...menuPages];
}
