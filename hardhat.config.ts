import "dotenv/config";
import { task } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-watcher";

const SEED_PHRASE = process.env.SEED_PHRASE as string;
const ALCHEMY_KEY = process.env.ALCHEMY_KEY as string;
const QUIKNODE_KEY_GOERLI = process.env.QUIKNODE_KEY_GOERLI as string;
const ALCHEMY_SEPOLIA_KEY = process.env.ALCHEMY_SEPOLIA_KEY as string;

task("accounts", "Prints the list of accounts", async (_, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts.slice(0, 10)) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 500,
        details: {
          yul: true,
          yulDetails: {
            stackAllocation: true,
            optimizerSteps: "dhfoDgvulfnTUtnIf",
          },
        },
      },
    },
  },
  networks: {
    hardhat: {
      // forking: {
      //   url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      // },
      blockGasLimit: 500000000,
      timeout: 100000000,
      accounts: {
        initialIndex: 4,
        count: 10,
        mnemonic: SEED_PHRASE,
      },
    },
    goerli: {
      url: `https://sly-warmhearted-gas.ethereum-goerli.quiknode.pro/${QUIKNODE_KEY_GOERLI}/`,
      blockGasLimit: 500000000,
      accounts: {
        initialIndex: 4,
        count: 10,
        mnemonic: SEED_PHRASE,
      },
      gasMultiplier: 2,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_KEY}`,
      blockGasLimit: 500000000,
      accounts: {
        initialIndex: 4,
        count: 10,
        mnemonic: SEED_PHRASE,
      },
      gasMultiplier: 2,
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      accounts: {
        count: 10,
        initialIndex: 4,
        mnemonic: SEED_PHRASE,
      },
      gasMultiplier: 1.02,
    },
  },
  gasReporter: {
    enabled: true,
    gasPrice: 15,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: [],
  },
  mocha: {
    timeout: 120000,
  },
  watcher: {
    test: {
      tasks: [{ command: "test", params: { testFiles: ["{path}"] } }],
      files: ["./test/**/*"],
      verbose: false,
      clearOnStart: true,
      runOnLaunch: false,
    },
  },
};

export default {
  solidity: "0.8.17",
};
