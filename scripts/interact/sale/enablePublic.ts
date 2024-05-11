import { ethers } from "hardhat";

const contractAddress = "0x5d531792C7fa7658Fab98ca97680f380fa50C8c3";

async function main() {
  const auction = await ethers.getContractAt("FixedPriceSale", contractAddress);
  const tx = await auction.setPublicSaleOpen(true);
  await tx.wait();
}

main().then(console.log);
