// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SpectraEpisode1155
 * @notice Per-episode AR artwork collection. One contract deployed per SPECTRA episode.
 *
 * Each token ID represents one AR artwork discovered at the event venue. Collectors
 * mint during or after the event — free, one per wallet per artwork by default.
 * Admin controls let the team open/close minting, airdrop, and update metadata.
 *
 * Deployment:
 *   1. Deploy SpectraSeasonRegistry (once per season).
 *   2. Deploy this contract per episode — set name/symbol/season/episode at deploy time.
 *   3. Call registerArtwork() for each AR piece.
 *   4. Call setOpenMint(tokenId, true) when the event goes live.
 *   5. Call registerEpisode() on SpectraSeasonRegistry after deploy.
 *
 * Roles:
 *   DEFAULT_ADMIN_ROLE    — root control
 *   ARTWORK_MANAGER_ROLE  — register artworks, open/close per-token mint
 *   MINTER_ROLE           — adminMint without open gate
 *   AIRDROP_ROLE          — batch push tokens to wallets
 *   PAUSER_ROLE           — global pause/unpause
 *   URI_MANAGER_ROLE      — update token and contract metadata URIs
 */
contract SpectraEpisode1155 is ERC1155Supply, AccessControl, Pausable {
    using Strings for uint256;

    // ─── Roles ───────────────────────────────────────────────────────────────

    bytes32 public constant ARTWORK_MANAGER_ROLE = keccak256("ARTWORK_MANAGER_ROLE");
    bytes32 public constant MINTER_ROLE          = keccak256("MINTER_ROLE");
    bytes32 public constant AIRDROP_ROLE         = keccak256("AIRDROP_ROLE");
    bytes32 public constant PAUSER_ROLE          = keccak256("PAUSER_ROLE");
    bytes32 public constant URI_MANAGER_ROLE     = keccak256("URI_MANAGER_ROLE");

    // ─── Metadata ────────────────────────────────────────────────────────────

    string public name;
    string public symbol;
    string public contractMetadataUri;
    string private _baseUri;

    // ─── Episode identity ────────────────────────────────────────────────────

    uint256 public immutable seasonId;
    uint256 public immutable episodeNumber;

    // ─── Artwork registry ────────────────────────────────────────────────────

    struct ArtworkEntry {
        string  name;
        string  metadataUri;  // per-token override; falls back to _baseUri if empty
        uint256 maxSupply;    // 0 = uncapped
        uint256 minted;       // running count (mirrors totalSupply but cached for reads)
        bool    exists;
        bool    openMint;     // true = anyone can call mint()
    }

    mapping(uint256 => ArtworkEntry) public artworks;

    /// @notice 1-per-wallet guard: hasMinted[collector][tokenId]
    mapping(address => mapping(uint256 => bool)) public hasMinted;

    // ─── Events ──────────────────────────────────────────────────────────────

    event ArtworkRegistered(uint256 indexed tokenId, string artworkName, uint256 maxSupply);
    event ArtworkMinted(uint256 indexed tokenId, address indexed collector, uint256 amount);
    event ArtworkMintOpened(uint256 indexed tokenId);
    event ArtworkMintClosed(uint256 indexed tokenId);
    event TokenUriUpdated(uint256 indexed tokenId, string newUri);
    event BaseUriUpdated(string newUri);
    event ContractMetadataUpdated(string newUri);
    event Airdropped(uint256 indexed tokenId, uint256 recipientCount);
    event MaxSupplyUpdated(uint256 indexed tokenId, uint256 newMaxSupply);

    // ─── Errors ──────────────────────────────────────────────────────────────

    error ArtworkNotFound(uint256 tokenId);
    error ArtworkMintNotOpen(uint256 tokenId);
    error AlreadyCollected(address collector, uint256 tokenId);
    error SupplyExceeded(uint256 tokenId, uint256 maxSupply);
    error ArtworkAlreadyRegistered(uint256 tokenId);
    error ZeroAddress();
    error EmptyRecipientsArray();

    // ─── Constructor ─────────────────────────────────────────────────────────

    /**
     * @param admin_               Gets all admin roles.
     * @param name_                Episode contract name, e.g. "IRL x Spectra".
     * @param symbol_              Token symbol, e.g. "SPECTRA-EP2".
     * @param seasonId_            Season number, e.g. 1.
     * @param episodeNumber_       Episode number within the season, e.g. 2.
     * @param baseUri_             IPFS folder URI, used as fallback when no per-token URI is set.
     *                             Should end without slash; tokenId + ".json" is appended.
     * @param contractMetadataUri_ Collection-level metadata URI for OpenSea / marketplaces.
     */
    constructor(
        address admin_,
        string memory name_,
        string memory symbol_,
        uint256 seasonId_,
        uint256 episodeNumber_,
        string memory baseUri_,
        string memory contractMetadataUri_
    ) ERC1155("") {
        if (admin_ == address(0)) revert ZeroAddress();
        name             = name_;
        symbol           = symbol_;
        seasonId         = seasonId_;
        episodeNumber    = episodeNumber_;
        _baseUri         = baseUri_;
        contractMetadataUri = contractMetadataUri_;

        _grantRole(DEFAULT_ADMIN_ROLE,   admin_);
        _grantRole(ARTWORK_MANAGER_ROLE, admin_);
        _grantRole(MINTER_ROLE,          admin_);
        _grantRole(AIRDROP_ROLE,         admin_);
        _grantRole(PAUSER_ROLE,          admin_);
        _grantRole(URI_MANAGER_ROLE,     admin_);
    }

    // ─── Artwork registration ─────────────────────────────────────────────────

    /**
     * @notice Register a new artwork token ID before the event.
     * @param tokenId      Token ID for this artwork (use sequential IDs starting at 1; never reuse).
     * @param artworkName  Human-readable artwork name, e.g. "Prism Glitch".
     * @param metadataUri  Per-token IPFS/HTTPS URI. Leave empty to use the base URI fallback.
     * @param maxSupply    Max mintable editions. 0 = uncapped.
     * @param openMint_    Set true if minting should open immediately after registration.
     */
    function registerArtwork(
        uint256 tokenId,
        string calldata artworkName,
        string calldata metadataUri,
        uint256 maxSupply,
        bool openMint_
    ) external onlyRole(ARTWORK_MANAGER_ROLE) {
        if (artworks[tokenId].exists) revert ArtworkAlreadyRegistered(tokenId);
        artworks[tokenId] = ArtworkEntry({
            name:        artworkName,
            metadataUri: metadataUri,
            maxSupply:   maxSupply,
            minted:      0,
            exists:      true,
            openMint:    openMint_
        });
        emit ArtworkRegistered(tokenId, artworkName, maxSupply);
        if (openMint_) emit ArtworkMintOpened(tokenId);
    }

    // ─── Public mint ─────────────────────────────────────────────────────────

    /**
     * @notice Collect an artwork. One per wallet per token ID.
     * @dev Requires: artwork exists, openMint = true, supply not exceeded, not already minted.
     */
    function mint(uint256 tokenId) external whenNotPaused {
        ArtworkEntry storage artwork = artworks[tokenId];
        if (!artwork.exists)   revert ArtworkNotFound(tokenId);
        if (!artwork.openMint) revert ArtworkMintNotOpen(tokenId);
        if (hasMinted[msg.sender][tokenId]) revert AlreadyCollected(msg.sender, tokenId);
        if (artwork.maxSupply != 0 && artwork.minted >= artwork.maxSupply) {
            revert SupplyExceeded(tokenId, artwork.maxSupply);
        }
        hasMinted[msg.sender][tokenId] = true;
        artwork.minted++;
        _mint(msg.sender, tokenId, 1, "");
        emit ArtworkMinted(tokenId, msg.sender, 1);
    }

    // ─── Admin mint ──────────────────────────────────────────────────────────

    /**
     * @notice Mint directly to a recipient. Bypasses openMint and hasMinted guards.
     * @dev Use for team mints, corrections, or manual issuance.
     */
    function adminMint(
        address recipient,
        uint256 tokenId,
        uint256 amount
    ) external whenNotPaused onlyRole(MINTER_ROLE) {
        if (recipient == address(0)) revert ZeroAddress();
        ArtworkEntry storage artwork = artworks[tokenId];
        if (!artwork.exists) revert ArtworkNotFound(tokenId);
        if (artwork.maxSupply != 0 && artwork.minted + amount > artwork.maxSupply) {
            revert SupplyExceeded(tokenId, artwork.maxSupply);
        }
        artwork.minted += amount;
        _mint(recipient, tokenId, amount, "");
        emit ArtworkMinted(tokenId, recipient, amount);
    }

    /**
     * @notice Batch-push one token ID to multiple recipients. Bypasses all guards.
     * @dev Gas on Base is cheap — hundreds of recipients per tx is practical.
     */
    function airdrop(
        address[] calldata recipients,
        uint256 tokenId
    ) external whenNotPaused onlyRole(AIRDROP_ROLE) {
        if (recipients.length == 0) revert EmptyRecipientsArray();
        ArtworkEntry storage artwork = artworks[tokenId];
        if (!artwork.exists) revert ArtworkNotFound(tokenId);
        uint256 count = recipients.length;
        if (artwork.maxSupply != 0 && artwork.minted + count > artwork.maxSupply) {
            revert SupplyExceeded(tokenId, artwork.maxSupply);
        }
        artwork.minted += count;
        for (uint256 i = 0; i < count; i++) {
            if (recipients[i] == address(0)) revert ZeroAddress();
            _mint(recipients[i], tokenId, 1, "");
        }
        emit Airdropped(tokenId, count);
    }

    // ─── Admin controls ──────────────────────────────────────────────────────

    function setOpenMint(uint256 tokenId, bool open) external onlyRole(ARTWORK_MANAGER_ROLE) {
        if (!artworks[tokenId].exists) revert ArtworkNotFound(tokenId);
        artworks[tokenId].openMint = open;
        if (open) emit ArtworkMintOpened(tokenId);
        else      emit ArtworkMintClosed(tokenId);
    }

    function setTokenUri(uint256 tokenId, string calldata newUri) external onlyRole(URI_MANAGER_ROLE) {
        if (!artworks[tokenId].exists) revert ArtworkNotFound(tokenId);
        artworks[tokenId].metadataUri = newUri;
        emit TokenUriUpdated(tokenId, newUri);
        emit URI(tokenId, newUri);
    }

    function setBaseUri(string calldata newUri) external onlyRole(URI_MANAGER_ROLE) {
        _baseUri = newUri;
        emit BaseUriUpdated(newUri);
    }

    function setContractMetadataUri(string calldata newUri) external onlyRole(URI_MANAGER_ROLE) {
        contractMetadataUri = newUri;
        emit ContractMetadataUpdated(newUri);
    }

    /**
     * @notice Adjust the supply cap for an artwork. Only increases are recommended for transparency.
     */
    function setMaxSupply(uint256 tokenId, uint256 newMaxSupply) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!artworks[tokenId].exists) revert ArtworkNotFound(tokenId);
        artworks[tokenId].maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(tokenId, newMaxSupply);
    }

    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    // ─── URI resolution ──────────────────────────────────────────────────────

    /**
     * @notice ERC-1155 uri() — returns per-token URI if set, otherwise base URI + tokenId + ".json".
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        if (artworks[tokenId].exists) {
            string memory tokenUri = artworks[tokenId].metadataUri;
            if (bytes(tokenUri).length > 0) return tokenUri;
        }
        return string(abi.encodePacked(_baseUri, "/", tokenId.toString(), ".json"));
    }

    /**
     * @notice OpenSea-style collection-level metadata.
     */
    function contractURI() external view returns (string memory) {
        return contractMetadataUri;
    }

    // ─── Interface support ───────────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // ─── Internals ───────────────────────────────────────────────────────────

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    /// @dev Emitted when a per-token URI is updated so indexers pick it up.
    event URI(uint256 indexed tokenId, string value);
}
