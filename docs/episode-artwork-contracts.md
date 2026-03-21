# SPECTRA Episode Artwork Contracts — Design Brief

Status: **pre-build review** — read this before writing any code.

---

## What we are building and why

SPECTRA runs IRL events where AR artworks are hidden around the venue.
Each artwork can be collected onchain during or after the event.
The current contract stack was built for a membership/application flow — not for this.

This document defines the new contract model, what to keep, what to add, and every design decision that needs to be confirmed before writing Solidity.

---

## The model in plain English

```
SPECTRA Season 1  (one registry contract, deployed once)
  │
  ├── Episode 1: "Spectra 1"            (one ERC-1155 contract per episode)
  │     ├── Token 1 — "Prism Glitch"    (one token ID per artwork, per episode)
  │     ├── Token 2 — "Echo Chamber"
  │     └── Token 3 — "Void Loop"
  │
  ├── Episode 2: "IRL x Spectra"
  │     ├── Token 1 — "Signal Drift"
  │     └── Token 2 — "Residue"
  │
  └── Episode 3: "Spectra x [Partner]"
        └── Token 1 — "Frequency Arc"
```

- **Season registry** — one contract, deployed once per season. Holds the list of episode contract addresses. Nothing more.
- **Episode contract** — one per event. The contract name is set at deploy time (e.g. `"IRL x Spectra"`). Each AR artwork gets one token ID inside that contract.
- **Collector** — attends the event, scans/triggers the AR piece, mints that token. One wallet can hold multiple artworks from the same episode, and artworks from multiple episodes.

---

## What already exists — keep, add, or replace

| Contract | Status | Decision |
|---|---|---|
| `SpectraOwnerAccess1155` | **Keep as-is** | Your HQ key system. Nothing to do with artwork. |
| `SpectraFounderSeason1_1155` | **Keep, optional** | Still valid for founder membership. Not part of the artwork flow. |
| `SpectraSubmissionRegistry` | **Keep, optional** | Still valid if you run an application/approval cycle for membership. |
| `SpectraEventAccessRegistry` | **Keep, optional** | Still valid for off-chain access flags (attendee/artist roles). Not replaced by artwork contracts — different purpose. |
| `SpectraSeasonRegistry` | **New — write** | Lightweight index of episode contracts per season. |
| `SpectraEpisode1155` | **New — write** | The actual artwork collection contract. One deployed per episode. |

None of the old contracts are removed. The new ones are additive.

---

## New contract 1: `SpectraSeasonRegistry`

### What it does

- Holds the canonical list of episode contract addresses for a given season.
- Admin registers a new episode address when a new episode contract is deployed.
- Admin can deregister or mark an episode inactive.
- Anyone can read the list — useful for frontends, indexers, and marketplaces to discover all episodes in a season.

### What it does NOT do

- Does not hold tokens.
- Does not control minting.
- Does not know anything about individual artworks or token IDs.

### Constructor inputs

| Field | Type | Notes |
|---|---|---|
| `admin` | `address` | Gets DEFAULT_ADMIN_ROLE and REGISTRY_MANAGER_ROLE |
| `seasonId` | `uint256` | e.g. `1` for Season 1. Stored immutably. |
| `seasonName` | `string` | e.g. `"SPECTRA Season 1"`. Mutable later. |

### State

```
uint256 public immutable seasonId
string public seasonName
uint256 public nextEpisodeIndex
mapping(uint256 => EpisodeEntry) public episodes
```

```
struct EpisodeEntry {
  address contractAddress
  string name          // mirrors the episode contract name — denormalized for easy reads
  uint256 episodeNumber
  bool active
}
```

### Functions

- `registerEpisode(address contractAddress, string name, uint256 episodeNumber)` — admin only
- `setEpisodeActive(uint256 index, bool active)` — admin only
- `getEpisode(uint256 index)` — public read
- `getAllEpisodes()` — public read, returns array
- `setSeasonName(string)` — admin only

### Roles

- `DEFAULT_ADMIN_ROLE`
- `REGISTRY_MANAGER_ROLE` — can register/update episodes (can be same as admin or a separate ops wallet)

