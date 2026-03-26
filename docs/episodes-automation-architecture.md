# Episodes Automation Architecture

This project now has a single source of truth for episodes in [episodes.json](/z:/spectra/episode/spectrart/content/episodes.json). When you add or update an episode there, the following layers can consume the same record:

- the Episodes UI
- the token/event metadata JSON
- the onchain event registry payload
- the Luma checkout link

## Source of truth

Each episode entry contains:

- `slug`, `title`, `id`, `season`, `status`
- `startsAt`, `timezone`, `venueName`, `city`
- `summary`, `description`
- `lumaEventId`, `lumaUrl`
- `assets.sourceUri`
- `assets.posterUri`
- `assets.imageUri`
- `assets.glbUri`

`imageUri` is treated as the extracted image you want token metadata and cards to use. If you only have a poster or original upload, the app falls back to `posterUri`.

## Automation flow

1. Add a new episode entry in `content/episodes.json`.
2. Put the uploaded source asset path in `assets.sourceUri`.
3. Put the extracted image path in `assets.imageUri`.
4. Put the GLB path in `assets.glbUri`.
5. Put the Luma event ID and URL in `lumaEventId` and `lumaUrl`.
6. The Episodes section updates automatically.
7. `/api/episodes` exposes a normalized automation payload for all episodes.
8. `/api/episodes/[slug]/metadata` exposes token-style metadata JSON with:
   - `name`
   - `description`
   - `image`
   - `animation_url`
   - `external_url`
   - `attributes`
9. `scripts/syncEpisodeEvent.ts` can create or update the onchain event entry from the same catalog row.

## Trait generation

Traits are generated from the episode record in [src/lib/episodes.ts](/z:/spectra/episode/spectrart/src/lib/episodes.ts):

- Event
- Date
- Season
- Episode
- Venue
- City
- Status
- Timezone

This means the event name, date, and related info are always aligned with the same episode object instead of being copied into multiple places.

## Owner dashboard

There is now an owner-facing admin page at `/owner/episodes`.

It lets you:

- sign in as organizer owner with a wallet-based ERC-1155 assertion
- select an existing episode
- update title, date, timezone, venue, city, summary, and description
- update `lumaEventId` and `lumaUrl`
- update `sourceUri`, `posterUri`, `imageUri`, and `glbUri`
- save the current episode without editing code
- sync the selected episode to `SpectraEventAccessRegistry`

### Environment variables (owner dashboard / owner wallet access)

For the full owner-access deployment, minting, revoke, and opsec guide, see [owner-access-ops.md](/z:/spectra/episode/spectrart/docs/owner-access-ops.md).
For the deployment UI handoff, bootstrap login, and manifest flow, see [deployment-hq-runbook.md](/z:/spectra/episode/spectrart/docs/deployment-hq-runbook.md).

These are the variables used by `src/lib/owner-session.ts` to determine whether a request is allowed.

#### Required

- `EPISODES_ADMIN_SESSION_SECRET` (string)
  - Used to sign/verify the owner session cookie.
  - **Always required** when using the owner dashboard (even for wallet-based login).

- `EPISODES_OWNER_ERC1155_ADDRESS` (address)
  - The deployed `SpectraOwnerAccess1155` contract address.
  - Used to verify a wallet holds an access token.

- `EPISODES_OWNER_ERC1155_TOKEN_ID` (number or comma-separated list)
  - The token ID(s) that grant access to the admin dashboard.
  - Example: `1` (owner only) or `1,2,3` (owner+admin+aiagent).

#### Optional allowlist override

- `EPISODES_OWNER_ALLOWLIST` (comma-separated wallet addresses)

This bypasses the ERC-1155 check so you can grant temporary admin access without minting.
Example: `0xabc...,0xdef...`.

#### RPC/settings for ERC-1155 checks

- `EPISODES_OWNER_RPC_URL` (URL)
  - RPC endpoint used to query token balances for access checks.
  - Defaults to `https://mainnet.base.org` if not set.

#### Bootstrap-only mode

If you want to access the admin UI before `SpectraOwnerAccess1155` exists, keep the four owner-token vars blank and set only:

```env
EPISODES_ADMIN_SESSION_SECRET=change_this_to_a_long_random_secret_value
```

In that mode the app allows a wallet-signed bootstrap session without checking ERC-1155 ownership yet.

