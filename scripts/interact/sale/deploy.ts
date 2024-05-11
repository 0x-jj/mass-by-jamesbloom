import { ethers, network, run } from "hardhat";
import * as utilities from "../../utils";
import { getMerkleRoot } from "../../../test/utils";
import { Seller } from "../../../typechain-types";
import _ from "lodash";

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const nftContractAddress = "0x8BAFC8dA0506d67b365552c5dbE50aee2535B85d";

const toWei = ethers.utils.parseEther;

const DEV1_SPLIT = 150; // 15%
const ARTIST_SPLIT = 750; // 75 %
const DEV2_SPLIT = 100; // 10 %
const SUPPLY = 300;
const PER_ADDRESS = 3;

const presaleAddresses = [
  "0x20ec68ba5dc8af5380bdb37465b3f9bde75f9635",
  "0x30900cdaa15b15eb00450ab2a9cfe4d73c12319b",
  "0xd4c4fe2d14b12bd5f94b1ed38bc93791b69dd3c2",
  "0x549985aeb2d4e948862f40de8c03032705132cc0",
  "0x3548214de80c57d29af861345577fcea5a3b43fe",
];

async function main() {
  console.log("");
  console.log("----------------------------------");
  console.log("Running sale deployment script");
  console.log("----------------------------------");

  const [dev, artist, dev2] = await ethers.getSigners();

  console.log("Deploying contracts");
  console.log("Network name:", network.name);
  console.log("Deployer:", dev.address);

  const merkleTree = getMerkleRoot(_.uniq([dev.address, ...presaleAddresses].map((a) => a.toLowerCase())));

  const PaymentSplitter = await ethers.getContractFactory("PaymentSplitter");
  const paymentSplitter = await PaymentSplitter.deploy(
    [dev.address, artist.address, dev2.address],
    [DEV1_SPLIT, ARTIST_SPLIT, DEV2_SPLIT]
  );

  const nft = await ethers.getContractAt("Mass", nftContractAddress);
  const Sale = await ethers.getContractFactory("FixedPriceSale");

  const sellerConfig: Seller.SellerConfigStruct = {
    totalInventory: SUPPLY,
    maxPerAddress: PER_ADDRESS,
    maxPerTx: 0,
    freeQuota: 0,
    reserveFreeQuota: true,
    lockFreeQuota: false,
    lockTotalInventory: false,
  };

  const start = Math.floor(Date.now() / 1000) - 100;

  const sale = await Sale.deploy(
    toWei("0.0025"),
    sellerConfig,
    paymentSplitter.address,
    start,
    [dev.address],
    utilities.addressFor(network.name, "DelegateCash"),
    false
  );

  const FriendlyMinterStorage = await ethers.getContractFactory("FriendlyMinterStorage");
  const friendlyMinterStorage = await FriendlyMinterStorage.deploy(sale.address, [dev.address]);

  await sale.setFriendlyMinterStorage(friendlyMinterStorage.address);
  await sale.setPresaleMerkleRoot(merkleTree.root);
  await sale.setNftContractAddress(nft.address);
  await nft.setMinterAddress(sale.address);

  console.log("Sale Contract is deployed", sale.address);

  if (network.name == "sepolia" || network.name == "mainnet") {
    console.log("Waiting for Etherscan to index the bytecode for verification");
    await delay(30000);

    await run("verify:verify", {
      address: sale.address,
      constructorArguments: [
        toWei("0.0025"),
        sellerConfig,
        paymentSplitter.address,
        start,
        [dev.address],
        utilities.addressFor(network.name, "DelegateCash"),
        false,
      ],
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
