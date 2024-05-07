import { expect } from "chai";
import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Mass, MassRenderer, WETH } from "../typechain-types";
import { deployContracts, scriptDefs } from "./utils";
import { takeSnapshot, revertToSnapshot } from "./helpers/snapshot";
import { deployOrGetContracts } from "../scripts/utils";

const toWei = ethers.utils.parseEther;

describe.only("Renderer", async function () {
  let contract: MassRenderer;
  let deployer: SignerWithAddress;
  let wethContract: WETH;
  let snapshotId: number;
  let nft: Mass;

  before("Deploy", async () => {
    const [dev, artist, dao] = await ethers.getSigners();
    const renderer = await ethers.getContractFactory("MassRenderer");
    const { scriptyStorageContract, scriptyBuilderContract, wethContract } = await deployOrGetContracts(
      network
    );
    const rendererContract = await renderer.deploy(
      [dev.address, artist.address, dao.address],
      scriptyBuilderContract.address,
      scriptyStorageContract.address,
      "https://arweave.net/gold/",
      scriptDefs
    );
    await rendererContract.deployed();
    contract = rendererContract;

    const Nft = await ethers.getContractFactory("Mass");
    const nftContract = await Nft.deploy(
      [dev.address, artist.address, dao.address],
      [140, 650, 210],
      [dev.address, artist.address, dao.address],
      dao.address,
      dao.address,
      300,
      wethContract.address
    );
    await nftContract.deployed();
    nft = nftContract;

    await contract.setMassContract(nft.address);
    await nft.mint(dev.address);
  });

  beforeEach(async () => {
    snapshotId = await takeSnapshot();
  });

  afterEach(async function () {
    await revertToSnapshot(snapshotId);
  });

  it("Correctly generates traits", async function () {
    const rv = await contract.generateAllTraits(0);

    console.log(rv[0]);
    console.log(rv[1]);
  });

  it("Can call tokenURI", async function () {
    await contract.tokenURI(0);
  });

  it.only("Mint many", async function () {
    const [dev, artist, dao] = await ethers.getSigners();
    for (let i = 1; i < 300; i++) {
      try {
        await nft.mint(dev.address);
        await contract.tokenURI(i);
      } catch (e) {
        console.log(i);
        throw e;
      }
    }
  });
});
