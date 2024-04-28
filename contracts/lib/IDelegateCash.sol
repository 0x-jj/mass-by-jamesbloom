//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IDelegateCash {
  function checkDelegateForContract(
    address hot,
    address cold,
    address contractAddress,
    bytes32 rights
  ) external view returns (bool);
}
