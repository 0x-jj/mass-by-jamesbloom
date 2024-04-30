import { expect } from "chai";
import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Gold, MassRenderer, WETH } from "../typechain-types";
import { deployContracts } from "./utils";
import { takeSnapshot, revertToSnapshot } from "./helpers/snapshot";
import { deployOrGetContracts } from "../scripts/utils";

const toWei = ethers.utils.parseEther;

describe.only("Renderer", async function () {
  let contract: MassRenderer;
  let deployer: SignerWithAddress;
  let wethContract: WETH;
  let snapshotId: number;

  before("Deploy", async () => {
    const [dev, artist, dao] = await ethers.getSigners();
    const renderer = await ethers.getContractFactory("MassRenderer");
    const { scriptyStorageContract, scriptyBuilderContract, wethContract } = await deployOrGetContracts(
      network.name
    );
    const rendererContract = await renderer.deploy(
      [dev.address, artist.address, dao.address],
      scriptyBuilderContract.address,
      scriptyStorageContract.address,
      210000,
      "https://arweave.net/gold/"
    );
    await rendererContract.deployed();
    contract = rendererContract;
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
});
