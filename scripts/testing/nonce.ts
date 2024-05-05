import { ethers } from "hardhat";

const toWei = ethers.utils.parseEther;

async function main() {
  const [dev, artist] = await ethers.getSigners();

  const curr = await dev.getTransactionCount();
  const pending = await dev.getTransactionCount("pending");

  console.log("Current nonce:", curr);
  console.log("Pending nonce:", pending);

  const params = {
    to: artist.address,
    value: toWei("0.00001"),
  };

  const gasPrice = await dev.getGasPrice();
  const higherGas = gasPrice.mul(3);

  console.log(`Sending with nonce ${curr} and gas price ${higherGas}...`);
  const tx = await dev.sendTransaction({
    ...params,
    gasPrice: higherGas,
    nonce: curr,
  });
  console.log("Transaction hash:", tx.hash);
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
