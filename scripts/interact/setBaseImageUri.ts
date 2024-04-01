import { ethers } from "hardhat";

const rendererContractAddress = "0xDc49B9D7De7b1B4d6d153d9857b3942Dc4BADDfA";
const newUri = "https://arweave.net/ZDUYnl92GoUI8jJwX3x3GiRzVIWq6da_6wp2ZL5bDps/";

async function main() {
  const renderer = await ethers.getContractAt("GoldRenderer", rendererContractAddress);
  await renderer.setBaseImageURI(newUri);
  console.log("Image uri set to", newUri);
}

main();
