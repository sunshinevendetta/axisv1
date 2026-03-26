# SPECTRA Owner Access Ops

This document covers the `SpectraOwnerAccess1155` deployment flow, the wallet-gated episodes admin auth model, and how each environment variable should be filled.

## Short answer

- Yes, `EPISODES_ADMIN_USERNAME` and `EPISODES_ADMIN_PASSWORD` can be removed. The dashboard is now wallet-only.
- Yes, using token IDs as role traits is the right model here:
  - `1 = owner`
  - `2 = admin`
  - `3 = aiagent`
- Recommended default dashboard access:
  - `EPISODES_OWNER_ERC1155_TOKEN_ID=1,2`
  - This lets owners and human admins into `/owner/episodes`.
  - Keep `3` out unless AI agent wallets should also be able to open the dashboard UI.

## Role model

`SpectraOwnerAccess1155` is a soulbound ERC-1155:

- tokens can be minted
- tokens can be burned by admin
- tokens cannot be transferred wallet-to-wallet

That gives you role identity without letting someone resell or move access.

The role tokens mean:

- `owner`
  - highest-trust identity
  - usually founders, core organizers, or a multisig-controlled wallet
- `admin`
  - human operators who should access the episode control room
  - can be rotated more often than owner
- `aiagent`
  - machine or service wallet
  - should usually be limited to narrow automation duties

## Recommended opsec

Use a 3-layer model:

1. `OWNER_ACCESS_ADMIN_ADDRESS`
   - best as a hardware wallet or multisig
   - this is the root admin for the owner-access contract
   - it can revoke compromised access keys and revoke compromised contract roles

2. `OWNER_ACCESS_INITIAL_MINTER_ADDRESS`
   - optional hot wallet used only to mint initial keys
   - useful when you want a one-command deploy+mint flow
   - after bootstrap, the admin should decide whether to keep or revoke this minter role

3. Token holder wallets
   - owner wallets receive token ID `1`
   - admin wallets receive token ID `2`
   - agent wallets receive token ID `3`

Recommended pattern:

- admin/root key = hardware wallet or Safe
- daily human ops = token ID `2`
- automation = token ID `3`
- dashboard login allowlist = `1,2`

## Failsafes

If a token-holder wallet is compromised:

- burn that wallet’s token with `npm run contracts:revoke:owner-access`
- mint a replacement token to a fresh wallet

If a minter wallet is compromised:

- use the admin key to revoke `MINTER_ROLE`
- burn any wrongly issued tokens
- rotate to a fresh minter if needed

If the root admin wallet is compromised:

- assume full contract control is at risk
- deploy a fresh `SpectraOwnerAccess1155`
- mint fresh owner/admin/agent keys
- update `EPISODES_OWNER_ERC1155_ADDRESS`
- invalidate the old contract operationally

## One-command bootstrap

This deploys `SpectraOwnerAccess1155` and mints the first key in one run:

```bash
npm run contracts:bootstrap:owner-access
```

It reads from `.env`, so you do not need to paste all variables into the shell every time.

Minimum required bootstrap variables:

```env
OWNER_ACCESS_DEPLOY_RPC_URL=https://mainnet.base.org
OWNER_ACCESS_DEPLOY_PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY
OWNER_ACCESS_ADMIN_ADDRESS=0xYOUR_HARDWARE_OR_SAFE_ADMIN
OWNER_ACCESS_INITIAL_MINTER_ADDRESS=0xYOUR_DEPLOYER_OR_MINT_OPERATOR
OWNER_ACCESS_RECIPIENT=0xWALLET_THAT_RECEIVES_THE_FIRST_KEY
OWNER_ACCESS_ROLE=owner
```

Notes:

- if `OWNER_ACCESS_INITIAL_MINTER_ADDRESS` is blank, it defaults to the deployer wallet derived from `OWNER_ACCESS_DEPLOY_PRIVATE_KEY`
- `OWNER_ACCESS_ROLE` can be `owner`, `admin`, or `aiagent`

## Common commands

Deploy only:

```bash
npm run contracts:deploy:owner-access
```

Deploy and mint first key:

```bash
npm run contracts:bootstrap:owner-access
```

Mint another key later:

```bash
npm run contracts:mint:owner-access
```

Burn a compromised key:

```bash
npm run contracts:revoke:owner-access
```

Grant or revoke contract roles like `MINTER_ROLE`:

