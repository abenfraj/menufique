import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchFoodImages } from "@/lib/unsplash";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const count = Math.min(parseInt(searchParams.get("count") ?? "16", 10) || 16, 40);

    if (!query || query.length > 100) {
      return NextResponse.json(
        { error: "Paramètre de recherche invalide (max 100 caractères)" },
        { status: 400 }
      );
    }

    const images = await searchFoodImages(query, count);
    return NextResponse.json({ data: images });
  } catch (error) {
    console.error("Erreur recherche images:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche d'images" },
      { status: 500 }
    );
  }
}
