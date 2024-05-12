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

  const isLocal = network.name === "hardhat" || network.name === "localhost";

  console.log("Is local:", isLocal);

  const { scriptyStorageContract, scriptyBuilderContract, wethContract } =
    await utilities.deployOrGetContracts(network);

  for (let i = 0; i < utilities.scripts.length; i++) {
    const script = utilities.scripts[i];
    if (!isLocal) {
      if (script.useEthFsDirectly) {
        console.log(`Skipping ${script.name} as it uses ethfs directly`);
        continue;
      }
    }
    await utilities.storeScript(network, scriptyStorageContract, script.name, script.path, script.compress);
  }

  const renderer = await ethers.getContractFactory("MassRenderer");

  const ethFsStorageV2 = isLocal ? "" : utilities.addressFor(network.name, "ETHFSV2FileStorage");

  const rendererContract = await renderer.deploy(
    [dev.address, artist.address, dao.address],
    scriptyBuilderContract.address,
    "https://arweave.net/mass/",
    utilities.scripts.map((s) => ({
      ...s,
      storageContract: !isLocal && s.useEthFsDirectly ? ethFsStorageV2 : scriptyStorageContract.address,
    }))
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

  await nftContract.mint(dev.address);
  console.log("Minted 1 NFT");

  if (network.name == "sepolia" || network.name == "mainnet") {
    console.log("Waiting for Etherscan to index the bytecode for verification");
    await delay(30000);

    try {
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
    } catch (e) {
      console.log(e);
    }

    try {
      await run("verify:verify", {
        address: rendererContract.address,
        constructorArguments: [
          [dev.address, artist.address, dao.address],
          scriptyBuilderContract.address,
          "https://arweave.net/mass/",
          utilities.scripts.map((s) => ({
            ...s,
            storageContract: !isLocal && s.useEthFsDirectly ? ethFsStorageV2 : scriptyStorageContract.address,
          })),
        ],
      });
    } catch (e) {
      console.log(e);
    }
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