```bash
npm run contracts:roles:owner-access
```

## Environment variables

### Episodes dashboard runtime

`EPISODES_ADMIN_SESSION_SECRET`

- Required.
- Used to sign the session cookie after a wallet proves ownership.
- Fill with a long random string, at least 32 bytes of entropy.
- Example:

```env
EPISODES_ADMIN_SESSION_SECRET=change_this_to_a_long_random_secret_value
```

`EPISODES_OWNER_ERC1155_ADDRESS`

- Required for wallet auth.
- The deployed `SpectraOwnerAccess1155` contract address.
- Fill with the address printed by the deploy/bootstrap script.

`EPISODES_OWNER_ERC1155_TOKEN_ID`

- Required for wallet auth.
- Comma-separated token IDs allowed to enter the episodes dashboard.
- Recommended:

```env
EPISODES_OWNER_ERC1155_TOKEN_ID=1,2
```

- Use `1,2,3` only if AI agent wallets should also access the dashboard UI.

`EPISODES_OWNER_RPC_URL`

- Optional.
- RPC used to check token balances for login.
- Base mainnet is already the default:

```env
EPISODES_OWNER_RPC_URL=https://mainnet.base.org
```

`EPISODES_OWNER_ALLOWLIST`

- Optional emergency bypass.
- Comma-separated wallet addresses that should pass auth even without the token.
- Use sparingly and remove entries after emergency use.
- Example:

```env
EPISODES_OWNER_ALLOWLIST=0xabc...,0xdef...
```

### Episode sync to onchain registry

`EPISODES_SYNC_RPC_URL`

- Required only for syncing episode metadata to the event registry contract.
- Fill with the RPC endpoint for the chain where `SpectraEventAccessRegistry` lives.

`EPISODES_SYNC_PRIVATE_KEY`

- Required only for sync writes.
- Private key of the wallet allowed to write to `SpectraEventAccessRegistry`.
- Keep this separate from owner-access root keys if possible.

`SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS`

- Required only for sync writes.
- Deployed registry contract address.

### Owner-access deploy and mint operations

`OWNER_ACCESS_DEPLOY_RPC_URL`

- Required for deploy/mint/revoke/role-management scripts unless an admin override RPC is provided.
- Usually:

```env
OWNER_ACCESS_DEPLOY_RPC_URL=https://mainnet.base.org
```

`OWNER_ACCESS_DEPLOY_PRIVATE_KEY`

- Required for deploy and default mint operations.
- Private key used to deploy the contract.
- This can also be the initial minter if you want one-command bootstrap.

`OWNER_ACCESS_ADMIN_ADDRESS`

- Required for deploy/bootstrap.
- Root admin address that receives `DEFAULT_ADMIN_ROLE`.
- Best filled with a Safe or hardware wallet address.

`OWNER_ACCESS_INITIAL_MINTER_ADDRESS`

- Optional but strongly recommended when separating hot minting from root admin.
- This address receives `MINTER_ROLE` at deploy time if it differs from the admin.
- Fill with the deployer wallet or a temporary mint-ops wallet.

`OWNER_ACCESS_BASE_URI`

- Optional metadata base URI for token metadata.
- Default:

```env
OWNER_ACCESS_BASE_URI=ipfs://spectra-owner-access/{id}.json
```

`OWNER_ACCESS_CONTRACT_METADATA_URI`

- Optional contract-level metadata URI.
- Default:

```env
OWNER_ACCESS_CONTRACT_METADATA_URI=ipfs://spectra-owner-access/contract.json
```

`OWNER_ACCESS_CONTRACT_ADDRESS`

- Required for mint, revoke, and role-management commands after deployment.
- Fill with the deployed `SpectraOwnerAccess1155` address.

`OWNER_ACCESS_RECIPIENT`

- Used by mint/bootstrap scripts.
- The wallet receiving the key token.

`OWNER_ACCESS_ROLE`

- Used by mint/bootstrap scripts.
- Allowed values:
  - `owner`
  - `admin`
  - `aiagent`

`OWNER_ACCESS_TOKEN_ID`

- Optional only for custom-role minting through the generic `mint` path.
- Not needed for the built-in `owner`, `admin`, or `aiagent` roles.

`OWNER_ACCESS_AMOUNT`

- Optional.
- Defaults to `1`.
- For soulbound access keys, keep this at `1`.

