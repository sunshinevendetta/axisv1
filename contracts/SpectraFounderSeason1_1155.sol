// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface ISpectraSubmissionRegistry {
    struct Submission {
        address applicant;
        uint64 createdAt;
        bytes32 emailHash;
        string metadataURI;
        bool approved;
        bool minted;
        uint256 mintedTokenId;
    }

    function getSubmission(uint256 submissionId) external view returns (Submission memory);
    function markMinted(uint256 submissionId, uint256 tokenId) external;
}

contract SpectraFounderSeason1_1155 is ERC1155Supply, ERC1155Burnable, AccessControl, Pausable {
    using Strings for uint256;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant URI_MANAGER_ROLE = keccak256("URI_MANAGER_ROLE");
    bytes32 public constant AIRDROP_ROLE = keccak256("AIRDROP_ROLE");
    bytes32 public constant CLOSER_ROLE = keccak256("CLOSER_ROLE");

    string public name = "SPECTRA Founder Membership - Season 1";
    string public symbol = "SPECTRA-S1";
    string public contractMetadataURI;
    uint256 public immutable seasonId = 1;
    uint256 public maxSupply;
    bool public seasonClosed;

    ISpectraSubmissionRegistry public immutable submissionRegistry;

    mapping(uint256 => uint256) public tokenIdToSubmissionId;
    mapping(uint256 => uint256) public submissionIdToTokenId;
    mapping(address => uint256[]) private mintedTokenIdsByWallet;

    event FounderMinted(
        uint256 indexed submissionId,
        uint256 indexed tokenId,
        address indexed recipient
    );
    event SeasonClosed(uint256 indexed seasonId);
    event ContractMetadataUpdated(string contractMetadataURI);
    event BaseURIUpdated(string newBaseURI);
    event AirdropExecuted(uint256 indexed tokenId, uint256 recipientCount);

    error SeasonAlreadyClosed();
    error SeasonSupplyExceeded();
    error SubmissionNotApproved();
    error SubmissionAlreadyMinted();
    error SubmissionApplicantMismatch();
    error InvalidAirdrop();

    constructor(
        address admin,
        address submissionRegistryAddress,
        string memory initialBaseURI,
        string memory initialContractMetadataURI,
        uint256 initialMaxSupply
    ) ERC1155(initialBaseURI) {
        submissionRegistry = ISpectraSubmissionRegistry(submissionRegistryAddress);
        contractMetadataURI = initialContractMetadataURI;
        maxSupply = initialMaxSupply;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(URI_MANAGER_ROLE, admin);
        _grantRole(AIRDROP_ROLE, admin);
        _grantRole(CLOSER_ROLE, admin);
    }

    function mintFounder(uint256 submissionId) external whenNotPaused returns (uint256 tokenId) {
        if (seasonClosed) revert SeasonAlreadyClosed();

        ISpectraSubmissionRegistry.Submission memory submission = submissionRegistry.getSubmission(submissionId);

        if (!submission.approved) revert SubmissionNotApproved();
        if (submission.minted) revert SubmissionAlreadyMinted();
        if (submission.applicant != msg.sender) revert SubmissionApplicantMismatch();
        if (maxSupply != 0 && totalSupply() >= maxSupply) revert SeasonSupplyExceeded();

        tokenId = submissionId;

        _mint(msg.sender, tokenId, 1, "");

        tokenIdToSubmissionId[tokenId] = submissionId;
        submissionIdToTokenId[submissionId] = tokenId;
        mintedTokenIdsByWallet[msg.sender].push(tokenId);

        submissionRegistry.markMinted(submissionId, tokenId);

        emit FounderMinted(submissionId, tokenId, msg.sender);
    }

    function airdrop(address[] calldata recipients, uint256 tokenId) external onlyRole(AIRDROP_ROLE) {
        uint256 length = recipients.length;
        if (length == 0) revert InvalidAirdrop();

        for (uint256 i = 0; i < length; ++i) {
            _mint(recipients[i], tokenId, 1, "");
            mintedTokenIdsByWallet[recipients[i]].push(tokenId);
        }

        emit AirdropExecuted(tokenId, length);
    }

    function closeSeason() external onlyRole(CLOSER_ROLE) {
        if (seasonClosed) revert SeasonAlreadyClosed();
        seasonClosed = true;
        emit SeasonClosed(seasonId);
    }

    function setBaseURI(string calldata newBaseURI) external onlyRole(URI_MANAGER_ROLE) {
        _setURI(newBaseURI);
        emit BaseURIUpdated(newBaseURI);
    }

    function setContractMetadataURI(string calldata newContractMetadataURI)
        external
        onlyRole(URI_MANAGER_ROLE)
    {
        contractMetadataURI = newContractMetadataURI;
        emit ContractMetadataUpdated(newContractMetadataURI);
    }

    function setMaxSupply(uint256 newMaxSupply) external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxSupply = newMaxSupply;
    }

    function getMintedTokenIdsByWallet(address wallet) external view returns (uint256[] memory) {
        return mintedTokenIdsByWallet[wallet];
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return string.concat(super.uri(tokenId), tokenId.toString(), ".json");
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
        whenNotPaused
    {
        super._update(from, to, ids, values);
    }
}
