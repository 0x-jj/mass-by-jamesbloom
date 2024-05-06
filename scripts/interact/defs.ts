import { ethers } from "hardhat";
import * as utilities from "../utils";
import path from "path";

const nftContractAddress = "0xd816825af71993Dc4FfFe39564c7B265806d7196";

async function main() {
  const nft = await ethers.getContractAt("MassRenderer", nftContractAddress);
  const defs = await nft.scriptDefinitions(6);
  return defs;
}

main().then(console.log);
