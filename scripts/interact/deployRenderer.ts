import { ethers, run } from "hardhat";
import * as utilities from "../utils";

const scriptyBuilder = "0x16b727a2Fc9322C724F4Bc562910c99a5edA5084";
const scriptyStorage = "0x096451F43800f207FC32B4FF86F286EdaF736eE3";

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function main() {
  const [admin] = await ethers.getSigners();

  const scriptRequests = [
    {
      name: "crashblossom_gold_base",
      contractAddress: scriptyStorage,
      contractData: 0,
      wrapType: 0,
      wrapPrefix: utilities.emptyBytes(),
      wrapSuffix: utilities.emptyBytes(),
      scriptContent: utilities.emptyBytes(),
    },
    {
      name: "crashblossom_gold_paths",
      contractAddress: scriptyStorage,
      contractData: 0,
      wrapType: 2,
      wrapPrefix: utilities.emptyBytes(),
      wrapSuffix: utilities.emptyBytes(),
      scriptContent: utilities.emptyBytes(),
    },
    {
      name: "gunzipScripts-0.0.1",
      contractAddress: scriptyStorage,
      contractData: 0,
      wrapType: 0,
      wrapPrefix: utilities.emptyBytes(),
      wrapSuffix: utilities.emptyBytes(),
      scriptContent: utilities.emptyBytes(),
    },
    {
      name: "crashblossom_gold_main_v1.2",
      contractAddress: scriptyStorage,
      contractData: 0,
      wrapType: 0,
      wrapPrefix: utilities.emptyBytes(),
      wrapSuffix: utilities.emptyBytes(),
      scriptContent: utilities.emptyBytes(),
    },
  ];

  const scriptyBuilderContract = await ethers.getContractAt("ScriptyBuilder", scriptyBuilder);
  const rawBufferSize = await scriptyBuilderContract.getBufferSizeForHTMLWrapped(
    // @ts-ignore
    scriptRequests
  );
  console.log("Buffer size:", rawBufferSize.toString());

  const renderer = await ethers.getContractFactory("GoldRenderer");
  const rendererContract = await renderer.deploy(
    [admin.address],
    scriptyBuilder,
    scriptyStorage,
    rawBufferSize,
    "https://arweave.net/ZDUYnl92GoUI8jJwX3x3GiRzVIWq6da_6wp2ZL5bDps/"
  );

  console.log("Waiting for 30 seconds for etherscan to index the contract");
  await delay(30000);

  await run("verify:verify", {
    address: rendererContract.address,
    constructorArguments: [
      [admin.address],
      scriptyBuilder,
      scriptyStorage,
      rawBufferSize,
      "https://arweave.net/ZDUYnl92GoUI8jJwX3x3GiRzVIWq6da_6wp2ZL5bDps/",
    ],
  });

  return rendererContract.address;
}

main().then(console.log);
