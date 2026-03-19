// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract SpectraEventAccessRegistry is AccessControl, Pausable {
    bytes32 public constant EVENT_MANAGER_ROLE = keccak256("EVENT_MANAGER_ROLE");
    bytes32 public constant ACCESS_MANAGER_ROLE = keccak256("ACCESS_MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    enum AccessRole {
        None,
        Attendee,
        Artist
    }

    struct EventConfig {
        string name;
        string metadataURI;
        bool exists;
        bool active;
    }

    uint256 public nextEventId = 1;

    mapping(uint256 => EventConfig) private eventsById;
    mapping(uint256 => mapping(address => AccessRole)) private accessByEventAndWallet;

    event EventCreated(uint256 indexed eventId, string name, string metadataURI);
    event EventUpdated(uint256 indexed eventId, string name, string metadataURI, bool active);
    event EventDeactivated(uint256 indexed eventId);
    event EventAccessSet(uint256 indexed eventId, address indexed wallet, AccessRole role);
    event EventAccessCleared(uint256 indexed eventId, address indexed wallet);

    error InvalidAdmin();
    error InvalidEvent();
    error InvalidWallet();
    error InvalidAccessRole();
    error ArrayLengthMismatch();

    constructor(address admin) {
        if (admin == address(0)) revert InvalidAdmin();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(EVENT_MANAGER_ROLE, admin);
        _grantRole(ACCESS_MANAGER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function createEvent(string calldata name, string calldata metadataURI)
        external
        onlyRole(EVENT_MANAGER_ROLE)
        whenNotPaused
        returns (uint256 eventId)
    {
        eventId = nextEventId++;
        eventsById[eventId] = EventConfig({
            name: name,
            metadataURI: metadataURI,
            exists: true,
            active: true
        });

        emit EventCreated(eventId, name, metadataURI);
    }

    function updateEvent(
        uint256 eventId,
        string calldata name,
        string calldata metadataURI,
        bool active
    ) external onlyRole(EVENT_MANAGER_ROLE) whenNotPaused {
        EventConfig storage eventConfig = _getExistingEvent(eventId);

        eventConfig.name = name;
        eventConfig.metadataURI = metadataURI;
        eventConfig.active = active;

        emit EventUpdated(eventId, name, metadataURI, active);
    }

    function deactivateEvent(uint256 eventId) external onlyRole(EVENT_MANAGER_ROLE) whenNotPaused {
        EventConfig storage eventConfig = _getExistingEvent(eventId);

        eventConfig.active = false;
        emit EventDeactivated(eventId);
    }

    function setAccess(uint256 eventId, address wallet, AccessRole role)
        external
        onlyRole(ACCESS_MANAGER_ROLE)
        whenNotPaused
    {
        if (wallet == address(0)) revert InvalidWallet();
        if (role == AccessRole.None) revert InvalidAccessRole();

        EventConfig storage eventConfig = _getExistingEvent(eventId);
        if (!eventConfig.active) revert InvalidEvent();

        accessByEventAndWallet[eventId][wallet] = role;
        emit EventAccessSet(eventId, wallet, role);
    }

    function batchSetAccess(
        uint256 eventId,
        address[] calldata wallets,
        AccessRole[] calldata roles
    ) external onlyRole(ACCESS_MANAGER_ROLE) whenNotPaused {
        if (wallets.length != roles.length) revert ArrayLengthMismatch();
        EventConfig storage eventConfig = _getExistingEvent(eventId);
        if (!eventConfig.active) revert InvalidEvent();

        for (uint256 i = 0; i < wallets.length; ++i) {
            if (wallets[i] == address(0)) revert InvalidWallet();
            if (roles[i] == AccessRole.None) revert InvalidAccessRole();
            accessByEventAndWallet[eventId][wallets[i]] = roles[i];
            emit EventAccessSet(eventId, wallets[i], roles[i]);
        }
    }

    function clearAccess(uint256 eventId, address wallet)
        external
        onlyRole(ACCESS_MANAGER_ROLE)
        whenNotPaused
    {
        if (wallet == address(0)) revert InvalidWallet();

        _getExistingEvent(eventId);

        delete accessByEventAndWallet[eventId][wallet];
        emit EventAccessCleared(eventId, wallet);
    }

    function getEvent(uint256 eventId) external view returns (EventConfig memory) {
        EventConfig memory eventConfig = eventsById[eventId];
        if (!eventConfig.exists) revert InvalidEvent();
        return eventConfig;
    }

    function getAccess(uint256 eventId, address wallet) external view returns (AccessRole) {
        if (wallet == address(0)) revert InvalidWallet();

        EventConfig memory eventConfig = eventsById[eventId];
        if (!eventConfig.exists) revert InvalidEvent();
        return accessByEventAndWallet[eventId][wallet];
    }

    function _getExistingEvent(uint256 eventId) internal view returns (EventConfig storage eventConfig) {
        eventConfig = eventsById[eventId];
        if (!eventConfig.exists) revert InvalidEvent();
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
