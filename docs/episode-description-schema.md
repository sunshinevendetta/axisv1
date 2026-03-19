# Episode Description Schema

## Purpose

Defines how episode description data should be structured in `content/episodes.json` so the UI renders it in sectioned, styled blocks rather than a raw text dump. Any AI agent, editor, or automation pipeline adding or updating episodes must follow this schema.

---

## Schema — `meta` field

Each episode entry in `content/episodes.json` can include an optional `meta` object:

```json
"meta": {
  "es": "string — Spanish-language description of the episode.",
  "en": "string — English-language description of the episode.",
  "music": ["@handle", "@handle"],
  "allies": ["@handle", "Brand Name", "@handle"],
  "venue": "@venue_social_handle",
  "tags": ["keyword", "keyword"]
}
```

### Field rules

| Field | Type | Required | Description |
|---|---|---|---|
| `en` | `string` | recommended | Primary description in English. Max ~400 chars. No hashtags or social syntax. |
| `es` | `string` | optional | Spanish version of the same description. Rendered behind a toggle. |
| `music` | `string[]` | optional | Social handles of music acts, DJs, or performers. Format: `@handle`. |
| `allies` | `string[]` | optional | Partner brands, protocols, collaborators. Can mix handles and plain names. |
| `venue` | `string` | optional | Social handle of the venue. Format: `@handle`. |
| `tags` | `string[]` | optional | Lowercase keywords for filtering, search, and metadata. |

---

## Agent prompt — parsing raw Luma descriptions

Use this prompt when importing a raw Luma event description into the structured `meta` format:

```
You are parsing a raw Luma event description for the SPECTRA episode catalog.

Extract and return a JSON object with these fields:
- "en": the English-language description block only. Remove all social handles, dates, venue tags, music credits, and ally mentions. Clean sentences only. Max 400 chars.
- "es": the Spanish-language description block only. Same cleaning rules as "en".
- "music": an array of all social handles listed after "Music:" or equivalent. Format each as "@handle".
- "allies": an array of all partner/ally handles and brand names listed after "allies:", "partners:", or equivalent. Format handles as "@handle", plain names as-is.
- "venue": the single venue social handle if present. Format: "@handle".
- "tags": 4–8 lowercase keywords that describe the experience type, tech used, and cultural genre (e.g. "anime", "AR", "NFC", "art", "music", "CDMX").

Rules:
- Do not include dates, times, or city names in "en" or "es".
- Do not hallucinate. If a field has no data in the source, omit it.
- Return only valid JSON, no explanation.

Raw description:
[PASTE RAW LUMA DESCRIPTION HERE]
```

---

## Example — Episode 4

Input (raw Luma dump):
```
SPECTRA regresa a Studio Berlin para la edición 04. PSYOP Anime llega como una mini sala de cine...
English SPECTRA returns to Studio Berlin for edition 04...
Music: @ambrozmusic @coronela____ @dansmacias @reyespaco @sunshinevendetta more to be announced
allies: @11oncepizza @refraction_irl tortoise music [@base_ app] 21.03.2026 @studioberlin__ CDMX
```

Output (structured `meta`):
```json
{
  "es": "SPECTRA regresa a Studio Berlin para la edición 04. PSYOP Anime llega como una mini sala de cine dentro del venue...",
  "en": "SPECTRA returns to Studio Berlin for edition 04. PSYOP Anime arrives as a mini cinema inside the venue...",
  "music": ["@ambrozmusic", "@coronela____", "@dansmacias", "@reyespaco", "@sunshinevendetta"],
  "allies": ["@11oncepizza", "@refraction_irl", "tortoise music", "@base_app", "@studioberlin__"],
  "venue": "@studioberlin__",
  "tags": ["anime", "AR", "NFC", "art", "music", "CDMX"]
}
```

---

## UI rendering

The `EpisodeMetaBlock` component in `components/EpisodesCards.tsx` renders `meta` as:

1. **`en`** — primary description block, always visible, `text-white/48`
2. **`es`** — hidden behind a `ver en español +` toggle
3. **`music`** — labelled inline handle list, `text-white/44`
4. **`allies`** — labelled inline handle/name list, `text-white/44`
5. **`tags`** — outlined pill chips, `text-white/30`

If `meta` is absent, the raw `description` string falls back.

---

## Luma pull system

The repo has a full Luma scraping pipeline already implemented. Agents and editors must use it instead of manually copying Luma text.

### How it works