### No tokens. No pausable needed here. Lightweight.

---

## New contract 2: `SpectraEpisode1155`

This is the main artwork contract. One deployed per episode.

### What it does

- ERC-1155 with multiple token IDs — one per artwork in the episode.
- Each token ID has its own supply cap, open/closed mint state, and metadata URI.
- Minting is open by default (anyone can mint during the event window) or can be gated by the admin.
- Supports airdrop (admin can push tokens to a list of wallets).
- Supports pause (stop all minting globally).
- URI is updatable per token ID (so you can fix metadata after deploy).
- Name and symbol are set at deploy time — e.g. `"IRL x Spectra"` / `"SPECTRA-EP2"`.
- Season and episode number stored on-chain for grouping.

### Constructor inputs

| Field | Type | Notes |
|---|---|---|
| `admin` | `address` | Gets all admin roles |
| `name_` | `string` | e.g. `"IRL x Spectra"` — set per episode |
| `symbol_` | `string` | e.g. `"SPECTRA-EP2"` — set per episode |
| `seasonId_` | `uint256` | e.g. `1` |
| `episodeNumber_` | `uint256` | e.g. `2` |
| `baseUri_` | `string` | IPFS folder, used as fallback if no per-token URI is set |
| `contractMetadataUri_` | `string` | Collection-level metadata for OpenSea/marketplaces |

### Token ID setup (post-deploy, before event)

Token IDs are registered after deploy by the admin before the event opens.

```solidity
function registerArtwork(
  uint256 tokenId,
  string calldata artworkName,
  string calldata metadataUri,
  uint256 maxSupply,   // 0 = uncapped
  bool openMint        // true = anyone can mint; false = admin/allowlist only
) external onlyRole(ARTWORK_MANAGER_ROLE)
```

This lets you define each artwork's supply cap and open/close state independently.

### Minting

**Open mint** (for the event — anyone who attended can mint):
```solidity
function mint(uint256 tokenId, uint256 amount) external whenNotPaused
```
- Checks: artwork exists, openMint = true, supply not exceeded
- Collector pays gas only (no ETH price unless added later)

**Admin mint** (for airdrop or manual issuance):
```solidity
function adminMint(address recipient, uint256 tokenId, uint256 amount) external onlyRole(MINTER_ROLE)
```

**Batch airdrop** (push to multiple wallets at once):
```solidity
function airdrop(address[] calldata recipients, uint256 tokenId) external onlyRole(AIRDROP_ROLE)
```

### Mint gating options — decision needed

Three options. Pick one before writing code:

**Option A — Open mint, no gate**
Anyone with the contract address can mint any open token ID. Simplest. Works for public events where the barrier is physical presence. Risk: bots or remote minting if address leaks.

**Option B — Signature gate**
Minting requires a signature from an admin wallet (generated at the venue via QR or AR trigger). Stronger. Each signature is per-wallet per-tokenId so it can't be reused by others. Adds a signing service backend.

**Option C — Allowlist**
Pre-load a Merkle root of allowed wallets per token ID. Wallet proves inclusion at mint time. Strong but requires knowing wallets in advance. Less compatible with walk-in event model.

**Recommendation**: Start with Option A for the first episode. Add Option B before any episode where the artworks are high-value enough to warrant gating.

### Per-token state

```
struct ArtworkEntry {
  string name
  string metadataUri   // per-token URI overrides baseUri
  uint256 maxSupply    // 0 = uncapped
  uint256 minted       // running count
  bool exists
  bool openMint        // can anyone mint this right now
}

mapping(uint256 => ArtworkEntry) public artworks
```

### URI resolution

Priority order:
1. If `artworks[tokenId].metadataUri` is set — return that
2. Else fall back to `baseUri + tokenId + ".json"`

This means you can host all metadata in one IPFS folder (option 2) or pin each artwork individually (option 1). Both work.

### Admin controls

