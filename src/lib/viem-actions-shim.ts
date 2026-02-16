export * from "../../node_modules/viem/_esm/actions/index.js";

import { estimateGas } from "../../node_modules/viem/_esm/actions/index.js";

type EstimateGasMultiParams = {
  transactions: Array<Record<string, unknown>>;
  stateOverride?: unknown;
  account?: unknown;
};

export async function estimateGasMulti(
  client: unknown,
  { transactions, stateOverride, account }: EstimateGasMultiParams
): Promise<bigint[]> {
  const gasEstimates = await Promise.all(
    transactions.map((transaction) =>
      estimateGas(client as never, {
        ...(transaction as Record<string, unknown>),
        stateOverride,
        account,
      } as never)
    )
  );

  return gasEstimates;
}
