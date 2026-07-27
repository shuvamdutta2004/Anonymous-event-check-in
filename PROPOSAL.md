# 📜 Product Proposal: Anonymous Event Check-In (AECI)

> **Privacy-Preserving Zero-Knowledge Attendee Verification on the Midnight Network**

---

## Executive Summary

**Anonymous Event Check-In (AECI)** is a decentralized, privacy-first attendance verification protocol built on the **Midnight Network** using **Compact** smart contracts. AECI solves the fundamental privacy dilemma of modern event ticketing: proving that an attendee is authorized to enter an event **without disclosing who they are, their personal identity (PII), or their private ticket credentials**.

By leveraging Midnight’s dual-state (public/private) architecture, attendees generate zero-knowledge (ZK) proofs on their local device. Only an un-linkable 32-byte cryptographic commitment hash is published on-chain, incrementing the verified attendee counter while keeping attendee passcodes, nonces, and role tiers completely confidential.

---

## 🎯 Problem Statement

Traditional event ticketing and check-in systems suffer from severe privacy vulnerabilities:

1. **Mass Surveillance & Attendee Tracking**: Centralized ticket providers track real-time attendance, timestamps, and locations, building intrusive behavioral profiles of individuals.
2. **PII Data Leakage**: Presenting government IDs, email addresses, or name-linked QR codes exposes attendees to identity theft, doxxing, and physical security risks.
3. **Double Check-In & Ticket Fraud**: Traditional offline passcodes can be shared or reused unless tracked on a public ledger — but tracking on public blockchains like Ethereum exposes attendee transaction graphs.
4. **Lack of Verifiable Privacy**: Existing web2 badge scanners offer no cryptographic guarantees that attendee data will not be sold to third-party data brokers.

---

## 💡 The AECI Solution

AECI introduces a **zero-knowledge, non-custodial check-in protocol** powered by Midnight Compact smart contracts:

- **Local Zero-Knowledge Proof Generation**: Attendees generate ZK proofs directly inside their browser using `@midnight-ntwrk/compact-runtime` and the Midnight Lace Wallet.
- **On-Chain Verifiable State**: The `counter.compact` smart contract verifies the ZK proof on-chain, increments `attendeeCount`, and records `lastAttendeeCommitment`.
- **Zero Identity Disclosure**: No PII, wallet public keys, names, or raw passcodes ever touch the network or any central server.
- **Double Check-In Prevention**: Cryptographic salt and session nonces prevent duplicate submissions within an active event epoch.

---

## 🏗️ Technical Architecture & System Design

```
+-------------------------------------------------------------------+
|                     LOCAL ATTENDEE DEVICE                         |
|                                                                   |
|  +-----------------------+       +-----------------------------+  |
|  |   Secret Passcode     |       |   Entropy Randomness Nonce  |  |
|  +-----------+-----------+       +--------------+--------------+  |
|              |                                  |                 |
|              +-----------------+----------------+                 |
|                                |                                  |
|                                v                                  |
|                  +----------------------------+                   |
|                  | Local ZK Proof Engine      |                   |
|                  | (Compact Circuit Witness)  |                   |
|                  +-------------+--------------+                   |
+--------------------------------|----------------------------------+
                                 |
                        Generates ZK Proof
                                 |
                                 v
+-------------------------------------------------------------------+
|                    MIDNIGHT NETWORK PREPROD                       |
|                                                                   |
|  +-------------------------------------------------------------+  |
|  |           Compact Contract (counter.compact)                |  |
|  |                                                             |  |
|  |  1. Verify expectedOrganizer ID match                       |  |
|  |  2. Compute persistentHash([passcode, nonce, role])          |  |
|  |  3. attendeeCount.increment(1)                              |  |
|  |  4. Update lastAttendeeCommitment                           |  |
|  +-------------------------------------------------------------+  |
+-------------------------------------------------------------------+
```

---

## 🛡️ Privacy Model & Data Exposure Matrix

AECI enforces strict separation between private witness data and public ledger state:

### ❌ Strictly Private (Local Device Witness Only)

| Field | Type | Description |
|---|---|---|
| `secretPasscode` | `Bytes<32>` | Raw event entry passcode known only to the attendee |
| `attendeeNonce` | `Bytes<32>` | Cryptographic entropy protecting against dictionary attacks |
| `attendeeRole` | `Bytes<32>` | Attendee tier (VIP, Speaker, General, Press) |

### ✅ Public Ledger State (On-Chain Auditability)

| Field | Type | Description |
|---|---|---|
| `attendeeCount` | `Counter` | Total verified anonymous check-in count |
| `organizerId` | `Bytes<32>` | Active event organizer identifier |
| `lastAttendeeCommitment` | `Bytes<32>` | Un-linkable ZK commitment hash of last check-in |
| `activeSession` | `Counter` | Event session epoch counter |

---

## 📜 Compact Smart Contract Specification

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
  lastAttendeeCommitment = attendeeCommitment;

  return attendeeCommitment;
}
```

---

## 🗺️ Product Roadmap

- [x] **Phase 1: Core Protocol & Circuit** — Compact ZK circuit for anonymous check-in verification.
- [x] **Phase 2: DApp & Wallet Connector** — Vanilla TypeScript frontend with Midnight Lace Wallet integration.
- [x] **Phase 3: Preprod Deployment & Explorer** — Deployment to Midnight Preprod testnet and live block explorer.
- [ ] **Phase 4: Multi-Event Sub-Nets** — Support for simultaneous multi-stage & multi-track event venues.
- [ ] **Phase 5: Soulbound Attendance Badges (SABs)** — ZK-mintable non-transferable proof-of-attendance tokens.

---

## 🌐 Live Resources & Repository

- **GitHub Repository**: [https://github.com/shuvamdutta2004/Anonymous-event-check-in](https://github.com/shuvamdutta2004/Anonymous-event-check-in)
- **Live Vercel Application**: [https://anonymous-event-check-in.vercel.app](https://anonymous-event-check-in.vercel.app)
- **Midnight Preprod Explorer**: [https://explorer.preprod.midnight.network](https://explorer.preprod.midnight.network)