| Function | Role | What it does |
|---|---|---|
| `registerArtwork(...)` | ARTWORK_MANAGER_ROLE | Define a new token ID |
| `setOpenMint(tokenId, bool)` | ARTWORK_MANAGER_ROLE | Open or close minting for one artwork |
| `setTokenUri(tokenId, string)` | URI_MANAGER_ROLE | Update metadata for one token ID |
| `setBaseUri(string)` | URI_MANAGER_ROLE | Update the fallback folder URI |
| `setContractMetadataUri(string)` | URI_MANAGER_ROLE | Update the collection-level metadata |
| `adminMint(recipient, tokenId, amount)` | MINTER_ROLE | Mint without open gate |
| `airdrop(recipients[], tokenId)` | AIRDROP_ROLE | Batch push to wallets |
| `pause()` / `unpause()` | PAUSER_ROLE | Stop/resume all minting |
| `setMaxSupply(tokenId, uint256)` | DEFAULT_ADMIN_ROLE | Adjust cap (only upward if you want safety) |

### Roles

- `DEFAULT_ADMIN_ROLE` — root control
- `ARTWORK_MANAGER_ROLE` — register artworks, open/close mint per token
- `MINTER_ROLE` — adminMint
- `AIRDROP_ROLE` — batch airdrop
- `PAUSER_ROLE` — global pause
- `URI_MANAGER_ROLE` — update metadata URIs

All granted to `admin` at deploy. Can be split to separate wallets later.

### Events emitted

```
ArtworkRegistered(uint256 indexed tokenId, string name, uint256 maxSupply)
ArtworkMinted(uint256 indexed tokenId, address indexed collector, uint256 amount)
ArtworkMintOpened(uint256 indexed tokenId)
ArtworkMintClosed(uint256 indexed tokenId)
TokenUriUpdated(uint256 indexed tokenId, string newUri)
BaseUriUpdated(string newUri)
ContractMetadataUpdated(string newUri)
Airdropped(uint256 indexed tokenId, uint256 recipientCount)
```

### What it does NOT do

- Does not know about submissions or membership approval.
- Does not gate on token ownership of another contract (unless you add that).
- Does not prevent a wallet from minting the same artwork multiple times (unless you add a `mapping(address => mapping(uint256 => bool)) public hasMinted` guard — decision needed, see below).

---

## Open design decisions — confirm before writing code

These need a yes/no before the contracts are written.

### 1. Per-wallet mint limit per artwork?

Should a wallet be able to mint the same artwork more than once?

- **Yes, unlimited** — simpler, good if artworks are intentionally multi-edition and you want collectors to hold multiples.
- **Yes, capped (e.g. max 1 or max N per wallet)** — add `mapping(address => mapping(uint256 => uint256)) mintCount` and check at mint time.
- **No, one per wallet** — strictest. Meaningful if each artwork should be unique per collector.

**Recommended default**: one per wallet per token ID. Feels right for AR artworks at a venue — you found it, you minted once. Can always be overridden by admin mint.

### 2. Transferable or soulbound?

- **Transferable** (standard ERC-1155) — artworks can be sold or moved. Standard marketplace behavior. Makes them proper collectibles.
- **Soulbound** — artworks are permanently tied to the collecting wallet. Stronger provenance. No secondary market.

**Recommended**: transferable. These are artworks, not access keys. Collectors should be able to sell or hold them.

### 3. Paid mint or free?

- **Free** — collector pays gas only. Simplest to start. Good for first episodes.
- **Paid** — each token ID has an ETH price. Revenue goes to a `paymentRecipient` set at deploy. Add `uint256 price` to `ArtworkEntry` and a `withdrawPayments()` function.

**Recommended**: start free. Add paid mint to `SpectraEpisode1155` as an optional upgrade for later episodes when the value is clearer.

### 4. Signature gate — yes for first episode?

See Option A/B/C above. Decision affects backend complexity.

**Recommended**: Option A (open mint) for first episode to keep the deploy simple. Plan Option B before any episode with high-value limited artworks.

### 5. Season registry — required at launch or add later?

The `SpectraSeasonRegistry` is purely informational — it doesn't affect minting at all. You can deploy episode contracts without it and register them later.

**Recommended**: deploy the season registry when you deploy the first episode contract. Low overhead, good for discoverability from day one.

---

## Deployment order

