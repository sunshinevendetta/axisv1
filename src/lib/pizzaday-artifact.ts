/**
 * VENDORED build artifact for AxisPizzaDayEpisode1155.
 *
 * Generated from artifacts/contracts/AxisPizzaDayEpisode1155.sol/AxisPizzaDayEpisode1155.json.
 * Committed (not gitignored) so the browser admin can deploy without the
 * Hardhat /artifacts folder, which is .gitignored and absent on Vercel/CI.
 *
 * To regenerate after a contract change:
 *   npm run contracts:compile
 *   node scripts/vendorPizzaDayArtifact.mjs
 */

import type { Abi, Hex } from "viem";

export const PDQ_MEDALS_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "admin_",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "name_",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol_",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "seasonId_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "episodeNumber_",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "baseUri_",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contractMetadataUri_",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "collector",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "AlreadyCollected",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ArtworkAlreadyRegistered",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ArtworkMintNotOpen",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ArtworkNotFound",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ERC1155InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC1155InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "idsLength",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "valuesLength",
        "type": "uint256"
      }
    ],
    "name": "ERC1155InvalidArrayLength",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "ERC1155InvalidOperator",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC1155InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC1155InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC1155MissingApprovalForAll",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyRecipientsArray",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidWindow",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint64",
        "name": "endsAt",
        "type": "uint64"
      }
    ],
    "name": "MintEnded",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint64",
        "name": "startsAt",
        "type": "uint64"
      }
    ],
    "name": "MintNotStarted",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxSupply",
        "type": "uint256"
      }
    ],
    "name": "SupplyExceeded",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroAddress",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "recipientCount",
        "type": "uint256"
      }
    ],
    "name": "Airdropped",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ArtworkMintClosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ArtworkMintOpened",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "collector",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "ArtworkMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "artworkName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "maxSupply",
        "type": "uint256"
      }
    ],
    "name": "ArtworkRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "newUri",
        "type": "string"
      }
    ],
    "name": "BaseUriUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "newUri",
        "type": "string"
      }
    ],
    "name": "ContractMetadataUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newMaxSupply",
        "type": "uint256"
      }
    ],
    "name": "MaxSupplyUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "startsAt",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "endsAt",
        "type": "uint64"
      }
    ],
    "name": "MintWindowUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "newUri",
        "type": "string"
      }
    ],
    "name": "TokenUriUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "ids",
        "type": "uint256[]"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      }
    ],
    "name": "TransferBatch",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "TransferSingle",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "value",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "URI",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "value",
        "type": "string"
      }
    ],
    "name": "URI",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "AIRDROP_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ARTWORK_MANAGER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MINTER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PAUSER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "URI_MANAGER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "adminMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "recipients",
        "type": "address[]"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "airdrop",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "artworks",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "metadataUri",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "maxSupply",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minted",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "openMint",
        "type": "bool"
      },
      {
        "internalType": "uint64",
        "name": "mintStartsAt",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "mintEndsAt",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "accounts",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "ids",
        "type": "uint256[]"
      }
    ],
    "name": "balanceOfBatch",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contractMetadataUri",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contractURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "episodeNumber",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "exists",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "hasMinted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "artworkName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "metadataUri",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "maxSupply",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "openMint_",
        "type": "bool"
      },
      {
        "internalType": "uint64",
        "name": "mintStartsAt",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "mintEndsAt",
        "type": "uint64"
      }
    ],
    "name": "registerArtwork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256[]",
        "name": "ids",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeBatchTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "seasonId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "newUri",
        "type": "string"
      }
    ],
    "name": "setBaseUri",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "newUri",
        "type": "string"
      }
    ],
    "name": "setContractMetadataUri",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "newMaxSupply",
        "type": "uint256"
      }
    ],
    "name": "setMaxSupply",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint64",
        "name": "startsAt",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "endsAt",
        "type": "uint64"
      }
    ],
    "name": "setMintWindow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "open",
        "type": "bool"
      }
    ],
    "name": "setOpenMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "newUri",
        "type": "string"
      }
    ],
    "name": "setTokenUri",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "uri",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const satisfies Abi;

