import { expect } from "chai";
import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Mass, MassRenderer, ScriptyStorageV2, WETH } from "../typechain-types";
import { deployContracts, scriptDefs } from "./utils";
import { takeSnapshot, revertToSnapshot } from "./helpers/snapshot";
import { deployOrGetContracts } from "../scripts/utils";
import * as utilities from "../scripts/utils";
import { BigNumber } from "ethers";

const toWei = ethers.utils.parseEther;

describe.only("Renderer", async function () {
  let contract: MassRenderer;
  let deployer: SignerWithAddress;
  let wethContract: WETH;
  let snapshotId: number;
  let nft: Mass;
  let scriptyStorage: ScriptyStorageV2;

  before("Deploy", async () => {
    const [dev, artist, dao] = await ethers.getSigners();

    const { scriptyStorageContract, scriptyBuilderContract, wethContract } = await deployOrGetContracts(
      network
    );

    scriptyStorage = scriptyStorageContract;

    const renderer = await ethers.getContractFactory("MassRenderer");

    const rendererContract = await renderer.deploy(
      [dev.address, artist.address, dao.address],
      scriptyBuilderContract.address,
      "https://arweave.net/gold/",
      scriptDefs.map((s) => ({
        ...s,
        storageContract: scriptyStorageContract.address,
      }))
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

  it("Can deploy scripts", async function () {
    let gasUsed = BigNumber.from(0);

    for (let i = 0; i < utilities.scripts.length; i++) {
      const script = utilities.scripts[i];

      const gas = await utilities.storeScript(
        network,
        scriptyStorage,
        script.name,
        script.path,
        script.compress
      );

      if (!script.useEthFsDirectly) {
        gasUsed = gasUsed.add(gas);
      }
    }

    console.log("Gas used", gasUsed.toString());
  });
});
