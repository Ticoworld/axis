"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal, ChevronRight, Zap, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { encodeFunctionData } from "viem";
import { useAccounts, useWaitForTransaction } from "@midl-xyz/midl-js-react";
import {
  useAddTxIntention,
  useFinalizeBTCTransaction,
  useSendBTCTransactions,
  useSignIntention,
} from "@midl-xyz/midl-js-executor-react";

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

type LogLineType = "system" | "info" | "user" | "success" | "error";
type LogLine = { type: LogLineType; text: string };

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

  const name = normalized
    .split(" ")
    .slice(0, 2)
    .join(" ")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .slice(0, 24)
    .trim();

  const tickerSource = normalized.replace(/[^a-zA-Z]/g, "").toUpperCase();
  const ticker = (tickerSource.slice(0, 5) || fallbackTicker).toUpperCase();

  return { name: name || fallbackName, ticker };
}

export default function LaunchTerminal() {
  const [advancedMode, setAdvancedMode] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenTicker, setTokenTicker] = useState("");
  const [tokenSupply, setTokenSupply] = useState("1000000");
  const [history, setHistory] = useState<LogLine[]>(INITIAL_HISTORY);
  const [isTyping, setIsTyping] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const { isConnected } = useAccounts();
  const { addTxIntentionAsync } = useAddTxIntention();
  const { finalizeBTCTransactionAsync } = useFinalizeBTCTransaction();
  const { signIntentionAsync } = useSignIntention();
  const { sendBTCTransactionsAsync } = useSendBTCTransactions();
  const { waitForTransactionAsync } = useWaitForTransaction();
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const appendHistory = (...lines: LogLine[]) => {
    setHistory((prev) => [...prev, ...lines]);
  };

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
      if (!isConnected) {
        appendHistory({
          type: "error",
          text: "Wallet not connected. Connect wallet in header and retry.",
        });
        return;
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
        text: "Finalizing BTC transaction...",
      });

      const finalized = await finalizeBTCTransactionAsync();
      appendHistory({
        type: "system",
        text: `BTC tx prepared: ${finalized.tx.id}`,
      });

      appendHistory({
        type: "system",
        text: "Signing intention with Xverse...",
      });
      const signedSerializedTx = await signIntentionAsync({
        txId: finalized.tx.id,
        intention,
      });

      appendHistory({
        type: "system",
        text: "Broadcasting BTC + EVM transactions...",
      });
      const broadcastResult = await sendBTCTransactionsAsync({
        serializedTransactions: [signedSerializedTx],
        btcTransaction: finalized.tx.hex,
      });

      const evmTxHash = Array.isArray(broadcastResult)
        ? String(broadcastResult[0] ?? "")
        : String(broadcastResult ?? "");
      if (evmTxHash) {
        appendHistory({
          type: "system",
          text: `EVM tx hash: ${evmTxHash}`,
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
        }
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Transaction failed";
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
          </div>
        </div>

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

      {/* Terminal Body */}
      <div className="p-4 h-64 overflow-y-auto font-mono text-sm">
        {history.map((line, i) => (
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
                {line.text}
              </span>
            )}
            {line.type === "info" && (
              <span className="text-accent/70">
                <span className="text-accent mr-2">[TIP]</span>
                {line.text}
              </span>
            )}
            {line.type === "user" && (
              <span className="text-white">
                <span className="text-accent mr-2">{">"}</span>
                {line.text}
              </span>
            )}
            {line.type === "success" && (
              <span className="text-green-400">
                <span className="text-green-600 mr-2">[OK]</span>
                {line.text}
              </span>
            )}
            {line.type === "error" && (
              <span className="text-red-400">
                <span className="text-red-500 mr-2">[ERR]</span>
                {line.text}
              </span>
            )}
          </motion.div>
        ))}

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
              className="flex items-center"
            >
              <span className="text-accent font-mono text-sm pl-4 pr-2 py-3 select-none">
                <ChevronRight size={14} />
              </span>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Describe your token... e.g. "A meme coin about cats on Bitcoin"'
                className="flex-1 bg-transparent py-3 pr-4 font-mono text-sm text-white placeholder:text-border focus:outline-none"
              />
              <button
                type="submit"
                disabled={isDeploying}
                className="font-mono text-xs tracking-wider px-6 py-3 bg-accent text-black hover:bg-accent-hover transition-colors uppercase border-l border-border flex items-center gap-2"
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
