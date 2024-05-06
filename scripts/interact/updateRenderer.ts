import { ethers } from "hardhat";
import * as utilities from "../utils";

const nftContractAddress = "0xb80475A044dA25E1Cd09474d05e27f8Ae9481857";
const scriptyBuilder = utilities.addressFor("sepolia", "ScriptyBuilderV2");
const scriptyStorage = utilities.addressFor("sepolia", "ScriptyStorageV2");

const scripts: { name: string; path: string; compress: boolean; tagType: utilities.HTMLTagType }[] = [
  {
    name: "three-v0.147.0.min.js.gz",
    path: "scripts/three-v0.147.0.min.js.gz.txt",
    compress: false,
    tagType: utilities.HTMLTagType.scriptGZIPBase64DataURI,
  },
  {
    name: "jb_params2",
    path: "scripts/parameters-min.js",
    compress: true,
    tagType: utilities.HTMLTagType.scriptGZIPBase64DataURI,
  },
  {
    name: "jb_mass_objects",
    path: "scripts/objects.js",
    compress: true,
    tagType: utilities.HTMLTagType.scriptGZIPBase64DataURI,
  },
  {
    name: "jb_mass_textures",
    path: "scripts/textures.js",
    compress: true,
    tagType: utilities.HTMLTagType.scriptGZIPBase64DataURI,
  },
  {
    name: "gunzipScripts-0.0.1.js",
    path: "scripts/gunzipScripts-0.0.1.js",
    compress: false,
    tagType: utilities.HTMLTagType.scriptBase64DataURI,
  },
  {
    name: "jb_mass_base",
    path: "scripts/massBase.js",
    compress: false,
    tagType: utilities.HTMLTagType.script,
  },
  {
    name: "jb_mass_main4",
    path: "scripts/main-min.js",
    compress: false,
    tagType: utilities.HTMLTagType.script,
  },
];

async function main() {
  const [admin] = await ethers.getSigners();

  const renderer = await ethers.getContractFactory("MassRenderer");
  const rendererContract = await renderer.deploy(
    [admin.address],
    scriptyBuilder,
    scriptyStorage,
    "https://arweave.net//",
    scripts
  );
  const newAddress = rendererContract.address;

  const nftContract = await ethers.getContractAt("Mass", nftContractAddress);
  await nftContract.setRendererAddress(newAddress);
  await rendererContract.setMassContract(nftContractAddress);

  return newAddress;
}

main().then(console.log);
