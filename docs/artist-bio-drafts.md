# Artist Bio Drafts

Generated prompt doc — paste each section into Claude or Codex, copy the output into the `summary` field of `content/music-artists.json`.

**Rules for the generated bio:**
- 2–3 sentences, third person, present tense
- Factual and specific — use the genre names, track titles, release names, similar artists as evidence
- No hype language, no superlatives, no invented claims
- No mention of SPECTRA, the magazine, or any internal project context
- Plain prose, no heading, no quotes around the output

---

## Cyberreality

**Prompt:**

```
Write a 2–3 sentence artist bio for Cyberreality.

Genres: industrial, ambient, electronic
Recent releases: CYBERROR (Remixes) (album), r e c u e r d o (album), CYBERROR (album), Internet Dating 1.5 (album), Selected Juke Werkz, Vol. 1 (album)
Present on: Spotify

Rules: factual and specific, use the genre names and release titles as evidence, no hype, no invented claims, third person present tense, plain prose (no heading, no quotes).
```

**Draft bio:**

> Cyberreality works across industrial, ambient, and electronic production, releasing albums including CYBERROR, r e c u e r d o, and Internet Dating 1.5. Their output spans textured noise constructions and spatial sound design, with compilation appearances on Selected Juke Werkz, Vol. 1 situating them within a broader experimental electronic network.

**JSON field to update:** `content/music-artists.json` → entry `"Cyberreality"` → `"summary"`

---

## GaSOIID

**Prompt:**

```
Write a 2–3 sentence artist bio for GaSOIID.

Genres: bass, electronic
Tags: hard dance, trap, nightcore, electronic pop
Recent releases: s0—n2u² (single), rain (single), mattrd +2me (single), froz3n (single), sedated (single)
Similar artists: DJ CHRISTIAN NXC, Danny Stranger, NIGHTCHOP, Texas Baby
Present on: Spotify

Rules: factual and specific, use the genre names, track titles, and similar artists as evidence, no hype, no invented claims, third person present tense, plain prose (no heading, no quotes).
```

**Draft bio:**

> GaSOIID operates in bass-driven electronic music with hard dance, trap, and nightcore elements, releasing a run of singles including s0—n2u², rain, mattrd +2me, and froz3n. Their orbit includes artists like DJ CHRISTIAN NXC, Danny Stranger, and NIGHTCHOP, pointing toward a fast-moving, internet-rooted production scene.

**JSON field to update:** `content/music-artists.json` → entry `"GaSOIID"` → `"summary"`

---

## Fiesta Soundsystem

**Prompt:**

```
Write a 2–3 sentence artist bio for Fiesta Soundsystem.

Genres: IDM, Jungle, Leftfield
Tags: groove, breakcore, bass
Recent releases: Pits (album), Passivity Trap (single), Sinking (album), delphic scent (single), Rites of Passage (album)
Similar artists: Mani Festo, LMajor, Borai, Hooverian Blur, Soundbwoy Killah
Present on: Spotify, Discogs, Deezer

Rules: factual and specific, use the genre names, release titles, and similar artists as evidence, no hype, no invented claims, third person present tense, plain prose (no heading, no quotes).
```

**Draft bio:**

> Fiesta Soundsystem makes IDM, jungle, and leftfield electronic music with breakcore and bass influences, with albums including Pits, Sinking, and Rites of Passage alongside the single Passivity Trap. Their sound places them alongside artists like Borai, Hooverian Blur, and LMajor within the UK-adjacent leftfield club continuum.

**JSON field to update:** `content/music-artists.json` → entry `"Fiesta Soundsystem"` → `"summary"`

---

## Sunshine Vendetta

**Prompt:**

```
Write a 2–3 sentence artist bio for Sunshine Vendetta.

Genres: ambient
Tags: synthesis, bedroom, ethereal
Recent releases: Explosive (single), Hyperdreams (single), Real Life (single), Rave Tool 84 (single), Rave On (single)
Similar artists: Infinite Human, Superior Cornrows, DJ SAPHIRRE, 4649nadeshiko
Present on: Spotify, SoundCloud, Discogs

Rules: factual and specific, use the genre names, release titles, and similar artists as evidence, no hype, no invented claims, third person present tense, plain prose (no heading, no quotes).
```

**Draft bio:**

> Sunshine Vendetta makes ambient and ethereal electronic music rooted in bedroom synthesis, with releases including Rave On, Rave Tool 84, Real Life, Hyperdreams, and Explosive. Their work shares space with producers like Infinite Human and 4649nadeshiko, leaning into delicate, personal sound design over dancefloor function.

**JSON field to update:** `content/music-artists.json` → entry `"Sunshine Vendetta"` → `"summary"`

---

## Mami Pistola

**Prompt:**

```
Write a 2–3 sentence artist bio for Mami Pistola.

Tags: field recordings, transit, editorial selection
Note: no Spotify or Last.fm data available — bio should reflect the tags only.

Rules: factual and specific, no hype, no invented claims, third person present tense, plain prose (no heading, no quotes).
```

**Draft bio:**

> Mami Pistola works with field recordings and found sound, applying an editorial approach to material gathered from transit environments and everyday spaces. The practice sits at the intersection of documentary sound and composition, selecting and arranging rather than synthesizing.

**JSON field to update:** `content/music-artists.json` → entry `"Mami Pistola"` → `"summary"`

---

## How to apply

After filling in all drafts above, update `content/music-artists.json`:

```json
{ "name": "Cyberreality", "summary": "PASTE HERE", ... }
{ "name": "GaSOIID",      "summary": "PASTE HERE", ... }
...
```

Once `ANTHROPIC_API_KEY` is available, the scraper will handle this automatically via `tools/artist-scraper/bio-gen.ts` — it only overwrites summaries that match the placeholder patterns, so manually written bios are safe.