### Emergency revoke command

`OWNER_ACCESS_ADMIN_RPC_URL`

- Optional override RPC for admin-only commands.
- Useful if you want admin scripts on a different provider than the mint scripts.

`OWNER_ACCESS_ADMIN_PRIVATE_KEY`

- Optional override signer for admin-only commands.
- Used by revoke or role-management scripts.
- If blank, scripts fall back to `OWNER_ACCESS_DEPLOY_PRIVATE_KEY`.

`OWNER_ACCESS_REVOKE_ACCOUNT`

- Used by `contracts:revoke:owner-access`.
- Wallet whose token should be burned.

`OWNER_ACCESS_REVOKE_TOKEN_ID`

- Used by `contracts:revoke:owner-access`.
- Usually:
  - `1` for owner
  - `2` for admin
  - `3` for aiagent

`OWNER_ACCESS_REVOKE_AMOUNT`

- Optional.
- Defaults to `1`.

### Contract role rotation

`OWNER_ACCESS_ROLE_ACTION`

- Used by `contracts:roles:owner-access`.
- `grant` or `revoke`

`OWNER_ACCESS_CONTRACT_ROLE`

- Used by `contracts:roles:owner-access`.
- Allowed values:
  - `DEFAULT_ADMIN_ROLE`
  - `MINTER_ROLE`
  - `PAUSER_ROLE`
  - `URI_MANAGER_ROLE`

`OWNER_ACCESS_ROLE_ACCOUNT`

- Wallet address receiving or losing the contract role.

## Recommended `.env` example

```env
EPISODES_ADMIN_SESSION_SECRET=change_this_to_a_long_random_secret_value

EPISODES_SYNC_RPC_URL=https://mainnet.base.org
EPISODES_SYNC_PRIVATE_KEY=0xSYNC_WRITER_PRIVATE_KEY
SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS=0xEVENT_ACCESS_REGISTRY

EPISODES_OWNER_ERC1155_ADDRESS=0xOWNER_ACCESS_1155
EPISODES_OWNER_ERC1155_TOKEN_ID=1,2
EPISODES_OWNER_RPC_URL=https://mainnet.base.org
EPISODES_OWNER_ALLOWLIST=

OWNER_ACCESS_DEPLOY_RPC_URL=https://mainnet.base.org
OWNER_ACCESS_DEPLOY_PRIVATE_KEY=0xDEPLOYER_PRIVATE_KEY
OWNER_ACCESS_ADMIN_ADDRESS=0xSAFE_OR_HARDWARE_ADMIN
OWNER_ACCESS_INITIAL_MINTER_ADDRESS=0xTEMP_MINTER_OR_DEPLOYER
OWNER_ACCESS_BASE_URI=ipfs://spectra-owner-access/{id}.json
OWNER_ACCESS_CONTRACT_METADATA_URI=ipfs://spectra-owner-access/contract.json
OWNER_ACCESS_CONTRACT_ADDRESS=0xOWNER_ACCESS_1155
OWNER_ACCESS_RECIPIENT=0xFIRST_WALLET
OWNER_ACCESS_ROLE=owner
OWNER_ACCESS_TOKEN_ID=
OWNER_ACCESS_AMOUNT=1
OWNER_ACCESS_ADMIN_RPC_URL=https://mainnet.base.org
OWNER_ACCESS_ADMIN_PRIVATE_KEY=0xADMIN_IF_USING_EOA
OWNER_ACCESS_REVOKE_ACCOUNT=
OWNER_ACCESS_REVOKE_TOKEN_ID=
OWNER_ACCESS_REVOKE_AMOUNT=1
OWNER_ACCESS_ROLE_ACTION=
OWNER_ACCESS_CONTRACT_ROLE=
OWNER_ACCESS_ROLE_ACCOUNT=
```

## Practical guidance

For your setup, the safest simple version is:

- remove username/password auth entirely
- deploy owner access once
- mint `owner` token to your hardware or Safe-controlled wallet
- mint `admin` token to the human ops wallet that edits episodes
- mint `aiagent` token only to a tightly scoped automation wallet
- set `EPISODES_OWNER_ERC1155_TOKEN_ID=1,2` unless the AI agent must open the admin UI

If you want, the next hardening step after this would be splitting AI-agent auth away from the human dashboard and checking token ID `3` only on the automation endpoints that actually need it.
