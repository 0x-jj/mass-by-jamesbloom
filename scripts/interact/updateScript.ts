import { ethers, network } from "hardhat";
import * as utilities from "../utils";

const rendererContractAddress = "0xd816825af71993Dc4FfFe39564c7B265806d7196";

const details = {
  newScriptName: "jb_params2",
  scriptPath: "scripts/parameters-min.js",
  compress: true,
  scriptIndex: 1,
  tagType: utilities.HTMLTagType.scriptGZIPBase64DataURI,
};

async function main() {
  const renderer = await ethers.getContractAt("MassRenderer", rendererContractAddress);

  const storageContractAddr = utilities.addressFor(network.name, "ScriptyStorageV2");
  const storageContract = await ethers.getContractAt("ScriptyStorageV2", storageContractAddr);

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
