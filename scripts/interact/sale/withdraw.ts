import { ethers } from "hardhat";

const contractAddress = "0x4F23D4DB040552fB6d4Df265Bd73dC35bA3Cc026";

async function main() {
  const auction = await ethers.getContractAt("DutchAuction", contractAddress);
  await auction.withdrawFunds();
}

main().then(console.log);
