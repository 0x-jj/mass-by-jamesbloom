import { ethers, network } from "hardhat";
import * as utilities from "../utils";

const scriptToStore: utilities.ScriptAlias = "nodes";

async function main() {
  const scriptDef = utilities.scripts.find((s) => s.alias === scriptToStore);

  if (!scriptDef) {
    throw new Error("Script definition not found");
  }

  const storageContractAddr = utilities.addressFor(network.name, "ScriptyStorageV2");
  const storageContract = await ethers.getContractAt("ScriptyStorageV2", storageContractAddr);

  await utilities.storeScript(network, storageContract, scriptDef.name, scriptDef.path, scriptDef.compress);
}

main().then(console.log);
