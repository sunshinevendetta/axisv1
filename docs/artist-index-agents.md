# Artist Index Instructions

This repository does not use external artist APIs for the magazine artist system.

The artist directory is a JSON-backed index that lives inside the codebase and is rendered directly by the app. If an artist needs to appear on the site, the record must exist in the local JSON sources first.

Zora is the only enrichment exception and it still resolves to local data. The owner-only HQ tool fetches Zora profile data, writes the result into a local cache file, and the public artist pages render from that cache. Do not add live frontend Zora fetches to artist pages.

## Canonical Sources

- Music artist source: [`content/music-artists.json`](/mnt/z/spectra/episode/spectrart/content/music-artists.json)
- Visual artist source: [`public/data/artists.json`](/mnt/z/spectra/episode/spectrart/public/data/artists.json)
- Normalized loader and derived indexes: [`src/content/artists.ts`](/mnt/z/spectra/episode/spectrart/src/content/artists.ts)
- Generated Zora cache: [`artist-zora-cache.json`](/mnt/z/spectra/episode/spectrart/content/artist-zora-cache.json)
- Zora sync route: [`route.ts`](/mnt/z/spectra/episode/spectrart/app/api/admin/artists/zora-sync/route.ts)
- Zora fetch helpers: [`zora.ts`](/mnt/z/spectra/episode/spectrart/src/lib/zora.ts)

## Operating Rules

- Do not add API fetches for artists.
- Do not add live Zora requests on public pages.
- Do not invent placeholder artists.
- Do not invent placeholder genres.
- Do not create empty profile shells just to fill a layout.
- Keep the artist experience visually aligned with the existing magazine flow.
- Artist pages must feel like a magazine extension, not a separate product.

## Data Model

The app derives a unified `ArtistProfile` shape in [`src/content/artists.ts`](/mnt/z/spectra/episode/spectrart/src/content/artists.ts).

Fields used by the UI:

- `slug`
- `name`
- `artistTypes`
- `gridIndex`
- `profilePageLabel`
- `summary`
- `shortBio`
- `profileImage`
- `coverImage`
- `externalLinks`
- `genres`
- `tags`
- `featured`
- `fromEpisode`
- `linkedEpisodes`
- `linkedArtifacts`
- `spaces`
- `signals`
- `aliases`

## Source File Rules

### Music Artists

Music artists are curated in [`content/music-artists.json`](/mnt/z/spectra/episode/spectrart/content/music-artists.json).

Use these fields:

- `name`
- `aliases`
- `artistTypes`
- `gridIndex`
- `profilePageLabel`
- `summary`
- `genres`
- `tags`
- `featured`
- `linkedEpisodes`
- `linkedArtifacts`
- `spaces`
- `signals`

Notes:

- `artistTypes` should include `"music"` and may also include `"visual"` if the same artist is legitimately both.
- `genres` should contain only real genre labels already supported by the record. If there is no reliable genre, leave it empty.
- `tags` can hold non-genre descriptors like format, context, or scene terms.

### Visual Artists

Visual artists are curated in [`public/data/artists.json`](/mnt/z/spectra/episode/spectrart/public/data/artists.json).

Current fields:

- `name`
- `image`
- `bio`
- `link`

Notes:

- The loader maps these records into the unified artist index automatically.
- Visual artists are kept minimal on purpose until more structured data is available.
- Do not add fake `genres` to visual artists just to create taxonomy coverage.
- If `link` is a Zora profile URL, the loader can derive the handle for HQ sync.

## Zora Enrichment

The owner-only HQ tool can enrich artists that have a Zora handle.

Current behavior:

- pulls the Zora profile
- pulls up to 2 created items for embeds
- stores avatar, socials, and embeds in local cache
- public pages render from the local cache only

Optional environment variable:

- `ZORA_API_KEY`

Recommended:

- set `ZORA_API_KEY` in `.env` for more reliable syncs and less rate limiting