---

### Owner access token roles (ERC-1155)

The token IDs in `SpectraOwnerAccess1155` are meant to represent roles/traits.
A wallet holding a token with one of these IDs can log in (subject to `EPISODES_OWNER_ERC1155_TOKEN_ID`).

Default role IDs:

- `1 = owner`
- `2 = admin`
- `3 = aiagent`

For example, use `EPISODES_OWNER_ERC1155_TOKEN_ID=1,2` to allow both owner and admin wallets.

#### Security / key compromise notes

- The deployer wallet (the one used by `OWNER_ACCESS_DEPLOY_PRIVATE_KEY`) is granted the admin/minter/pauser/URI-manager roles. Treat it like a root key and keep it highly secure (hardware wallet / multisig).
- Tokens are **non-transferable**, so losing a wallet does not let an attacker move access tokens, but it **can** let an attacker mint new ones if they control a role account.
- If a key is compromised:
  - Use a separate admin key (or a multisig) to call `revoke(address, tokenId, amount)` on the contract and burn the compromised token(s).
  - Or pause the contract with `pause()` (requires `PAUSER_ROLE`) until you regain control.
  - You can also deploy a new `SpectraOwnerAccess1155` contract and update `EPISODES_OWNER_ERC1155_ADDRESS`.

---

### Sync / onchain registry configuration

To sync episodes to the onchain registry you also need:

- `EPISODES_SYNC_RPC_URL` (RPC endpoint for the chain used by `SpectraEventAccessRegistry`)
- `EPISODES_SYNC_PRIVATE_KEY` (private key used to sign sync transactions)
- `SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS` (deployed registry contract address)

## Onchain registry connection

The event registry payload currently maps an episode to:

- `name = episode.title`
- `metadataURI = /api/episodes/[slug]/metadata`
- `active = episode.status === "open"`

Use:

```bash
EPISODE_SLUG=episode-3 SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS=0x... npm run contracts:sync:event
```

To update an existing event instead of creating a new one:

```bash
EPISODE_SLUG=episode-3 SPECTRA_EVENT_ID=3 SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS=0x... npm run contracts:sync:event
```

## Owner access key deployment

Deploy the owner-access ERC-1155:

```bash
OWNER_ACCESS_DEPLOY_RPC_URL=https://mainnet.base.org \
OWNER_ACCESS_DEPLOY_PRIVATE_KEY=0x... \
OWNER_ACCESS_ADMIN_ADDRESS=0xYourWallet \
npm run contracts:deploy:owner-access
```

Deploy and mint your first owner key in one command:

```bash
OWNER_ACCESS_DEPLOY_RPC_URL=https://mainnet.base.org \
OWNER_ACCESS_DEPLOY_PRIVATE_KEY=0x... \
OWNER_ACCESS_ADMIN_ADDRESS=0xYourWallet \
OWNER_ACCESS_INITIAL_MINTER_ADDRESS=0xYourDeployerWallet \
OWNER_ACCESS_RECIPIENT=0xYourWallet \
OWNER_ACCESS_ROLE=owner \
npm run contracts:bootstrap:owner-access
```

Mint additional admin or ai-agent keys later:

```bash
OWNER_ACCESS_DEPLOY_RPC_URL=https://mainnet.base.org \
OWNER_ACCESS_DEPLOY_PRIVATE_KEY=0x... \
OWNER_ACCESS_CONTRACT_ADDRESS=0xOwnerAccessContract \
OWNER_ACCESS_RECIPIENT=0xAgentWallet \
OWNER_ACCESS_ROLE=aiagent \
npm run contracts:mint:owner-access
```

For owner-dashboard sync, also configure:

- `EPISODES_SYNC_RPC_URL`
- `EPISODES_SYNC_PRIVATE_KEY`
- `SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS`

## Luma integration

Today, Luma is connected through `lumaEventId` and `lumaUrl`, which drive the checkout button in the Episodes UI.

If you want a deeper sync later, the next safe step is:

- pull canonical date, title, and description from Luma's API or a webhook into a private admin route
- validate that payload
- write the approved values into `content/episodes.json` or a future CMS/database
- then run the onchain sync script from that same canonical episode record

That keeps Luma as the scheduling source while still preserving an internal reviewed source of truth for onchain metadata.
