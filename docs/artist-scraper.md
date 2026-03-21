# SPECTRA Artist Scraper — Design Brief

Status: **built** — all scraper files exist in `tools/artist-scraper/`. Ready to run after adding `LASTFM_API_KEY` to `.env`.

---

## What this is and why it exists

The artist index (`src/content/artists.ts`) merges two data sources:

- `public/data/artists.json` — visual artists (name, bio, image, link)
- `src/content/music-artists.json` — music artists (name, genres, tags, episodes, signals, etc.)

Both files are written by hand today. As the artist roster grows this becomes a bottleneck — especially for music artists where structured data (genres, tags, similar artists, social links, streaming links) already exists in public APIs.

This document defines a scraper that auto-fills the fields we can get from **two free APIs** and leaves the rest for manual curation:

- **Last.fm** → name, bio, tags, similar artists, listener stats, `mbid`
- **MusicBrainz** → all social and streaming links, using the `mbid` from Last.fm

---

## Where it lives

```
spectrart/
  tools/
    artist-scraper/
      config.ts           — list of artist names to resolve
      lastfm.ts           — Last.fm API client (artist.getInfo)
      musicbrainz.ts      — MusicBrainz API client (artist url-rels)
      merge.ts            — merge strategy: API data + existing JSON
      output.ts           — writes final result to music-artists.json
      scraper.ts          — entry point: wires all of the above, logs results
      tag-genre-map.ts    — Last.fm tag → clean genre lookup table
```

Same repo. Not pushed to GitHub. Add to `.gitignore`:

```
tools/artist-scraper/
```

**Why same repo, not separate:**
- Writes directly to `src/content/music-artists.json` — no sync step, no type drift
- Both API keys live in `.env` which is already gitignored
- `MusicArtistSource` and `ArtistProfile` types are importable from `src/content/artists.ts`
- One less repo to manage

---

## Data pipeline overview

```
config.ts
  └─ artist name list
       │
       ▼
Last.fm artist.getInfo (by name)
  └─ name, bio, tags (×5), similar (×5), stats.listeners, mbid
       │
       ├─ tags → TAG_TO_GENRE lookup → genres[]
       ├─ similar[].name → similar[] (new schema field)
       ├─ stats.listeners → used for featured threshold
       └─ mbid ──────────────────────────────────────────┐
                                                          ▼
                                          MusicBrainz artist/{mbid}?inc=url-rels
                                            └─ relations[] filtered by type
                                                 ├─ social network → Instagram, Twitter/X
                                                 ├─ streaming → Spotify, Deezer, Tidal, Apple Music
                                                 ├─ soundcloud → SoundCloud
                                                 ├─ bandcamp → Bandcamp
                                                 ├─ youtube → YouTube
                                                 ├─ discogs → Discogs
                                                 └─ official homepage → website
       │
       ▼
merge.ts
  └─ merge API data with existing music-artists.json (safe, never overwrites manual fields)
       │
       ▼
content/music-artists.json  ← final output
```

---

## API 1 — Last.fm `artist.getInfo`

**Base URL:** `https://ws.audioscrobbler.com/2.0/`

**Required params:**
```
method=artist.getInfo
artist=<url-encoded name>
api_key=<LASTFM_API_KEY>
format=json
```

**Example:**
```
https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&artist=Burial&api_key=YOUR_KEY&format=json
```

**Rate limit:** 5 req/sec on free tier. Use 250ms delay between calls.

**Auth:** API key only. No OAuth. Free account: https://www.last.fm/api/account/create

**Store as:** `LASTFM_API_KEY` in `.env`

### Registration form field answers

When creating a Last.fm API account at the link above:

| Field | What to enter |
|---|---|
| **Contact email** | Your personal or project email (e.g. `spectra@spectra.xyz`) |
| **Application name** | `Spectrart Artist Scraper` |
| **Application description** | `Internal tool to populate artist metadata (bio, genres, similar artists) for the Spectra episode website. Read-only.` |
| **Callback URL** | Leave blank — this is a server-side scraper, not an OAuth flow |
| **Application homepage** | Leave blank — or enter your project URL if you have one |

You get a key immediately after submitting. Copy it to `.env`:

```bash
LASTFM_API_KEY=your_key_here
```

