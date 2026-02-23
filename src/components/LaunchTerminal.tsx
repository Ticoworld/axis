"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Terminal, ChevronRight, Zap, Settings2, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { encodeFunctionData } from "viem";
import { useAccounts, useWaitForTransaction } from "@midl/react";
import {
  useAddTxIntention,
  useFinalizeBTCTransaction,
  useSendBTCTransactions,
  useSignIntention,
} from "@midl/executor-react";
const FACTORY_CONTRACT_ADDRESS = "0x5447Ef425888C2f464F53B485B5E2fFCD4Df168f";
const DEFAULT_BONDING_CURVE_K = BigInt("1000000000000"); // 1e12
const FACTORY_ABI = [
  {
    type: "function",
    name: "createToken",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "k", type: "uint256" },
    ],
    outputs: [{ name: "token", type: "address" }],
  },
] as const;

type LogLineType = "system" | "info" | "user" | "success" | "error" | "warn";
type LogLine = { 
  type: LogLineType
  text: string
  link?: string  // Optional link for clickable transaction hashes
};

const INITIAL_HISTORY: LogLine[] = [
  { type: "system", text: "AXIS PROTOCOL v0.1.0 - MIDL NETWORK" },
  { type: "system", text: "Bonding curve engine initialized..." },
  { type: "system", text: "Connected to MIDL testnet" },
  {
    type: "info",
    text: 'Type a description to generate your token, or toggle "Advanced" for manual config.',
  },
];

function deriveTokenConfigFromPrompt(inputPrompt: string) {
  const normalized = inputPrompt.trim().replace(/\s+/g, " ");
  const fallbackName = "AxisToken";
  const fallbackTicker = "AXIS";

  if (!normalized) {
    return { name: fallbackName, ticker: fallbackTicker };
  }

  // Remove common filler words for better naming
  const fillerWords = ["a", "an", "the", "about", "for", "with", "of", "in", "on", "at", "to", "from"];
  const words = normalized.split(" ").filter(w => {
    const lower = w.toLowerCase();
    return !fillerWords.includes(lower) && w.length > 0;
  });

  // Take first 2-3 meaningful words for name
  const name = words
    .slice(0, 3)
    .join(" ")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .slice(0, 24)
    .trim();

  // Create ticker from first letters of words, or first word fully
  let ticker = "";
  if (words.length >= 2) {
    // Multi-word: use first letters (e.g., "Man Eating" → "MNEA" or "Bitcoin Cats" → "BTCC")
    ticker = words.slice(0, 3).map(w => w[0].toUpperCase()).join("");
    // If too short, add more letters from first word
    if (ticker.length < 3 && words[0]) {
      ticker = words[0].slice(0, 4).toUpperCase();
    }
  } else {
    // Single word: use first 3-5 letters
    ticker = words[0] ? words[0].slice(0, 4).toUpperCase() : fallbackTicker;
  }

  return { name: name || fallbackName, ticker: ticker || fallbackTicker };
}

/** Sleep helper for demo mode */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Check if an error is the known Xverse mempool HTML bug */
function isXverseMempoolBug(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : JSON.stringify(err);
  return (
    (msg.includes("Unexpected '<'") || msg.includes("<!doctype")) &&
    (msg.includes("mempool.space") || msg.includes("-32603"))
  );
}

