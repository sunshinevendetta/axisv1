type LumaResolvedEvent = {
  title: string;
  description: string;
  startsAt: string;
  timezone: string;
  venueName: string;
  city: string;
  lumaEventId?: string;
  lumaUrl: string;
  imageUrl?: string;
  summary: string;
};

function normalizeLumaReference(reference: string) {
  const trimmed = reference.trim();

  if (!trimmed) {
    throw new Error("A Luma event ID or URL is required.");
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("evt-")) {
    return `https://luma.com/event/${trimmed}`;
  }

  return `https://luma.com/${trimmed.replace(/^\//, "")}`;
}

function extractScriptJson(html: string, marker: string) {
  const regex = new RegExp(`<script[^>]*${marker}[^>]*>([\\s\\S]*?)<\\/script>`, "i");
  return html.match(regex)?.[1];
}

function stripHtml(text: string) {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function toSummary(description: string) {
  const compact = description.replace(/\s+/g, " ").trim();
  if (compact.length <= 180) {
    return compact;
  }

  return `${compact.slice(0, 177).trim()}...`;
}

export async function resolveLumaEvent(reference: string): Promise<LumaResolvedEvent> {
  const url = normalizeLumaReference(reference);
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0",
      accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load Luma event (${response.status}).`);
  }

  const html = await response.text();
  const nextDataRaw = extractScriptJson(html, 'id="__NEXT_DATA__"');
  const ldJsonRaw = extractScriptJson(html, 'type="application/ld\\+json"');

  const nextData = nextDataRaw ? JSON.parse(nextDataRaw) : null;
  const ldJson = ldJsonRaw ? JSON.parse(ldJsonRaw) : null;

  const lumaEvent = nextData?.props?.pageProps?.initialData?.data?.event;
  const geoInfo = lumaEvent?.geo_address_info;
  const imageUrl =
    (Array.isArray(ldJson?.image) ? ldJson.image[0] : ldJson?.image) ?? lumaEvent?.cover_url ?? undefined;
  const description = stripHtml(String(ldJson?.description ?? html.match(/<meta name="description" content="([^"]+)"/i)?.[1] ?? ""));

  const resolvedUrl =
    String(html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1] ?? "") ||
    (lumaEvent?.url ? `https://luma.com/${lumaEvent.url}` : url);

  return {
    title: String(ldJson?.name ?? lumaEvent?.name ?? "").trim(),
    description,
    startsAt: String(ldJson?.startDate ?? lumaEvent?.start_at ?? "").trim(),
    timezone: String(lumaEvent?.timezone ?? "America/Mexico_City"),
    venueName: String(geoInfo?.short_address ?? geoInfo?.address ?? ldJson?.location?.name ?? "").trim(),
    city: String(
      geoInfo?.localized?.["es-419"]?.city ??
        geoInfo?.city ??
        ldJson?.location?.address?.addressLocality ??
        "",
    ).trim(),
    lumaEventId: lumaEvent?.api_id,
    lumaUrl: resolvedUrl,
    imageUrl,
    summary: toSummary(description),
  };
}
