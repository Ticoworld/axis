export * from "../../node_modules/viem/_esm/actions/index.js";

import { estimateGas } from "../../node_modules/viem/_esm/actions/index.js";

export async function estimateGasMulti(client, { transactions, stateOverride, account }) {
  const gasEstimates = await Promise.all(
    transactions.map((transaction) =>
      estimateGas(client, {
        ...transaction,
        stateOverride,
        account,
      })
    )
  );

  return gasEstimates;
}