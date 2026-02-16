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
git clone [https://github.com/yourusername/axis-vibehack.git](https://github.com/yourusername/axis-vibehack.git)
cd axis-vibehack
2. Install dependencies

Bash
npm install
3. Configure Environment
Create a .env.local file in the root directory and add your AI API keys and RPC URLs as needed.

4. Run the Development Server

Bash
npm run dev
Open http://localhost:3000 with your browser to access the Axis Terminal.

🏆 Hackathon Checklist Completed
[x] Front End Design: Custom Brutalist UI (No default libraries).

[x] Xverse Wallet: Exclusive connection via SatoshiKit.

[x] User Flow: AI Prompt -> Contract Generation -> Deployment.

[x] Logic & Interaction: Intention pipeline mapping EVM writes to BTC transactions.

[x] Feedback Loop: Reactive UI updating based on network confirmations.

Secured by Bitcoin. Powered by AI.


### Next Steps for GitHub

Once you paste that in, open your terminal and push the code to your GitHub account:

```bash
git init
git add .
git commit -m "Initial commit: Axis Terminal for Midl VibeHack"
git branch -M main
(Then follow GitHub's instructions to link your remote repository and push).
```
