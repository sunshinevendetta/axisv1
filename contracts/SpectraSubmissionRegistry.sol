// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract SpectraSubmissionRegistry is AccessControl, Pausable {
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    struct Submission {
        address applicant;
        uint64 createdAt;
        bytes32 emailHash;
        string metadataURI;
        bool approved;
        bool minted;
        uint256 mintedTokenId;
    }

    uint256 public nextSubmissionId = 1;
    address public founderMembershipContract;

    mapping(uint256 => Submission) private submissions;
    mapping(address => uint256[]) private submissionsByApplicant;

    event SubmissionCreated(
        uint256 indexed submissionId,
        address indexed applicant,
        bytes32 indexed emailHash,
        string metadataURI
    );
    event SubmissionApprovalUpdated(uint256 indexed submissionId, bool approved);
    event SubmissionMetadataUpdated(uint256 indexed submissionId, string metadataURI);
    event FounderMembershipContractSet(address indexed founderMembershipContract);
    event SubmissionMintLinked(uint256 indexed submissionId, uint256 indexed tokenId);

    error InvalidSubmission();
    error NotApplicant();
    error AlreadyMinted();
    error UnauthorizedFounderContract();

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(APPROVER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function createSubmission(bytes32 emailHash, string calldata metadataURI)
        external
        whenNotPaused
        returns (uint256 submissionId)
    {
        submissionId = nextSubmissionId++;

        submissions[submissionId] = Submission({
            applicant: msg.sender,
            createdAt: uint64(block.timestamp),
            emailHash: emailHash,
            metadataURI: metadataURI,
            approved: false,
            minted: false,
            mintedTokenId: 0
        });

        submissionsByApplicant[msg.sender].push(submissionId);

        emit SubmissionCreated(submissionId, msg.sender, emailHash, metadataURI);
    }

    function updateSubmissionMetadata(uint256 submissionId, string calldata metadataURI) external whenNotPaused {
        Submission storage submission = submissions[submissionId];
        if (submission.applicant == address(0)) revert InvalidSubmission();
        if (submission.applicant != msg.sender) revert NotApplicant();
        if (submission.minted) revert AlreadyMinted();

        submission.metadataURI = metadataURI;
        emit SubmissionMetadataUpdated(submissionId, metadataURI);
    }

    function setSubmissionApproval(uint256 submissionId, bool approved)
        external
        onlyRole(APPROVER_ROLE)
    {
        Submission storage submission = submissions[submissionId];
        if (submission.applicant == address(0)) revert InvalidSubmission();

        submission.approved = approved;
        emit SubmissionApprovalUpdated(submissionId, approved);
    }

    function setFounderMembershipContract(address founderContract)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        founderMembershipContract = founderContract;
        emit FounderMembershipContractSet(founderContract);
    }

    function markMinted(uint256 submissionId, uint256 tokenId) external {
        if (msg.sender != founderMembershipContract) revert UnauthorizedFounderContract();

        Submission storage submission = submissions[submissionId];
        if (submission.applicant == address(0)) revert InvalidSubmission();
        if (submission.minted) revert AlreadyMinted();

        submission.minted = true;
        submission.mintedTokenId = tokenId;

        emit SubmissionMintLinked(submissionId, tokenId);
    }

    function getSubmission(uint256 submissionId) external view returns (Submission memory) {
        Submission memory submission = submissions[submissionId];
        if (submission.applicant == address(0)) revert InvalidSubmission();
        return submission;
    }

    function getSubmissionsByApplicant(address applicant) external view returns (uint256[] memory) {
        return submissionsByApplicant[applicant];
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
