import { ethers } from "hardhat";

const nftContractAddress = "0xccbe56ea12b845a281431290f202196864f2f576";

const newTimestamp = 1687363200;
async function main() {
  const Nft = await ethers.getContractAt("Gold", nftContractAddress);
  await Nft.setBaseTimestamp(newTimestamp);
  console.log("Base timestamp set to", newTimestamp);
}

main();
