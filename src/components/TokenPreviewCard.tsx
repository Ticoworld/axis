"use client";

import { TrendingUp, Zap, Clock, BarChart3 } from "lucide-react";
import { motion } from "motion/react";

// Simple ASCII-style bonding curve visualization
function BondingCurve() {
  const points = Array.from({ length: 20 }, (_, i) => {
    const x = i / 19;
    const y = Math.pow(x, 1.8); // Exponential curve shape
    // Round to 2 decimal places to prevent hydration mismatch
    return { 
      x: +(x * 100).toFixed(2), 
      y: +((1 - y) * 100).toFixed(2) 
    };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div className="relative w-full h-32 border border-border bg-black p-2">
      {/* Grid lines */}
      <div className="absolute inset-2 opacity-10">
        {[...Array(5)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute w-full border-t border-white"
            style={{ top: `${(i + 1) * 20}%` }}
          />
        ))}
        {[...Array(5)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute h-full border-l border-white"
            style={{ left: `${(i + 1) * 20}%` }}
          />
        ))}
      </div>

      {/* SVG Curve */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)]"
      >
        {/* Gradient fill under curve */}
        <defs>
          <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF5722" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF5722" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${pathD} L 100 100 L 0 100 Z`}
          fill="url(#curveGrad)"
        />
        <motion.path
          d={pathD}
          fill="none"
          stroke="#FF5722"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        {/* Current price dot */}
        <motion.circle
          cx={points[12].x}
          cy={points[12].y}
          r="3"
          fill="#FF5722"
          vectorEffect="non-scaling-stroke"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
        />
      </svg>

      {/* Axis Labels */}
      <span className="absolute bottom-0 right-2 font-mono text-[8px] text-muted">
        SUPPLY →
      </span>
      <span className="absolute top-1 left-2 font-mono text-[8px] text-muted">
        PRICE ↑
      </span>
    </div>
  );
}

interface TokenData {
  name: string;
  ticker: string;
  supply: string;
  price: string;
  status: "ready" | "live" | "pending";
}

const SAMPLE_TOKEN: TokenData = {
  name: "Orbital",
  ticker: "ORB",
  supply: "1,000,000",
  price: "0.00042 BTC",
  status: "ready",
};

export default function TokenPreviewCard({
  token = SAMPLE_TOKEN,
}: {
  token?: TokenData;
}) {
  const statusConfig = {
    ready: { label: "READY TO LAUNCH", color: "text-accent", bg: "bg-accent/10", border: "border-accent" },
    live: { label: "LIVE", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400" },
    pending: { label: "PENDING", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400" },
  };

  const status = statusConfig[token.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full border border-border bg-surface shadow-[6px_6px_0px_0px_rgba(255,87,34,0.4)]"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Token Icon Placeholder */}
          <div className="w-10 h-10 border border-accent bg-accent/10 flex items-center justify-center">
            <span className="font-mono text-sm font-bold text-accent">
              {token.ticker.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white tracking-wide">
              {token.name}
            </h3>
            <span className="font-mono text-xs text-muted">${token.ticker}</span>
          </div>
        </div>
        <div
          className={`px-2 py-1 border ${status.border} ${status.bg}`}
        >
          <span className={`font-mono text-[10px] tracking-wider ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Bonding Curve */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={12} className="text-accent" />
          <span className="font-mono text-[10px] text-muted tracking-wider uppercase">
            Bonding Curve
          </span>
        </div>
        <BondingCurve />
      </div>

      {/* Token Stats */}
      <div className="grid grid-cols-3 border-t border-border">
        <div className="p-3 border-r border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={10} className="text-muted" />
            <span className="font-mono text-[9px] text-muted tracking-wider uppercase">
              Price
            </span>
          </div>
          <span className="font-mono text-xs text-white font-bold">
            {token.price}
          </span>
        </div>
        <div className="p-3 border-r border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={10} className="text-muted" />
            <span className="font-mono text-[9px] text-muted tracking-wider uppercase">
              Supply
            </span>
          </div>
          <span className="font-mono text-xs text-white font-bold">
            {token.supply}
          </span>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={10} className="text-muted" />
            <span className="font-mono text-[9px] text-muted tracking-wider uppercase">
              Network
            </span>
          </div>
          <span className="font-mono text-xs text-accent font-bold">MIDL</span>
        </div>
      </div>

      {/* Deploy Button */}
      <div className="p-4 border-t border-border">
        <button className="w-full font-mono text-xs tracking-wider py-3 bg-accent text-black hover:bg-accent-hover transition-all duration-150 uppercase flex items-center justify-center gap-2 font-bold shadow-[4px_4px_0px_0px_rgba(255,87,34,0.5)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
          <Zap size={14} />
          Launch on MIDL
        </button>
      </div>
    </motion.div>
  );
}
