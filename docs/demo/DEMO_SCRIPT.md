# HALE Oracle: Demo Video Script & Walkthrough

**Total Duration:** 2:30 minutes
**Narrator:** Antigravity AI (or Human Narrator)

---

## 🎬 Intro: The Problem (0:00 - 0:30)
**Visual:** Slide 1 transition to Slide 3. Hovering over a dark abyss.
**Audio:** "In the emerging machine economy, AI agents are transacting billions in value. But there’s a missing link: Trust. How does an agent know the code it just bought actually works before it pays? This is the Trust Gap, and it’s what HALE was built to solve."

---

## 🛠️ Step 1: Secure Deployment (0:30 - 1:00)
**Visual:** 1. Open the HALE Frontend (/deploy).
**Action:** User connects wallet and clicks 'Deploy Escrow'.
**Visual:** 2. Switching to the Oracle Monitor showing the new entry.
**Audio:** "HALE starts on the Circle Arc network. A buyer deploys a smart contract escrow, defining the exact digital terms. These aren't just words—they're the fuel for our forensic engine."

---

## 👁️ Step 2: The Live Monitoring (1:00 - 1:30)
**Visual:** Show the 'Monitor' page with live stats cards.
**Action:** Hover over 'Active Escrows' and 'Total Transactions'.
**Audio:** "Our Live Monitoring system provides real-time visibility into the agentic labor market. Here, we track every deposit, every audit, and every settlement. It’s a transparent windows into the machine economy."

---

## 🛡️ Step 3: Forensic Auditing & Settlement (1:30 - 2:15)
**Visual:** Run the `full_flow_demo.py` script in a split screen.
**Action:** 1. Show 'Deposit' on Arc. 2. Show 'Attestation' (Proof of Intent) created on Solana via the Anchor Program. 3. Show the Bridge Relayer triggering.
**Visual:** The Monitor UI updates instantly with a new 'PASS' verdict from the forensics.
**Audio:** "When the work is delivered, the Seller creates a Proof of Intent on Solana. Our HALE Bridge detects this Anchor attestation and triggers our forensic auditor—powered by Google Gemini. No human needed. If it passes, the funds are released on-chain instantly. This is the power of a cross-chain forensic ledger."

---

## 🏆 Outro: Scaling trust (2:15 - 2:30)
**Visual:** Slide 12 (CTA).
**Audio:** "HALE Oracle. We're scaling trust to the speed of light. Join us in building the most accountable engine for the machine economy. Visit HALE-scan dot io to begin."

---

## 📋 Production Checklist:
1. [ ] **Start API:** `./venv/bin/python backend_api.py`
2. [ ] **Start Frontend:** `npm run dev` (on port 3002)
3. [ ] **Open Browser:** `http://localhost:3002` + `http://localhost:3002/monitor`
4. [ ] **Terminal Ready:** Clear terminal for `python full_flow_demo.py`
5. [ ] **Presentation Ready:** Open `PRESENTATION.html` for intro/outro.
