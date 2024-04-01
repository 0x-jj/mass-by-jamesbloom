import { ethers } from "hardhat";

const nftContractAddress = "0xCcBE56eA12B845A281431290F202196864F2f576";
const scriptyBuilder = "0x16b727a2Fc9322C724F4Bc562910c99a5edA5084";
const scriptyStorage = "0x096451F43800f207FC32B4FF86F286EdaF736eE3";

async function main() {
  const [admin] = await ethers.getSigners();

  const renderer = await ethers.getContractFactory("GoldRenderer");
  const rendererContract = await renderer.deploy(
    [admin.address],
    scriptyBuilder,
    scriptyStorage,
    250000,
    "https://arweave.net/ZDUYnl92GoUI8jJwX3x3GiRzVIWq6da_6wp2ZL5bDps/"
  );
  const newAddress = rendererContract.address;

  const nftContract = await ethers.getContractAt("Gold", nftContractAddress);
  await nftContract.setRendererAddress(newAddress);
  await rendererContract.setGoldContract(nftContractAddress);

  return newAddress;
}

main().then(console.log);
