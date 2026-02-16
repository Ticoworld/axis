import type { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  console.log("Initializing Midl environment...");
  await hre.midl.initialize();

  const evmAddress = hre.midl.evm.address;
  console.log("Deploying from EVM Address:", evmAddress);

  console.log("Queueing AxisBondingCurve deployment...");
  await hre.midl.deploy("AxisBondingCurve", []);

  console.log("Executing transaction on Midl Regtest...");
  const txInfo = await hre.midl.execute();

  console.log("Deployment Complete!");
  console.log("Transaction Info:", txInfo);
}
