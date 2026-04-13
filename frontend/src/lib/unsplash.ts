type UnsplashSearchResponse = {
  results?: Array<{
    urls?: {
      regular?: string;
      small?: string;
    };
  }>;
};

export async function fetchUnsplashImageUrl(
  query: string,
  accessKey: string,
): Promise<string | null> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return null;
  }

  const normalizedAccessKey = accessKey.trim();
  if (!normalizedAccessKey) {
    throw new Error("Az Unsplash access key hianyzik.");
  }

  const params = new URLSearchParams({
    query: normalizedQuery,
    per_page: "1",
    orientation: "squarish",
    content_filter: "high",
  });

  const response = await fetch(`https://api.unsplash.com/search/photos?${params.toString()}`, {
    headers: {
      Authorization: `Client-ID ${normalizedAccessKey}`,
      "Accept-Version": "v1",
    },
  });

  if (!response.ok) {
    const details = await response.text();
    const compactDetails = details.replace(/\s+/g, " ").trim();
    const message = compactDetails
      ? `Unsplash API hivas sikertelen (${response.status}): ${compactDetails}`
      : `Unsplash API hivas sikertelen (${response.status}).`;
    throw new Error(message);
  }

  const data = (await response.json()) as UnsplashSearchResponse;
  const topHit = data.results?.[0];

  return topHit?.urls?.regular ?? topHit?.urls?.small ?? null;
}