### Full response shape

```json
{
  "artist": {
    "name": "Burial",
    "mbid": "5b11f4ce-a62d-471e-81fc-a69a8278c7da",
    "url": "https://www.last.fm/music/Burial",
    "image": [
      { "size": "small",  "#text": "https://..." },
      { "size": "medium", "#text": "https://..." },
      { "size": "large",  "#text": "https://..." }
    ],
    "streamable": "0",
    "stats": {
      "listeners": "1234567",
      "plays": "9876543"
    },
    "similar": {
      "artist": [
        {
          "name": "Andy Stott",
          "url": "https://www.last.fm/music/Andy+Stott",
          "image": [{ "size": "medium", "#text": "https://..." }]
        }
      ]
    },
    "tags": {
      "tag": [
        { "name": "dubstep", "url": "https://www.last.fm/tag/dubstep" },
        { "name": "electronic", "url": "https://www.last.fm/tag/electronic" }
      ]
    },
    "bio": {
      "published": "01 Jan 2007",
      "summary": "Burial is...<a href=\"...\">Read more on Last.fm</a>",
      "content": "Burial is... [full text, also contains HTML links]"
    }
  }
}
```

### What we extract from Last.fm

| Response field | What we use it for | Notes |
|---|---|---|
| `artist.name` | `name` — canonical spelling | Corrects capitalisation drift |
| `artist.mbid` | Internal — passed to MusicBrainz as the lookup key | Critical link between the two APIs |
| `artist.bio.summary` | `summary` | Strip everything after `<a` to remove the "Read more" link. Also strip all other HTML tags. |
| `artist.tags.tag[].name` | `tags[]` raw + `genres[]` via mapping | Take top 5. Map to clean genres via TAG_TO_GENRE. |
| `artist.similar.artist[].name` | `similar[]` (new field) | Top 5 similar artists by name |
| `artist.stats.listeners` | Not stored — used to auto-set `featured` | If > 500k listeners, candidate for `featured: true` |
| `artist.image` | Skipped | Last.fm images are low quality thumbnails. Not worth using. |

### What Last.fm does NOT have

- Social media links (Instagram, Twitter/X, etc.) — **use MusicBrainz instead**
- Streaming links (Spotify, Apple Music, etc.) — **use MusicBrainz instead**
- YouTube — **use MusicBrainz instead**
- Bandcamp — **use MusicBrainz instead**
- Website / official homepage — **use MusicBrainz instead**

---

## API 2 — MusicBrainz `artist/{mbid}?inc=url-rels`

MusicBrainz is a community-maintained music encyclopedia. Every artist entity stores a list of external URL relationships — this is where all the social, streaming, and platform links live.

**Base URL:** `https://musicbrainz.org/ws/2/`

**Endpoint:** `artist/{mbid}?inc=url-rels&fmt=json`

**Example (Burial):**
```
https://musicbrainz.org/ws/2/artist/5b11f4ce-a62d-471e-81fc-a69a8278c7da?inc=url-rels&fmt=json
```

**Rate limit:** 1 req/sec. Use 1100ms delay between calls.

**Auth:** None required for read-only. Must include a `User-Agent` header with your app name and contact email — required by MusicBrainz policy:
```
User-Agent: spectrart-artist-scraper/1.0 (your@email.com)
```

**No API key needed.**

### URL relation types we care about

Each item in `relations[]` has this shape:

```json
{
  "type": "social network",
  "url": { "resource": "https://instagram.com/artistname" },
  "direction": "forward",
  "ended": false
}
```

Filter by `type` and extract `url.resource`:

| MusicBrainz `type` | Platform | Notes |
|---|---|---|
| `"social network"` | Instagram, Twitter/X, Facebook, Mastodon | Detect platform from the URL hostname |
| `"streaming"` | Spotify, Deezer, Tidal, Apple Music | Detect platform from hostname |
| `"free streaming"` | SoundCloud (sometimes), Spotify (sometimes) | Same — detect from hostname |
| `"soundcloud"` | SoundCloud | Dedicated type, always SoundCloud |
| `"bandcamp"` | Bandcamp | Dedicated type, always Bandcamp |
| `"youtube"` | YouTube channel | Dedicated type |
| `"official homepage"` | Artist's own website | Can be anything — store as `website` |
| `"discogs"` | Discogs artist page | Useful for record collectors |
| `"wikidata"` | Wikidata entity | Skip — not useful for display |
| `"allmusic"` | AllMusic | Skip — not useful for display |
| `"last.fm"` | Last.fm artist page | Skip — we already have this |
| `"lyrics"` | Genius / AZLyrics / etc. | Skip |

