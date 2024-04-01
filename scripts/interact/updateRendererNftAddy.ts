import { ethers } from "hardhat";

const nftContractAddress = "0xCcBE56eA12B845A281431290F202196864F2f576";
const rendererAddress = "0xBB5Af1B6B0EFa143Ff526af32B8BFbe1Eb53b33a";
async function main() {
  const renderer = await ethers.getContractAt("GoldRenderer", rendererAddress);
  await renderer.setGoldContract(nftContractAddress);
}

main().then(console.log);
