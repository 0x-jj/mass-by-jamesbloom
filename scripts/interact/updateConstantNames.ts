import { ethers } from "hardhat";

const rendererContractAddress = "0x300FE66F314F387dc848bcbcc398120d5fdb9077";

async function main() {
  const renderer = await ethers.getContractAt("MassRenderer", rendererContractAddress);

  const res = await renderer.setScriptConstantVarNames({
    objects: "traitsObjects",
    palettes: "traitsPalette",
    contractAddy: "contractAddress",
    contractMetricsSelector: "jsonRpcCallDataContract",
    tokenMetricsSelector: "jsonRpcCallDataToken",
    baseTimestamp: "contractMintTimestamp",
    royaltyPercent: "royaltyPercent",
    tokenId: "tokenId",
    seedToken: "tokenHash",
    resetTimestamp: "resetTimestamp",
  });
  await res.wait(1);
  return res.hash;
}

main().then(console.log);