### Platform detection from URL hostname

For `social network` and `streaming` types we detect the platform from the URL:

```ts
function detectPlatform(url: string): string | null {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  if (hostname.includes("instagram.com"))  return "instagram";
  if (hostname.includes("twitter.com"))    return "twitter";
  if (hostname.includes("x.com"))          return "twitter";
  if (hostname.includes("facebook.com"))   return "facebook";
  if (hostname.includes("open.spotify.com")) return "spotify";
  if (hostname.includes("music.apple.com")) return "apple-music";
  if (hostname.includes("deezer.com"))     return "deezer";
  if (hostname.includes("tidal.com"))      return "tidal";
  if (hostname.includes("youtube.com"))    return "youtube";
  if (hostname.includes("soundcloud.com")) return "soundcloud";
  if (hostname.includes("bandcamp.com"))   return "bandcamp";
  if (hostname.includes("discogs.com"))    return "discogs";
  return null; // skip unknowns
}
```

---

## Updated `MusicArtistSource` schema

The current schema in `artists.ts` needs two new fields to hold the scraped data:

```ts
type MusicArtistSource = {
  name: string;
  aliases?: string[];
  artistTypes: ArtistType[];
  gridIndex?: string;
  profilePageLabel?: string;
  summary: string;
  genres?: string[];
  tags?: string[];
  featured?: boolean;
  linkedEpisodes?: ArtistLink[];
  linkedArtifacts?: ArtistLink[];
  spaces?: ArtistSpace[];
  signals?: ArtistSignal[];

  // ── New fields added by the scraper ──────────────────────────────────────
  similar?: string[];          // names of similar artists from Last.fm (top 5)
  links?: ArtistSocialLink[];  // structured social + streaming + platform links
  mbid?: string;               // MusicBrainz ID — internal, used for re-fetching
};

type ArtistSocialLink = {
  platform: string;   // "instagram" | "twitter" | "spotify" | "soundcloud" | "bandcamp" | "youtube" | "apple-music" | "deezer" | "tidal" | "discogs" | "website"
  url: string;        // full URL
};
```

`links[]` replaces the current `externalLinks: ArtistLink[]` for music artists — it's structured by platform so the UI can render platform-specific icons rather than generic labels.

The existing `externalLinks` in `ArtistProfile` gets populated from `links[]` during the merge in `artists.ts`.

---

## Tag → genre mapping

Last.fm tags are messy user-generated labels. We map them to our clean genre list:

