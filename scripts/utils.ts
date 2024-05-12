import { ethers } from "hardhat";
import zlib from "zlib";
import fs from "fs";
import { Network } from "hardhat/types";
import { ETHFSV2FileStorage, ScriptyStorageV2 } from "../typechain-types";
import { BigNumber, ContractReceipt } from "ethers";
import path from "path";
import { randomBytes } from "ethers/lib/utils";

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
  mainnet: {
    ScriptyStorageV2: "0xbD11994aABB55Da86DC246EBB17C1Be0af5b7699",
    ScriptyBuilderV2: "0xD7587F110E08F4D120A231bA97d3B577A81Df022",
    WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    DelegateCash: "0x00000000000076a84fef008cdabe6409d2fe638b",
    ETHFSV2FileStorage: "0x8FAA1AAb9DA8c75917C43Fb24fDdb513edDC3245",
  },
  sepolia: {
    ScriptyStorageV2: "0xbD11994aABB55Da86DC246EBB17C1Be0af5b7699",
    ScriptyBuilderV2: "0xD7587F110E08F4D120A231bA97d3B577A81Df022",
    WETH: "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0",
    DelegateCash: "0x00000000000000447e69651d841bD8D104Bed493",
    ETHFSV2FileStorage: "0x8FAA1AAb9DA8c75917C43Fb24fDdb513edDC3245",
  },
};

const SAFE_SINGLETON_FACTORY = "0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7";
const SAFE_SINGLETON_FACTORY_BYTECODE =
  "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf3";

export const addressFor = (networkName: string, name: string): string => {
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

export async function storeScript(
  network: Network,
  storageContract: ScriptyStorageV2,
  name: string,
  filePath: string,
  compress = false
) {
  let totalGas = BigNumber.from(0);

  const storedScript = await storageContract.contents(name);
  if (storedScript.size.gt(BigNumber.from(0))) {
    console.log(`${name} is already stored`);
    return totalGas;
  }

  let script = readFile(path.join(__dirname, filePath));

  if (compress) {
    script = toGZIPBase64String(script);
  }

  const scriptChunks = chunkSubstr(script, 24575);

  if (storedScript.owner === ethers.constants.AddressZero) {
    const receipt = await waitIfNeeded(await storageContract.createContent(name, stringToBytes(name)));
    if (receipt) {
      const gasUsed = receipt.gasUsed;
      totalGas = totalGas.add(gasUsed);
    }
  }

  for (let i = 0; i < scriptChunks.length; i++) {
    let receipt: ContractReceipt | null = null;

    console.log(
      `Storing ${name} chunk ${i + 1}/${scriptChunks.length}. Size: ${scriptChunks[i].length} bytes`
    );

    if (network.name === "hardhat") {
      receipt = await waitIfNeeded(
        await storageContract.addChunkToContent(name, stringToBytes(scriptChunks[i]), { gasLimit: 500000000 })
      );
    } else {
      receipt = await waitIfNeeded(
        await storageContract.addChunkToContent(name, stringToBytes(scriptChunks[i]))
      );
    }

    if (receipt) {
      const gasUsed = receipt.gasUsed;
      totalGas = totalGas.add(gasUsed);
    }
  }
  console.log(`${name} is stored`);
  return totalGas;
}

const waitIfNeeded = async (tx: any): Promise<ContractReceipt | null> => {
  if (tx.wait) {
    return tx.wait(1);
  }
  console.log("returning null");
  return null;
};

export enum HTMLTagType {
  useTagOpenAndClose,
  script,
  scriptBase64DataURI,
  scriptGZIPBase64DataURI,
  scriptPNGBase64DataURI,
}

export type ScriptAlias = "three" | "params" | "objects" | "textures" | "gunzip" | "base" | "main" | "nodes";
type ScriptDefinition = {
  name: string;
  path: string;
  compress: boolean;
  tagType: HTMLTagType;
  alias: ScriptAlias;
  useEthFsDirectly: boolean;
};

export const scripts: ScriptDefinition[] = [
  {
    name: "three-v0.147.0.min.js.gz",
    path: "scripts/three-v0.147.0.min.js.gz.txt",
    compress: false,
    tagType: HTMLTagType.scriptGZIPBase64DataURI,
    alias: "three",
    useEthFsDirectly: false,
  },
  {
    name: "jb_params9",
    path: "scripts/parameters-min.js",
    compress: true,
    tagType: HTMLTagType.scriptGZIPBase64DataURI,
    alias: "params",
    useEthFsDirectly: false,
  },
  {
    name: "jb_nodes2",
    path: "scripts/nodes.js",
    compress: true,
    tagType: HTMLTagType.scriptGZIPBase64DataURI,
    alias: "nodes",
    useEthFsDirectly: false,
  },
  {
    name: "jb_mass_objects",
    path: "scripts/objects.js",
    compress: true,
    tagType: HTMLTagType.scriptGZIPBase64DataURI,
    alias: "objects",
    useEthFsDirectly: false,
  },
  {
    name: "jb_mass_textures",
    path: "scripts/textures.js",
    compress: true,
    tagType: HTMLTagType.scriptGZIPBase64DataURI,
    alias: "textures",
    useEthFsDirectly: false,
  },
  {
    name: "gunzipScripts-0.0.1.js",
    path: "scripts/gunzipScripts-0.0.1.js",
    compress: false,
    tagType: HTMLTagType.scriptBase64DataURI,
    alias: "gunzip",
    useEthFsDirectly: true,
  },
  {
    name: "jb_mass_base",
    path: "scripts/massBase.js",
    compress: false,
    tagType: HTMLTagType.script,
    alias: "base",
    useEthFsDirectly: false,
  },
  {
    name: "jb_mass_main13",
    path: "scripts/main-min.js",
    compress: false,
    tagType: HTMLTagType.script,
    alias: "main",
    useEthFsDirectly: false,
  },
];
