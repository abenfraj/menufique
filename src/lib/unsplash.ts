export interface SearchImage {
  id: string;
  thumb: string;
  full: string;
  alt: string;
}

/**
 * Scrape Google Images search results.
 * Extracts image URLs from the embedded metadata in Google's HTML.
 */
export async function searchFoodImages(
  query: string,
  count = 16
): Promise<SearchImage[]> {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&ijn=0`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "fr-FR,fr;q=0.9",
    },
  });

  if (!res.ok) {
    throw new Error(`Google Images scrape error: ${res.status}`);
  }

  const html = await res.text();
  const images: SearchImage[] = [];
  const seen = new Set<string>();

  // Google embeds full-size image URLs in JSON arrays like: ["URL", width, height]
  // They appear twice (thumbnail + full), so we deduplicate
  const regex = /\["(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)",\s*(\d+),\s*(\d+)\]/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const imgUrl = match[1];

    // Skip Google's own assets
    if (
      imgUrl.includes("gstatic.com") ||
      imgUrl.includes("google.com") ||
      imgUrl.includes("googleapis.com") ||
      seen.has(imgUrl)
    ) {
      continue;
    }

    const width = parseInt(match[2], 10);
    const height = parseInt(match[3], 10);

    // Only keep reasonably sized images
    if (width < 200 || height < 200) continue;

    seen.add(imgUrl);
    images.push({
      id: `gimg-${images.length}`,
      thumb: imgUrl,
      full: imgUrl,
      alt: query,
    });
  }

  return images.slice(0, count);
}
