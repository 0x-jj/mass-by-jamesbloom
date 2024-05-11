import { ethers, network } from "hardhat";
import * as utilities from "../utils";

const rendererContractAddress = "0x31a295dAF49B88ccF4C2EB787a37094f270cA00e";

const scriptToUpdate = "params";

async function main() {
  const scriptDef = utilities.scripts.find((s) => s.alias === scriptToUpdate);

  if (!scriptDef) {
    throw new Error("Script definition not found");
  }

  const index = utilities.scripts.findIndex((s) => s.alias === scriptDef.alias);

  if (index === -1) {
    throw new Error("Script index not found");
  }

  const renderer = await ethers.getContractAt("MassRenderer", rendererContractAddress);

  const storageContractAddr = utilities.addressFor(network.name, "ScriptyStorageV2");
  const storageContract = await ethers.getContractAt("ScriptyStorageV2", storageContractAddr);

  await utilities.storeScript(network, storageContract, scriptDef.name, scriptDef.path, scriptDef.compress);

  await renderer.setScriptDefinition(index, scriptDef.name, scriptDef.tagType);
}

main().then(console.log);
