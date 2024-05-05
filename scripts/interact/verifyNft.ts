import { ethers, run, network } from "hardhat";
import * as utilities from "../utils";
import path from "path";

const contractAddress = "0x34ca6315C02831CBE3008fD21f6002525E060B27";
const rendererAddress = "0x1c0DB5c204C45c260dB7a56fE3ff0C85a5b3824E";
const wethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
const DEV_SPLIT = 140; // 14%
const ARTIST_SPLIT = 650; // 65 %
const DAO_SPLIT = 210; // 21 %
const SUPPLY = 300;

async function main() {
  const contract = await ethers.getContractAt("Mass", contractAddress);
  const [dev, artist, dao] = await ethers.getSigners();

  await run("verify:verify", {
    address: contract.address,
    constructorArguments: [
      [dev.address, artist.address, dao.address],
      [DEV_SPLIT, ARTIST_SPLIT, DAO_SPLIT],
      [dev.address, artist.address, dao.address],
      wethAddress,
      rendererAddress,
      SUPPLY,
      utilities.addressFor(network.name, "DelegateCash"),
    ],
  });
}

main().then(console.log);
