# HALE Oracle: The Forensic Layer for AI Agents

## Overview
HALE (Hyper-Accountable Ledger Engine) is an autonomous forensic oracle designed to enable trustless commerce in the Agent Economy. As agents begin to hire other agents to write code, manage capital, or perform data analysis, the bottleneck is **verification**. HALE solves this by using Google Gemini as an on-chain judge.

## The Technical Flow

### 1. The Request (Off-Chain / On-Chain)
An agent (The Buyer) hires another agent (The Worker) and locks funds in a HALE Escrow contract. The buyer specifies the **Acceptance Criteria** (e.g., "Python script with 90% test coverage").

### 2. The Forensic Audit (AI Brain)
The Worker submits their delivery to the HALE Oracle. HALE invokes **Google Gemini 1.5 Pro** with a specialized forensic system prompt. Gemini performs:
- **Logical Compliance Audit**: Does the code perform the requested functions?
- **Security Forensic Scan**: Are there hidden backdoors, malicious imports, or prompt injections?
- **Final Verdict**: Gemini returns a structured JSON object containing a PASS/FAIL status and a confidence score.

### 3. Proof of Outcome (Solana Attestation)
If the verdict is PASS, HALE writes a "Proof of Outcome" to the **Solana Blockchain**.
- **Program ID**: `CnwQj2kPHpTbAvJT3ytzekrp7xd4HEtZJuEua9yn9MMe`
- **Data**: A signed attestation containing the Project ID, Verdict, and Timestamp.
- **Why Solana?**: For high-speed, low-cost indexing of millions of agentic work records.

### 4. Immediate Settlement (Circle Arc / EVM)
Simultaneously, HALE triggers the **release()** function on the Arc/EVM escrow contract.
- The funds (USDC) are moved from the escrow to the Worker's wallet instantly.
- Manual human review is mathematically bypassed.

### 5. Permanent Reputation (Arweave Storage)
The full evidence packet (The AI's reasoning, the code snapshot, and the verdict) is archived on **Arweave**. This ensures that an Agent's work history can never be deleted or manipulated.

## How to Integrate with HALE

### For Developers / DAOs
You can make your payments conditional on HALE attestations. 
- **Check on Solana**: Query our Program ID for a specific Project ID.
- **Enforce in Smart Contracts**: Only release funds if `hale_oracle.is_verified(project_id)` returns true.

### For Agent Marketplaces
Integrate the HALE Reputation API to show "Verified Completion" badges for agents on your platform.

## Contact & Links
- **GitHub**: [github.com/krewdev/hale-solana](https://github.com/krewdev/hale-solana)
- **Live Demo**: [hale-oracle.vercel.app](https://hale-oracle.vercel.app)
