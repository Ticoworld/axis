import { type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@midl/hardhat-deploy";
import { midlRegtest } from "@midl/executor";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "regtest",
  midl: {
    path: "deployments",
    networks: {
      default: {
        mnemonic: process.env.MNEMONIC || "",
        confirmationsRequired: 1,
        btcConfirmationsRequired: 1,
        network: "regtest",
        hardhatNetwork: "regtest",
      },
      regtest: {
        mnemonic: process.env.MNEMONIC || "",
        confirmationsRequired: 1,
        btcConfirmationsRequired: 1,
        network: "regtest",
        hardhatNetwork: "regtest",
      },
    },
  },
  networks: {
    regtest: {
      url: midlRegtest.rpcUrls.default.http[0],
      chainId: midlRegtest.id,
    },
  },
};

export default config;
