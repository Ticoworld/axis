import { type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@midl/hardhat-deploy";
import { MaestroSymphonyProvider, MempoolSpaceProvider } from "@midl/core";
import { midlRegtest } from "@midl/executor";
import * as dotenv from "dotenv";
import "./tasks/create-token";

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
        hardhatNetwork: "regtest",
        network: {
          explorerUrl: "https://mempool.staging.midl.xyz",
          id: "regtest",
          network: "regtest",
        },
        runesProviderFactory: () =>
          new MaestroSymphonyProvider({
            regtest: "https://runes.staging.midl.xyz",
          }),
        providerFactory: () =>
          new MempoolSpaceProvider({
            regtest: "https://mempool.staging.midl.xyz",
          }),
      },
      regtest: {
        mnemonic: process.env.MNEMONIC || "",
        confirmationsRequired: 1,
        btcConfirmationsRequired: 1,
        hardhatNetwork: "regtest",
        network: {
          explorerUrl: "https://mempool.staging.midl.xyz",
          id: "regtest",
          network: "regtest",
        },
        runesProviderFactory: () =>
          new MaestroSymphonyProvider({
            regtest: "https://runes.staging.midl.xyz",
          }),
        providerFactory: () =>
          new MempoolSpaceProvider({
            regtest: "https://mempool.staging.midl.xyz",
          }),
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