export const PDQ_MEDALS_BYTECODE = "0x60c060405234801561000f575f5ffd5b50604051615b2e380380615b2e83398181016040528101906100319190610567565b60405180602001604052805f81525061004f8161021960201b60201c565b505f73ffffffffffffffffffffffffffffffffffffffff168773ffffffffffffffffffffffffffffffffffffffff16036100b5576040517fd92e233d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b85600790816100c4919061087b565b5084600890816100d4919061087b565b5083608081815250508260a0818152505081600a90816100f4919061087b565b508060099081610104919061087b565b506101175f5f1b8861022c60201b60201c565b506101487f8379d04e13cada81a99237b97ad49cf6f4bfd86e1ac211976061d7a5b05ccf6c8861022c60201b60201c565b506101797f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a68861022c60201b60201c565b506101aa7f3a2f235c9daaf33349d300aadff2f15078a89df81bcfdd45ba11c8f816bddc6f8861022c60201b60201c565b506101db7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a8861022c60201b60201c565b5061020c7fa70a2d8710fed9f014c8c2af50c7c2f6b25748ae4cded822e03b7beed44cf3a88861022c60201b60201c565b505050505050505061094a565b8060029081610228919061087b565b5050565b5f61023d838361032260201b60201c565b61031857600160055f8581526020019081526020015f205f015f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f6101000a81548160ff0219169083151502179055506102b561038660201b60201c565b73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a46001905061031c565b5f90505b92915050565b5f60055f8481526020019081526020015f205f015f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f9054906101000a900460ff16905092915050565b5f33905090565b5f604051905090565b5f5ffd5b5f5ffd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6103c78261039e565b9050919050565b6103d7816103bd565b81146103e1575f5ffd5b50565b5f815190506103f2816103ce565b92915050565b5f5ffd5b5f5ffd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b61044682610400565b810181811067ffffffffffffffff8211171561046557610464610410565b5b80604052505050565b5f61047761038d565b9050610483828261043d565b919050565b5f67ffffffffffffffff8211156104a2576104a1610410565b5b6104ab82610400565b9050602081019050919050565b8281835e5f83830152505050565b5f6104d86104d384610488565b61046e565b9050828152602081018484840111156104f4576104f36103fc565b5b6104ff8482856104b8565b509392505050565b5f82601f83011261051b5761051a6103f8565b5b815161052b8482602086016104c6565b91505092915050565b5f819050919050565b61054681610534565b8114610550575f5ffd5b50565b5f815190506105618161053d565b92915050565b5f5f5f5f5f5f5f60e0888a03121561058257610581610396565b5b5f61058f8a828b016103e4565b975050602088015167ffffffffffffffff8111156105b0576105af61039a565b5b6105bc8a828b01610507565b965050604088015167ffffffffffffffff8111156105dd576105dc61039a565b5b6105e98a828b01610507565b95505060606105fa8a828b01610553565b945050608061060b8a828b01610553565b93505060a088015167ffffffffffffffff81111561062c5761062b61039a565b5b6106388a828b01610507565b92505060c088015167ffffffffffffffff8111156106595761065861039a565b5b6106658a828b01610507565b91505092959891949750929550565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f60028204905060018216806106c257607f821691505b6020821081036106d5576106d461067e565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026107377fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826106fc565b61074186836106fc565b95508019841693508086168417925050509392505050565b5f819050919050565b5f61077c61077761077284610534565b610759565b610534565b9050919050565b5f819050919050565b61079583610762565b6107a96107a182610783565b848454610708565b825550505050565b5f5f905090565b6107c06107b1565b6107cb81848461078c565b505050565b5b818110156107ee576107e35f826107b8565b6001810190506107d1565b5050565b601f82111561083357610804816106db565b61080d846106ed565b8101602085101561081c578190505b610830610828856106ed565b8301826107d0565b50505b505050565b5f82821c905092915050565b5f6108535f1984600802610838565b1980831691505092915050565b5f61086b8383610844565b9150826002028217905092915050565b61088482610674565b67ffffffffffffffff81111561089d5761089c610410565b5b6108a782546106ab565b6108b28282856107f2565b5f60209050601f8311600181146108e3575f84156108d1578287015190505b6108db8582610860565b865550610942565b601f1984166108f1866106db565b5f5b82811015610918578489015182556001820191506020850194506020810190506108f3565b868310156109355784890151610931601f891682610844565b8355505b6001600288020188555050505b505050505050565b60805160a0516151c361096b5f395f610a5501525f610a7901526151c35ff3fe608060405234801561000f575f5ffd5b5060043610610265575f3560e01c806357f7789e1161014f578063ba66a5f9116100c1578063d547741f11610085578063d547741f14610724578063e63ab1e914610740578063e8a3d4851461075e578063e985e9c51461077c578063f242432a146107ac578063f8f1147d146107c857610265565b8063ba66a5f914610680578063bd85b0391461069e578063c204642c146106ce578063d2423105146106ea578063d53913931461070657610265565b806391d148541161011357806391d14854146105c057806395d89b41146105f0578063a0712d681461060e578063a0bcfc7f1461062a578063a217fddf14610646578063a22cb4651461066457610265565b806357f7789e146105425780635c975abb1461055e578063642cab0e1461057c578063682d07d9146105985780638456cb59146105b657610265565b80631e0fbfa2116101e857806336568abe116101ac57806336568abe1461046957806337da577c146104855780633f4ba83a146104a15780634b602673146104ab5780634e1273f4146104e25780634f558e791461051257610265565b80631e0fbfa2146103c7578063248a9ca3146103e5578063291f1ed5146104155780632eb2c2d6146104315780632f2ff15d1461044d57610265565b806306fdde031161022f57806306fdde0314610321578063096429591461033f5780630e89341c1461035b5780631325aea71461038b57806318160ddd146103a957610265565b80624a84cb14610269578062fdd58e1461028557806301ffc9a7146102b557806302bf974b146102e55780630492296014610303575b5f5ffd5b610283600480360381019061027e9190613a74565b6107f8565b005b61029f600480360381019061029a9190613ac4565b6109ed565b6040516102ac9190613b11565b60405180910390f35b6102cf60048036038101906102ca9190613b7f565b610a42565b6040516102dc9190613bc4565b60405180910390f35b6102ed610a53565b6040516102fa9190613b11565b60405180910390f35b61030b610a77565b6040516103189190613b11565b60405180910390f35b610329610a9b565b6040516103369190613c4d565b60405180910390f35b61035960048036038101906103549190613d35565b610b27565b005b61037560048036038101906103709190613e11565b610ed6565b6040516103829190613c4d565b60405180910390f35b610393610fe3565b6040516103a09190613e54565b60405180910390f35b6103b1611007565b6040516103be9190613b11565b60405180910390f35b6103cf611010565b6040516103dc9190613e54565b60405180910390f35b6103ff60048036038101906103fa9190613e97565b611034565b60405161040c9190613e54565b60405180910390f35b61042f600480360381019061042a9190613ec2565b611051565b005b61044b600480360381019061044691906140e8565b611174565b005b610467600480360381019061046291906141b3565b611199565b005b610483600480360381019061047e91906141b3565b6111bb565b005b61049f600480360381019061049a91906141f1565b611236565b005b6104a96112fa565b005b6104c560048036038101906104c09190613e11565b61132f565b6040516104d998979695949392919061423e565b60405180910390f35b6104fc60048036038101906104f79190614388565b6114c0565b60405161050991906144b5565b60405180910390f35b61052c60048036038101906105279190613e11565b6115ca565b6040516105399190613bc4565b60405180910390f35b61055c600480360381019061055791906144d5565b6115dd565b005b610566611707565b6040516105739190613bc4565b60405180910390f35b61059660048036038101906105919190614532565b61171c565b005b6105a06118d9565b6040516105ad9190613e54565b60405180910390f35b6105be6118fd565b005b6105da60048036038101906105d591906141b3565b611932565b6040516105e79190613bc4565b60405180910390f35b6105f8611996565b6040516106059190613c4d565b60405180910390f35b61062860048036038101906106239190613e11565b611a22565b005b610644600480360381019061063f9190614582565b611dd8565b005b61064e611e52565b60405161065b9190613e54565b60405180910390f35b61067e600480360381019061067991906145cd565b611e58565b005b610688611e6e565b6040516106959190613c4d565b60405180910390f35b6106b860048036038101906106b39190613e11565b611efa565b6040516106c59190613b11565b60405180910390f35b6106e860048036038101906106e39190614660565b611f14565b005b61070460048036038101906106ff9190614582565b6121a0565b005b61070e61221a565b60405161071b9190613e54565b60405180910390f35b61073e600480360381019061073991906141b3565b61223e565b005b610748612260565b6040516107559190613e54565b60405180910390f35b610766612284565b6040516107739190613c4d565b60405180910390f35b610796600480360381019061079191906146bd565b612314565b6040516107a39190613bc4565b60405180910390f35b6107c660048036038101906107c191906146fb565b6123a2565b005b6107e260048036038101906107dd9190613ac4565b6123c7565b6040516107ef9190613bc4565b60405180910390f35b6108006123f1565b7f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a661082a81612432565b5f73ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff160361088f576040517fd92e233d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f600b5f8581526020019081526020015f209050806004015f9054906101000a900460ff166108f557836040517fe4a769660000000000000000000000000000000000000000000000000000000081526004016108ec9190613b11565b60405180910390fd5b5f81600201541415801561091b5750806002015483826003015461091991906147bb565b115b15610963578381600201546040517fe76a5f2400000000000000000000000000000000000000000000000000000000815260040161095a9291906147ee565b60405180910390fd5b82816003015f82825461097691906147bb565b9250508190555061099785858560405180602001604052805f815250612446565b8473ffffffffffffffffffffffffffffffffffffffff16847f1ff0135ee793b1b953ca5ada72cccf5e8eb27f7db5a24d74a6a9a88bcd65c511856040516109de9190613b11565b60405180910390a35050505050565b5f5f5f8381526020019081526020015f205f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905092915050565b5f610a4c826124dc565b9050919050565b7f000000000000000000000000000000000000000000000000000000000000000081565b7f000000000000000000000000000000000000000000000000000000000000000081565b60078054610aa890614842565b80601f0160208091040260200160405190810160405280929190818152602001828054610ad490614842565b8015610b1f5780601f10610af657610100808354040283529160200191610b1f565b820191905f5260205f20905b815481529060010190602001808311610b0257829003601f168201915b505050505081565b7f8379d04e13cada81a99237b97ad49cf6f4bfd86e1ac211976061d7a5b05ccf6c610b5181612432565b600b5f8b81526020019081526020015f206004015f9054906101000a900460ff1615610bb457896040517f3072e4fb000000000000000000000000000000000000000000000000000000008152600401610bab9190613b11565b60405180910390fd5b5f8367ffffffffffffffff1614158015610bd857505f8267ffffffffffffffff1614155b8015610bf857508267ffffffffffffffff168267ffffffffffffffff1611155b15610c2f576040517f392334ed00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6040518061010001604052808a8a8080601f0160208091040260200160405190810160405280939291908181526020018383808284375f81840152601f19601f82011690508083019250505050505050815260200188888080601f0160208091040260200160405190810160405280939291908181526020018383808284375f81840152601f19601f8201169050808301925050505050505081526020018681526020015f815260200160011515815260200185151581526020018467ffffffffffffffff1681526020018367ffffffffffffffff16815250600b5f8c81526020019081526020015f205f820151815f019081610d2c9190614a12565b506020820151816001019081610d429190614a12565b5060408201518160020155606082015181600301556080820151816004015f6101000a81548160ff02191690831515021790555060a08201518160040160016101000a81548160ff02191690831515021790555060c08201518160040160026101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555060e082015181600401600a6101000a81548167ffffffffffffffff021916908367ffffffffffffffff160217905550905050897f1372e251e139e7c0e29957debed1d84db9f2f973da99fad77e7d22ff29f9f8118a8a88604051610e2b93929190614b0d565b60405180910390a28315610e6757897f02203df4df381c196a30a006688a2081804a4656701ae2373338bc082f25533160405160405180910390a25b5f8367ffffffffffffffff16141580610e8a57505f8267ffffffffffffffff1614155b15610eca57897f4561f34dda799a7846a628eb1353f768ef0e7b475a0bb08f9924d3e6ee56eeb08484604051610ec1929190614b3d565b60405180910390a25b50505050505050505050565b6060600b5f8381526020019081526020015f206004015f9054906101000a900460ff1615610fb0575f600b5f8481526020019081526020015f206001018054610f1e90614842565b80601f0160208091040260200160405190810160405280929190818152602001828054610f4a90614842565b8015610f955780601f10610f6c57610100808354040283529160200191610f95565b820191905f5260205f20905b815481529060010190602001808311610f7857829003601f168201915b505050505090505f81511115610fae5780915050610fde565b505b600a610fbb83612555565b604051602001610fcc929190614cb2565b60405160208183030381529060405290505b919050565b7f8379d04e13cada81a99237b97ad49cf6f4bfd86e1ac211976061d7a5b05ccf6c81565b5f600454905090565b7f3a2f235c9daaf33349d300aadff2f15078a89df81bcfdd45ba11c8f816bddc6f81565b5f60055f8381526020019081526020015f20600101549050919050565b7f8379d04e13cada81a99237b97ad49cf6f4bfd86e1ac211976061d7a5b05ccf6c61107b81612432565b600b5f8481526020019081526020015f206004015f9054906101000a900460ff166110dd57826040517fe4a769660000000000000000000000000000000000000000000000000000000081526004016110d49190613b11565b60405180910390fd5b81600b5f8581526020019081526020015f2060040160016101000a81548160ff021916908315150217905550811561114157827f02203df4df381c196a30a006688a2081804a4656701ae2373338bc082f25533160405160405180910390a261116f565b827f697c34910961fe07eddac3e6f593f22f6452d20cfb8b7b64b48bfa0b623d10bb60405160405180910390a25b505050565b61118561117f61261f565b86612626565b61119285858585856126b1565b5050505050565b6111a282611034565b6111ab81612432565b6111b583836127a7565b50505050565b6111c361261f565b73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614611227576040517f6697b23200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6112318282612891565b505050565b5f5f1b61124281612432565b600b5f8481526020019081526020015f206004015f9054906101000a900460ff166112a457826040517fe4a7696600000000000000000000000000000000000000000000000000000000815260040161129b9190613b11565b60405180910390fd5b81600b5f8581526020019081526020015f2060020181905550827f44ecfc706d63e347851cfd40acfa6cf2e3a41faa3e8b460210c03938e84a91ad836040516112ed9190613b11565b60405180910390a2505050565b7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a61132481612432565b61132c61297b565b50565b600b602052805f5260405f205f91509050805f01805461134e90614842565b80601f016020809104026020016040519081016040528092919081815260200182805461137a90614842565b80156113c55780601f1061139c576101008083540402835291602001916113c5565b820191905f5260205f20905b8154815290600101906020018083116113a857829003601f168201915b5050505050908060010180546113da90614842565b80601f016020809104026020016040519081016040528092919081815260200182805461140690614842565b80156114515780601f1061142857610100808354040283529160200191611451565b820191905f5260205f20905b81548152906001019060200180831161143457829003601f168201915b505050505090806002015490806003015490806004015f9054906101000a900460ff16908060040160019054906101000a900460ff16908060040160029054906101000a900467ffffffffffffffff169080600401600a9054906101000a900467ffffffffffffffff16905088565b6060815183511461150c57815183516040517f5b0599910000000000000000000000000000000000000000000000000000000081526004016115039291906147ee565b60405180910390fd5b5f835167ffffffffffffffff81111561152857611527613f00565b5b6040519080825280602002602001820160405280156115565781602001602082028036833780820191505090505b5090505f5f90505b84518110156115bf5761159561157d82876129dc90919063ffffffff16565b61159083876129ef90919063ffffffff16565b6109ed565b8282815181106115a8576115a7614ceb565b5b60200260200101818152505080600101905061155e565b508091505092915050565b5f5f6115d583611efa565b119050919050565b7fa70a2d8710fed9f014c8c2af50c7c2f6b25748ae4cded822e03b7beed44cf3a861160781612432565b600b5f8581526020019081526020015f206004015f9054906101000a900460ff1661166957836040517fe4a769660000000000000000000000000000000000000000000000000000000081526004016116609190613b11565b60405180910390fd5b8282600b5f8781526020019081526020015f20600101918261168c929190614d22565b50837f652c9498726ae446882619d79306dfe2594d5d5a008eaad0a720ee55ebf8e8b884846040516116bf929190614def565b60405180910390a2837f369737eac2f50072db0001f8a5c3f225ab50d5ab38d8cbdbabf885abf2ab722a84846040516116f9929190614def565b60405180910390a250505050565b5f60065f9054906101000a900460ff16905090565b7f8379d04e13cada81a99237b97ad49cf6f4bfd86e1ac211976061d7a5b05ccf6c61174681612432565b600b5f8581526020019081526020015f206004015f9054906101000a900460ff166117a857836040517fe4a7696600000000000000000000000000000000000000000000000000000000815260040161179f9190613b11565b60405180910390fd5b5f8367ffffffffffffffff16141580156117cc57505f8267ffffffffffffffff1614155b80156117ec57508267ffffffffffffffff168267ffffffffffffffff1611155b15611823576040517f392334ed00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b82600b5f8681526020019081526020015f2060040160026101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555081600b5f8681526020019081526020015f20600401600a6101000a81548167ffffffffffffffff021916908367ffffffffffffffff160217905550837f4561f34dda799a7846a628eb1353f768ef0e7b475a0bb08f9924d3e6ee56eeb084846040516118cb929190614b3d565b60405180910390a250505050565b7fa70a2d8710fed9f014c8c2af50c7c2f6b25748ae4cded822e03b7beed44cf3a881565b7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a61192781612432565b61192f612a02565b50565b5f60055f8481526020019081526020015f205f015f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f9054906101000a900460ff16905092915050565b600880546119a390614842565b80601f01602080910402602001604051908101604052809291908181526020018280546119cf90614842565b8015611a1a5780601f106119f157610100808354040283529160200191611a1a565b820191905f5260205f20905b8154815290600101906020018083116119fd57829003601f168201915b505050505081565b611a2a6123f1565b5f600b5f8381526020019081526020015f209050806004015f9054906101000a900460ff16611a9057816040517fe4a76966000000000000000000000000000000000000000000000000000000008152600401611a879190613b11565b60405180910390fd5b8060040160019054906101000a900460ff16611ae357816040517f3d7f3aa8000000000000000000000000000000000000000000000000000000008152600401611ada9190613b11565b60405180910390fd5b5f8160040160029054906101000a900467ffffffffffffffff1690505f82600401600a9054906101000a900467ffffffffffffffff1690505f8267ffffffffffffffff1614158015611b3e57508167ffffffffffffffff1642105b15611b825783826040517f7e77f5b8000000000000000000000000000000000000000000000000000000008152600401611b79929190614e11565b60405180910390fd5b5f8167ffffffffffffffff1614158015611ba557508067ffffffffffffffff1642115b15611be95783816040517ff2c273aa000000000000000000000000000000000000000000000000000000008152600401611be0929190614e11565b60405180910390fd5b600c5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8581526020019081526020015f205f9054906101000a900460ff1615611c865733846040517f87506cea000000000000000000000000000000000000000000000000000000008152600401611c7d929190614e47565b60405180910390fd5b5f836002015414158015611ca257508260020154836003015410155b15611cea578383600201546040517fe76a5f24000000000000000000000000000000000000000000000000000000008152600401611ce19291906147ee565b60405180910390fd5b6001600c5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8681526020019081526020015f205f6101000a81548160ff021916908315150217905550826003015f815480929190611d6290614e6e565b9190505550611d823385600160405180602001604052805f815250612446565b3373ffffffffffffffffffffffffffffffffffffffff16847f1ff0135ee793b1b953ca5ada72cccf5e8eb27f7db5a24d74a6a9a88bcd65c5116001604051611dca9190614eee565b60405180910390a350505050565b7fa70a2d8710fed9f014c8c2af50c7c2f6b25748ae4cded822e03b7beed44cf3a8611e0281612432565b8282600a9182611e13929190614d22565b507f24a9152dc695ecc801ad580886331ee12d7aac0fa2ae341a5ae3c2ccae36cb4f8383604051611e45929190614def565b60405180910390a1505050565b5f5f1b81565b611e6a611e6361261f565b8383612a64565b5050565b60098054611e7b90614842565b80601f0160208091040260200160405190810160405280929190818152602001828054611ea790614842565b8015611ef25780601f10611ec957610100808354040283529160200191611ef2565b820191905f5260205f20905b815481529060010190602001808311611ed557829003601f168201915b505050505081565b5f60035f8381526020019081526020015f20549050919050565b611f1c6123f1565b7f3a2f235c9daaf33349d300aadff2f15078a89df81bcfdd45ba11c8f816bddc6f611f4681612432565b5f8484905003611f82576040517fd982238500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f600b5f8481526020019081526020015f209050806004015f9054906101000a900460ff16611fe857826040517fe4a76966000000000000000000000000000000000000000000000000000000008152600401611fdf9190613b11565b60405180910390fd5b5f8585905090505f8260020154141580156120155750816002015481836003015461201391906147bb565b115b1561205d578382600201546040517fe76a5f240000000000000000000000000000000000000000000000000000000081526004016120549291906147ee565b60405180910390fd5b80826003015f82825461207091906147bb565b925050819055505f5f90505b8181101561215f575f73ffffffffffffffffffffffffffffffffffffffff168787838181106120ae576120ad614ceb565b5b90506020020160208101906120c39190614f07565b73ffffffffffffffffffffffffffffffffffffffff1603612110576040517fd92e233d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61215287878381811061212657612125614ceb565b5b905060200201602081019061213b9190614f07565b86600160405180602001604052805f815250612446565b808060010191505061207c565b50837fcf920e91425238e78b56f92b129e3171ba644fe6a1b2e632d1d30b5c450113bb826040516121909190613b11565b60405180910390a2505050505050565b7fa70a2d8710fed9f014c8c2af50c7c2f6b25748ae4cded822e03b7beed44cf3a86121ca81612432565b8282600991826121db929190614d22565b507f4bad971e573541e528d22030efb9d17c582463e49e6d0f0f0b26c9a7fd291ccd838360405161220d929190614def565b60405180910390a1505050565b7f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a681565b61224782611034565b61225081612432565b61225a8383612891565b50505050565b7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a81565b60606009805461229390614842565b80601f01602080910402602001604051908101604052809291908181526020018280546122bf90614842565b801561230a5780601f106122e15761010080835404028352916020019161230a565b820191905f5260205f20905b8154815290600101906020018083116122ed57829003601f168201915b5050505050905090565b5f60015f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f9054906101000a900460ff16905092915050565b6123b36123ad61261f565b86612626565b6123c08585858585612c3d565b5050505050565b600c602052815f5260405f20602052805f5260405f205f915091509054906101000a900460ff1681565b6123f9611707565b15612430576040517fd93c066500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b565b6124438161243e61261f565b612d44565b50565b5f73ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16036124b6575f6040517f57f447ce0000000000000000000000000000000000000000000000000000000081526004016124ad9190614f32565b60405180910390fd5b5f5f6124c28585612d95565b915091506124d45f878484875f612dc5565b505050505050565b5f7f7965db0b000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916148061254e575061254d82612e6f565b5b9050919050565b60605f600161256384612f50565b0190505f8167ffffffffffffffff81111561258157612580613f00565b5b6040519080825280601f01601f1916602001820160405280156125b35781602001600182028036833780820191505090505b5090505f82602083010190505b600115612614578080600190039150507f3031323334353637383961626364656600000000000000000000000000000000600a86061a8153600a858161260957612608614f4b565b5b0494505f85036125c0575b819350505050919050565b5f33905090565b8173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415801561266957506126678183612314565b155b156126ad5781816040517fe237d9220000000000000000000000000000000000000000000000000000000081526004016126a4929190614f78565b60405180910390fd5b5050565b5f73ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff1603612721575f6040517f57f447ce0000000000000000000000000000000000000000000000000000000081526004016127189190614f32565b60405180910390fd5b5f73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff1603612791575f6040517f01a835140000000000000000000000000000000000000000000000000000000081526004016127889190614f32565b60405180910390fd5b6127a085858585856001612dc5565b5050505050565b5f6127b28383611932565b61288757600160055f8581526020019081526020015f205f015f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f6101000a81548160ff02191690831515021790555061282461261f565b73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a46001905061288b565b5f90505b92915050565b5f61289c8383611932565b15612971575f60055f8581526020019081526020015f205f015f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f6101000a81548160ff02191690831515021790555061290e61261f565b73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16847ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b60405160405180910390a460019050612975565b5f90505b92915050565b6129836130a1565b5f60065f6101000a81548160ff0219169083151502179055507f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa6129c561261f565b6040516129d29190614f32565b60405180910390a1565b5f60208202602084010151905092915050565b5f60208202602084010151905092915050565b612a0a6123f1565b600160065f6101000a81548160ff0219169083151502179055507f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258612a4d61261f565b604051612a5a9190614f32565b60405180910390a1565b5f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603612ad4575f6040517f3e31884e000000000000000000000000000000000000000000000000000000008152600401612acb9190614f32565b60405180910390fd5b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603612b44575f6040517fced3e100000000000000000000000000000000000000000000000000000000008152600401612b3b9190614f32565b60405180910390fd5b8060015f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f6101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051612c309190613bc4565b60405180910390a3505050565b5f73ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff1603612cad575f6040517f57f447ce000000000000000000000000000000000000000000000000000000008152600401612ca49190614f32565b60405180910390fd5b5f73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff1603612d1d575f6040517f01a83514000000000000000000000000000000000000000000000000000000008152600401612d149190614f32565b60405180910390fd5b5f5f612d298585612d95565b91509150612d3b87878484875f612dc5565b50505050505050565b612d4e8282611932565b612d915780826040517fe2517d3f000000000000000000000000000000000000000000000000000000008152600401612d88929190614f9f565b60405180910390fd5b5050565b60608060405191506001825283602083015260408201905060018152826020820152604081016040529250929050565b612dd1868686866130e1565b5f73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff1614612e67575f612e0d61261f565b90508115612e2857612e238188888888886130f3565b612e65565b5f612e3c5f876129ef90919063ffffffff16565b90505f612e525f876129ef90919063ffffffff16565b9050612e62838a8a85858a6132a2565b50505b505b505050505050565b5f7fd9b67a26000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161480612f3957507f0e89341c000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b80612f495750612f4882613451565b5b9050919050565b5f5f5f90507a184f03e93ff9f4daa797ed6e38ed64bf6a1f0100000000000000008310612fac577a184f03e93ff9f4daa797ed6e38ed64bf6a1f0100000000000000008381612fa257612fa1614f4b565b5b0492506040810190505b6d04ee2d6d415b85acef81000000008310612fe9576d04ee2d6d415b85acef81000000008381612fdf57612fde614f4b565b5b0492506020810190505b662386f26fc10000831061301857662386f26fc10000838161300e5761300d614f4b565b5b0492506010810190505b6305f5e1008310613041576305f5e100838161303757613036614f4b565b5b0492506008810190505b612710831061306657612710838161305c5761305b614f4b565b5b0492506004810190505b60648310613089576064838161307f5761307e614f4b565b5b0492506002810190505b600a8310613098576001810190505b80915050919050565b6130a9611707565b6130df576040517f8dfc202b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b565b6130ed848484846134ba565b50505050565b5f8473ffffffffffffffffffffffffffffffffffffffff163b111561329a578373ffffffffffffffffffffffffffffffffffffffff1663bc197c8187878686866040518663ffffffff1660e01b8152600401613153959493929190615018565b6020604051808303815f875af192505050801561318e57506040513d601f19601f8201168201806040525081019061318b9190615092565b60015b61320f573d805f81146131bc576040519150601f19603f3d011682016040523d82523d5f602084013e6131c1565b606091505b505f81510361320757846040517f57f447ce0000000000000000000000000000000000000000000000000000000081526004016131fe9190614f32565b60405180910390fd5b805160208201fd5b63bc197c8160e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161461329857846040517f57f447ce00000000000000000000000000000000000000000000000000000000815260040161328f9190614f32565b60405180910390fd5b505b505050505050565b5f8473ffffffffffffffffffffffffffffffffffffffff163b1115613449578373ffffffffffffffffffffffffffffffffffffffff1663f23a6e6187878686866040518663ffffffff1660e01b81526004016133029594939291906150bd565b6020604051808303815f875af192505050801561333d57506040513d601f19601f8201168201806040525081019061333a9190615092565b60015b6133be573d805f811461336b576040519150601f19603f3d011682016040523d82523d5f602084013e613370565b606091505b505f8151036133b657846040517f57f447ce0000000000000000000000000000000000000000000000000000000081526004016133ad9190614f32565b60405180910390fd5b805160208201fd5b63f23a6e6160e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161461344757846040517f57f447ce00000000000000000000000000000000000000000000000000000000815260040161343e9190614f32565b60405180910390fd5b505b505050505050565b5f7f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149050919050565b6134c684848484613643565b5f73ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff160361358f575f5f90505f5f90505b8351811015613574575f61351f82856129ef90919063ffffffff16565b90508060035f61353885896129ef90919063ffffffff16565b81526020019081526020015f205f82825461355391906147bb565b92505081905550808361356691906147bb565b925050806001019050613502565b508060045f82825461358691906147bb565b92505081905550505b5f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361363d575f5f90505f5f90505b835181101561362b575f6135e882856129ef90919063ffffffff16565b90508060035f61360185896129ef90919063ffffffff16565b81526020019081526020015f205f82825403925050819055508083019250508060010190506135cb565b508060045f8282540392505081905550505b50505050565b805182511461368d57815181516040517f5b0599910000000000000000000000000000000000000000000000000000000081526004016136849291906147ee565b60405180910390fd5b5f61369661261f565b90505f5f90505b8351811015613895575f6136ba82866129ef90919063ffffffff16565b90505f6136d083866129ef90919063ffffffff16565b90505f73ffffffffffffffffffffffffffffffffffffffff168873ffffffffffffffffffffffffffffffffffffffff16146137f3575f5f5f8481526020019081526020015f205f8a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205490508181101561379f57888183856040517f03dee4c50000000000000000000000000000000000000000000000000000000081526004016137969493929190615115565b60405180910390fd5b8181035f5f8581526020019081526020015f205f8b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2081905550505b5f73ffffffffffffffffffffffffffffffffffffffff168773ffffffffffffffffffffffffffffffffffffffff161461388857805f5f8481526020019081526020015f205f8973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f82825461388091906147bb565b925050819055505b505080600101905061369d565b506001835103613950575f6138b35f856129ef90919063ffffffff16565b90505f6138c95f856129ef90919063ffffffff16565b90508573ffffffffffffffffffffffffffffffffffffffff168773ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f6285856040516139419291906147ee565b60405180910390a450506139cf565b8373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb86866040516139c6929190615158565b60405180910390a45b5050505050565b5f604051905090565b5f5ffd5b5f5ffd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f613a10826139e7565b9050919050565b613a2081613a06565b8114613a2a575f5ffd5b50565b5f81359050613a3b81613a17565b92915050565b5f819050919050565b613a5381613a41565b8114613a5d575f5ffd5b50565b5f81359050613a6e81613a4a565b92915050565b5f5f5f60608486031215613a8b57613a8a6139df565b5b5f613a9886828701613a2d565b9350506020613aa986828701613a60565b9250506040613aba86828701613a60565b9150509250925092565b5f5f60408385031215613ada57613ad96139df565b5b5f613ae785828601613a2d565b9250506020613af885828601613a60565b9150509250929050565b613b0b81613a41565b82525050565b5f602082019050613b245f830184613b02565b92915050565b5f7fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b613b5e81613b2a565b8114613b68575f5ffd5b50565b5f81359050613b7981613b55565b92915050565b5f60208284031215613b9457613b936139df565b5b5f613ba184828501613b6b565b91505092915050565b5f8115159050919050565b613bbe81613baa565b82525050565b5f602082019050613bd75f830184613bb5565b92915050565b5f81519050919050565b5f82825260208201905092915050565b8281835e5f83830152505050565b5f601f19601f8301169050919050565b5f613c1f82613bdd565b613c298185613be7565b9350613c39818560208601613bf7565b613c4281613c05565b840191505092915050565b5f6020820190508181035f830152613c658184613c15565b905092915050565b5f5ffd5b5f5ffd5b5f5ffd5b5f5f83601f840112613c8e57613c8d613c6d565b5b8235905067ffffffffffffffff811115613cab57613caa613c71565b5b602083019150836001820283011115613cc757613cc6613c75565b5b9250929050565b613cd781613baa565b8114613ce1575f5ffd5b50565b5f81359050613cf281613cce565b92915050565b5f67ffffffffffffffff82169050919050565b613d1481613cf8565b8114613d1e575f5ffd5b50565b5f81359050613d2f81613d0b565b92915050565b5f5f5f5f5f5f5f5f5f60e08a8c031215613d5257613d516139df565b5b5f613d5f8c828d01613a60565b99505060208a013567ffffffffffffffff811115613d8057613d7f6139e3565b5b613d8c8c828d01613c79565b985098505060408a013567ffffffffffffffff811115613daf57613dae6139e3565b5b613dbb8c828d01613c79565b96509650506060613dce8c828d01613a60565b9450506080613ddf8c828d01613ce4565b93505060a0613df08c828d01613d21565b92505060c0613e018c828d01613d21565b9150509295985092959850929598565b5f60208284031215613e2657613e256139df565b5b5f613e3384828501613a60565b91505092915050565b5f819050919050565b613e4e81613e3c565b82525050565b5f602082019050613e675f830184613e45565b92915050565b613e7681613e3c565b8114613e80575f5ffd5b50565b5f81359050613e9181613e6d565b92915050565b5f60208284031215613eac57613eab6139df565b5b5f613eb984828501613e83565b91505092915050565b5f5f60408385031215613ed857613ed76139df565b5b5f613ee585828601613a60565b9250506020613ef685828601613ce4565b9150509250929050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b613f3682613c05565b810181811067ffffffffffffffff82111715613f5557613f54613f00565b5b80604052505050565b5f613f676139d6565b9050613f738282613f2d565b919050565b5f67ffffffffffffffff821115613f9257613f91613f00565b5b602082029050602081019050919050565b5f613fb5613fb084613f78565b613f5e565b90508083825260208201905060208402830185811115613fd857613fd7613c75565b5b835b818110156140015780613fed8882613a60565b845260208401935050602081019050613fda565b5050509392505050565b5f82601f83011261401f5761401e613c6d565b5b813561402f848260208601613fa3565b91505092915050565b5f5ffd5b5f67ffffffffffffffff82111561405657614055613f00565b5b61405f82613c05565b9050602081019050919050565b828183375f83830152505050565b5f61408c6140878461403c565b613f5e565b9050828152602081018484840111156140a8576140a7614038565b5b6140b384828561406c565b509392505050565b5f82601f8301126140cf576140ce613c6d565b5b81356140df84826020860161407a565b91505092915050565b5f5f5f5f5f60a08688031215614101576141006139df565b5b5f61410e88828901613a2d565b955050602061411f88828901613a2d565b945050604086013567ffffffffffffffff8111156141405761413f6139e3565b5b61414c8882890161400b565b935050606086013567ffffffffffffffff81111561416d5761416c6139e3565b5b6141798882890161400b565b925050608086013567ffffffffffffffff81111561419a576141996139e3565b5b6141a6888289016140bb565b9150509295509295909350565b5f5f604083850312156141c9576141c86139df565b5b5f6141d685828601613e83565b92505060206141e785828601613a2d565b9150509250929050565b5f5f60408385031215614207576142066139df565b5b5f61421485828601613a60565b925050602061422585828601613a60565b9150509250929050565b61423881613cf8565b82525050565b5f610100820190508181035f830152614257818b613c15565b9050818103602083015261426b818a613c15565b905061427a6040830189613b02565b6142876060830188613b02565b6142946080830187613bb5565b6142a160a0830186613bb5565b6142ae60c083018561422f565b6142bb60e083018461422f565b9998505050505050505050565b5f67ffffffffffffffff8211156142e2576142e1613f00565b5b602082029050602081019050919050565b5f614305614300846142c8565b613f5e565b9050808382526020820190506020840283018581111561432857614327613c75565b5b835b81811015614351578061433d8882613a2d565b84526020840193505060208101905061432a565b5050509392505050565b5f82601f83011261436f5761436e613c6d565b5b813561437f8482602086016142f3565b91505092915050565b5f5f6040838503121561439e5761439d6139df565b5b5f83013567ffffffffffffffff8111156143bb576143ba6139e3565b5b6143c78582860161435b565b925050602083013567ffffffffffffffff8111156143e8576143e76139e3565b5b6143f48582860161400b565b9150509250929050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b61443081613a41565b82525050565b5f6144418383614427565b60208301905092915050565b5f602082019050919050565b5f614463826143fe565b61446d8185614408565b935061447883614418565b805f5b838110156144a857815161448f8882614436565b975061449a8361444d565b92505060018101905061447b565b5085935050505092915050565b5f6020820190508181035f8301526144cd8184614459565b905092915050565b5f5f5f604084860312156144ec576144eb6139df565b5b5f6144f986828701613a60565b935050602084013567ffffffffffffffff81111561451a576145196139e3565b5b61452686828701613c79565b92509250509250925092565b5f5f5f60608486031215614549576145486139df565b5b5f61455686828701613a60565b935050602061456786828701613d21565b925050604061457886828701613d21565b9150509250925092565b5f5f60208385031215614598576145976139df565b5b5f83013567ffffffffffffffff8111156145b5576145b46139e3565b5b6145c185828601613c79565b92509250509250929050565b5f5f604083850312156145e3576145e26139df565b5b5f6145f085828601613a2d565b925050602061460185828601613ce4565b9150509250929050565b5f5f83601f8401126146205761461f613c6d565b5b8235905067ffffffffffffffff81111561463d5761463c613c71565b5b60208301915083602082028301111561465957614658613c75565b5b9250929050565b5f5f5f60408486031215614677576146766139df565b5b5f84013567ffffffffffffffff811115614694576146936139e3565b5b6146a08682870161460b565b935093505060206146b386828701613a60565b9150509250925092565b5f5f604083850312156146d3576146d26139df565b5b5f6146e085828601613a2d565b92505060206146f185828601613a2d565b9150509250929050565b5f5f5f5f5f60a08688031215614714576147136139df565b5b5f61472188828901613a2d565b955050602061473288828901613a2d565b945050604061474388828901613a60565b935050606061475488828901613a60565b925050608086013567ffffffffffffffff811115614775576147746139e3565b5b614781888289016140bb565b9150509295509295909350565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f6147c582613a41565b91506147d083613a41565b92508282019050808211156147e8576147e761478e565b5b92915050565b5f6040820190506148015f830185613b02565b61480e6020830184613b02565b9392505050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f600282049050600182168061485957607f821691505b60208210810361486c5761486b614815565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026148ce7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82614893565b6148d88683614893565b95508019841693508086168417925050509392505050565b5f819050919050565b5f61491361490e61490984613a41565b6148f0565b613a41565b9050919050565b5f819050919050565b61492c836148f9565b6149406149388261491a565b84845461489f565b825550505050565b5f5f905090565b614957614948565b614962818484614923565b505050565b5b818110156149855761497a5f8261494f565b600181019050614968565b5050565b601f8211156149ca5761499b81614872565b6149a484614884565b810160208510156149b3578190505b6149c76149bf85614884565b830182614967565b50505b505050565b5f82821c905092915050565b5f6149ea5f19846008026149cf565b1980831691505092915050565b5f614a0283836149db565b9150826002028217905092915050565b614a1b82613bdd565b67ffffffffffffffff811115614a3457614a33613f00565b5b614a3e8254614842565b614a49828285614989565b5f60209050601f831160018114614a7a575f8415614a68578287015190505b614a7285826149f7565b865550614ad9565b601f198416614a8886614872565b5f5b82811015614aaf57848901518255600182019150602085019450602081019050614a8a565b86831015614acc5784890151614ac8601f8916826149db565b8355505b6001600288020188555050505b505050505050565b5f614aec8385613be7565b9350614af983858461406c565b614b0283613c05565b840190509392505050565b5f6040820190508181035f830152614b26818587614ae1565b9050614b356020830184613b02565b949350505050565b5f604082019050614b505f83018561422f565b614b5d602083018461422f565b9392505050565b5f81905092915050565b5f8154614b7a81614842565b614b848186614b64565b9450600182165f8114614b9e5760018114614bb357614be5565b60ff1983168652811515820286019350614be5565b614bbc85614872565b5f5b83811015614bdd57815481890152600182019150602081019050614bbe565b838801955050505b50505092915050565b7f2f000000000000000000000000000000000000000000000000000000000000005f82015250565b5f614c22600183614b64565b9150614c2d82614bee565b600182019050919050565b5f614c4282613bdd565b614c4c8185614b64565b9350614c5c818560208601613bf7565b80840191505092915050565b7f2e6a736f6e0000000000000000000000000000000000000000000000000000005f82015250565b5f614c9c600583614b64565b9150614ca782614c68565b600582019050919050565b5f614cbd8285614b6e565b9150614cc882614c16565b9150614cd48284614c38565b9150614cdf82614c90565b91508190509392505050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52603260045260245ffd5b5f82905092915050565b614d2c8383614d18565b67ffffffffffffffff811115614d4557614d44613f00565b5b614d4f8254614842565b614d5a828285614989565b5f601f831160018114614d87575f8415614d75578287013590505b614d7f85826149f7565b865550614de6565b601f198416614d9586614872565b5f5b82811015614dbc57848901358255600182019150602085019450602081019050614d97565b86831015614dd95784890135614dd5601f8916826149db565b8355505b6001600288020188555050505b50505050505050565b5f6020820190508181035f830152614e08818486614ae1565b90509392505050565b5f604082019050614e245f830185613b02565b614e31602083018461422f565b9392505050565b614e4181613a06565b82525050565b5f604082019050614e5a5f830185614e38565b614e676020830184613b02565b9392505050565b5f614e7882613a41565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203614eaa57614ea961478e565b5b600182019050919050565b5f819050919050565b5f614ed8614ed3614ece84614eb5565b6148f0565b613a41565b9050919050565b614ee881614ebe565b82525050565b5f602082019050614f015f830184614edf565b92915050565b5f60208284031215614f1c57614f1b6139df565b5b5f614f2984828501613a2d565b91505092915050565b5f602082019050614f455f830184614e38565b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601260045260245ffd5b5f604082019050614f8b5f830185614e38565b614f986020830184614e38565b9392505050565b5f604082019050614fb25f830185614e38565b614fbf6020830184613e45565b9392505050565b5f81519050919050565b5f82825260208201905092915050565b5f614fea82614fc6565b614ff48185614fd0565b9350615004818560208601613bf7565b61500d81613c05565b840191505092915050565b5f60a08201905061502b5f830188614e38565b6150386020830187614e38565b818103604083015261504a8186614459565b9050818103606083015261505e8185614459565b905081810360808301526150728184614fe0565b90509695505050505050565b5f8151905061508c81613b55565b92915050565b5f602082840312156150a7576150a66139df565b5b5f6150b48482850161507e565b91505092915050565b5f60a0820190506150d05f830188614e38565b6150dd6020830187614e38565b6150ea6040830186613b02565b6150f76060830185613b02565b81810360808301526151098184614fe0565b90509695505050505050565b5f6080820190506151285f830187614e38565b6151356020830186613b02565b6151426040830185613b02565b61514f6060830184613b02565b95945050505050565b5f6040820190508181035f8301526151708185614459565b905081810360208301526151848184614459565b9050939250505056fea264697066735822122078dfa16b06435b88349016003277ebbc38e76c896455b7891b7cb695d0586bcf64736f6c634300081c0033" as Hex;
