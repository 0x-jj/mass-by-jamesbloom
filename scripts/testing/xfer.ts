import { ethers } from "hardhat";

const toWei = ethers.utils.parseEther;

async function main() {
  const [dev, artist] = await ethers.getSigners();

  const res = await dev.sendTransaction({
    to: artist.address,
    value: toWei("0.00001"),
  });

  console.log("Transaction hash:", res.hash);

  await res.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
