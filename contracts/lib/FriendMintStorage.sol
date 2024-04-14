// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IDelegateCash} from "./IDelegateCash.sol";

contract FriendlyMinterStorage is AccessControl {
  struct FriendlyMinter {
    address minter;
    bool hasMinted;
  }

  /// @notice Addresses nominated by presale minters to be able to mint
  mapping(address => FriendlyMinter) public friendlyMinters;

  /// @notice Sale contract address
  address public saleContractAddress;

  /**
   * @param sale Address of the sale contract
   * @param _admins Addresses to be granted admin roles
   */
  constructor(address sale, address[] memory _admins) {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    for (uint256 i = 0; i < _admins.length; i++) {
      _grantRole(DEFAULT_ADMIN_ROLE, _admins[i]);
    }
    saleContractAddress = sale;
  }

  /**
   * @dev Adds a friendly minter to the mapping
   * @param minter Address of the friendly minter
   */
  function addFriendlyMinter(address minter) external {
    require(msg.sender == saleContractAddress, "FixedPriceSale: Only sale contract can add friendly minters");
    friendlyMinters[minter] = FriendlyMinter(minter, false);
  }

  /**
   * @notice Checks if an address is eligible for a friend mint
   * @param minter Address to check eligibility for friend minting
   * @return bool indicating if the minter can perform a friend mint
   */
  function canDoFriendMint(address minter) public view returns (bool) {
    return friendlyMinters[minter].minter != address(0) && !friendlyMinters[minter].hasMinted;
  }

  /**
   * @notice Marks a friendly minter as minted
   * @param minter Address of the friendly minter
   */
  function markFriendlyMinterAsMinted(address minter) external {
    require(
      msg.sender == saleContractAddress,
      "FixedPriceSale: Only sale contract can mark friendly minters as minted"
    );
    require(friendlyMinters[minter].minter != address(0), "FixedPriceSale: Minter not found");
    friendlyMinters[minter].hasMinted = true;
  }

  /**
   * @notice Updates the sale contract address
   * @param sale Address of the sale contract
   */
  function updateSaleContract(address sale) external onlyRole(DEFAULT_ADMIN_ROLE) {
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "FixedPriceSale: Only admins can update sale contract");
    saleContractAddress = sale;
  }
}
