"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { Wallet, Menu, X, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AddressPurpose } from "@midl/core";
import {
  useAccounts,
  useAddNetwork,
  useConnect,
  useDisconnect,
} from "@midl/react";
import { useToast } from "@/components/ui/Toast";

const MIDL_REGTEST_NETWORK = {
  name: "MIDL Regtest",
  network: "regtest" as const,
  rpcUrl: "https://mempool.staging.midl.xyz/api",  // Bitcoin mempool API with /api path
  indexerUrl: "https://api-regtest-midl.xverse.app/",  // Xverse-specific indexer endpoint (required for PSBT signing)
};

const formatAddress = (addr?: string) => {
  if (!addr) return "Connected";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

const formatBalance = (sats: number) => {
  return (sats / 1e8).toFixed(4);
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Close mobile menu on route change
    setMobileOpen(false);
  }, [pathname]);
  const [addingNetwork, setAddingNetwork] = useState(false);
  const [lastConnectorId, setLastConnectorId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const { toast } = useToast();
  const { accounts, isConnected } = useAccounts();
  const { disconnect } = useDisconnect();
  const { addNetworkAsync } = useAddNetwork();
  const { connectAsync, connectors } = useConnect({
    purposes: [AddressPurpose.Payment],
  });

  const currentAddress = accounts?.[0]?.address;
  const truncatedAddress = formatAddress(currentAddress);

  // Fetch balance when wallet connects
  useEffect(() => {
    if (!isConnected || !currentAddress) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const url = `https://mempool.staging.midl.xyz/api/address/${currentAddress}/utxo`;
        const res = await fetch(url);
        if (!res.ok) return;
        const utxos = await res.json();
        if (!Array.isArray(utxos)) return;
        const totalSats = utxos.reduce((sum: number, u: { value: number }) => sum + u.value, 0);
        setBalance(formatBalance(totalSats));
      } catch (err) {
        console.warn("Balance fetch failed:", err);
      }
    };

    fetchBalance();
  }, [isConnected, currentAddress]);

  /**
   * Attempt to register the MIDL regtest network with Xverse.
   * This tells the wallet to use mempool.staging.midl.xyz for UTXO
   * lookups instead of mempool.space.
   */
  const pushAddNetwork = useCallback(async (connectorId?: string) => {
    const resolvedConnectorId = connectorId ?? lastConnectorId;
    if (!resolvedConnectorId) {
      toast.warning("addNetwork: No wallet connector id found");
      return false;
    }
    setAddingNetwork(true);
    try {
      await addNetworkAsync({
        connectorId: resolvedConnectorId,
        networkConfig: MIDL_REGTEST_NETWORK,
      });
      toast.success("MIDL Regtest network added to Xverse");
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[AXIS] addNetwork failed:", msg);
      toast.warning("addNetwork: " + msg.slice(0, 120));
      return false;
    } finally {
      setAddingNetwork(false);
    }
  }, [addNetworkAsync, lastConnectorId, toast]);

  const handleConnect = async () => {
    if (isConnected) {
      disconnect();
      toast.info("Wallet disconnected");
      return;
    }

    const xverseConnector =
      connectors.find((item) => item.id.toLowerCase().includes("xverse")) ??
      connectors[0];

    if (!xverseConnector) {
      toast.error("No wallet connector found. Install Xverse and refresh.");
      return;
    }

    try {
      await connectAsync({ id: xverseConnector.id });
      setLastConnectorId(xverseConnector.id);

      // Required: tell Xverse about MIDL regtest mempool (official VibeHack guide)
      await pushAddNetwork(xverseConnector.id);

      toast.success("Wallet connected");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to connect wallet"
      );
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-bold tracking-widest text-white">
              AXIS
            </span>
            <span className="w-2 h-2 bg-accent inline-block" />
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="font-mono text-xs tracking-wider text-muted hover:text-accent transition-colors uppercase"
            >
              Launch
            </Link>
            <Link
              href="/explore"
              className="font-mono text-xs tracking-wider text-muted hover:text-accent transition-colors uppercase"
            >
              Explore
            </Link>
            <a
              href="#"
              className="font-mono text-xs tracking-wider text-muted hover:text-accent transition-colors uppercase"
            >
              Docs
            </a>
          </div>

          {/* Connect Wallet Button + Re-sync */}
          <div className="hidden md:flex items-center gap-2">
            {isConnected && (
              <button
                onClick={() => { void pushAddNetwork(); }}
                disabled={addingNetwork}
                title="Re-register MIDL network with Xverse (fixes mempool URL)"
                className="font-mono text-[10px] tracking-wider px-3 py-2.5 bg-black text-muted border border-border hover:border-accent hover:text-accent transition-all duration-150 uppercase flex items-center gap-1.5"
              >
                <RefreshCw size={12} className={addingNetwork ? "animate-spin" : ""} />
                Sync
              </button>
            )}
            <button
              onClick={() => {
                void handleConnect();
              }}
              className={`font-mono text-xs tracking-wider px-5 py-2.5 bg-black transition-all duration-150 uppercase
                ${
                  isConnected
                    ? "text-[#39FF14] border border-[#39FF14] shadow-[4px_4px_0px_0px_rgba(57,255,20,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                    : "text-accent border border-accent hover:bg-accent hover:text-black shadow-[4px_4px_0px_0px_rgba(255,87,34,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                }
              `}
            >
              <span className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
                    <span className="flex items-center gap-1.5">
                      <span>{truncatedAddress}</span>
                      {balance && (
                        <>
                          <span className="text-[#39FF14]/50">·</span>
                          <span className="text-xs">{balance} BTC</span>
                        </>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <Wallet size={14} />
                    Connect Wallet
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-muted hover:text-accent transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-black overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="font-mono text-xs tracking-wider text-muted hover:text-accent transition-colors uppercase"
              >
                Launch
              </Link>
              <Link
                href="/explore"
                onClick={() => setMobileOpen(false)}
                className="font-mono text-xs tracking-wider text-muted hover:text-accent transition-colors uppercase"
              >
                Explore
              </Link>
              <a
                href="#"
                onClick={() => setMobileOpen(false)}
                className="font-mono text-xs tracking-wider text-muted hover:text-accent transition-colors uppercase"
              >
                Docs
              </a>
              <button
                onClick={() => {
                  void handleConnect();
                  setMobileOpen(false);
                }}
                className={`font-mono text-xs tracking-wider w-full px-5 py-2.5 bg-black transition-all duration-150 uppercase
                  ${
                    isConnected
                      ? "text-[#39FF14] border border-[#39FF14] shadow-[4px_4px_0px_0px_rgba(57,255,20,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                      : "text-accent border border-accent hover:bg-accent hover:text-black shadow-[4px_4px_0px_0px_rgba(255,87,34,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                  }
                `}
              >
                <span className="flex items-center justify-center gap-2">
                  {isConnected ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
                      {truncatedAddress}
                    </>
                  ) : (
                    <>
                      <Wallet size={14} />
                      Connect Wallet
                    </>
                  )}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
