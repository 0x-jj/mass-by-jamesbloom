import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { signBid } from "./helpers/sign";
import { takeSnapshot, revertToSnapshot } from "./helpers/snapshot";
import { increaseTime } from "./helpers/time";
import { DutchAuction, FixedPriceSale, Mass, Seller } from "../typechain-types";
import { BigNumber } from "ethers";
import { deployContracts, getMerkleRoot, timeTravel } from "./utils";
import MerkleTree from "merkletreejs";
import { parseEther } from "ethers/lib/utils";

const toWei = ethers.utils.parseEther;

const START_PRICE = toWei("1.4");
const RESERVED_MINTS = 3;
const MAX_SUPPLY = 10;

const DEV_SPLIT = 140; // 14%
const ARTIST_SPLIT = 650; // 65 %
const DAO_SPLIT = 210; // 21 %

const zeroAddress = ethers.constants.AddressZero;

describe.only("FixedPriceSale", function () {
  let nft: Mass;
  let sale: FixedPriceSale;
  let admin: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let jill: SignerWithAddress;
  let signer: SignerWithAddress;
  let treasury: SignerWithAddress;
  let defaultAdminRole: string;
  let snapshotId: number;
  let merkle: { tree: MerkleTree; root: string; proof: (addy: string) => string[] };

  before("Deploy", async () => {
    [admin, alice, bob, signer, treasury, jill] = await ethers.getSigners();
    merkle = getMerkleRoot([alice.address, admin.address]);

    const contracts = await deployContracts();
    nft = contracts.nftContract;
    const wethContract = contracts.wethContract;
    const MassContract = await ethers.getContractFactory("Mass");
    nft = await MassContract.deploy(
      [admin.address, alice.address, bob.address],
      [DEV_SPLIT, ARTIST_SPLIT, DAO_SPLIT],
      [admin.address],
      wethContract.address,
      contracts.rendererContract.address,
      20,
      "0x00000000000076A84feF008CDAbe6409d2FE638B"
    );

    const sellerConfig: Seller.SellerConfigStruct = {
      totalInventory: 300,
      maxPerAddress: 3,
      maxPerTx: 0,
      freeQuota: 20,
      reserveFreeQuota: true,
      lockFreeQuota: false,
      lockTotalInventory: true,
    };

    const Sale = await ethers.getContractFactory("FixedPriceSale");
    sale = await Sale.deploy(
      toWei("0.1"),
      sellerConfig,
      treasury.address,
      Math.floor(Date.now() / 1000) - 100,
      [admin.address],
      "0x00000000000076A84feF008CDAbe6409d2FE638B"
    );

    await nft.connect(admin).setMinterAddress(sale.address);

    await sale.connect(admin).setNftContractAddress(nft.address);

    defaultAdminRole = await sale.DEFAULT_ADMIN_ROLE();
  });

  beforeEach(async () => {
    snapshotId = await takeSnapshot();
  });

  afterEach(async function () {
    await revertToSnapshot(snapshotId);
  });

  describe("setNftContractAddress", function () {
    it("should set the NFT contract address", async function () {
      const newAddress = "0x1234567890123456789012345678901234567890";
      await expect(sale.connect(admin).setNftContractAddress(newAddress)).to.not.be.reverted;
      expect(await sale.nftContractAddress()).to.equal(newAddress);
    });

    it("should revert if called by non-admin", async function () {
      const newAddress = "0x1234567890123456789012345678901234567890";
      await expect(sale.connect(alice).setNftContractAddress(newAddress)).to.be.revertedWith(/AccessControl/);
    });

    it("should revert if new address is zero", async function () {
      await expect(
        sale.connect(admin).setNftContractAddress(ethers.constants.AddressZero)
      ).to.be.revertedWith(/zero address not allowed/);
    });
  });

  describe("Presale", function () {
    before(async () => {
      await sale.connect(admin).setPresaleMerkleRoot(merkle.root);
    });

    it("should allow someone in merkle tree to mint", async function () {
      await expect(
        sale
          .connect(alice)
          .purchasePresale(1, merkle.proof(alice.address), zeroAddress, zeroAddress, { value: toWei("0.1") })
      ).to.not.be.reverted;

      expect(await nft.balanceOf(alice.address)).to.equal(1);
    });

    it("should not allow someone not in merkle tree to mint", async function () {
      await expect(
        sale
          .connect(admin)
          .purchasePresale(1, merkle.proof(alice.address), zeroAddress, zeroAddress, { value: toWei("0.1") })
      ).to.be.revertedWithCustomError(sale, "NotOnAllowlist");
    });

    it("should not allow someone in merkle tree to mint with wrong eth amount", async function () {
      await expect(
        sale
          .connect(alice)
          .purchasePresale(1, merkle.proof(alice.address), zeroAddress, zeroAddress, { value: toWei("0.01") })
      ).to.be.revertedWith(/Seller: Costs 100000000 GWei/);
    });

    it("should not allow someone in merkle tree to mint multiple with wrong price", async function () {
      await expect(
        sale
          .connect(alice)
          .purchasePresale(3, merkle.proof(alice.address), zeroAddress, zeroAddress, { value: toWei("0.1") })
      ).to.be.revertedWith(/Seller: Costs 300000000 GWei/);
    });

    it("should allow someone to nominate a friend", async function () {
      await sale
        .connect(alice)
        .purchasePresale(1, merkle.proof(alice.address), zeroAddress, bob.address, { value: toWei("0.1") });

      const deets = await sale.friendlyMinters(bob.address);
      expect(deets[0]).to.equal(bob.address);
      expect(deets[1]).to.be.false;
    });

    it("should allow a nominated friend to mint", async function () {
      // Revert initially
      await expect(
        sale
          .connect(bob)
          .purchasePresale(1, merkle.proof(alice.address), zeroAddress, zeroAddress, { value: toWei("0.1") })
      ).to.be.revertedWithCustomError(sale, "NotOnAllowlist");

      // Alice mint and add bob as friend mint
      await sale
        .connect(alice)
        .purchasePresale(1, merkle.proof(alice.address), zeroAddress, bob.address, { value: toWei("0.1") });

      // Bob can mint N as friend
      await expect(
        sale.connect(bob).purchasePresale(2, [], zeroAddress, zeroAddress, { value: toWei("0.2") })
      ).to.not.be.reverted;

      // Bob has balance of N
      expect(await nft.balanceOf(bob.address)).to.equal(2);
    });

    it("shouldn't allow a friend to nominate a friend", async function () {
      // Alice mint and add bob as friend mint
      await sale
        .connect(alice)
        .purchasePresale(1, merkle.proof(alice.address), zeroAddress, bob.address, { value: toWei("0.1") });

      // Bob can't mint while setting a friend
      await expect(
        sale.connect(bob).purchasePresale(2, [], zeroAddress, admin.address, { value: toWei("0.2") })
      ).to.be.revertedWithCustomError(sale, "NotAllowedToNominate");
    });

    it("should not allow someone to call purchase in public sale", async function () {
      await expect(sale.connect(jill).purchase(1, { value: toWei("0.1") })).to.be.revertedWithCustomError(
        sale,
        "PublicSaleNotOpen"
      );
    });
  });

  describe("Public sale", function () {
    before(async () => {
      await timeTravel(86400);
    });

    it("should allow someone in not merkle tree to mint", async function () {
      await expect(sale.connect(jill).purchase(1, { value: toWei("0.1") })).to.not.be.reverted;
    });
  });
});