HQ surface:

- Contracts HQ page: [`OwnerContractsPanel.tsx`](/mnt/z/spectra/episode/spectrart/components/admin/OwnerContractsPanel.tsx)

Generated fields include:

- profile image
- connected socials
- wallet address when available
- up to 2 Zora embed cards per artist

## Genre Index Rules

Genres are derived automatically from music artist records in [`src/content/artists.ts`](/mnt/z/spectra/episode/spectrart/src/content/artists.ts).

That means:

- if a genre is not present in a music artist record, it must not appear in the genre index
- if an artist has no trustworthy genre data, leave `genres` empty
- use `tags` for descriptive context that is not a stable genre label

## Routing

Artist routes:

- Artist directory: [`app/magazine/artists/page.tsx`](/mnt/z/spectra/episode/spectrart/app/magazine/artists/page.tsx)
- Artist mini page: [`app/magazine/artists/[slug]/page.tsx`](/mnt/z/spectra/episode/spectrart/app/magazine/artists/[slug]/page.tsx)

Artist previews and links:

- Home artist section: [`components/home/HomeArtistsSection.tsx`](/mnt/z/spectra/episode/spectrart/components/home/HomeArtistsSection.tsx)
- Home page wiring: [`app/page.tsx`](/mnt/z/spectra/episode/spectrart/app/page.tsx)
- Magazine article routing: [`app/magazine/page.tsx`](/mnt/z/spectra/episode/spectrart/app/magazine/page.tsx)
- Mixtape artist routing: [`app/magazine/mixtapes/page.tsx`](/mnt/z/spectra/episode/spectrart/app/magazine/mixtapes/page.tsx)

## How To Add A New Artist

### Add a new music artist

1. Add the record to [`content/music-artists.json`](/mnt/z/spectra/episode/spectrart/content/music-artists.json).
2. Include only confirmed `genres`.
3. Add episode links, artifacts, spaces, and signals only if they are real.
4. Verify the profile appears under `/magazine/artists`.
5. Verify the mini page resolves under `/magazine/artists/[slug]`.
6. If the artist has a Zora profile, run the HQ sync after saving.

### Add a new visual artist

1. Add the record to [`public/data/artists.json`](/mnt/z/spectra/episode/spectrart/public/data/artists.json).
2. Keep `bio` concise and useful.
3. Use `link` only when there is a real external destination.
4. Verify the profile appears under `/magazine/artists`.
5. Verify the mini page resolves under `/magazine/artists/[slug]`.
6. If the artist has a Zora profile, run the HQ sync after saving.

## How To Update An Existing Artist

1. Find which source owns the artist.
2. Edit the source JSON instead of patching rendered output directly.
3. If the artist exists in both sources, keep naming consistent so the loader can merge them by slug.
4. Check the artist page and any article or mixtape links that reference that artist by name.

## Merge Behavior

The loader merges records with the same slug.

Current intended behavior:

- episode-linked records win for core summary text
- visual records can contribute external links and image fields
- artist types are merged
- genres and tags are deduplicated

If merge logic needs to change, update [`src/content/artists.ts`](/mnt/z/spectra/episode/spectrart/src/content/artists.ts), not the page components.

## UI Constraints

- Preserve current magazine typography scale.
- Preserve the existing dark editorial look.
- Preserve current spacing rhythm and border treatment.
- Avoid introducing colorful card systems or app-dashboard patterns.
- Do not add placeholder blocks when artist counts are low.
- Keep photos and Zora embeds editorial, restrained, and magazine-native.

## Verification Checklist

- Run `npm run lint`
- Run `npm run build`
- Open `/`
- Open `/magazine`
- Open `/magazine/artists`
- Open at least one music artist page
- Open at least one visual artist page
- Open `/magazine/mixtapes` and click an artist
- If Zora sync was run, verify avatar and embeds appear from local cache
