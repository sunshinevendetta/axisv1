// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract SpectraOwnerAccess1155 is ERC1155Supply, AccessControl, Pausable {
    uint256 public constant OWNER_TOKEN_ID = 1;
    uint256 public constant ADMIN_TOKEN_ID = 2;
    uint256 public constant AI_AGENT_TOKEN_ID = 3;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant URI_MANAGER_ROLE = keccak256("URI_MANAGER_ROLE");

    string public name = "SPECTRA Owner Access";
    string public symbol = "SPECTRA-OWNER";
    string public contractMetadataURI;

    event ContractMetadataUpdated(string contractMetadataURI);
    event BaseURIUpdated(string newBaseURI);
    event OwnerAccessMinted(address indexed recipient, uint256 indexed tokenId, uint256 amount);
    event OwnerAccessRevoked(address indexed account, uint256 indexed tokenId, uint256 amount);

    constructor(
        address admin,
        address initialMinter,
        string memory baseURI,
        string memory initialContractMetadataURI
    )
        ERC1155(baseURI)
    {
        contractMetadataURI = initialContractMetadataURI;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(URI_MANAGER_ROLE, admin);

        if (initialMinter != address(0) && initialMinter != admin) {
            _grantRole(MINTER_ROLE, initialMinter);
        }
    }

    function mint(address recipient, uint256 tokenId, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(recipient, tokenId, amount, "");
        emit OwnerAccessMinted(recipient, tokenId, amount);
    }

    function mintOwner(address recipient) external onlyRole(MINTER_ROLE) {
        _mint(recipient, OWNER_TOKEN_ID, 1, "");
        emit OwnerAccessMinted(recipient, OWNER_TOKEN_ID, 1);
    }

    function mintAdmin(address recipient) external onlyRole(MINTER_ROLE) {
        _mint(recipient, ADMIN_TOKEN_ID, 1, "");
        emit OwnerAccessMinted(recipient, ADMIN_TOKEN_ID, 1);
    }

    function mintAiAgent(address recipient) external onlyRole(MINTER_ROLE) {
        _mint(recipient, AI_AGENT_TOKEN_ID, 1, "");
        emit OwnerAccessMinted(recipient, AI_AGENT_TOKEN_ID, 1);
    }

    function revoke(address account, uint256 tokenId, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _burn(account, tokenId, amount);
        emit OwnerAccessRevoked(account, tokenId, amount);
    }

    function roleName(uint256 tokenId) external pure returns (string memory) {
        if (tokenId == OWNER_TOKEN_ID) {
            return "owner";
        }
        if (tokenId == ADMIN_TOKEN_ID) {
            return "admin";
        }
        if (tokenId == AI_AGENT_TOKEN_ID) {
            return "aiagent";
        }

        return "custom";
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
        override(ERC1155Supply)
        whenNotPaused
    {
        require(from == address(0) || to == address(0), "SPECTRA_OWNER_ACCESS_NON_TRANSFERABLE");
        super._update(from, to, ids, values);
    }
}
