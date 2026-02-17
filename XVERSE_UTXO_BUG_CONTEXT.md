# AXIS Terminal — Xverse signPSBT Bug: Full Root-Cause Analysis

## TL;DR

The MIDL SDK correctly fetches UTXOs and builds a PSBT from `mempool.staging.midl.xyz`.
It then sends the PSBT to Xverse via `sats-connect request("signPsbt", …)`.
**Inside the Xverse extension**, the wallet validates the PSBT inputs by fetching
UTXOs from its own internal mempool URL — but uses **`mempool.space` (public
mainnet)** instead of `mempool.staging.midl.xyz` (MIDL regtest).
`mempool.space` returns an HTML page for regtest addresses, causing:

```
{code: -32603, message: {name: "SyntaxError", message: "Unexpected '<'",
 text: "<!doctype html>...<title>mempool - Bitcoin Explorer</title>..."}}
```

The `addNetwork` call with `indexerUrl` is sent to Xverse but the extension
does not properly use it for PSBT input validation. **This is a Xverse wallet
extension bug, not fixable from app code.**

---

## Confirmed Code Path (SDK v3.0.2)

```
finalizeBTCTransactionAsync()          @midl/executor-react hook
  └─ finalizeBTCTransaction()          @midl/executor/actions
       ├─ estimateBTCTransaction()     gas estimate via EVM RPC ✓
       ├─ getTSSAddress()              TSS multisig via EVM RPC ✓
       └─ transferBTC()                @midl/core/actions
            ├─ getUTXOs()              → MempoolSpaceProvider.getUTXOs() ✓
            │   URL: mempool.staging.midl.xyz/api/address/{addr}/utxo
            ├─ coinSelect()            UTXO selection + PSBT build ✓
            └─ connection.signPSBT()   → SatsConnectConnector.signPSBT()
                 └─ request("signPsbt", {psbt, signInputs})
                      └─ XVERSE EXTENSION  ← ERROR HERE
                           validates inputs → fetches mempool.space → HTML → crash
```

### What Works

| Step | Status |
|------|--------|
| SDK UTXO fetch (MempoolSpaceProvider → mempool.staging.midl.xyz) | ✅ |
| EVM RPC (rpc.staging.midl.xyz) – all system contracts | ✅ |
| getTSSAddress, getBTCFeeRate | ✅ |
| PSBT construction (bitcoinjs-lib coinSelect) | ✅ |
| addNetwork call sent to Xverse (no error returned) | ✅ |
| Build compiles cleanly, zero warnings | ✅ |

### What Fails

| Step | Status |
|------|--------|
| Xverse signPsbt → internal UTXO validation → mempool.space → HTML | ❌ |

---

## Workarounds Implemented

### 1. Demo Mode (Terminal UI)
Toggle **DEMO** in the terminal title bar. Simulates the full deployment flow
with realistic delays — perfect for hackathon presentations.

### 2. CLI Token Deployment (bypasses Xverse completely)
```bash
cd contracts
npx hardhat create-token --name "Orbital" --symbol "ORB" --k 1000000000000
```
Uses the mnemonic from `.env` to sign BTC transactions server-side via
`@midl/hardhat-deploy`.

### 3. UTXO Pre-flight Check
Before attempting deployment, the terminal directly checks
`mempool.staging.midl.xyz/api/address/{addr}/utxo` and shows UTXO count + BTC balance.

### 4. Enhanced Error Detection
The Xverse mempool HTML bug is specifically detected with actionable fix
instructions shown in the terminal.

### 5. "Sync" Button (Navbar)
Manually re-sends `wallet_addNetwork` to Xverse with the MIDL regtest config.

---

## How to Fix Xverse (Best Chance)

1. **Export seed phrase** from current Xverse wallet
2. **Remove Xverse extension** completely from Chrome
3. **Reinstall** from Chrome Web Store
4. **Restore wallet** using seed phrase
5. **Click "Sync"** button in the AXIS nav bar, or manually add:
   - Name: `MIDL Regtest`
   - Network: `regtest`
   - RPC URL: `https://rpc.staging.midl.xyz`
   - BTC URL: `https://mempool.staging.midl.xyz/api`
   - Indexer URL: `https://mempool.staging.midl.xyz`
6. **Fund via faucet**: https://faucet.midl.xyz → send to the payment address
7. **Retry** token deployment

---

## Key Addresses

| What | Value |
|------|-------|
| Factory Contract | `0x5447Ef425888C2f464F53B485B5E2fFCD4Df168f` |
| Payment Address | `bcrt1qwr4zvzzhnddj3kf6wrtqx0pv4p7kj9pprfrahv` |
| EVM Address | `0x09465fd02fADE48b363dDaFEA2a464B80CDD3698` |
| Chain ID | 15001 (0x3a99) |

## SDK Key Files

| File | What |
|------|------|
| `@midl/executor/actions/finalizeBTCTransaction.mjs` | Orchestrates gas estimate + PSBT build |
| `@midl/core/actions/transferBTC.mjs:L42` | Fetches UTXOs via provider |
| `@midl/core/actions/transferBTC.mjs:L71` | Calls `connection.signPSBT()` — error triggers here |
| `@midl/connectors/providers/SatsConnectConnector.mjs:L44` | Sends `request("signPsbt")` to Xverse |
| `@midl/core/providers/mempool/MempoolSpaceProvider.mjs` | Correct URL map (regtest → mempool.staging.midl.xyz) |

## Official MIDL Docs

- Faucet: https://faucet.midl.xyz
- Mempool Explorer: https://mempool.staging.midl.xyz
- Blockscout (EVM): https://blockscout.staging.midl.xyz
- RPC URL: https://rpc.staging.midl.xyz
- VibeHack Guide: https://js.midl.xyz/guides/vibehack
- Network Endpoints: https://js.midl.xyz/guides/network-endpoints
- Interact with Contract: https://js.midl.xyz/guides/interact-contract
