import { BigNumber, BigNumberish } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { ethers, network } from "hardhat";
import * as utilities from "../scripts/utils";

export async function timeTravel(duration: BigNumberish) {
  if (!BigNumber.isBigNumber(duration)) {
    duration = BigNumber.from(duration);
  }

  if (duration.isNegative()) throw Error(`Cannot increase time by a negative amount (${duration})`);
  await ethers.provider.send("evm_increaseTime", [duration.toNumber()]);
  await advanceBlock();
}

export async function advanceBlock() {
  return ethers.provider.send("evm_mine", []);
}

export function getMerkleRoot(addresses: string[]) {
  const hashes = addresses.map((addr) => keccak256(ethers.utils.getAddress(addr)));

  const tree = new MerkleTree(hashes, keccak256, {
    sortPairs: true,
  });

  return {
    tree,
    root: tree.getHexRoot(),
    proof: (addy: string) => tree.getHexProof(keccak256(ethers.utils.getAddress(addy))),
  };
}

export function getMerkleRootWithDiscounts(addresses: { address: string; discountBps: number }[]) {
  const getLeaf = (addy: string, bps: number) => {
    return ethers.utils.solidityKeccak256(
      ["address", "uint16"],
      [ethers.utils.getAddress(addy), String(bps)]
    );
  };
  const hashes = addresses.map((data) => getLeaf(data.address, data.discountBps));

  const tree = new MerkleTree(hashes, keccak256, {
    sortPairs: true,
  });

  return { tree, root: tree.getHexRoot(), getLeaf };
}

export function getStringOfNKilobytes(n: number) {
  return "0".repeat(n * 1024);
}

const toWei = ethers.utils.parseEther;

const START_PRICE = toWei("1.4");
const RESERVED_MINTS = 3;
const MAX_SUPPLY = 10;

const DEV_SPLIT = 140; // 14%
const ARTIST_SPLIT = 650; // 65 %
const DAO_SPLIT = 210; // 21 %

export const scriptDefs: { name: string; path: string; compress: boolean; tagType: utilities.HTMLTagType }[] =
  [
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
      name: "jb_mass_main2",
      path: "scripts/main-min.js",
      compress: false,
      tagType: utilities.HTMLTagType.script,
    },
  ];

export async function deployContracts() {
  const { scriptyStorageContract, scriptyBuilderContract, wethContract } =
    await utilities.deployOrGetContracts(network);

  const [dev, artist, dao] = await ethers.getSigners();

  await wethContract.mint(dev.address, toWei("1000"));

  const renderer = await ethers.getContractFactory("MassRenderer");
  const rendererContract = await renderer.deploy(
    [dev.address, artist.address, dao.address],
    scriptyBuilderContract.address,
    "https://arweave.net/gold/",
    scriptDefs.map((s) => ({
      ...s,
      storageContract: scriptyStorageContract.address,
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
    20,
    "0x00000000000076A84feF008CDAbe6409d2FE638B"
  );
  await nftContract.deployed();
  console.log("NFT Contract is deployed", nftContract.address);

  rendererContract.setMassContract(nftContract.address);

  const merkleTree = getMerkleRootWithDiscounts([{ address: dev.address, discountBps: 2000 }]);

  return { nftContract, rendererContract, wethContract, merkleTree };
}