```
1. SpectraOwnerAccess1155     — already deployed (your HQ key)
2. SpectraSeasonRegistry      — once per season, deployed first as a standalone step
3. SpectraEpisode1155 (×N)    — one per episode, all can be deployed concurrently
   └── post-deploy each: registerArtwork() for each artwork in that episode
   └── post-deploy each: registerEpisode() on the season registry
```

**Registry first, episodes concurrent.** The season registry is a one-time standalone deploy — it has no dependency on episode contracts. Once it exists, any number of episode contracts can be deployed in any order and registered afterward. Because gas on Base is cheap, you can deploy all 12 episode contracts the same day if needed, or one at a time as each episode goes `open`. There is no sequencing requirement between episode contracts themselves.

This gives maximum control:
- The registry is always ready before the first episode.
- Episodes can be deployed in batch (e.g. to prep Season 1 in one go) or on-demand (e.g. only when the Luma event is confirmed).
- A failed or cancelled episode contract has no effect on any other episode.

Old contracts (`SpectraFounderSeason1_1155`, `SpectraSubmissionRegistry`, `SpectraEventAccessRegistry`) stay in the repo and deployment stack as optional — deploy them if/when the membership or event-access flow is needed.

---

## Naming convention

Episode contract names should be set at the time of deploy based on what the event is actually called:

| Episode | Suggested contract name | Suggested symbol |
|---|---|---|
| Episode 1 | `"Spectra 1"` | `"SPECTRA-EP1"` |
| Episode 2 | `"IRL x Spectra"` | `"SPECTRA-EP2"` |
| Episode 3 | `"Spectra x [Partner Name]"` | `"SPECTRA-EP3"` |
| Episode N | Whatever the event is called | `"SPECTRA-EPN"` |

Both `name` and `symbol` are constructor arguments — set them at deploy, they can be made immutable or mutable depending on preference.

---

## Metadata structure for each artwork token

Each token ID should resolve to a JSON file like this:

```json
{
  "name": "Prism Glitch",
  "description": "Found on the east wall of the venue during Spectra 1. AR artwork by [artist name].",
  "image": "ipfs://...",
  "animation_url": "ipfs://...",
  "attributes": [
    { "trait_type": "Episode", "value": "Spectra 1" },
    { "trait_type": "Season", "value": "1" },
    { "trait_type": "Episode Number", "value": 1 },
    { "trait_type": "Artwork", "value": "Prism Glitch" },
    { "trait_type": "Artist", "value": "[artist name]" },
    { "trait_type": "Medium", "value": "AR / Generative" }
  ]
}
```

The `animation_url` field is where the actual AR/3D content lives. OpenSea and most wallets will render it.

---

## What to check on other sources before writing code

These are the areas where you should verify current best practice before implementation:

