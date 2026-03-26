# © SPECTRA Founder Membership Season 1

This scaffold splits the system into three contracts so Season 1 founder membership, submission provenance, and event access stay cleanly separated.

## Contracts

### `SpectraSubmissionRegistry.sol`

Purpose:
- stores the submission record
- keeps the applicant wallet
- stores `emailHash` instead of plaintext email
- stores a mutable `metadataURI`
- tracks approval and whether the submission already minted

Key idea:
- one submission creates one `submissionId`
- the ERC-1155 founder mint later links back to that exact `submissionId`

### `SpectraFounderSeason1_1155.sol`

Purpose:
- mints the Season 1 founder token
- maps `submissionId <-> tokenId`
- supports `pause`, `unpause`, `closeSeason`
- supports mutable base URI and contract metadata URI
- supports airdrops for future membership drops

Current design:
- `tokenId == submissionId`
- each approved submission can mint exactly one founder token
- the season can be permanently closed without disabling transfers or airdrops

### `SpectraEventAccessRegistry.sol`

Purpose:
- generates events
- assigns only two event roles per wallet:
  - `Attendee`
  - `Artist`

Key idea:
- role type stays fixed
- only the event changes
- the event name and metadata URI are mutable
- events can be deactivated and new ones created later

## What this solves

- submission provenance is explicit
- Season 1 founder membership is separate from event access
- event names can change without touching membership supply
- event roles stay simple: attendee or artist
- future drops can be airdropped to current founder holders

## What is still missing before production

- actual approval policy:
  - admin approval before mint
  - or auto-approval
- transfer policy:
  - do founder benefits follow the current holder
  - or the original minter
- metadata policy:
  - IPFS / Arweave / HTTPS
- deployment tooling:
  - Foundry or Hardhat config is not yet in this repo
- frontend integration:
  - current app still points to the old submission contract

## Recommended next implementation step

1. Add Foundry or Hardhat.
2. Write tests for:
   - submission creation
   - approval
   - founder mint
   - season close
   - URI updates
   - event creation and access assignment
   - airdrops
3. Replace the current frontend membership flow with:
   - connect wallet
   - create submission
   - wait for approval or auto-approve
   - mint Season 1 founder token
   - query event access from `SpectraEventAccessRegistry`
