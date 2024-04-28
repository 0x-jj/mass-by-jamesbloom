// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {FixedPriceSeller} from "@divergencetech/ethier/contracts/sales/FixedPriceSeller.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Seller} from "@divergencetech/ethier/contracts/sales/Seller.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IDelegateCash} from "./IDelegateCash.sol";

import "./INFT.sol";

error NotAllowedToNominate();
error NotOnAllowlist();
error PresaleNotOpen();
error PublicSaleNotOpen();
error FriendMintsDisabled();

interface IFriendlyMinterStorage {
  function canDoFriendMint(address) external view returns (bool);
  function addFriendlyMinter(address) external;
  function markFriendlyMinterAsMinted(address) external;
}

contract FixedPriceSale is FixedPriceSeller, AccessControl {
  /// @notice Address of the friendly minter storage contract
  IFriendlyMinterStorage public friendMinterStorage;

  /// @notice Timestamp for when the presale starts
  uint256 public presaleStartTime;

  /// @dev Merkle root for allowed presale minters
  bytes32 public presaleMerkleRoot;

  /// @notice NFT contract address
  INFT public nftContractAddress;

  /// @dev Delegate cash contract address
  IDelegateCash public delegateCash;

  /// @notice Whether friend mints are enabled
  bool public friendMintsEnabled;

  /// @notice Whether the public sale is open
  bool public publicSaleOpen;

  /**
   * @param _price Price per NFT
   * @param sellerConfig Configuration for the sale process
   * @param _beneficiary Address where collected funds will be sent
   * @param _presaleStartTime Timestamp for when the presale starts
   * @param _admins Addresses to be granted admin roles
   * @param _delegateCash Address of the DelegateCash contract
   * @param _friendMintsEnabled  Whether friend mints are enabled
   */
  constructor(
    uint256 _price,
    Seller.SellerConfig memory sellerConfig,
    address payable _beneficiary,
    uint256 _presaleStartTime,
    address[] memory _admins,
    address _delegateCash,
    bool _friendMintsEnabled
  ) FixedPriceSeller(_price, sellerConfig, _beneficiary) {
    presaleStartTime = _presaleStartTime;
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    for (uint256 i = 0; i < _admins.length; i++) {
      _grantRole(DEFAULT_ADMIN_ROLE, _admins[i]);
    }
    delegateCash = IDelegateCash(_delegateCash);
    friendMintsEnabled = _friendMintsEnabled;
  }

  /**
   * @dev Sets the merkle root for discounts.
   *
   * Requirements:
   * - Caller must have the DEFAULT_ADMIN_ROLE.
   *
   * @param root The new merkle root.
   */
  function setPresaleMerkleRoot(bytes32 root) external onlyRole(DEFAULT_ADMIN_ROLE) {
    presaleMerkleRoot = root;
  }

  /**
   * @notice Sets the start time for the presale
   * @param startTime Timestamp when the presale should start
   */
  function setPresaleStartTime(uint256 startTime) external onlyRole(DEFAULT_ADMIN_ROLE) {
    presaleStartTime = startTime;
  }

  /**
   * @dev Sets the address of the NFT contract.
   * @param newAddress The address of the new NFT contract.
   */
  function setNftContractAddress(address newAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
    require(newAddress != address(0), "Invalid address: zero address not allowed");
    nftContractAddress = INFT(newAddress);
  }

  /**
   * @dev Sets the address of the friendly minter storage contract.
   * @param newAddress The address of the new friendly minter storage contract.
   */
  function setFriendlyMinterStorage(address newAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
    require(newAddress != address(0), "Invalid address: zero address not allowed");
    friendMinterStorage = IFriendlyMinterStorage(newAddress);
  }

  /**
   * @dev Sets whether friend mints are enabled.
   * @param enabled Whether friend mints are enabled.
   */
  function setFriendMintsEnabled(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
    friendMintsEnabled = enabled;
  }

  /**
   * @dev Sets whether the public sale is open.
   * @notice If the public sale is open, the seller config is updated to remove per-wallet mint limits
   * @param open Whether the public sale is open.
   */
  function setPublicSaleOpen(bool open) external onlyRole(DEFAULT_ADMIN_ROLE) {
    if (open) {
      Seller.SellerConfig memory cfg = sellerConfig;
      cfg.maxPerAddress = 0;
      cfg.maxPerTx = 0;
      setSellerConfig(cfg);
    }
    publicSaleOpen = open;
  }

  /**
   * @notice Function to handle presale purchases with various checks and balances
   * @param qty Quantity of NFTs to purchase
   * @param _merkleProof Array of bytes constituting the Merkle Proof for presale eligibility
   * @param vaultAddress Address of the vault for delegate checks
   * @param nominatedFriend Address of a friend to potentially add for friendly minting
   */
  function purchasePresale(
    uint32 qty,
    bytes32[] calldata _merkleProof,
    address vaultAddress,
    address nominatedFriend
  ) external payable whenNotPaused {
    require(nftContractAddress != INFT(address(0)), "NFT contract address not set");
    require(presaleMerkleRoot != 0, "Presale merkle root not set");

    address minter = msg.sender;

    if (vaultAddress != address(0) && vaultAddress != msg.sender) {
      bool isDelegateValid = delegateCash.checkDelegateForContract(
        msg.sender,
        vaultAddress,
        address(nftContractAddress),
        ""
      );
      require(isDelegateValid, "invalid delegate-vault pairing");
      minter = vaultAddress;
    }

    if (block.timestamp < presaleStartTime) {
      revert PresaleNotOpen();
    }

    if (!publicSaleOpen) {
      // In presale mint phase, check merkle proof or friend mint
      bytes32 leaf = keccak256(abi.encodePacked(minter));
      bool isInMerkleTree = MerkleProof.verify(_merkleProof, presaleMerkleRoot, leaf);
      if (!isInMerkleTree && !friendMinterStorage.canDoFriendMint(minter)) {
        revert NotOnAllowlist();
      }

      if (isInMerkleTree && nominatedFriend != address(0)) {
        friendMinterStorage.addFriendlyMinter(nominatedFriend);
      }

      if (!isInMerkleTree && nominatedFriend != address(0)) {
        revert NotAllowedToNominate();
      }

      if (!isInMerkleTree && !friendMintsEnabled) {
        revert FriendMintsDisabled();
      }
    }

    _purchase(msg.sender, qty);
  }

  /**
   * @notice Function to handle public sale purchases with checks for sale phase
   * @param qty Quantity of NFTs to purchase
   */
  function purchase(uint32 qty) external payable whenNotPaused {
    require(nftContractAddress != INFT(address(0)), "NFT contract address not set");

    if (!publicSaleOpen) {
      revert PublicSaleNotOpen();
    }

    _purchase(msg.sender, qty);
  }

  /**
   * @dev Overridden function to handle the actual NFT minting logic
   * @param to Address to mint NFTs to
   * @param n Quantity of NFTs to mint
   */
  function _handlePurchase(address to, uint256 n, bool) internal override {
    _mintTokens(to, n);
  }

  /**
   * @dev Internal function to mint a specified quantity of NFTs for a recipient.
   * This function mints 'qty' number of NFTs to the 'to' address.
   * @param to Recipient address.
   * @param qty Number of NFTs to mint.
   */
  function _mintTokens(address to, uint256 qty) internal {
    for (uint256 i; i != qty; ++i) {
      nftContractAddress.mint(to);
    }
  }

  function saleInfo() external view returns (uint256, uint256, bool, bool) {
    return (price, presaleStartTime, publicSaleOpen, friendMintsEnabled);
  }
}
