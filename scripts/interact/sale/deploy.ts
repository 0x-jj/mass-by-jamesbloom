import { ethers, network, run } from "hardhat";
import * as utilities from "../../utils";
import { getMerkleRoot } from "../../../test/utils";
import { Seller } from "../../../typechain-types";
import _ from "lodash";

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const treasury = "0x65C7432E6662A96f4e999603991d5E929E57f60A";
const nftContractAddress = "0x80faa45d6f6cbdafdeba2f9c4a0237f74e5d8d9c";

const toWei = ethers.utils.parseEther;

const SUPPLY = 300;
const PER_ADDRESS = 3;

const startTime = 1715792400;

const presaleAddresses = ["0x0000000000000000000000000000000000000000"];

async function main() {
  console.log("");
  console.log("----------------------------------");
  console.log("Running sale deployment script");
  console.log("----------------------------------");

  const [dev, artist, dev2] = await ethers.getSigners();

  console.log("Deploying contracts");
  console.log("Network name:", network.name);
  console.log("Deployer:", dev.address);

  // const merkleTree = getMerkleRoot(_.uniq([dev.address, ...presaleAddresses].map((a) => a.toLowerCase())));

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

  const sale = await Sale.deploy(
    toWei("0.25"),
    sellerConfig,
    treasury,
    startTime,
    [dev.address],
    utilities.addressFor(network.name, "DelegateCash"),
    false
  );

  const FriendlyMinterStorage = await ethers.getContractFactory("FriendlyMinterStorage");
  const friendlyMinterStorage = await FriendlyMinterStorage.deploy(sale.address, [dev.address]);

  await sale.setFriendlyMinterStorage(friendlyMinterStorage.address);
  //await sale.setPresaleMerkleRoot(merkleTree.root);
  await sale.setNftContractAddress(nft.address);
  await nft.setMinterAddress(sale.address);

  console.log("Sale Contract is deployed", sale.address);

  if (network.name == "sepolia" || network.name == "mainnet") {
    console.log("Waiting for Etherscan to index the bytecode for verification");
    await delay(30000);

    await run("verify:verify", {
      address: sale.address,
      constructorArguments: [
        toWei("0.25"),
        sellerConfig,
        treasury,
        startTime,
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