| Layer | File | What it does |
|---|---|---|
| Scraper | `src/lib/luma.ts` → `resolveLumaEvent(reference)` | Fetches Luma HTML, parses `__NEXT_DATA__` and `ld+json`, returns structured `LumaResolvedEvent` |
| API route | `app/api/admin/luma/route.ts` → `POST /api/admin/luma` | Owner-session protected endpoint. Accepts `{ reference }`, returns `{ event: LumaResolvedEvent }` |
| Admin UI | `components/admin/EpisodesAdminPanel.tsx` | The Episodes HQ panel calls this route, merges returned fields into the draft episode, and saves to `content/episodes.json` via `PATCH /api/admin/episodes/[slug]` |
| Catalog write | `src/lib/episodes-store.ts` → `writeEpisodeCatalog()` | Writes the updated catalog back to `content/episodes.json` |

### `LumaResolvedEvent` shape

```ts
type LumaResolvedEvent = {
  title: string;
  description: string;   // raw, full text from Luma — feed this into the meta agent prompt
  startsAt: string;      // ISO 8601
  timezone: string;
  venueName: string;
  city: string;
  lumaEventId?: string;  // evt-xxx format
  lumaUrl: string;       // canonical luma.com URL
  imageUrl?: string;
  summary: string;       // auto-truncated to 180 chars from description
}
```

Fields that get merged into `content/episodes.json` on a pull: `title`, `description`, `startsAt`, `timezone`, `venueName`, `city`, `lumaEventId`, `lumaUrl`, `assets.imageUri`.

The `meta` block is **not** auto-populated by the pull — run the agent prompt (see above) against `event.description` after pulling.

### Accepted reference formats

All three formats resolve to the same event:

```
evt-8zhDxcY3FslgVT5           ← Luma internal event ID
hiys43uw                      ← Luma short slug
https://luma.com/hiys43uw     ← full URL
https://luma.com/event/evt-8zhDxcY3FslgVT5
```

### Triggering a pull — API

Requires an active owner session (wallet-signed). From a script or agent:

```bash
# 1. Authenticate — obtain session cookie via /api/admin/session (wallet sign flow)
# 2. Pull Luma data
curl -X POST https://spectrart.xyz/api/admin/luma \
  -H "Content-Type: application/json" \
  -b "session=<owner_session_cookie>" \
  -d '{ "reference": "evt-8zhDxcY3FslgVT5" }'

# Response
{
  "event": {
    "title": "SPECTRA 4.0",
    "description": "...",
    "startsAt": "2026-03-21T18:00:00-06:00",
    ...
  }
}
```

### Triggering a pull — Episodes HQ UI

1. Go to `/owner/episodes` (requires owner wallet)
2. Select the episode to update
3. Enter any valid Luma reference in the **Luma Reference** field
4. Click **Pull from Luma**
5. Fields merge into the draft — review, then click **Save**

### Back-date pulls

The scraper fetches live Luma HTML with no date restrictions. Past events remain accessible on Luma indefinitely. To back-fill an older episode:

1. Find the past event's `lumaEventId` (format: `evt-xxx`) — check the existing entry in `content/episodes.json` or the Luma event URL
2. Pass it to `resolveLumaEvent("evt-xxx")` or `POST /api/admin/luma` with `{ "reference": "evt-xxx" }`
3. The scraper returns the original event data including description, date, venue, and cover image
4. Merge into the episode entry, then run the meta agent prompt against the returned `description` to populate the `meta` block

Back-date pull is useful when:
- An episode entry was created as a placeholder and never had its description filled
- The `description` field contains stale or placeholder text
- A past episode is missing its `imageUri` (the pull returns `imageUrl` from Luma CDN)

### Full automation sequence for a new episode

```
1. Create episode entry in content/episodes.json with status "locked", known id/slug/startsAt
2. When Luma event is published — note the lumaEventId or URL
3. POST /api/admin/luma { reference: "evt-xxx" }
4. Merge returned fields into the episode entry
5. Run meta agent prompt against event.description → paste result as meta field
6. Set status to "open"
7. PATCH /api/admin/episodes/[slug] with the updated entry
```

---

## Where to update

- **Data:** `content/episodes.json` — add `meta` field to any episode entry
- **Types:** `src/content/episodes.ts` → `EpisodeMeta` and `EpisodeCatalogEntry`
- **Card type:** `src/lib/episodes.ts` → `EpisodeCard.meta`
- **UI:** `components/EpisodesCards.tsx` → `EpisodeMetaBlock`
- **Episodes HQ admin:** when adding a new episode, run the agent prompt above against the raw Luma description, paste the output JSON as the `meta` field
