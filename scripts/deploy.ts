import { ethers, network, run } from "hardhat";
import path from "path";
import * as utilities from "./utils";
import { ScriptyStorage } from "../typechain-types";
import { BigNumber } from "ethers";
import { getMerkleRootWithDiscounts } from "../test/utils";
import { discounts } from "../offchain/discounts";

const waitIfNeeded = async (tx: any) => {
  if (tx.wait) {
    await tx.wait(1);
  }
};

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function storeScript(
  storageContract: ScriptyStorage,
  name: string,
  filePath: string,
  compress = false
) {
  // Check if script is already stored
  const storedScript = await storageContract.scripts(name);
  if (storedScript.size.gt(BigNumber.from(0))) {
    console.log(`${name} is already stored`);
    return;
  }

  // Grab file and break into chunks that SSTORE2 can handle
  let script = utilities.readFile(path.join(__dirname, filePath));

  if (compress) {
    script = utilities.toGZIPBase64String(script);
  }

  const scriptChunks = utilities.chunkSubstr(script, 24575);

  if (storedScript.owner === ethers.constants.AddressZero) {
    // First create the script in the storage contract
    await waitIfNeeded(await storageContract.createScript(name, utilities.stringToBytes(name)));
  }

  // Store each chunk
  // [WARNING]: With big files this can be very costly
  for (let i = 0; i < scriptChunks.length; i++) {
    console.log("chunk head:", scriptChunks[i].slice(0, 10));
    await waitIfNeeded(
      await storageContract.addChunkToScript(
        name,
        utilities.stringToBytes(scriptChunks[i]),
        network.name === "hardhat" ? { gasLimit: 30_000_000 } : undefined
      )
    );
    console.log(`${name} chunk #`, i + 1, "/", scriptChunks.length, "chunk length: ", scriptChunks[i].length);
  }
  console.log(`${name} is stored`);
}

const DEV_SPLIT = 140; // 14%
const ARTIST_SPLIT = 650; // 65 %
const DAO_SPLIT = 210; // 21 %
const SUPPLY = 500;
const SIGNER = "0x589b6C421C55260fC5E4117Bd893f57eD7bd44cD";

async function main() {
  console.log("");
  console.log("----------------------------------");
  console.log("Running deployment script");
  console.log("----------------------------------");

  const [dev, artist, dao] = await ethers.getSigners();

  // Deploy or use already deployed contracts depending on the network that script runs on
  console.log("Deploying contracts");
  console.log("Network name:", network.name);
  console.log("Deployer:", dev.address);

  const { scriptyStorageContract, scriptyBuilderContract, wethContract } =
    await utilities.deployOrGetContracts(network.name);

  const scripts: { name: string; path: string; wrapType: number }[] = [
    { name: "jb_mass_base", path: "scripts/massBase.js", wrapType: 0 },
    { name: "jb_mass_goldWallets", path: "scripts/goldWallets.js", wrapType: 0 },
    { name: "jb_mass_dataTools", path: "scripts/dataTools.js", wrapType: 0 },
    { name: "jb_mass_three", path: "scripts/three.js", wrapType: 0 },
    { name: "jb_mass_parameters", path: "scripts/parameters.js", wrapType: 0 },
    { name: "jb_mass_mersenneTwister", path: "scripts/mersenneTwister.js", wrapType: 0 },
    { name: "jb_mass_util", path: "scripts/util.js", wrapType: 0 },
    { name: "jb_mass_perlin", path: "scripts/perlin.js", wrapType: 0 },
    { name: "jb_mass_ImprovedNoise", path: "scripts/ImprovedNoise.js", wrapType: 0 },
    { name: "jb_mass_OBJLoader", path: "scripts/OBJLoader.js", wrapType: 0 },
    { name: "jb_mass_objects", path: "scripts/objects.js", wrapType: 2 },
    { name: "jb_mass_textures", path: "scripts/textures.js", wrapType: 2 },
    { name: "gunzipScripts-0.0.1", path: "scripts/gunzipScripts-0.0.1.js", wrapType: 0 },
    { name: "jb_mass_main", path: "scripts/main.js", wrapType: 0 },
  ];

  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    await storeScript(scriptyStorageContract, script.name, script.path, script.wrapType === 2);
  }

  const scriptRequests = scripts.map((script) => {
    return {
      name: script.name,
      contractAddress: scriptyStorageContract.address,
      contractData: 0,
      wrapType: script.wrapType,
      wrapPrefix: utilities.emptyBytes(),
      wrapSuffix: utilities.emptyBytes(),
      scriptContent: utilities.emptyBytes(),
    };
  });

  const rawBufferSize = await scriptyBuilderContract.getBufferSizeForHTMLWrapped(scriptRequests as any);

  const renderer = await ethers.getContractFactory("MassRenderer");
  const rendererContract = await renderer.deploy(
    [dev.address, artist.address, dao.address],
    scriptyBuilderContract.address,
    scriptyStorageContract.address,
    rawBufferSize,
    "https://arweave.net/mass/"
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

  // Verify contracts if network is goerli
  if (network.name == "goerli") {
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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
