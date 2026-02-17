/**
 * Hardhat task: create-token
 *
 * Deploys a new token via the AxisBondingCurve factory contract
 * using the mnemonic from .env (bypasses Xverse wallet entirely).
 *
 * Usage:
 *   npx hardhat create-token --name "Orbital" --symbol "ORB" --k 1000000000000
 *   npx hardhat create-token --name "Meme Cat" --symbol "MCAT"
 */
import { task } from "hardhat/config";

task("create-token", "Create a token via the AxisBondingCurve factory")
  .addParam("name", "Token name (e.g. Orbital)")
  .addParam("symbol", "Token symbol/ticker (e.g. ORB)")
  .addOptionalParam("k", "Bonding curve pricing constant", "1000000000000")
  .addOptionalParam(
    "factory",
    "Factory contract address",
    "0x5447Ef425888C2f464F53B485B5E2fFCD4Df168f"
  )
  .setAction(async (args, hre) => {
    const { name, symbol, k, factory } = args as {
      name: string;
      symbol: string;
      k: string;
      factory: string;
    };

    console.log("═══════════════════════════════════════");
    console.log("  AXIS Token Creator (CLI)");
    console.log("═══════════════════════════════════════");
    console.log(`  Name:    ${name}`);
    console.log(`  Symbol:  ${symbol}`);
    console.log(`  K:       ${k}`);
    console.log(`  Factory: ${factory}`);
    console.log("───────────────────────────────────────");

    console.log("\n1. Initializing MIDL environment...");
    await hre.midl.initialize();

    const evmAddress = hre.midl.evm.address;
    console.log(`   EVM Address: ${evmAddress}`);

    console.log("\n2. Encoding createToken intention...");
    const iface = new hre.ethers.Interface([
      "function createToken(string name, string symbol, uint256 k) returns (address token)",
    ]);
    const calldata = iface.encodeFunctionData("createToken", [
      name,
      symbol,
      BigInt(k),
    ]);
    console.log(`   Calldata: ${calldata.slice(0, 42)}...`);

    console.log("\n3. Queueing EVM transaction intention...");
    await hre.midl.addTxIntention({
      evmTransaction: {
        to: factory as `0x${string}`,
        data: calldata as `0x${string}`,
      },
    });

    console.log("\n4. Executing via MIDL (BTC wrap + broadcast)...");
    const txInfo = await hre.midl.execute();

    console.log("\n═══════════════════════════════════════");
    console.log("  TOKEN CREATED SUCCESSFULLY");
    console.log("═══════════════════════════════════════");
    console.log("  TX Info:", JSON.stringify(txInfo, null, 2));
    console.log(
      `\n  View on Blockscout: https://blockscout.staging.midl.xyz`
    );
    console.log(
      `  View on Mempool:    https://mempool.staging.midl.xyz`
    );
  });
