"use client";

import Link from "next/link";
import { useState } from "react";
import { Wallet, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AddressPurpose } from "@midl-xyz/midl-js-core";
import {
  useAddNetwork,
  useAccounts,
  useConnect,
  useDisconnect,
} from "@midl-xyz/midl-js-react";
import { useToast } from "@/components/ui/Toast";

const formatAddress = (addr?: string) => {
  if (!addr) return "Connected";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toast } = useToast();
  const { accounts, isConnected } = useAccounts();
  const { disconnect } = useDisconnect();
  const { addNetworkAsync } = useAddNetwork();
  const { connectAsync, connectors } = useConnect({
    purposes: [AddressPurpose.Payment],
  });

  const currentAddress = accounts?.[0]?.address;
  const truncatedAddress = formatAddress(currentAddress);

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
      toast.success("Wallet connected");

      try {
        await addNetworkAsync({
          connectorId: xverseConnector.id,
          networkConfig: {
            name: "MIDL Regtest",
            network: "regtest",
            rpcUrl: "https://rpc.staging.midl.xyz",
            indexerUrl: "https://mempool.staging.midl.xyz",
          },
        });
      } catch (networkError: unknown) {
        const message =
          networkError instanceof Error ? networkError.message : String(networkError);
        if (!/(already|exists|added)/i.test(message)) {
          toast.info(`Network setup note: ${message}`);
        }
      }
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

          {/* Connect Wallet Button */}
          <div className="hidden md:block">
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

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-muted hover:text-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
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
