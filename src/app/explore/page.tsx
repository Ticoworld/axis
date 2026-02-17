'use client';

import React, { useState, useEffect } from 'react';

// --- Types ---
interface TokenData {
  id: string;
  ticker: string;
  name: string;
  price: string;
  marketCap: string;
  volume24h: string;
  change24h: string;
}

interface LogEntry {
  id: string;
  message: string;
  type: 'buy' | 'sell' | 'deploy';
  timestamp: string;
}

// --- Dummy Data ---
const DUMMY_TOKENS: TokenData[] = [
  { id: '1', ticker: 'NEURA', name: 'Neural Net', price: '$0.0421', marketCap: '$4.2M', volume24h: '$1.2M', change24h: '+12.4%' },
  { id: '2', ticker: 'SYNTH', name: 'Synthwave', price: '$1.20', marketCap: '$12.0M', volume24h: '$850K', change24h: '-3.2%' },
  { id: '3', ticker: 'VOID', name: 'The Void', price: '$0.0009', marketCap: '$900K', volume24h: '$45K', change24h: '+45.1%' },
  { id: '4', ticker: 'CYBER', name: 'Cyber Edge', price: '$0.15', marketCap: '$1.5M', volume24h: '$120K', change24h: '+2.1%' },
  { id: '5', ticker: 'GLITCH', name: 'Glitch Protocol', price: '$0.088', marketCap: '$880K', volume24h: '$300K', change24h: '-8.5%' },
  { id: '6', ticker: 'CORE', name: 'Core Systems', price: '$2.50', marketCap: '$25.0M', volume24h: '$5.5M', change24h: '+1.0%' },
];

const TICKER_TAPE = [
  { pair: 'BTC/USD', price: '64,231.50', change: '+2.4%' },
  { pair: 'ETH/USD', price: '3,452.12', change: '-1.1%' },
  { pair: 'SOL/USD', price: '145.67', change: '+5.7%' },
  { pair: 'NEURA/USD', price: '0.0421', change: '+12.4%' },
  { pair: 'SYNTH/USD', price: '1.20', change: '-3.2%' },
  { pair: 'VOID/USD', price: '0.0009', change: '+45.1%' },
  { pair: 'AXIS/USD', price: '0.85', change: '+3.3%' },
];

// --- Components ---

const Marquee = () => {
  return (
    <div className="w-full bg-[#0A0A0A] border-b border-[#333333] overflow-hidden whitespace-nowrap h-8 flex items-center">
      <div className="animate-marquee inline-flex">
        {[...TICKER_TAPE, ...TICKER_TAPE, ...TICKER_TAPE].map((item, i) => (
          <div key={i} className="mx-6 font-mono text-xs flex items-center gap-2">
            <span className="text-gray-400">{item.pair}</span>
            <span className="text-white">{item.price}</span>
            <span className={item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MarketCard = ({ token }: { token: TokenData }) => {
  return (
    <div className="group bg-[#0A0A0A] border border-[#333333] p-6 hover:border-[#FF5722] transition-colors duration-200 cursor-pointer h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white text-lg font-bold group-hover:text-[#FF5722] transition-colors duration-200">
            ${token.ticker}
          </h3>
          <p className="text-gray-500 text-sm mt-1">{token.name}</p>
        </div>
        <div className={`font-mono text-sm ${token.change24h.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
          {token.change24h}
        </div>
      </div>

      <div className="space-y-2 mt-8 font-mono text-sm">
        <div className="flex justify-between border-b border-[#1a1a1a] pb-2">
          <span className="text-gray-600">PRICE</span>
          <span className="text-white">{token.price}</span>
        </div>
        <div className="flex justify-between border-b border-[#1a1a1a] pb-2">
          <span className="text-gray-600">MCAP</span>
          <span className="text-white">{token.marketCap}</span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-gray-600">VOL.24H</span>
          <span className="text-gray-400">{token.volume24h}</span>
        </div>
      </div>
    </div>
  );
};

const SystemLog = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', message: 'Wallet bc1q...8a2f deployed $NEURA', type: 'deploy', timestamp: '10:42:01' },
    { id: '2', message: '0.5 BTC bought $VOID', type: 'buy', timestamp: '10:42:05' },
    { id: '3', message: '1.2 BTC bought $SYNTH', type: 'buy', timestamp: '10:42:12' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const actions = ['bought', 'sold', 'deployed'];
      const tokens = ['$NEURA', '$SYNTH', '$VOID', '$CYBER', '$GLITCH'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const amount = (Math.random() * 2).toFixed(2);
      
      const newLog: LogEntry = {
        id: Date.now().toString(),
        message: action === 'deployed' 
          ? `Wallet bc1q...${Math.floor(Math.random()*999)} deployed ${token}`
          : `${amount} BTC ${action} ${token}`,
        type: action as 'buy' | 'sell' | 'deploy',
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
      };

      setLogs(prev => [newLog, ...prev].slice(0, 10));
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full border-l border-[#333333] bg-[#050505] hidden lg:block w-80 fixed right-0 top-24 bottom-0 overflow-hidden font-mono text-xs">
      <div className="p-4 border-b border-[#333333] bg-[#0A0A0A]">
        <h3 className="text-[#FF5722] font-bold">SYSTEM_LOG</h3>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-gray-500">LIVE FEED</span>
        </div>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto h-full pb-20">
        {logs.map((log) => (
          <div key={log.id} className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between text-gray-600 mb-1">
              <span>[{log.timestamp}]</span>
              <span className={`uppercase ${
                log.type === 'buy' ? 'text-green-500' : 
                log.type === 'sell' ? 'text-red-500' : 'text-[#FF5722]'
              }`}>
                {log.type}
              </span>
            </div>
            <div className="text-gray-300">
              {log.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bootText, setBootText] = useState('');
  const targetText = 'ACTIVE MARKETS';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= targetText.length) {
        setBootText(targetText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const filteredTokens = DUMMY_TOKENS.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    token.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#000000] text-white pt-16 font-sans">
      <Marquee />
      
      <div className="flex">
        {/* Main Content Area */}
        <div className="flex-1 lg:mr-80 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Header Section */}
            <div className="mb-12 space-y-6">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white font-mono">
                {bootText}
                <span className="animate-pulse bg-[#FF5722] text-[#FF5722] inline-block w-4 h-8 md:h-12 align-middle ml-2">_</span>
              </h1>
              
              {/* Terminal Search Input */}
              <div className="relative max-w-xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-[#FF5722] font-mono">{'>'}</span>
                </div>
                <input
                  type="text"
                  placeholder="SEARCH_TICKER"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333333] py-3 pl-10 pr-4 text-white font-mono placeholder-gray-600 focus:outline-none focus:border-[#FF5722] transition-colors"
                />
              </div>
            </div>

            {/* Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 border-t border-l border-[#333333]">
              {filteredTokens.map((token) => (
                 <div key={token.id} className="border-b border-r border-[#333333]">
                    <MarketCard token={token} />
                 </div>
              ))}
              
              {filteredTokens.length === 0 && (
                 <div className="col-span-full py-12 text-center text-gray-500 font-mono border-b border-r border-[#333333]">
                    NO_RESULTS_FOUND
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <SystemLog />
      </div>
      
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </main>
  );
}
