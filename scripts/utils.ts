import { ethers } from "hardhat";
import zlib from "zlib";
import fs from "fs";
import { Network } from "hardhat/types";

export const stringToBytes = (str: string) => {
  return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(str));
};

export const bytesToString = (str: string) => {
  return ethers.utils.toUtf8String(str);
};

export const emptyBytes = () => {
  return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(""));
};

export const readFile = (path: string) => {
  return fs.readFileSync(path, { encoding: "utf8" });
};

export const writeFile = (path: string, data: any) => {
  fs.writeFileSync(path, data);
};

export const emptyAddress = "0x0000000000000000000000000000000000000000";

export const parseBase64DataURI = (uri: string) => {
  const data = uri.split("base64,")[1];
  const buff = Buffer.from(data, "base64");
  return buff.toString("utf8");
};

export const parseEscapedDataURI = (uri: string) => {
  const data = uri.split("data:")[1].split(",")[1];
  return decodeURIComponent(data);
};

export const chunkSubstr = (str: string, size: number) => {
  return str.split(new RegExp("(.{" + size.toString() + "})")).filter((O) => O);
};

export const toBase64String = (data: any) => {
  return Buffer.from(data).toString("base64");
};

export const toGZIPBase64String = (data: any) => {
  return zlib.gzipSync(data).toString("base64");
};

const addresses = {
  ethereum: {
    ScriptyStorage: "0x096451F43800f207FC32B4FF86F286EdaF736eE3",
    ScriptyBuilder: "0x16b727a2Fc9322C724F4Bc562910c99a5edA5084",
    ETHFSFileStorage: "0xFc7453dA7bF4d0c739C1c53da57b3636dAb0e11e",
    WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    DelegateCash: "0x00000000000076a84fef008cdabe6409d2fe638b",
    ethfs_ContentStore: "0xC6806fd75745bB5F5B32ADa19963898155f9DB91",
    ethfs_FileStore: "0x9746fD0A77829E12F8A9DBe70D7a322412325B91",
  },
  goerli: {
    ScriptyStorage: "0xEA5cD8A8D4eFdA42266E7B9139F8d80915A56daf",
    ScriptyBuilder: "0x610c05bC5739baf4837fF67d5fc5Ab6D9Ee7558D",
    ETHFSFileStorage: "0x70a78d91A434C1073D47b2deBe31C184aA8CA9Fa",
    WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    DelegateCash: "0x00000000000076a84fef008cdabe6409d2fe638b",
    ethfs_ContentStore: "0xED7C16aB4eB4D091F492713e5235Ac93852bc3a0",
    ethfs_FileStore: "0x5E348d0975A920E9611F8140f84458998A53af94",
  },
  localhost: {
    ScriptyStorage: "0xEA5cD8A8D4eFdA42266E7B9139F8d80915A56daf",
    ScriptyBuilder: "0x610c05bC5739baf4837fF67d5fc5Ab6D9Ee7558D",
    ETHFSFileStorage: "0x70a78d91A434C1073D47b2deBe31C184aA8CA9Fa",
    WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    DelegateCash: "0x00000000000076a84fef008cdabe6409d2fe638b",
    ethfs_ContentStore: "0xED7C16aB4eB4D091F492713e5235Ac93852bc3a0",
    ethfs_FileStore: "0x5E348d0975A920E9611F8140f84458998A53af94",
  },
};

const SAFE_SINGLETON_FACTORY = "0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7";
const SAFE_SINGLETON_FACTORY_BYTECODE =
  "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf3";

export const addressFor = (networkName: string, name: string) => {
  // @ts-ignore
  return addresses[networkName][name];
};

export async function deployOrGetContracts(network: Network) {
  const networkName = network.name;
  if (networkName == "hardhat" || networkName == "localhost") {
    console.log("Deploying contracts on", networkName);
    await network.provider.send("hardhat_setCode", [SAFE_SINGLETON_FACTORY, SAFE_SINGLETON_FACTORY_BYTECODE]);
    console.log("SafeSingletonFactory deployed at", SAFE_SINGLETON_FACTORY);

    const ethfsFileStoreContract = await (
      await ethers.getContractFactory("FileStore")
    ).deploy(SAFE_SINGLETON_FACTORY);
    await ethfsFileStoreContract.deployed();
    console.log("ETHFS deployed at", ethfsFileStoreContract.address);

    const scriptyStorageContract = await (
      await ethers.getContractFactory("ScriptyStorageV2")
    ).deploy(ethfsFileStoreContract.address);
    await scriptyStorageContract.deployed();
    console.log("ScriptyStorage deployed at", scriptyStorageContract.address);

    const scriptyBuilderContract = await (await ethers.getContractFactory("ScriptyBuilderV2")).deploy();
    await scriptyBuilderContract.deployed();
    console.log("ScriptyBuilder deployed at", scriptyBuilderContract.address);

    const Weth = await ethers.getContractFactory("WETH");
    const wethContract = await Weth.deploy();
    await wethContract.deployed();
    console.log("WETH deployed at", wethContract.address);

    return { scriptyStorageContract, scriptyBuilderContract, wethContract };
  } else {
    const scriptyStorageAddress = addressFor(networkName, "ScriptyStorageV2");
    const scriptyStorageContract = await ethers.getContractAt("ScriptyStorageV2", scriptyStorageAddress);
    console.log("ScriptyStorage is already deployed at", scriptyStorageAddress);

    const scriptyBuilderAddress = addressFor(networkName, "ScriptyBuilderV2");
    const scriptyBuilderContract = await ethers.getContractAt("ScriptyBuilderV2", scriptyBuilderAddress);
    console.log("ScriptyBuilder is already deployed at", scriptyBuilderAddress);

    const wethAddress = addressFor(networkName, "WETH");
    const wethContract = await ethers.getContractAt("WETH", wethAddress);
    console.log("WethContract is already deployed at", wethAddress);

    return { scriptyStorageContract, scriptyBuilderContract, wethContract };
  }
}
