import { ethers } from "hardhat";

const nftContractAddress = "0xCcBE56eA12B845A281431290F202196864F2f576";
const newRenderer = "0xBB5Af1B6B0EFa143Ff526af32B8BFbe1Eb53b33a";

async function main() {
  const nftContract = await ethers.getContractAt("Gold", nftContractAddress);
  await nftContract.setRendererAddress(newRenderer);
}

main().then(console.log);