```ts
export const TAG_TO_GENRE: Record<string, string> = {
  // Electronic
  "electronic":        "Electronic",
  "electronica":       "Electronic",
  "techno":            "Techno",
  "house":             "House",
  "deep house":        "Deep House",
  "tech house":        "Tech House",
  "ambient":           "Ambient",
  "experimental":      "Experimental",
  "idm":               "IDM",
  "intelligent dance music": "IDM",
  "drum and bass":     "Drum & Bass",
  "dnb":               "Drum & Bass",
  "dubstep":           "Dubstep",
  "post-dubstep":      "Post-Dubstep",
  "uk bass":           "UK Bass",
  "bass music":        "Bass Music",
  "grime":             "Grime",
  "uk garage":         "UK Garage",
  "2-step":            "UK Garage",
  "industrial":        "Industrial",
  "noise":             "Noise",
  "dark ambient":      "Dark Ambient",
  "drone":             "Drone",
  "minimal":           "Minimal",
  "minimal techno":    "Minimal Techno",
  "acid":              "Acid",
  "acid house":        "Acid House",
  "trance":            "Trance",
  "psytrance":         "Psytrance",
  "breakbeat":         "Breakbeat",
  "breaks":            "Breakbeat",
  "big beat":          "Big Beat",
  "electro":           "Electro",
  "electro house":     "Electro House",
  "synthwave":         "Synthwave",
  "synth-pop":         "Synth-Pop",
  "new wave":          "New Wave",
  "footwork":          "Footwork",
  "juke":              "Footwork",
  "jersey club":       "Jersey Club",
  "club":              "Club",
  "dj":                "DJ",
  "lo-fi":             "Lo-Fi",
  "lofi":              "Lo-Fi",
  "lo-fi hip hop":     "Lo-Fi",
  "downtempo":         "Downtempo",
  "trip-hop":          "Trip-Hop",
  "triphop":           "Trip-Hop",
  "chillout":          "Chillout",
  "chill":             "Chillout",
  "world":             "World",
  "afrobeat":          "Afrobeat",
  "afrobeats":         "Afrobeats",
  // Other
  "jazz":              "Jazz",
  "nu jazz":           "Nu Jazz",
  "hip-hop":           "Hip-Hop",
  "hip hop":           "Hip-Hop",
  "rap":               "Hip-Hop",
  "r&b":               "R&B",
  "rnb":               "R&B",
  "soul":              "Soul",
  "funk":              "Funk",
  "neo-soul":          "Neo-Soul",
  "pop":               "Pop",
  "indie":             "Indie",
  "indie pop":         "Indie Pop",
  "alternative":       "Alternative",
  "rock":              "Rock",
  "post-rock":         "Post-Rock",
  "indie rock":        "Indie Rock",
  "metal":             "Metal",
  "classical":         "Classical",
  "contemporary classical": "Contemporary Classical",
  "neo-classical":     "Neoclassical",
  "soundtrack":        "Soundtrack",
  "film score":        "Soundtrack",
};
```

Tags not in this map are kept as raw `tags[]` (lowercase). They don't get promoted to `genres[]`.

---

## Merge strategy

The scraper uses a safe merge — **existing manual values are never overwritten**, only empty or absent fields get filled.

| Field | Rule |
|---|---|
| `name` | Always update to Last.fm canonical spelling |
| `mbid` | Always update — internal only, not displayed |
| `summary` | Fill if empty. Never overwrite if set manually. |
| `genres` | Fill if empty. Never overwrite. |
| `tags` | Merge: union of existing + new. Dedup. |
| `similar` | Fill if empty. Never overwrite. |
| `links` | Merge: add new platforms found, keep existing. Never remove. |
| `aliases` | Merge: add Last.fm redirect names. Keep existing. |
| `featured` | Auto-set to `true` if `stats.listeners > 500000` AND currently `undefined`. Never overwrite if already set. |
| `artistTypes` | Never touch — manual. |
| `linkedEpisodes` | Never touch — manual. |
| `linkedArtifacts` | Never touch — manual. |
| `spaces` | Never touch — manual. |
| `signals` | Never touch — manual. |
| `gridIndex` | Never touch — auto-generated at read time. |

Run the scraper as many times as you want — it is idempotent for already-filled fields.

---

## Script flow

```
1. Load config.ts → array of artist names

2. Load src/content/music-artists.json → existing entries (or [] if new)

3. For each artist name (with 1.1s delay between iterations):

   a. Call Last.fm artist.getInfo
      → extract: name, mbid, bio.summary, tags (top 5), similar (top 5), stats.listeners

   b. If mbid present: call MusicBrainz artist/{mbid}?inc=url-rels
      → extract relations[] filtered to the types we want
      → run detectPlatform() on each URL
      → build ArtistSocialLink[]

   c. Map Last.fm tags → genres via TAG_TO_GENRE

   d. Find existing JSON entry by name or aliases match

   e. Apply merge rules field by field

   f. Push merged result into output array

4. Write output array back to src/content/music-artists.json (pretty-printed JSON)

5. Print summary:
   - N artists updated
   - N artists newly added as stubs
   - N artists skipped (all fields already filled)
   - N artists not found on Last.fm (list their names)
   - N artists found on Last.fm but missing on MusicBrainz (list their names)
```

---

## What the scraper does NOT do

- Does not touch `public/data/artists.json` — visual artists are fully manual
- Does not add artists to `config.ts` — always a manual decision
- Does not overwrite any field that already has a non-empty manually-set value
- Does not fetch or store Last.fm profile images — low quality thumbnails, not worth it
- Does not run on a schedule — always triggered manually
- Does not commit or push anything — separate manual step

