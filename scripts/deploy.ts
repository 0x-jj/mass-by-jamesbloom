import { ethers, network, run } from "hardhat";
import path from "path";
import * as utilities from "./utils";

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const DEV_SPLIT = 140; // 14%
const ARTIST_SPLIT = 650; // 65 %
const DAO_SPLIT = 210; // 21 %
const SUPPLY = 300;

async function main() {
  console.log("----------------------------------");
  console.log("Running deployment script");
  console.log("----------------------------------");

  const [dev, artist, dao] = await ethers.getSigners();

  // Deploy or use already deployed contracts depending on the network that script runs on
  console.log("Deploying contracts");
  console.log("Network name:", network.name);
  console.log("Deployer:", dev.address);

  const { scriptyStorageContract, scriptyBuilderContract, wethContract } =
    await utilities.deployOrGetContracts(network);

  const scripts: { name: string; path: string; compress: boolean; tagType: utilities.HTMLTagType }[] = [
    {
      name: "three-v0.147.0.min.js.gz",
      path: "scripts/three-v0.147.0.min.js.gz.txt",
      compress: false,
      tagType: utilities.HTMLTagType.scriptGZIPBase64DataURI,
    },
    {
      name: "jb_mass_parameters2",
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
      name: "jb_mass_main3",
      path: "scripts/main-min.js",
      compress: false,
      tagType: utilities.HTMLTagType.script,
    },
  ];

  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    await utilities.storeScript(network, scriptyStorageContract, script.name, script.path, script.compress);
  }

  const renderer = await ethers.getContractFactory("MassRenderer");
  const rendererContract = await renderer.deploy(
    [dev.address, artist.address, dao.address],
    scriptyBuilderContract.address,
    scriptyStorageContract.address,
    "https://arweave.net/mass/",
    scripts
  );
  await rendererContract.deployed();
  console.log("Renderer Contract is deployed", rendererContract.address);

  const nftContract = await (
    await ethers.getContractFactory("Mass")
  ).deploy(
    [dev.address, artist.address, dao.address],
    [DEV_SPLIT, ARTIST_SPLIT, DAO_SPLIT],
    [dev.address, artist.address, dao.address],
    wethContract.address,
    rendererContract.address,
    SUPPLY,
    network.name === "hardhat"
      ? "0x00000000000076a84fef008cdabe6409d2fe638b"
      : utilities.addressFor(network.name, "DelegateCash")
  );
  await nftContract.deployed();
  console.log("NFT Contract is deployed", nftContract.address);

  await rendererContract.setMassContract(nftContract.address);

  // const merkleTree = getMerkleRootWithDiscounts(discounts);

  // const Auction = await ethers.getContractFactory("DutchAuction");
  // const auction = await Auction.deploy(
  //   nftContract.address,
  //   dev.address,
  //   dao.address,
  //   merkleTree.root,
  //   network.name === "hardhat"
  //     ? "0x00000000000076a84fef008cdabe6409d2fe638b"
  //     : utilities.addressFor(network.name, "DelegateCash")
  // );
  // console.log("Auction Contract is deployed", auction.address);
  // const startAmount = ethers.utils.parseEther("2");
  // const endAmount = ethers.utils.parseEther("0.1");
  // const limit = ethers.utils.parseEther("10");
  // const refundDelayTime = 1 * 60;
  // const startTime = Math.floor(Date.now() / 1000) - 100;
  // const endTime = startTime + 1.5 * 3600;

  // await auction.setConfig(startAmount, endAmount, limit, refundDelayTime, startTime, endTime);
  // await auction.setSignerAddress(SIGNER);
  // await nftContract.setMinterAddress(auction.address);
  // console.log("Config, minter, signer are set");

  await nftContract.mint(dev.address);
  console.log("Minted 1 NFT");

  if (network.name == "sepolia") {
    console.log("Waiting a little bytecode index on Etherscan");
    await delay(30000);

    await run("verify:verify", {
      address: nftContract.address,
      constructorArguments: [
        [dev.address, artist.address, dao.address],
        [DEV_SPLIT, ARTIST_SPLIT, DAO_SPLIT],
        [dev.address, artist.address, dao.address],
        wethContract.address,
        rendererContract.address,
        SUPPLY,
        utilities.addressFor(network.name, "DelegateCash"),
      ],
    });
  }

  const tokenURI = await nftContract.tokenURI(0);
  console.log("Got token URI");

  utilities.writeFile(path.join(__dirname, "output", "tokenURI.txt"), tokenURI);

  const tokenURIDecoded = utilities.parseBase64DataURI(tokenURI);
  console.log("Decoded token URI");

  utilities.writeFile(path.join(__dirname, "output", "metadata.json"), tokenURIDecoded);

  const tokenURIJSONDecoded = JSON.parse(tokenURIDecoded);
  console.log("Parsed decoded token URI");

  utilities.writeFile(path.join(__dirname, "output", "metadata.json"), tokenURIDecoded);

  const animationURL = utilities.parseBase64DataURI(tokenURIJSONDecoded.animation_url);
  console.log("Parsed animation url");

  utilities.writeFile(path.join(__dirname, "output", "output.html"), animationURL);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
