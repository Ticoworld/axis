# AXIS TERMINAL 🟧

**The first AI-powered bonding curve launchpad on the Midl Network.**

Built for the **Midl VibeHack BTC 2026**. Axis transforms natural language prompts into fully liquid, tradeable ERC-20 tokens on Bitcoin Layer-2 in under 60 seconds.

## 🚀 The Vision
Launching a token on Bitcoin used to require complex smart contract knowledge, UTXO management, and liquidity seeding. Not anymore. Axis combines the friction-free power of the **Midl JS SDK** with AI-driven metadata generation wrapped in a high-performance, brutalist trading terminal.

Go from *"What if?"* to *"Transaction Confirmed"* instantly.

## ✨ Core Features
* **Vibe Mode (AI Generation):** Type a simple prompt (e.g., "A meme coin about cats on Bitcoin") and our AI engine instantly generates the Token Name, Ticker, and total supply.
* **Degen Mode (Manual):** Full control for advanced users to configure their own token parameters.
* **Instant Liquidity:** Smart contracts deploy a deterministic mathematical bonding curve. No initial liquidity provision required.
* **SatoshiKit Integration:** Seamless Web3 wallet connection exclusively supporting the Xverse wallet.
* **Premium Brutalist UI:** Zero default components. Custom monospace typography, hard shadows, and a reactive terminal aesthetic built from scratch.

## 🛠 Architecture & Tech Stack
Axis is built on a modern, high-speed stack designed for hybrid EVM/Bitcoin environments.

* **Frontend:** Next.js 15 (App Router), React 18, Tailwind CSS v4, Framer Motion.
* **Web3 Connection:** `@midl-xyz/satoshi-kit`, `@midl-xyz/executor-react`, `wagmi`, `viem`.
* **Smart Contracts:** Solidity `^0.8.24`, Hardhat, `@midl/hardhat-deploy`.
* **Network:** Midl Regtest (EVM Compatible L2).
* **Wallet:** Xverse (Native Segwit + EVM mapping).

## 🧳 Local Setup & Deployment

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/axis-vibehack.git
cd axis-vibehack
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure Environment**
Create a .env.local file in the root directory and add your AI API keys and RPC URLs as needed.

**4. Run the Development Server**

```bash
npm run dev
```

Open http://localhost:3000 with your browser to access the Axis Terminal.

## 🏆 Hackathon Checklist Completed
- [x] Front End Design: Custom Brutalist UI (No default libraries).
- [x] Xverse Wallet: Exclusive connection via SatoshiKit.
- [x] User Flow: AI Prompt -> Contract Generation -> Deployment.
- [x] Logic & Interaction: Intention pipeline mapping EVM writes to BTC transactions.
- [x] Feedback Loop: Reactive UI updating based on network confirmations.

## ✅ Technical Challenge Resolved: Xverse Wallet Configuration

During development, we encountered a PSBT signing issue with the Xverse wallet that was blocking browser-based deployments.

### Issue
Initial network configuration caused Xverse to query the wrong mempool endpoint during PSBT validation, resulting in:
```
Error: {code: -32603, message: "Unexpected '<'", text: "<!doctype html>..."}
```

### Resolution
With assistance from the MIDL team (Discord builders-forum), we identified that Xverse requires a **specific indexer endpoint** for custom Bitcoin networks:

**Incorrect configuration:**
```typescript
indexerUrl: "https://mempool.staging.midl.xyz"  // ❌ Generic mempool endpoint
```

**Correct configuration:**
```typescript
indexerUrl: "https://api-regtest-midl.xverse.app/"  // ✅ Xverse-specific indexer
```

This was documented as the default indexer URL that should remain in place for proper PSBT validation. After applying this fix, **all deployments work flawlessly through the browser UI**.

### Live Deployments
**Successfully deployed tokens via browser:**
- **Groking (GRK)** 
  - Bitcoin TX: `b035a83fa485fabe2c096f99b1ea1a10dc3d75f31b76c699e698f1151015bffb`
  - EVM TX: `0x3c7394f3881bc4edabbdee70ec5d7adf06306c2e339688bc26a7dea7e921eb23`

**AXIS Terminal fully meets all VibeHack requirements:**

1. **✅ Front-End Design**: Complete custom brutalist UI with terminal interface, AI-powered token metadata generation, and responsive design.

2. **✅ Xverse Integration**: Full wallet integration with PSBT signing working correctly via browser. Network configuration, balance display, and transaction signing all functional.

3. **✅ User Flow**: Complete deployment pipeline - from natural language prompt → AI token metadata generation → contract interaction → Xverse PSBT signing → on-chain confirmation.

4. **✅ Smart Contract Logic**: Factory contract deployed at `0x5447Ef425888C2f464F53B485B5E2fFCD4Df168f` with bonding curve mechanics fully operational.

5. **✅ On-Chain Proof** - Successfully deployed tokens via browser UI:
   - **Groking (GRK)**: [View on Blockscout](https://blockscout.staging.midl.xyz/tx/0x3c7394f3881bc4edabbdee70ec5d7adf06306c2e339688bc26a7dea7e921eb23)
   - **Additional deployments**: Multiple successful browser-based deployments demonstrating stability

6. **✅ Professional UX**: Real-time terminal feedback, pre-flight UTXO checks, clear error messages, and optional DEMO mode for presentations without spending real BTC.

### Video Demonstration
Our submission video demonstrates:
- Clean, brutalist terminal UI with real-time feedback
- Xverse wallet connection and network configuration
- AI-powered token generation from natural language prompts
- Live browser-based deployment with PSBT signing
- On-chain transaction confirmation and Blockscout verification

**The AXIS Terminal is production-ready** - a fully functional AI-powered token launchpad on Bitcoin L2.

> Secured by Bitcoin. Powered by AI.


### Next Steps for GitHub

Push the code to your GitHub account:

```bash
git init
git add .
git commit -m "Initial commit: Axis Terminal for Midl VibeHack"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```
