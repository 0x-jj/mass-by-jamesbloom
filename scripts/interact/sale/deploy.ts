import { ethers, network, run } from "hardhat";
import * as utilities from "../../utils";
import { getMerkleRoot } from "../../../test/utils";
import { Seller } from "../../../typechain-types";

const nftContractAddress = "0xED3484B9BE69576462b293249F2aEfdc7b6BC538";

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

  const merkleTree = getMerkleRoot([dev.address]);

  const nft = await ethers.getContractAt("Mass", nftContractAddress);

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
    toWei("0.0025"),
    sellerConfig,
    dao.address,
    Math.floor(Date.now() / 1000) - 100,
    [dev.address],
    await utilities.addressFor(network.name, "DelegateCash"),
    false
  );

  const FriendlyMinterStorage = await ethers.getContractFactory("FriendlyMinterStorage");
  const friendlyMinterStorage = await FriendlyMinterStorage.deploy(sale.address, [dev.address]);

  await sale.setFriendlyMinterStorage(friendlyMinterStorage.address);
  await sale.setPresaleMerkleRoot(merkleTree.root);
  await sale.setNftContractAddress(nft.address);
  await nft.setMinterAddress(sale.address);

  console.log("Sale Contract is deployed", sale.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
