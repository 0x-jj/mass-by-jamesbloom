import { ethers, network } from "hardhat";
import * as utilities from "../utils";

const rendererContractAddress = "0x1c0DB5c204C45c260dB7a56fE3ff0C85a5b3824E";

const details = {
  newScriptName: "jb_mass_main2",
  scriptPath: "scripts/main-min.js",
  compress: false,
  scriptIndex: 6,
  tagType: utilities.HTMLTagType.script,
};

async function main() {
  const renderer = await ethers.getContractAt("MassRenderer", rendererContractAddress);

  const storageContract = utilities.addressFor(network.name, "ScriptyStorageV2");

  await utilities.storeScript(
    network,
    storageContract,
    details.newScriptName,
    details.scriptPath,
    details.compress
  );

  await renderer.setScriptDefinition(details.scriptIndex, details.newScriptName, details.tagType);
}

main().then(console.log);
