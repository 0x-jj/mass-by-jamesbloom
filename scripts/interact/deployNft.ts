import { ethers, run } from "hardhat";

const maxSupply = 300;
const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const rendererAddress = "0x9861F4b3E833b9e8618F6c3Af3B295d1b2177303";
const admin = "0x20Ec68Ba5dC8aF5380BDb37465b3F9BDE75f9635";

const secondaryMarketSplits = [
  { address: "0x65C7432E6662A96f4e999603991d5E929E57f60A", split: 85 },
  { address: "0x134309c4cf57BfA43EF66bF20bD0EEcCDEb2D80c", split: 15 },
];

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function main() {
  const nftContract = await (
    await ethers.getContractFactory("Mass")
  ).deploy(
    secondaryMarketSplits.map((s) => ethers.utils.getAddress(s.address)),
    secondaryMarketSplits.map((s) => s.split),
    [admin],
    wethAddress,
    rendererAddress,
    maxSupply
  );

  await nftContract.deployed();
  console.log(`NFT contract is deployed at ${nftContract.address}`);

  console.log("Waiting for 30 seconds for etherscan to index the contract");
  await delay(30000);

  console.log("Sending contract for verification");
  await run("verify:verify", {
    address: nftContract.address,
    constructorArguments: [
      secondaryMarketSplits.map((s) => ethers.utils.getAddress(s.address)),
      secondaryMarketSplits.map((s) => s.split),
      [admin],
      wethAddress,
      rendererAddress,
      maxSupply,
    ],
  });
}

main().then(console.log);