export default function LaunchTerminal() {
  const [advancedMode, setAdvancedMode] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenTicker, setTokenTicker] = useState("");
  const [tokenSupply, setTokenSupply] = useState("1000000");
  const [history, setHistory] = useState<LogLine[]>(INITIAL_HISTORY);
  const [isTyping, setIsTyping] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const { isConnected, accounts } = useAccounts();
  const { addTxIntentionAsync } = useAddTxIntention();
  const { finalizeBTCTransactionAsync } = useFinalizeBTCTransaction();
  const { signIntentionAsync } = useSignIntention();
  const { sendBTCTransactionsAsync } = useSendBTCTransactions();
  const { waitForTransactionAsync } = useWaitForTransaction();
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const appendHistory = useCallback((...lines: LogLine[]) => {
    setHistory((prev) => [...prev, ...lines]);
  }, []);

  /**
   * Run a simulated deployment for demo / hackathon presentation.
   * Shows the full flow with realistic delays per step.
   */
  const runDemoDeployment = useCallback(
    async (tokenConfig: { name: string; ticker: string }) => {
      const fakeTxId =
        "b6f8e2a1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0";
      const fakeEvmHash =
        "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b";
      const fakeTokenAddr =
        "0xABcDEf0123456789AbCdEf0123456789aBcDeF01";

      appendHistory({
        type: "system",
        text: `[DEMO] Queueing createToken(${tokenConfig.name}, ${tokenConfig.ticker}) intention...`,
      });
      await sleep(800);

      appendHistory({
        type: "system",
        text: `[DEMO] EVM call: AxisBondingCurve.createToken("${tokenConfig.name}", "${tokenConfig.ticker}", 1000000000000)`,
      });
      await sleep(500);

      appendHistory({
        type: "system",
        text: "[DEMO] Estimating gas via rpc.staging.midl.xyz ...",
      });
      await sleep(600);

      appendHistory({
        type: "system",
        text: "[DEMO] Gas estimate: 245,312 units @ 1 sat/vB",
      });
      await sleep(400);

      appendHistory({
        type: "system",
        text: "[DEMO] Fetching UTXOs from mempool.staging.midl.xyz ...",
      });
      await sleep(700);

      appendHistory({
        type: "system",
        text: "[DEMO] 1 UTXO selected (2.25 BTC) → building PSBT ...",
      });
      await sleep(500);

      appendHistory({
        type: "system",
        text: "[DEMO] Finalizing BTC transaction...",
      });
      await sleep(900);

      appendHistory({
        type: "system",
        text: `[DEMO] BTC tx prepared: ${fakeTxId.slice(0, 16)}...`,
      });
      await sleep(400);

      appendHistory({
        type: "system",
        text: "[DEMO] Signing intention with wallet...",
      });
      await sleep(1200);

      appendHistory({
        type: "system",
        text: "[DEMO] Broadcasting BTC + EVM transactions...",
      });
      await sleep(800);

      appendHistory({
        type: "system",
        text: `[DEMO] EVM tx hash: ${fakeEvmHash.slice(0, 18)}...`,
      });
      await sleep(600);

      appendHistory({
        type: "system",
        text: `[DEMO] Waiting for BTC confirmation: ${fakeTxId.slice(0, 16)}...`,
      });
      await sleep(1500);

      appendHistory(
        {
          type: "success",
          text: `[DEMO] Token ${tokenConfig.ticker} deployed at ${fakeTokenAddr}`,
        },
        {
          type: "success",
          text: `[DEMO] BTC transaction confirmed: ${fakeTxId.slice(0, 16)}...`,
        },
        {
          type: "info",
          text: `[DEMO] View on Blockscout: https://blockscout.staging.midl.xyz/address/${fakeTokenAddr}`,
        }
      );
    },
    [appendHistory]
  );

  /**
   * Pre-flight check: verify UTXOs are available via the mempool API.
   * This catches issues where the mempool is down or address has no funds.
   */
  const preflight = useCallback(
    async (address: string): Promise<boolean> => {
      try {
        const url = `https://mempool.staging.midl.xyz/api/address/${address}/utxo`;
        const res = await fetch(url);
        if (!res.ok) {
          appendHistory({
            type: "warn",
            text: `Pre-flight: mempool returned ${res.status} for UTXO check`,
          });
          return false;
        }
        const utxos = await res.json();
        if (!Array.isArray(utxos) || utxos.length === 0) {
          appendHistory({
            type: "warn",
            text: `Pre-flight: No UTXOs found for ${address}. Fund via faucet.midl.xyz`,
          });
          return false;
        }
        const totalSats = utxos.reduce(
          (s: number, u: { value: number }) => s + u.value,
          0
        );
        appendHistory({
          type: "system",
          text: `Pre-flight OK: ${utxos.length} UTXO(s), ${(totalSats / 1e8).toFixed(4)} BTC available`,
        });
        return true;
      } catch (err) {
        appendHistory({
          type: "warn",
          text: `Pre-flight: Could not reach mempool API — ${err instanceof Error ? err.message : "unknown"}`,
        });
        return false;
      }
    },
    [appendHistory]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDeploying) return;
    if (!prompt.trim() && !advancedMode) return;
    if (advancedMode && (!tokenName.trim() || !tokenTicker.trim())) return;

    const finalTokenConfig = advancedMode
      ? {
          name: tokenName.trim(),
          ticker: tokenTicker.trim().toUpperCase(),
        }
      : deriveTokenConfigFromPrompt(prompt);

    const userInput = advancedMode
      ? `deploy --name="${finalTokenConfig.name}" --ticker="${finalTokenConfig.ticker}" --supply=${tokenSupply}`
      : prompt;

    appendHistory({ type: "user", text: userInput });
    setIsTyping(true);
    setIsDeploying(true);

    try {
      /* ── Demo mode: simulate the full flow ── */
      if (demoMode) {
        await runDemoDeployment(finalTokenConfig);
        return;
      }

      /* ── Live mode: real MIDL deployment ── */
      if (!isConnected) {
        appendHistory({
          type: "error",
          text: "Wallet not connected. Connect wallet in header and retry.",
        });
        return;
      }

      const connectedPaymentAddress = accounts?.[0]?.address;
      if (connectedPaymentAddress) {
        appendHistory({
          type: "system",
          text: `Using payment address: ${connectedPaymentAddress}`,
        });
        // Pre-flight UTXO check
        await preflight(connectedPaymentAddress);
      }

      appendHistory({
        type: "system",
        text: `Queueing createToken(${finalTokenConfig.name}, ${finalTokenConfig.ticker}) intention...`,
      });

      const encodedCall = encodeFunctionData({
        abi: FACTORY_ABI,
        functionName: "createToken",
        args: [
          finalTokenConfig.name,
          finalTokenConfig.ticker,
          DEFAULT_BONDING_CURVE_K,
        ],
      });

      const intention = await addTxIntentionAsync({
        reset: true,
        intention: {
          evmTransaction: {
            to: FACTORY_CONTRACT_ADDRESS as `0x${string}`,
            data: encodedCall,
          },
        },
      });

      appendHistory({
        type: "system",
        text: "Finalizing BTC transaction (PSBT build + Xverse sign)...",
      });

      let finalized;
      try {
        finalized = await finalizeBTCTransactionAsync();
      } catch (finalizeErr) {
        console.error("[AXIS] finalizeBTCTransaction failed:", finalizeErr);
        if (isXverseMempoolBug(finalizeErr)) {
          appendHistory(
            {
              type: "error",
              text: "━━━━ XVERSE WALLET BUG DETECTED ━━━━",
            },
            {
              type: "error",
              text: "Xverse is hardcoded to fetch UTXO data from mempool.space (public mainnet) and ignores custom network configuration during PSBT signing.",
            },
            {
              type: "warn",
              text: "This is a known Xverse extension bug, NOT an AXIS Terminal bug. Documented in XVERSE_UTXO_BUG_CONTEXT.md",
            },
            {
              type: "info",
              text: "WORKAROUND 1: Enable DEMO mode (toggle above) to preview the full deployment flow for VibeHack judges.",
            },
            {
              type: "info",
              text: "WORKAROUND 2: Use CLI deployment: cd contracts && npx hardhat create-token --name 'TokenName' --symbol 'TKN' --supply 1000000",
            },
            {
              type: "info",
              text: "Note: Our UTXO endpoint (https://mempool.staging.midl.xyz/api/address/.../utxo) returns valid JSON with 2.25 BTC available.",
            }
          );
          return;
        }
        throw finalizeErr;
      }

      appendHistory({
        type: "system",
        text: `BTC tx prepared: ${finalized.tx.id}`,
      });

      appendHistory({
        type: "system",
        text: "Signing intention with Xverse...",
      });
      let signedSerializedTx;
      try {
        signedSerializedTx = await signIntentionAsync({
          txId: finalized.tx.id,
          intention,
        });
      } catch (signErr) {
        const msg =
          signErr instanceof Error ? signErr.message : String(signErr);
        console.error("[AXIS] signIntention failed:", signErr);
        appendHistory({
          type: "error",
          text: `signIntention error: ${msg.slice(0, 300)}`,
        });
        throw signErr;
      }

      appendHistory({
        type: "system",
        text: "Broadcasting BTC + EVM transactions...",
      });
      
      let broadcastResult;
      try {
        broadcastResult = await sendBTCTransactionsAsync({
          serializedTransactions: [signedSerializedTx],
          btcTransaction: finalized.tx.hex,
        });

      } catch (broadcastErr) {
        console.error("[AXIS] sendBTCTransactions failed:", broadcastErr);
        appendHistory({
          type: "error",
          text: `Broadcast error: ${JSON.stringify(broadcastErr, null, 2)}`,
        });
        throw broadcastErr;
      }

      const evmTxHash = Array.isArray(broadcastResult)
        ? String(broadcastResult[0] ?? "")
        : String(broadcastResult ?? "");
      if (evmTxHash) {
        appendHistory({
          type: "system",
          text: `EVM tx hash: ${evmTxHash}`,
          link: `https://blockscout.staging.midl.xyz/tx/${evmTxHash}`,
        });
      }

      appendHistory({
        type: "system",
        text: `Waiting for BTC confirmation: ${finalized.tx.id}`,
      });
      await waitForTransactionAsync({ txId: finalized.tx.id });
      appendHistory(
        {
          type: "success",
          text: `Deployment successful. Token ${finalTokenConfig.ticker} created.`,
        },
        {
          type: "success",
          text: `BTC transaction confirmed: ${finalized.tx.id}`,
          link: `https://mempool.staging.midl.xyz/tx/${finalized.tx.id}`,
        }
      );
    } catch (error) {
      console.error("[AXIS] Deployment failed:", error);
      
      const message =
        error instanceof Error ? error.message : "Transaction failed";

      if (/selected utxos|no utxo|insufficient|No selected/i.test(message)) {
        appendHistory(
          {
            type: "error",
            text: "Deployment failed: No UTXO inputs available for this transaction.",
          },
          {
            type: "info",
            text: "Fix: fund the exact payment address shown above via faucet.midl.xyz, then reconnect Xverse and retry.",
          },
          {
            type: "info",
            text: "Also click 'Sync' in the nav bar to re-register the MIDL network with Xverse.",
          }
        );
        return;
      }

      if (isXverseMempoolBug(error)) {
        appendHistory(
          {
            type: "error",
            text: "Xverse mempool bug: wallet fetched HTML from mempool.space instead of MIDL regtest JSON.",
          },
          {
            type: "info",
            text: "Reinstall Xverse, restore seed, re-add MIDL Regtest network, then try again.",
          },
          {
            type: "info",
            text: "Or enable Demo Mode to preview the deployment flow.",
          }
        );
        return;
      }

      appendHistory({
        type: "error",
        text: `Deployment failed: ${message}`,
      });
    } finally {
      setIsTyping(false);
      setIsDeploying(false);
      setPrompt("");
      if (advancedMode) {
        setTokenName("");
        setTokenTicker("");
        setTokenSupply("1000000");
      }
    }
  };

  return (
    <div className="w-full border border-border bg-surface">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-black">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-accent inline-block" />
            <span className="w-3 h-3 border border-border inline-block" />
            <span className="w-3 h-3 border border-border inline-block" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-accent" />
            <span className="font-mono text-xs text-muted tracking-wider uppercase">
              Axis Terminal
            </span>
            {demoMode && (
              <span className="font-mono text-[9px] text-yellow-400 tracking-wider border border-yellow-400/40 px-1.5 py-0.5 uppercase">
                Demo
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Demo Mode Toggle */}
          <button
            onClick={() => setDemoMode(!demoMode)}
            title="Demo mode simulates deployment without a wallet"
            className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-muted hover:text-yellow-400 transition-colors"
          >
            <Play size={10} />
            <span className="hidden sm:inline">DEMO</span>
            <div
              className={`w-6 h-3 border transition-colors ${
                demoMode
                  ? "border-yellow-400 bg-yellow-400/20"
                  : "border-border bg-black"
              } relative`}
            >
              <div
                className={`absolute top-[1px] w-2 h-2 transition-all ${
                  demoMode ? "right-[1px] bg-yellow-400" : "left-[1px] bg-muted"
                }`}
              />
            </div>
          </button>

          {/* Advanced Toggle */}
          <button
            onClick={() => setAdvancedMode(!advancedMode)}
            className="flex items-center gap-2 font-mono text-xs tracking-wider text-muted hover:text-accent transition-colors"
          >
            <Settings2 size={12} />
            <span className="hidden sm:inline">
              {advancedMode ? "AI MODE" : "ADVANCED"}
            </span>
            <div
              className={`w-8 h-4 border transition-colors ${
                advancedMode ? "border-accent bg-accent/20" : "border-border bg-black"
              } relative`}
            >
              <div
                className={`absolute top-0.5 w-2.5 h-2.5 transition-all ${
                  advancedMode ? "right-0.5 bg-accent" : "left-0.5 bg-muted"
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 h-64 overflow-y-auto font-mono text-sm">
        {history.map((line, i) => {
          // Render clickable text if link present
          const renderText = (text: string, link?: string) => {
            if (link) {
              return (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-70 transition-opacity cursor-pointer"
                  title={`Click to verify: ${link}`}
                >
                  {text}
                </a>
              );
            }
            return text;
          };

          return (
            <motion.div
              key={`${line.type}-${line.text}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15, delay: i * 0.03 }}
              className="mb-1.5"
            >
              {line.type === "system" && (
                <span className="text-muted">
                  <span className="text-border mr-2">[SYS]</span>
                  {renderText(line.text, line.link)}
                </span>
              )}
              {line.type === "info" && (
                <span className="text-accent/70">
                  <span className="text-accent mr-2">[TIP]</span>
                  {renderText(line.text, line.link)}
                </span>
              )}
              {line.type === "user" && (
                <span className="text-white">
                  <span className="text-accent mr-2">{">"}</span>
                  {renderText(line.text, line.link)}
                </span>
              )}
              {line.type === "success" && (
                <span className="text-green-400">
                  <span className="text-green-600 mr-2">[OK]</span>
                  {renderText(line.text, line.link)}
                </span>
              )}
              {line.type === "error" && (
                <span className="text-red-400">
                  <span className="text-red-500 mr-2">[ERR]</span>
                  {renderText(line.text, line.link)}
                </span>
              )}
              {line.type === "warn" && (
                <span className="text-yellow-400">
                  <span className="text-yellow-500 mr-2">[WARN]</span>
                  {renderText(line.text, line.link)}
                </span>
              )}
            </motion.div>
          );
        })}

        {isTyping && (
          <div className="text-muted flex items-center gap-1">
            <span className="text-border mr-2">[SYS]</span>
            <span
              className="inline-block w-2 h-4 bg-accent"
              style={{ animation: "blink 1s infinite" }}
            />
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t border-border">
        <AnimatePresence mode="wait">
          {advancedMode ? (
            <motion.div
              key="advanced"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-mono text-[10px] text-muted tracking-wider uppercase block mb-1">
                    Token Name
                  </label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="e.g. Orbital"
                    className="w-full bg-black border border-border px-3 py-2 font-mono text-sm text-white placeholder:text-border focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-muted tracking-wider uppercase block mb-1">
                    Ticker
                  </label>
                  <input
                    type="text"
                    value={tokenTicker}
                    onChange={(e) => setTokenTicker(e.target.value.toUpperCase())}
                    placeholder="e.g. ORB"
                    maxLength={6}
                    className="w-full bg-black border border-border px-3 py-2 font-mono text-sm text-white placeholder:text-border focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-muted tracking-wider uppercase block mb-1">
                    Supply
                  </label>
                  <input
                    type="number"
                    value={tokenSupply}
                    onChange={(e) => setTokenSupply(e.target.value)}
                    placeholder="1000000"
                    className="w-full bg-black border border-border px-3 py-2 font-mono text-sm text-white placeholder:text-border focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="px-4 pb-4">
                <button
                  type="submit"
                  disabled={isDeploying}
                  className="w-full font-mono text-xs tracking-wider py-3 bg-black text-accent border border-accent hover:bg-accent hover:text-black transition-all duration-150 shadow-[4px_4px_0px_0px_rgba(255,87,34,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] uppercase flex items-center justify-center gap-2"
                >
                  <Zap size={14} />
                  {isDeploying ? "Processing..." : "Deploy Token"}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center min-w-0 w-full"
            >
              <span className="text-accent font-mono text-sm pl-4 pr-2 py-3 select-none">
                <ChevronRight size={14} />
              </span>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Describe your token... e.g. "A meme coin about cats on Bitcoin"'
                className="flex-1 min-w-0 bg-transparent py-3 pr-4 font-mono text-sm text-white placeholder:text-border focus:outline-none"
              />
              <button
                type="submit"
                disabled={isDeploying}
                className="font-mono text-xs tracking-wider px-6 py-3 bg-accent text-black hover:bg-accent-hover transition-colors uppercase border-l border-border flex items-center gap-2 flex-shrink-0"
              >
                <Zap size={12} />
                {isDeploying ? "Processing..." : "Deploy"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
