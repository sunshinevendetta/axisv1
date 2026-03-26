// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SpectraSeasonRegistry
 * @notice Lightweight on-chain index of all SpectraEpisode1155 contracts for a given season.
 *
 * One contract is deployed per season (e.g. Season 1). It holds nothing but the list of episode
 * contract addresses. Minting and artwork logic lives entirely in SpectraEpisode1155.
 *
 * Roles:
 *   DEFAULT_ADMIN_ROLE   — root control, can grant/revoke all roles
 *   REGISTRY_MANAGER_ROLE — can register/update/deactivate episodes
 */
contract SpectraSeasonRegistry is AccessControl {
    bytes32 public constant REGISTRY_MANAGER_ROLE = keccak256("REGISTRY_MANAGER_ROLE");

    uint256 public immutable seasonId;
    string public seasonName;
    uint256 public episodeCount;

    struct EpisodeEntry {
        address contractAddress;
        string name;
        uint256 episodeNumber;
        bool active;
    }

    /// @dev index → episode entry (0-based, matches registration order)
    mapping(uint256 => EpisodeEntry) private _episodes;

    event EpisodeRegistered(
        uint256 indexed index,
        address indexed contractAddress,
        string name,
        uint256 episodeNumber
    );
    event EpisodeActiveChanged(uint256 indexed index, bool active);
    event SeasonNameUpdated(string newName);

    error EpisodeIndexOutOfRange(uint256 index, uint256 count);
    error ZeroAddress();

    constructor(address admin, uint256 seasonId_, string memory seasonName_) {
        if (admin == address(0)) revert ZeroAddress();
        seasonId = seasonId_;
        seasonName = seasonName_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRY_MANAGER_ROLE, admin);
    }

    // ─── Write ───────────────────────────────────────────────────────────────

    /**
     * @notice Register a deployed SpectraEpisode1155 contract in this season.
     * @param contractAddress The deployed episode contract address.
     * @param name            Human-readable name (mirrors the episode contract name).
     * @param episodeNumber   Season-relative episode number (1-based).
     */
    function registerEpisode(
        address contractAddress,
        string calldata name,
        uint256 episodeNumber
    ) external onlyRole(REGISTRY_MANAGER_ROLE) returns (uint256 index) {
        if (contractAddress == address(0)) revert ZeroAddress();
        index = episodeCount;
        _episodes[index] = EpisodeEntry({
            contractAddress: contractAddress,
            name: name,
            episodeNumber: episodeNumber,
            active: true
        });
        episodeCount++;
        emit EpisodeRegistered(index, contractAddress, name, episodeNumber);
    }

    /**
     * @notice Activate or deactivate an episode entry.
     * @dev Deactivating does not remove the entry — just flags it. Frontends should filter active episodes.
     */
    function setEpisodeActive(uint256 index, bool active) external onlyRole(REGISTRY_MANAGER_ROLE) {
        if (index >= episodeCount) revert EpisodeIndexOutOfRange(index, episodeCount);
        _episodes[index].active = active;
        emit EpisodeActiveChanged(index, active);
    }

    /**
     * @notice Update the season name (e.g. after rebranding).
     */
    function setSeasonName(string calldata name) external onlyRole(DEFAULT_ADMIN_ROLE) {
        seasonName = name;
        emit SeasonNameUpdated(name);
    }

    // ─── Read ────────────────────────────────────────────────────────────────

    /**
     * @notice Read a single episode entry by index.
     */
    function getEpisode(uint256 index) external view returns (EpisodeEntry memory) {
        if (index >= episodeCount) revert EpisodeIndexOutOfRange(index, episodeCount);
        return _episodes[index];
    }

    /**
     * @notice Read all episode entries (active and inactive).
     * @dev Frontends can filter by `active` flag.
     */
    function getAllEpisodes() external view returns (EpisodeEntry[] memory entries) {
        entries = new EpisodeEntry[](episodeCount);
        for (uint256 i = 0; i < episodeCount; i++) {
            entries[i] = _episodes[i];
        }
    }

    /**
     * @notice Read only active episode entries.
     */
    function getActiveEpisodes() external view returns (EpisodeEntry[] memory entries, uint256[] memory indices) {
        uint256 activeCount;
        for (uint256 i = 0; i < episodeCount; i++) {
            if (_episodes[i].active) activeCount++;
        }
        entries = new EpisodeEntry[](activeCount);
        indices = new uint256[](activeCount);
        uint256 cursor;
        for (uint256 i = 0; i < episodeCount; i++) {
            if (_episodes[i].active) {
                entries[cursor] = _episodes[i];
                indices[cursor] = i;
                cursor++;
            }
        }
    }
}
