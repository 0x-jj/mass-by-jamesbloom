import { ethers, network, run } from "hardhat";
import { getMerkleRootWithDiscounts } from "../../../test/utils";
import { discounts } from "../../../offchain/discounts";

const nftContractAddress = "0xccbe56ea12b845a281431290f202196864f2f576";
const SIGNER = "0x589b6C421C55260fC5E4117Bd893f57eD7bd44cD";

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function main() {
  const merkleTree = getMerkleRootWithDiscounts(discounts);

  const Auction = await ethers.getContractFactory("DutchAuction");
  const auction = await Auction.deploy(
    nftContractAddress,
    SIGNER,
    "0x65C7432E6662A96f4e999603991d5E929E57f60A",
    merkleTree.root,
    "0x00000000000076a84fef008cdabe6409d2fe638b"
  );

  console.log("Auction Contract is deployed", auction.address);
  const startAmount = ethers.utils.parseEther("2");
  const endAmount = ethers.utils.parseEther("0.1");
  const limit = ethers.utils.parseEther("10");
  const refundDelayTime = 1;
  const startTime = 1687363200;
  const endTime = startTime + 1.5 * 3600;
  await auction.setConfig(startAmount, endAmount, limit, refundDelayTime, startTime, endTime);
  await auction.setSignerAddress(SIGNER);

  const nftContract = await ethers.getContractAt("Gold", nftContractAddress);

  await nftContract.setMinterAddress(auction.address);
  console.log("Config, minter, signer are set");

  console.log("Waiting for 30 seconds for etherscan to index the contract");
  await delay(30000);

  await run("verify:verify", {
    address: auction.address,
    constructorArguments: [
      nftContractAddress,
      SIGNER,
      "0x65C7432E6662A96f4e999603991d5E929E57f60A",
      merkleTree.root,
      "0x00000000000076a84fef008cdabe6409d2fe638b",
    ],
  });
}

main().then(console.log);