### ERC-1155 per-token URI pattern
- OpenZeppelin's current `ERC1155URIStorage` extension supports per-token URI overrides natively.
- Worth checking if using it directly is cleaner than a custom `artworks[tokenId].metadataUri` mapping.
- Reference: [OZ ERC1155URIStorage](https://docs.openzeppelin.com/contracts/5.x/api/token/erc1155#ERC1155URIStorage)

### Signature-based mint gate (Option B)
- EIP-712 typed data signatures are the standard. ECDSA recovery on-chain.
- OpenZeppelin `MessageHashUtils` + `ECDSA` are the right tools.
- Each signature should encode: `(address collector, uint256 tokenId, uint256 episodeChainId, address episodeContract)` — so a signature for one episode can't be replayed on another.
- Reference: [OZ EIP-712](https://docs.openzeppelin.com/contracts/5.x/api/utils#EIP712)

### Marketplace compatibility
- For OpenSea/Zora/etc. to pick up the collection properly: `contractURI()` must return the contract-level metadata URI. Already in scope.
- ERC-1155 `uri(tokenId)` must return a valid IPFS or HTTPS URL per token. Already in scope.
- `name()` and `symbol()` are not in the ERC-1155 standard but are expected by most marketplaces. Include them.

### Base Network specifics
- Base is EVM-equivalent. No special considerations for ERC-1155.
- Basescan verifies Solidity ^0.8.24 with standard flattening or multi-file. Already working in your setup.
- Gas on Base is cheap enough that batch airdrop to hundreds of wallets in one tx is practical.

### Supply cap edge case
- If `maxSupply = 0` means uncapped, make sure the mint check reads `maxSupply == 0 || minted < maxSupply` — not just `minted < maxSupply`.

### OpenZeppelin version
- You are already on OZ 5.x (`@openzeppelin/contracts: ^5.4.0`). The new `AccessControl` does not have `_setupRole` — use `_grantRole` instead. Already done in existing contracts so this is consistent.

---

## Summary of files to create

```
contracts/
  SpectraSeasonRegistry.sol       — new, season-level episode index
  SpectraEpisode1155.sol          — new, per-episode artwork ERC-1155

test/
  SpectraSeasonRegistry.ts        — new
  SpectraEpisode1155.ts           — new

scripts/
  deployEpisode1155.ts            — new, configures name/symbol/season/episode at run time
  registerArtworks.ts             — new, registers token IDs post-deploy
  mintEpisodeArtwork.ts           — new, admin mint helper
  airdropEpisodeArtwork.ts        — new, batch airdrop helper

docs/
  episode-artwork-contracts.md    — this file (design brief)
```

Existing contracts and scripts stay untouched.

---

---

## Decisions locked — confirmed answers

| Decision | Answer |
|---|---|
| Per-wallet mint limit | **1 per wallet per artwork** |
| Transferable or soulbound | **Transferable** |
| Free or paid mint | **Free to start** — pricing added later as option |
| Signature gate | **Open mint for episode 1** — signature gate available as option before high-value drops |
| Season registry timing | **Deploy registry first as standalone, then episode contracts concurrently** — no sequencing between episodes required, gas on Base is cheap enough to batch |
| Contract deployment trigger | **Only when episode status is `open` and Luma event is confirmed** — locked episodes have no contract |

---

## Additional insights before writing code

### 1. The `artworks` array is missing from `episodes.json` — it needs to be added

Right now `episodes.json` has episode-level data (title, venue, date, assets) but **no artwork-level data**. Each episode contract will have multiple token IDs — one per artwork. That means the artwork inventory needs to live somewhere in the data layer before any contract is deployed.

The episode entry needs a new `artworks` field:

```json
{
  "id": 4,
  "slug": "episode-4",
  "title": "SPECTRA 4.0",
  "artworks": [
    {
      "id": 1,
      "name": "Prism Glitch",
      "artist": "Artist Name",
      "description": "Found on the east wall of Studio Berlin during SPECTRA 4.0.",
      "maxSupply": 50,
      "metadataUri": ""
    },
    {
      "id": 2,
      "name": "Signal Residue",
      "artist": "Artist Name",
      "description": "...",
      "maxSupply": 30,
      "metadataUri": ""
    }
  ]
}
```

`metadataUri` starts empty and gets filled in once the artwork is uploaded to IPFS and pinned. The contract's `registerArtwork()` call reads from this field. This is the single source of truth for the artwork inventory — just like `episodes.json` is the source of truth for episodes.

### 2. Luma already pulls: title, description, date, venue, city, image, lumaEventId

The existing `resolveLumaEvent()` function in `src/lib/luma.ts` already scrapes/parses these fields from a Luma event page:

- `title` → episode `title`
- `description` → episode `description` + `summary`
- `startsAt` → episode `startsAt`
- `timezone` → episode `timezone`
- `venueName` → episode `venueName`
- `city` → episode `city`
- `imageUrl` → episode `assets.imageUri` / `posterUri`
- `lumaEventId` → episode `lumaEventId`
- `lumaUrl` → episode `lumaUrl`

**What Luma does NOT have and we have to add manually:**

- `artworks[]` — the AR artwork inventory. Luma knows nothing about what's hidden in the venue. This is curated by you.
- `assets.glbUri` — the 3D model for the AR viewer. Set manually.
- `meta.music[]`, `meta.allies[]`, `meta.tags[]` — the cultural/partner layer. Set manually.
- `meta.es` — Spanish translation. Set manually.
- Contract-specific data: `episodeContractAddress`, `seasonRegistryIndex`.

**Implication**: Luma sync fills ~60% of the fields. The rest — especially artworks — is manual curation that happens in the admin panel before the event.

### 3. Traits generated from `episodes.json` already work for the contract-level collection metadata

`buildEpisodeTraits()` in `src/lib/episodes.ts` produces:

```
Event, Date, Season, Episode, Venue, City, Status, Timezone
```

These traits should also appear on the **episode contract's `contractURI()`** — the collection-level metadata. They describe the episode as a collection, not individual artworks.

For **individual artwork token metadata**, the traits should be a superset:

```
Event, Date, Season, Episode, Venue, City — from the episode
Artwork, Artist, Medium — from the artworks[] entry
```

So `buildEpisodeTraits()` already gives you the episode layer. The artwork layer just adds 3 more traits per token.

### 4. The `contractMetadataUri` for the episode contract should be auto-generated

Right now the collection-level metadata URI is a static IPFS URL set at deploy time. But we already have `/api/episodes/[slug]/metadata` that generates this dynamically.

**Two options:**

**Option A — Dynamic HTTPS URI** (simpler, already works): set `contractMetadataUri` to `https://spectrart.xyz/api/episodes/episode-4/metadata`. OpenSea will fetch it. Works today.

**Option B — Pinned IPFS URI** (stronger, permanent): build the metadata JSON from `episodes.json`, pin it to IPFS, and set the resulting `ipfs://...` URI. Better for permanence. Requires a pinning step before deploy.

**Recommendation**: use Option A (dynamic HTTPS) for the first episodes. It's already built and the data is always in sync with `episodes.json`. Add IPFS pinning as a separate step for later episodes.

**Same logic for individual artwork `metadataUri`**: we can add `/api/episodes/[slug]/artworks/[id]/metadata` to serve per-artwork metadata dynamically. Then when the artwork is ready to be permanent, pin it to IPFS and update the URI on-chain via `setTokenUri()`.

### 5. `episodes.json` needs two new fields per episode for the contract pipeline

```json
{
  "episodeContractAddress": "",
  "seasonRegistryIndex": null
}
```

- `episodeContractAddress` — filled after deploy. Used by the app to know which contract to call for minting.
- `seasonRegistryIndex` — the index in `SpectraSeasonRegistry` returned by `registerEpisode()`. Stored so we can query the registry later.

The existing `registryEventId` field is from `SpectraEventAccessRegistry` (event access roles). That stays as-is. The new fields are for the artwork contract pipeline and are separate.

### 6. The mint trigger: the collector scans AR → what happens exactly?

This is the most important UX question that affects the contract design.

**Scenario A — QR code at the venue (simplest)**
Each AR artwork location has a QR code. Scanning it opens a mint page: `spectrart.xyz/collect/episode-4/artwork/1`. The page connects wallet, checks `hasMinted`, and calls `mint(tokenId, 1)` on the episode contract. Free, open, no gate.

**Scenario B — AR trigger in the Base App**
The artwork is revealed through the Base App AR flow. The app sends a trigger that opens the mint page. Same mint flow, different discovery layer.

**Scenario C — NFC tap (already in Episode 4)**
Episode 4 already has NFC touchpoints via Refraction. Tapping opens the collectible mint. This is effectively the same as Scenario A from the contract's perspective — it's just a different hardware trigger that leads to the same mint page.

**All three scenarios use the same mint contract call.** The contract doesn't know or care how the collector discovered the artwork. It just checks: does this wallet already hold 1 of this token ID, and is the supply not exceeded?

**This means the `SpectraEpisode1155` contract works for all three discovery modes without any changes.** The discovery layer (QR, AR, NFC) is app-level, not contract-level.

### 7. The `hasMinted` guard needs careful design

The 1-per-wallet rule means adding:

```solidity
mapping(address => mapping(uint256 => bool)) public hasMinted;
```

Check at mint:
```solidity
require(!hasMinted[msg.sender][tokenId], "ALREADY_COLLECTED");
hasMinted[msg.sender][tokenId] = true;
```

**One edge case**: what if a collector transfers their token and wants to mint again? Since the guard is on `hasMinted` not on `balanceOf`, they **cannot** mint again even if their balance is 0. This is the correct behavior — you minted it at the venue, that's the provenance record. If you sold it, you sold your proof of presence.

**Admin mint bypasses this guard** intentionally. Airdrops also bypass it. Only the public `mint()` function enforces it.

### 8. Supply cap at 0 means uncapped — explicit decision per artwork

Not all artworks need a supply cap. Some might be "everyone who finds it gets one." Others might be "only 10 exist." The `maxSupply = 0` means uncapped. This needs to be a conscious decision per artwork in the `artworks[]` array, not an afterthought.

**Default recommendation**: set explicit caps. Even if the cap is 200 or 500, having it be explicit signals scarcity and intent. `0` (uncapped) should be a deliberate choice, not the default when you forgot to fill it in.

### 9. The `SpectraEventAccessRegistry` still has a role — it's not replaced

The existing `SpectraEventAccessRegistry` assigns `Attendee` or `Artist` roles per wallet per event. This is about **who is at the event**. The new `SpectraEpisode1155` is about **what they collected**. These are different things.

- `SpectraEventAccessRegistry` → access/identity ("was this wallet at Episode 4 as an artist?")
- `SpectraEpisode1155` → ownership ("does this wallet hold Artwork 2 from Episode 4?")

Both can coexist for the same episode. Keep both in the stack.

### 10. The `episodes.json` ↔ contract pipeline for all 12 episodes

The existing architecture docs say 12 episodes are planned for Season 1. Currently episodes 5–12 are placeholder entries with `status: "locked"`. The rule you confirmed:

> **If episode is not launched yet, contract is not deployed yet.**

This means the pipeline is:

```
1. Episode status = "locked"     → no contract, no artworks array needed
2. Episode status = "open"       → Luma sync fills metadata
                                 → artworks[] is curated manually in admin panel
                                 → IPFS or HTTPS metadata URIs are set
                                 → SpectraEpisode1155 is deployed
                                 → episodeContractAddress saved to episodes.json
                                 → registerEpisode() called on SpectraSeasonRegistry
                                 → artworks registered on-chain via registerArtwork()
                                 → mint opens day of event
```

The admin panel already handles the Luma sync and `episodes.json` editing. It just needs two new things:
- An **artworks editor** per episode (add/edit artworks, set supply, set metadata URI)
- A **deploy episode contract** button that reads from `episodes.json` and deploys `SpectraEpisode1155` with the right name/symbol/season/episode fields

### 11. Token ID stability matters for metadata

Once you call `registerArtwork(tokenId, ...)` on the episode contract, that `tokenId` is permanent. If you register artwork in order 1, 2, 3 and then decide to add artwork 4 later, the metadata at token ID 4 just needs to be ready.

**Never reuse a token ID.** If an artwork is removed or cancelled, leave the gap. The supply on that token ID can be set to 0 or its openMint can be closed.

### 12. Cross-episode collector view

A collector who attended 4 episodes should be able to see all their artwork across all episode contracts from one view. Since each episode is a separate contract, the frontend needs to know all episode contract addresses to query `balanceOf` across them.

This is why `SpectraSeasonRegistry` matters — it's the on-chain index that tells the frontend "here are all the episode contracts for Season 1." Without it, you'd have to hardcode the list of addresses.

The registry is also what lets future tools (indexers, wallets, galleries) discover the full SPECTRA collection without special knowledge.

---

## Next step

1. ✅ Design decisions confirmed (above table)
2. ✅ Deployment order confirmed: registry first (standalone), then episode contracts concurrent/on-demand
3. Add `artworks[]` field to `episodes.json` schema (start with Episode 4 since it's the next event)
4. Add `episodeContractAddress` + `seasonRegistryIndex` fields to episode catalog type
5. Write `SpectraSeasonRegistry.sol`
6. Write `SpectraEpisode1155.sol`
7. Write tests for both
8. Add artwork metadata API route: `/api/episodes/[slug]/artworks/[id]/metadata`
9. Add artwork editor to Episodes HQ admin panel
10. Add "Deploy Season Registry" and "Deploy Episode Contract" flows to Contracts HQ or Episodes HQ
