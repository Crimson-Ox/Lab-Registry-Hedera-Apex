# 🏥 Smart Lab Registry (Hedera Apex 2026)

**Decentralized Verifiable Diagnostics on Hedera** *Anchoring AI-driven medical analysis to a trust-layer infrastructure.*

**Track:** AI & Agents

**Role:** Solidity Lead



## 🎯 Product Clarity: The Vision

### 1. Problem Statement: The Medical Data "Black Box"

In 2026, medical AI is powerful, but its output is only as good as the data it receives.

* **Integrity:** Patients currently cannot prove that results were not altered post-analysis.
* **Hallucinations:** AI agents lack a verifiable "Single Source of Truth" to anchor their findings.

### 2. The Solution: Decentralized Verifiable Diagnostics

**Lab Registry** is a trust-layer built on **Hedera**, providing an immutable audit trail that anchors raw laboratory data and AI interpretations directly to the blockchain.

### 3. The Agentic Workflow

1. **Upload:** Authorized Technicians commit data hashes to Hedera.
2. **Trigger:** The Smart Contract emits an event (The "Handshake").
3. **Analyze:** The AI Agent detects the event via a Mirror Node and interprets the data.
4. **Anchor:** The AI writes its interpretation hash back to the registry via an HTS-gated transaction.

---

## 🛠 Evolutionary Roadmap: From Prototype to Production

### ⏳ Phase 1: The Foundation (V1 - V2)

* **V1 (Baseline Ledger):** Simple key-value storage. Proved that data could be held on the Hedera EVM.
* **V2 (Data Organization):** Introduction of the `LabReport` struct. Evolution included `block.timestamp` anchoring and `patientAddress` indexing to move away from loose string variables.

### 🛡️ Phase 2: The Security Conflict (V3 - V4)

* **V3 (Access Control):** First implementation of OpenZeppelin `AccessControl`. Explored the Initializable Proxy pattern but encountered the "Storage Gap" risk—a potential critical failure for medical data integrity.
* **V4 (The HTS Battlefield):** A high-intensity research phase.
* **The Precompile Breach:** Attempted native HTS integration via address `0x167`.
* **The Pivot:** Encountered RPC `staticcall` reverts and gas estimation failures. This led to the architectural decision to bridge HTS tokens via ERC20-parity (address `0x...7c30cf`).
* **The Success:** Anchored **Report 333** ("Blood" by "Jane"), proving the HTS-Gated logic worked.



### 🏛️ Phase 3: The Clean State (V5.0)

* **V5.0 (Apex Anchor):** Current Production Version.
* **Status:** A total "Clean Slate" deployment using four distinct accounts to ensure a pristine transaction history for auditors.
* **Innovation:** Combined Sovereign RBAC with a "Strict-Overwrite" shield 
  
### <summary>📊 <b>Click to View: Official  Gas Audit & Efficiency Report</b></summary>
<details>
 ***Efficiency & Gas Optimization
**Criteria:** *Is the contract optimized for high-frequency medical diagnostic throughput?*

* **Execution Efficiency:** Achieved a **47% reduction** in gas costs by transitioning from V1 String Mappings to V5 Optimized Structs.
* **Storage Slot Packing:** Strategically aligned `uint256` and `address` variables to minimize "SLOAD" and "SSTORE" operations.
* **Proxy-to-Standard Pivot:** Saved **~2,100 gas per transaction** by moving from a Proxy pattern to a Hardened Standard Implementation.

| Version | `addReport` Gas Cost | Improvement |
| :--- | :--- | :--- |
| **V1 Baseline** | 23,893 | --- |
| **V5.0 Final** | **12,668** | **-47%** |


</details>

## 🔄 Architectural Decisions & Rationale

### 🏛️ Transition: From Proxy to Standard Implementation

**Decision:** Deprecated the Initializable Proxy pattern in favor of the **V5 "Hardened Master"** Standard Implementation.

**Rationale:**

* **State Collision Risk:** Proxies require strict storage gap management. In our rapid development cycle (V4.0 to V4.6), the risk of "Storage Collision" between the proxy and the logic contract was high. For a medical registry, any corruption of patient data is a catastrophic failure.
* **AI Agent Integration:** Standard contracts provide a direct, immutable ABI. This ensures the AI Agent has a 100% reliable entry point for the `addReport` function without the overhead of delegate calls.
* **Gas Efficiency:** By removing the proxy middleman, we reduced the gas cost for every HBAR-anchored report, making the lab more economically viable.

### 🛡️ Smart Contract Architecture Note (March 2026)

**Active Deployment (V5.0):** `0x305cE9911290db9D5dfaC3FD4ac2c08fBbE2fcc1`

**Architectural Pivot:**
We have transitioned to a **Sovereign RBAC** (Role-Based Access Control) model. The "Sovereign" role (Factory Admin) can pause the system in emergencies, while the "Operational" role (Lab Director) manages daily whitelists.

---

## 🧪 Installation & Testing (Forge/Foundry)

To audit or test the Lab Registry on your local machine, follow these steps:

### 1. Prerequisites

* [Foundry / Forge](https://www.google.com/search?q=https://book.getfoundry.sh/getting-started/installation)
* Hedera Testnet Account (ECDSA)

### 2. Setup

```bash
# Clone the repository
git clone https://github.com/YourUsername/Lab-Registry-Hedera-Apex
cd Lab-Registry-Hedera-Apex

# Install dependencies
forge install openzeppelin/openzeppelin-contracts

```

### 3. Compilation

```bash
# Clean and Build
forge clean
forge build

```

### 4. Running the Audit Suite

Our test suite simulates the V5.0 "Clean State" logic, including the HTS gate and RBAC permission checks.

```bash
# Run all tests
forge test -vv

# Test specific security gate (Unauthorized access)
forge test --match-test testUnauthorizedAnchor -vv

```

---

## 📊 Deployment Integrity (V5.0 Final)

* **HTS Gating:** Active via Token `0.0.8138959`.
* **Multi-Tier Permissions:** 1. **Account 1 (Sovereign):** Contract Pausing/Unpausing.
2. **Account 2 (Director):** Agent Whitelisting & Fee Management.
3. **Account 4 (AI Agent):** HTS-Gated Report Anchoring.
* **Data Protection:** ID-uniqueness requirement (`require(timestamp == 0)`) prevents malicious record overwriting.


