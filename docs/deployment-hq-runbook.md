# Deployment HQ Runbook

This is the shortest safe path to get into Deployment HQ and then move from bootstrap access to final token-gated access.

## 1. Bootstrap access first

To sign into `/owner/contracts` and `/owner/episodes`, you only need:

```env
EPISODES_ADMIN_SESSION_SECRET=your-long-random-secret
```

Leave these blank during bootstrap:

```env
EPISODES_OWNER_ERC1155_ADDRESS=
EPISODES_OWNER_ERC1155_TOKEN_ID=
EPISODES_OWNER_RPC_URL=
EPISODES_OWNER_ALLOWLIST=
```

Why:

- if the owner-token gate is blank, the app allows a wallet-signed bootstrap session
- this avoids fake contract addresses and wrong-network balance checks
- you can still use Deployment HQ and Episodes HQ while the contract stack is not deployed yet

## 2. Deployment order

Use Deployment HQ in this order:

1. `Owner Access 1155`
2. `Submission Registry`
3. `Founder Membership S1`
4. `Event Access Registry`
5. Link founder membership into submission registry
6. Mint an `owner` or `admin` key to the wallet that should have final dashboard access

The HQ page now outputs:

- `Bootstrap Env`
- `Token Gated Env`
- `Contract Env Handoff`
- `Deployment Manifest` JSON

The JSON manifest is the durable record of deployed addresses, tx hashes, constructor args, and verification status.

## 3. Switch to final token-gated access

After `Owner Access 1155` is deployed and the wallet has token `1` or `2`, update `.env`:

```env
EPISODES_OWNER_ERC1155_ADDRESS=0xYOUR_OWNER_ACCESS_1155
EPISODES_OWNER_ERC1155_TOKEN_ID=1,2
EPISODES_OWNER_RPC_URL=https://your-rpc-for-the-chain
EPISODES_OWNER_ALLOWLIST=
```

Recommended:

- `1 = owner`
- `2 = admin`
- keep `EPISODES_OWNER_ALLOWLIST` empty after bootstrap

## 4. Contract handoff env

After the full stack is live, these are the key addresses to carry into `.env`:

```env
OWNER_ACCESS_CONTRACT_ADDRESS=0x...
SPECTRA_SUBMISSION_REGISTRY_ADDRESS=0x...
SPECTRA_FOUNDER_MEMBERSHIP_ADDRESS=0x...
SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS=0x...
```

## 5. Verification config

For explorer verification, the app expects:

```env
BASESCAN_API_KEY=your-api-key
ETHERSCAN_API_URL=https://api.etherscan.io/v2/api
BASE_BLOCKSCOUT_API_URL=https://base.blockscout.com/api/
BASE_SEPOLIA_BLOCKSCOUT_API_URL=https://base-sepolia.blockscout.com/api/
```

Do not paste a full Etherscan URL into `BASESCAN_API_KEY`.