---

## Files

All files are built and live in `tools/artist-scraper/` (gitignored):

```
tools/
  artist-scraper/
    config.ts           — ARTISTS_TO_SCRAPE string array (populate this with your artist names)
    tag-genre-map.ts    — TAG_TO_GENRE lookup table (~60 entries)
    types.ts            — MusicArtistEntry, ScrapedData, ArtistSocialLink types
    lastfm.ts           — fetchLastFmArtist(name, apiKey) → LastFmResult | null
    lastfm-media.ts     — fetchArtistMedia(slug, name, apiKey) → profile image + tracks + albums
    musicbrainz.ts      — fetchMusicBrainzLinks(mbid) → ArtistSocialLink[]
    merge.ts            — mergeArtist(existing | null, scraped) → MusicArtistEntry
    output.ts           — loadExistingArtists(), writeArtists(), findExisting()
    media-cache.ts      — loadMediaCache(), writeMediaCache() for artist-media-cache.json
    scraper.ts          — entry point: two-pass pipeline (metadata + media)
```

Two output files written to `content/`:

| File | What's in it | Updated by |
|---|---|---|
| `content/music-artists.json` | Curated metadata: genres, links, similar, episodes, signals | `npm run artists:scrape` (safe merge, never overwrites manual fields) |
| `content/artist-media-cache.json` | Profile image, top 5 tracks, top 5 album cover arts | `npm run artists:scrape` (always refreshed) |

No new dependencies — uses native `fetch` (Node 18+) and `fs`.

---

## .gitignore entry

```
tools/artist-scraper/
```

The `tools/` folder itself is not ignored — only the scraper subfolder.

---

## package.json script

```json
"artists:scrape": "tsx tools/artist-scraper/scraper.ts"
```

Run with:

```bash
npm run artists:scrape
```

`tsx` is already available via Hardhat's TypeScript setup — no extra install.

---

## Schema additions needed in `artists.ts`

Before building the scraper, add these two fields to `MusicArtistSource`:

```ts
similar?: string[];          // similar artist names from Last.fm
links?: ArtistSocialLink[];  // structured platform links from MusicBrainz
mbid?: string;               // MusicBrainz ID (internal)
```

And add the `ArtistSocialLink` type:

```ts
export type ArtistSocialLink = {
  platform: "instagram" | "twitter" | "spotify" | "soundcloud" | "bandcamp" | "youtube" | "apple-music" | "deezer" | "tidal" | "discogs" | "website" | string;
  url: string;
};
```

In the `normalizeArtistProfile()` / `musicArtists` map in `artists.ts`, populate `externalLinks` from `links[]` so the existing display layer keeps working:

```ts
externalLinks: (artist.links ?? []).map((l) => ({ label: l.platform, href: l.url })),
```

---

## What becomes possible after this is built

1. **Genre filter on the artist index** — `artistGenreIndex` already exists in `artists.ts`, just needs populated data
2. **Platform-icon link row on artist profile pages** — `links[]` is structured by platform, UI can render Spotify/Instagram/SoundCloud icons directly
3. **"Similar artists" section** — `similar[]` gives 5 related names; cross-link to profiles that exist in our index
4. **Auto-featured threshold** — `stats.listeners > 500k` as a soft flag for the featured row
5. **Visual artist enrichment** — visual artists with a music presence (e.g. Sunshine Vendetta) can be added to `config.ts` to get their music metadata too

---

## To run

1. ✅ Scraper files built in `tools/artist-scraper/`
2. ✅ `tools/artist-scraper/` added to `.gitignore`
3. ✅ `artists:scrape` script added to `package.json`
4. Get a Last.fm API key: https://www.last.fm/api/account/create
5. Add to `.env`: `LASTFM_API_KEY=your_key_here`
6. Add `similar`, `links`, `mbid` fields to `MusicArtistSource` in `src/content/artists.ts` (see schema section above)
7. Populate `tools/artist-scraper/config.ts` → `ARTISTS_TO_SCRAPE` with the names from `music-artists.json`
8. Run: `npm run artists:scrape`
