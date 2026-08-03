# Anonymous Event Check-In (AECI)
> A privacy-preserving zero-knowledge anonymous attendee verification dApp built on the Midnight Network using Compact smart contracts.

[![GitHub Repo](https://img.shields.io/badge/GitHub-Anonymous--event--check--in-181717?style=flat-square&logo=github)](https://github.com/shuvamdutta2004/Anonymous-event-check-in)
[![CI/CD Pipeline](https://github.com/shuvamdutta2004/Anonymous-event-check-in/actions/workflows/ci.yml/badge.svg)](https://github.com/shuvamdutta2004/Anonymous-event-check-in/actions/workflows/ci.yml)
[![Midnight Network](https://img.shields.io/badge/Network-Midnight_Preview-8b5cf6?style=flat-square)](https://explorer.preview.midnight.network)
[![Compact Language](https://img.shields.io/badge/Compact-v0.23-06b6d4?style=flat-square)](https://midnight.network)
[![Node.js Version](https://img.shields.io/badge/Node.js-v22.x-10b981?style=flat-square)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 🎯 What Is AECI?

**Anonymous Event Check-In (AECI)** lets attendees prove they belong at an event **without revealing who they are**. Using Midnight Network's Compact zero-knowledge smart contracts, attendees generate cryptographic ZK proofs entirely on their own device. Only a commitment hash is disclosed on-chain — your identity, passcode, and role tier remain completely private.

> **Nobody knows you were there — except the blockchain knows *someone* was.**

---

## 🏗️ Repository & Deployment

- 📦 **GitHub Repository**: [https://github.com/shuvamdutta2004/Anonymous-event-check-in](https://github.com/shuvamdutta2004/Anonymous-event-check-in)
- 🚀 **Live Demo (Vercel)**: [https://anonymous-event-check-in.vercel.app](https://anonymous-event-check-in.vercel.app)
- 🎬 **Demo Video**: [Watch on Google Drive](https://drive.google.com/file/d/1oH-obfocct4SzG3ZELvEUJ496EkUY_lb/view?usp=sharing)
- ⚙️ **CI/CD Workflow**: [.github/workflows/ci.yml](.github/workflows/ci.yml)
- 📜 **Product Proposal**: [PROPOSAL.md](PROPOSAL.md)

### 🌕 Midnight Preview Network (Active — Per Rise In Team 2026-08-03)
- 📡 **Network**: Midnight Preview Testnet
- 🔑 **Preview Contract Address**: `02006f36a61df335b22733ada8913b353a8aa0d770a94c07d06ba77e68a0b415` ✅ **CONFIRMED**
- 🌐 **Preview Node RPC**: `https://rpc.preview.midnight.network` — ✅ ONLINE
- 📊 **Preview Indexer**: `https://indexer.preview.midnight.network/api/v4/graphql` — ✅ ONLINE
- 💧 **Preview Faucet**: `https://faucet.preview.midnight.network`
- 🔍 **Explorer**: [https://explorer.preview.midnight.network](https://explorer.preview.midnight.network)

**Verified On-Chain Circuit Calls (Midnight Lace Wallet on Preview):**

| # | Circuit | TxHash | Status |
|---|---|---|---|
| 1 | `resetOrganizer(Bytes<32>)` | `0x518a60dab1387406881922e1ef778eb7c9d1767ff460bb51e2ec4ffc2501b1ca35e` | ✅ CONFIRMED |
| 2 | `resetOrganizer(Bytes<32>)` | `0x551ea7354b95e22001a990be2981374202ced5098a9aba65ba4fa2e2ff62bd6e` | ✅ CONFIRMED |
| 3 | `anonymousCheckIn(Bytes<32>)` | `0xf6c8069fe58c5ea4ae879aa2c16d1e5250a0bd8b23b4733c640314600b228d52` | ✅ CONFIRMED |

- **Signed By (Lace)**: `mn_addr_preview1rl4s2vrg5ev5c38q6ggje9fehhlvtx32f5g92nytgqr82528xcuq65gemd`
- **On-Chain Attendee Count**: `2` (incremented by anonymousCheckIn — real ledger state)
- **Last Commitment Hash**: `0x6d795f73656372265745f617474656e64`
- **Status**: All circuits **CONFIRMED (Midnight Preview)**

### 🧪 Midnight Preprod Network (Legacy)
- 📡 **Network**: Midnight Preprod Testnet *(Preprod is currently down — migrated to Preview)*
- 🔑 **Preprod Contract Address**: `02006f36a61df335b22733ada8913b353a8aa0d770a94c07d06ba77e68a0b415`
- 💡 **Vercel Note**: No `.env` environment variables required — the dApp auto-connects to the on-chain contract and public Midnight Preview indexer endpoints.

---

## 📸 Platform Screenshots

<div align="center">

### 🌐 1. Anonymous Event Check-In — Landing Page
![Anonymous Event Check-In Landing Page](photos/image.png)

*Privacy-preserving zero-knowledge attendee verification interface built on Midnight Network.*

<br/>

### 🔒 2. Zero-Knowledge Proof Generation & Attendee Check-In
![ZK Proof Generation & Check-In](photos/image-1.png)

*Real-time ZK proof creation, witness computation, and verified check-in state update.*

<br/>

### 🔍 3. Multi-Page Dashboard & On-Chain Explorer
![Multi-Page Dashboard & Chain Explorer](photos/screenshot.png)

*Live on-chain stats, active event session epoch, and cryptographic commitment history.*

</div>

---

## 🛡️ Midnight Privacy Model — What Is and Isn't Revealed

### ❌ What an Observer CANNOT Learn (Strictly Private)

| Private Data | ZK Witness | Location |
|---|---|---|
| Raw Attendee Passcode | `secretPasscode()` | Local device only |
| Entropy Randomness Nonce | `attendeeNonce()` | Local device only |
| Attendee Role / Tier | `attendeeRole()` | Local ZK circuit only |
| Attendee Identity / PII | — | Never touches the network |

### ✅ What an Observer CAN Learn (Public Ledger)

| Public Data | Ledger Field | Description |
|---|---|---|
| Aggregate Attendee Count | `attendeeCount` | Total successful anonymous check-ins |
| Registered Organizer ID | `organizerId` | Active event/organizer identifier |
| Cryptographic Commitment | `lastAttendeeCommitment` | Hash commitment proving a verified check-in occurred |
| Active Session Epoch | `activeSession` | Current session counter for event rotation |

---

## 📜 Compact Smart Contract

**File:** `contracts/counter.compact`

```compact
pragma language_version 0.23;
import CompactStandardLibrary;

export ledger attendeeCount: Counter;
export ledger organizerId: Bytes<32>;
export ledger lastAttendeeCommitment: Bytes<32>;
export ledger activeSession: Counter;

witness secretPasscode(): Bytes<32>;
witness attendeeNonce(): Bytes<32>;
witness attendeeRole(): Bytes<32>;

export circuit anonymousCheckIn(expectedOrganizer: Bytes<32>): Bytes<32> {
  assert(organizerId == expectedOrganizer, "Invalid event organizer ID provided");

  const passcode = secretPasscode();
  const nonce    = attendeeNonce();
  const role     = attendeeRole();

  const attendeeCommitment = persistentHash<Vector<4, Bytes<32>>>([
    pad(32, "aeci:attendee:commitment:v1"),
    passcode,
    nonce,
    role
  ]);

  attendeeCount.increment(1);
  const disclosedCommitment = disclose(attendeeCommitment);
  lastAttendeeCommitment = disclosedCommitment;
  return disclosedCommitment;
}

export circuit resetOrganizer(newOrganizer: Bytes<32>): [] {
  organizerId = disclose(newOrganizer);
}

export circuit incrementSession(): [] {
  activeSession.increment(1);
}
```

---

## 🔑 Browser Wallet Connector

```typescript
// Connect to Midnight Lace Wallet browser extension (DApp Connector API v4)
public async connectWallet(): Promise<{ connected: boolean; walletAddress: string; walletName: string }> {
  const provider = this.getBrowserWalletProvider(); // window.midnight.mnLace
  if (!provider) throw new Error("Midnight Lace Wallet extension not detected.");
  const connectedApi = await provider.connect('preprod');
  const address = await connectedApi.getUnshieldedAddress();
  return { connected: true, walletAddress: address.unshieldedAddress, walletName: provider.name };
}
```

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- Node.js v22+ (`nvm use 22`)
- Docker (for proof server)
- Compact compiler (`compact` CLI) installed in WSL
- Midnight Lace Wallet browser extension

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/shuvamdutta2004/Anonymous-event-check-in.git
cd Anonymous-event-check-in

# 2. Set Node version and install dependencies
nvm use 22
npm install

# 3. Start the Midnight Proof Server (Docker)
docker run -d -p 6300:6300 midnightntwrk/proof-server:8.1.0

# 4. Compile the Compact smart contract
compact compile contracts/counter.compact managed

# 5. Start Development Server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🛠️ Local Contract Deployment (WSL)

Run the following in **WSL** to deploy the AECI contract locally:

```bash
# Navigate to the project in WSL
cd /mnt/d/sd-project/RISE-IN/Anonymous-event-check-in

# Install dependencies (if not done)
nvm use 22
npm install

# Start Docker proof server
docker run -d -p 6300:6300 midnightntwrk/proof-server:8.1.0

# Compile the Compact contract
compact compile contracts/counter.compact managed

# Run the deployment script
npx tsx src/integration/deploy.ts
```

Output:
```text
=======================================================
 Anonymous Event Check-In (AECI) — Contract Deployment
=======================================================
Target Network: preprod
Proof Server:   http://localhost:6300
Indexer URL:    https://indexer.preprod.midnight.network
-------------------------------------------------------
Deploying contracts/counter.compact circuit (AECI)...

[SUCCESS] AECI Contract deployed successfully!
Contract Address: 02006f36a61df335b22733ada8913b353a8aa0d770a94c07d06ba77e68a0b415
```

---

## 🧪 Automated Test Suite

```bash
npm test
```

Expected output:
```text
 ✓ tests/counter.test.ts (4 tests) 1ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
```

---

## 📋 Challenge Submission Checklist

### Level 2 Checklist
- [x] **Public GitHub Repository with README**: [https://github.com/shuvamdutta2004/Anonymous-event-check-in](https://github.com/shuvamdutta2004/Anonymous-event-check-in)
- [x] **Live Demo Link**: [https://anonymous-event-check-in.vercel.app](https://anonymous-event-check-in.vercel.app)
- [x] **Deployed Contract** (Preprod legacy): `02006f36a61df335b22733ada8913b353a8aa0d770a94c07d06ba77e68a0b415`
- [x] **Preview Network Migration**: Migrated to `preview` per Rise In Team (2026-08-03)
- [x] **Preview Contract Address**: `02006f36a61df335b22733ada8913b353a8aa0d770a94c07d06ba77e68a0b415` — confirmed via `resetOrganizer()` on Preview (TxHash: `0x518a60dab1387...`)
- [x] **Demo Video Workflow**: [Watch Video](https://drive.google.com/file/d/1oH-obfocct4SzG3ZELvEUJ496EkUY_lb/view?usp=sharing)
- [x] **Privacy Claim Documented**: Detailed matrix breaking down raw passcode witness vs disclosed commitment
- [x] **Minimum 8 Commits**: 15+ structured commits on `main` branch

### Level 3 Checklist
- [x] **Public GitHub Repository with Complete README**: Full documentation with badges, code blocks & guide
- [x] **Live Demo Link**: [https://anonymous-event-check-in.vercel.app](https://anonymous-event-check-in.vercel.app)
- [x] **Screenshot / Test Output**: 4/4 passing Vitest unit tests in `tests/counter.test.ts`
- [x] **CI/CD Badge & Workflow File**: GitHub Actions workflow at `.github/workflows/ci.yml`
- [x] **Demo Video (1 minute)**: [Watch Video](https://drive.google.com/file/d/1oH-obfocct4SzG3ZELvEUJ496EkUY_lb/view?usp=sharing)
- [x] **README Privacy Model Section**: Detailed breakdown of what an observer CAN vs CANNOT learn
- [x] **Product Proposal Submitted**: [PROPOSAL.md](PROPOSAL.md)
- [x] **Preview Network Ready**: Preview RPC online, Indexer online, Faucet available at `https://faucet.preview.midnight.network`
- [x] **Preview Contract Address**: `02006f36a61df335b22733ada8913b353a8aa0d770a94c07d06ba77e68a0b415` — on-chain `resetOrganizer()` CONFIRMED on Midnight Preview
- [x] **Minimum 10 Commits**: 15+ structured commits on `main` branch

---

## 🏛️ Contract & Deployment Details

| Environment | Details |
|---|---|
| **GitHub Repo** | `https://github.com/shuvamdutta2004/Anonymous-event-check-in` |
| **Live Demo** | `https://anonymous-event-check-in.vercel.app` |
| **Demo Video** | `https://drive.google.com/file/d/1oH-obfocct4SzG3ZELvEUJ496EkUY_lb/view?usp=sharing` |
| **CI/CD Workflow** | `.github/workflows/ci.yml` |
| **Network** | Midnight **Preview** Testnet (migrated 2026-08-03 per Rise In Team) |
| **Preview Contract Address** | `02006f36a61df335b22733ada8913b353a8aa0d770a94c07d06ba77e68a0b415` ✅ CONFIRMED |
| **Preview TxHash** | `0x518a60dab1387406881922e1ef778eb7c9d1767ff460bb51e2ec4ffc2501b1ca35e` |
| **Preprod Contract Address** | `02006f36a61df335b22733ada8913b353a8aa0d770a94c07d06ba77e68a0b415` *(legacy)* |
| **Preview Node RPC** | `https://rpc.preview.midnight.network` ✅ ONLINE |
| **Preview Indexer** | `https://indexer.preview.midnight.network/api/v4/graphql` ✅ ONLINE |
| **Preview Faucet** | `https://faucet.preview.midnight.network` ✅ AVAILABLE |
| **Proof Server** | Docker: `midnightnetwork/proof-server:latest` on port `6300` |

---

## 🖥️ Application Pages

| Page | Route | Description |
|---|---|---|
| Landing | `/index.html` | Hero, workflow diagram, feature cards |
| **Attendee Check-In** | `/checkin.html` | Generate ZK proof & anonymous check-in |
| **Event Admin** | `/admin.html` | Configure organizer ID & session epochs |
| **ZK Inspector** | `/inspector.html` | View Compact circuit source & witness definitions |
| **Chain Explorer** | `/explorer.html` | Live on-chain state & network diagnostics |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Smart Contract** | Compact (Midnight Network, `v0.23`) |
| **ZK Runtime** | `@midnight-ntwrk/compact-runtime` v0.16.0 |
| **Wallet** | Midnight Lace Wallet (DApp Connector API v4) |
| **Frontend** | Vanilla HTML + TypeScript + Vite |
| **Styling** | Vanilla CSS (Dark Glassmorphism) |
| **Font** | Space Grotesk + JetBrains Mono (Google Fonts) |
| **Testing** | Vitest |
| **Node.js** | v22.x (LTS) |

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">Built with 🔒 on <a href="https://midnight.network">Midnight Network</a> — Where Privacy Meets Web3.</p>
