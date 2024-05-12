import { ethers, network, run } from "hardhat";
import * as utilities from "../utils";

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function main() {
  const [admin] = await ethers.getSigners();

  const isLocal = network.name === "hardhat" || network.name === "localhost";

  console.log("Is local:", isLocal);

  const { scriptyStorageContract, scriptyBuilderContract } = await utilities.deployOrGetContracts(network);

  for (let i = 0; i < utilities.scripts.length; i++) {
    const script = utilities.scripts[i];
    if (!isLocal) {
      if (script.useEthFsDirectly) {
        console.log(`Skipping ${script.name} as it uses ethfs directly`);
        continue;
      }
    }
    await utilities.storeScript(network, scriptyStorageContract, script.name, script.path, script.compress);
  }

  const renderer = await ethers.getContractFactory("MassRenderer");

  const ethFsStorageV2 = isLocal ? "" : utilities.addressFor(network.name, "ETHFSV2FileStorage");

  const rendererContract = await renderer.deploy(
    [admin.address],
    scriptyBuilderContract.address,
    "https://arweave.net/mass/",
    utilities.scripts.map((s) => ({
      ...s,
      storageContract: !isLocal && s.useEthFsDirectly ? ethFsStorageV2 : scriptyStorageContract.address,
    }))
  );
  await rendererContract.deployed();
  console.log("Renderer Contract is deployed", rendererContract.address);

  if (network.name == "sepolia" || network.name == "mainnet") {
    console.log("Waiting for Etherscan to index the bytecode for verification");
    await delay(30000);

    try {
      await run("verify:verify", {
        address: rendererContract.address,
        constructorArguments: [
          [admin.address],
          scriptyBuilderContract.address,
          "https://arweave.net/mass/",
          utilities.scripts.map((s) => ({
            ...s,
            storageContract: !isLocal && s.useEthFsDirectly ? ethFsStorageV2 : scriptyStorageContract.address,
          })),
        ],
      });
    } catch (e) {
      console.error(e);
    }
  }

  return rendererContract.address;
}

main().then(console.log);
