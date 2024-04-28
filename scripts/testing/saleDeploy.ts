import { ethers, network, run } from "hardhat";
import * as utilities from "../utils";
import { getMerkleRoot } from "../../test/utils";
import { Seller } from "../../typechain-types";

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const toWei = ethers.utils.parseEther;

const DEV_SPLIT = 140; // 14%
const ARTIST_SPLIT = 650; // 65 %
const DAO_SPLIT = 210; // 21 %
const SUPPLY = 300;

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

  const nftContract = await (
    await ethers.getContractFactory("Mass")
  ).deploy(
    [dev.address, artist.address, dao.address],
    [DEV_SPLIT, ARTIST_SPLIT, DAO_SPLIT],
    [dev.address, artist.address, dao.address],
    dao.address,
    dao.address,
    SUPPLY,
    network.name === "hardhat"
      ? "0x00000000000076a84fef008cdabe6409d2fe638b"
      : utilities.addressFor(network.name, "DelegateCash")
  );
  await nftContract.deployed();
  console.log("NFT Contract is deployed", nftContract.address);

  const merkleTree = getMerkleRoot([dev.address]);

  const Sale = await ethers.getContractFactory("FixedPriceSale");

  const sellerConfig: Seller.SellerConfigStruct = {
    totalInventory: 300,
    maxPerAddress: 3,
    maxPerTx: 0,
    freeQuota: 20,
    reserveFreeQuota: true,
    lockFreeQuota: false,
    lockTotalInventory: true,
  };

  const sale = await Sale.deploy(
    toWei("0.25"),
    sellerConfig,
    dao.address,
    Math.floor(Date.now() / 1000) - 100,
    [dev.address],
    "0x00000000000076A84feF008CDAbe6409d2FE638B",
    false
  );
  console.log("Sale Contract is deployed", sale.address);

  const FriendlyMinterStorage = await ethers.getContractFactory("FriendlyMinterStorage");
  const friendlyMinterStorage = await FriendlyMinterStorage.deploy(sale.address, [dev.address]);

  await sale.setFriendlyMinterStorage(friendlyMinterStorage.address);
  await sale.setPresaleMerkleRoot(merkleTree.root);
  await nftContract.setMinterAddress(sale.address);
  await sale.setNftContractAddress(nftContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
