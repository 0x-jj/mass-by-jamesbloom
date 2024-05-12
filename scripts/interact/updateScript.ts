import { ethers, network } from "hardhat";
import * as utilities from "../utils";

const rendererContractAddress = "0x5D25722e13C4f27903d0f0b707a3803282932C13";

const scriptToUpdate: utilities.ScriptAlias = "main";

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
