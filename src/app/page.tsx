import Navbar from "@/components/Navbar";
import LaunchTerminal from "@/components/LaunchTerminal";
import TokenPreviewCard from "@/components/TokenPreviewCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="mb-12 text-center lg:text-left">
          <h1 className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
            LAUNCH YOUR{" "}
            <span className="text-accent">TOKEN</span>
          </h1>
          <p className="font-mono text-sm text-muted max-w-xl mx-auto lg:mx-0">
            Deploy bonding curve tokens on MIDL Network with a single prompt.
            Powered by AI. Secured by Bitcoin.
          </p>

          {/* Decorative line */}
          <div className="mt-6 flex items-center gap-2 justify-center lg:justify-start">
            <span className="w-8 h-px bg-accent inline-block" />
            <span className="font-mono text-[10px] text-muted tracking-widest uppercase">
              Midl Network Hackathon
            </span>
            <span className="w-8 h-px bg-accent inline-block" />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Terminal — takes more space */}
          <div className="lg:col-span-3">
            <LaunchTerminal />
          </div>

          {/* Preview Card */}
          <div className="lg:col-span-2">
            <TokenPreviewCard />
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="mt-12 border border-border bg-surface px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 inline-block animate-pulse" />
              <span className="font-mono text-[10px] text-muted tracking-wider">
                MIDL TESTNET
              </span>
            </div>
            <span className="text-border">|</span>
            <span className="font-mono text-[10px] text-muted tracking-wider">
              BLOCK #1,247,832
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-muted tracking-wider">
              GAS: <span className="text-accent">12 sat/vB</span>
            </span>
            <span className="text-border">|</span>
            <span className="font-mono text-[10px] text-muted tracking-wider">
              TOKENS LAUNCHED: <span className="text-white">342</span>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
