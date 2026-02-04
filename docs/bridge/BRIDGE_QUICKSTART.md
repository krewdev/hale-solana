# 🌉 HALE Cross-Chain Bridge - Quick Start Guide

## Overview

The HALE Bridge enables **cross-chain escrow** by syncing attestation state from **Solana** to **Arc Network**:

- ✅ **Solana**: Fast, cheap attestations and forensic audits
- ✅ **Arc**: EVM-compatible escrow with stablecoin support
- ✅ **Bridge**: Automatic sync of attestation verdicts

---

## Architecture

```
┌─────────────┐                    ┌─────────────┐
│   SOLANA    │                    │ ARC NETWORK │
│             │                    │             │
│  Attestation│──── Bridge ────►│   Escrow    │
│  + Audit    │    Relayer       │   Release   │
│             │                    │             │
└─────────────┘                    └─────────────┘
```

---

## Components

### 1. Solana HALE Program ✅
**Program ID**: `CnwQj2kPHpTbAvJT3ytzekrp7xd4HEtZJuEua9yn9MMe`

**Functions**:
- `initialize_attestation()` - Create attestation
- `seal_attestation()` - Lock outcome
- `audit_attestation()` - Oracle verdict
- `challenge_attestation()` - Dispute

### 2. Arc Escrow Contract ✅
**Address**: `0x4596d58ee50A9db2538eDe9E157324A24C327E4C`

**Functions**:
- `deposit()` - Buyer deposits funds
- `release()` - Oracle releases to seller
- `refund()` - Oracle refunds buyers

### 3. Bridge Relayer 🆕
**File**: `hale_bridge_relayer.py`

**Functions**:
- Monitors Solana attestations
- Parses attestation state
- Triggers Arc escrow actions

---

## Installation

### 1. Install Dependencies

```bash
cd /Users/krewdev/Haleoracle/HaleOracle-/
./venv/bin/pip install solana solders anchorpy
```

### 2. Configure Environment

Make sure your `.env` has:

```bash
# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com

# Arc
ARC_RPC_URL=https://rpc.testnet.arc.network
ESCROW_CONTRACT_ADDRESS=0x4596d58ee50A9db2538eDe9E157324A24C327E4C
HALE_ORACLE_ADDRESS=0x876f7ee6D6AA43c5A6cC13c05522eb47363E5907
ORACLE_PRIVATE_KEY=your-private-key-here

# Gemini (for oracle)
GEMINI_API_KEY=your-api-key-here
```

---

## Usage

### Step 1: Create Attestation on Solana

```bash
cd /Users/krewdev/new1/hale-solana
npm run demo:jupiter
```

This creates an attestation and returns the pubkey (e.g., `7xKXtg2CW3UXPhBca5oHudjF9pwg4cXhvyuZ1yGNv3AB`)

### Step 2: Register Bridge Mapping

```python
from hale_bridge_relayer import HaleBridge

bridge = HaleBridge()

# Register mapping between Solana attestation and Arc seller
bridge.register_mapping(
    solana_attestation="7xKXtg2CW3UXPhBca5oHudjF9pwg4cXhvyuZ1yGNv3AB",
    arc_seller="0x876f7ee6D6AA43c5A6cC13c05522eb47363E5907"
)
```

### Step 3: Audit on Solana

```bash
cd /Users/krewdev/new1/hale-solana
npm run audit
```

This marks the attestation as `Audited` with `is_valid = true/false`

### Step 4: Run Bridge

```bash
cd /Users/krewdev/Haleoracle/HaleOracle-/
./venv/bin/python3 hale_bridge_relayer.py
```

The bridge will:
1. Detect the `Audited` attestation
2. Parse the verdict
3. Call Arc escrow `release()` or `refund()`

---

## Complete Flow Example

### Scenario: Freelance Developer Payment

1. **Buyer deposits 100 USDC on Arc**
   ```javascript
   await escrow.deposit(sellerAddress, { value: ethers.parseEther("100") })
   ```

2. **Seller creates attestation on Solana**
   ```typescript
   const intentHash = sha256("Build React app")
   await hale.initializeAttestation(intentHash, "ipfs://metadata")
   ```

3. **Seller completes work and seals**
   ```typescript
   const outcomeHash = sha256("ipfs://QmCodeDelivery")
   await hale.sealAttestation(outcomeHash)
   ```

4. **Oracle audits on Solana**
   ```typescript
   const reportHash = sha256("Audit report: PASS")
   await hale.auditAttestation(reportHash, true) // is_valid = true
   ```

5. **Bridge syncs to Arc**
   ```python
   # Automatically detects Audited status
   # Calls escrow.release(seller, transactionId)
   # Seller receives 100 USDC!
   ```

---

## Bridge Mapping Database

Mappings are stored in `bridge_mappings.json`:

```json
{
  "7xKXtg2CW3UXPhBca5oHudjF9pwg4cXhvyuZ1yGNv3AB": {
    "solana_attestation": "7xKXtg2CW3UXPhBca5oHudjF9pwg4cXhvyuZ1yGNv3AB",
    "arc_seller": "0x876f7ee6d6aa43c5a6cc13c05522eb47363e5907",
    "arc_escrow": "0x4596d58ee50a9db2538ede9e157324a24c327e4c",
    "status": "synced",
    "created_at": "2026-02-03T05:00:00",
    "synced_at": "2026-02-03T05:05:00"
  }
}
```

---

## Attestation Status Flow

```
Draft → Sealed → Audited → [Bridge Sync] → Arc Release
                     ↓
                 Disputed → [Bridge Sync] → Arc Refund
```

### Status Meanings

- **Draft**: Attestation created, not yet sealed
- **Sealed**: Outcome locked, ready for audit
- **Audited**: Oracle verified, ready for bridge
- **Disputed**: Challenged, will trigger refund

---

## API Reference

### HaleBridge Class

```python
class HaleBridge:
    def __init__(self, solana_rpc_url, arc_rpc_url, gemini_api_key)
    
    def register_mapping(self, solana_attestation, arc_seller, arc_escrow=None)
    
    async def fetch_attestation(self, attestation_pubkey) -> Dict
    
    async def sync_attestation_to_arc(self, solana_attestation_pubkey) -> bool
    
    async def monitor_solana_events(self, poll_interval=10)
    
    def get_bridge_status(self) -> Dict
```

### Parser Functions

```python
def parse_attestation_account(data: bytes) -> Dict
def is_attestation_ready_for_bridge(attestation: Dict) -> bool
def get_verdict_from_attestation(attestation: Dict) -> Dict
```

---

## Testing

### 1. Run Demo

```bash
./venv/bin/python3 demo_bridge.py
```

### 2. Check Bridge Status

```python
from hale_bridge_relayer import HaleBridge

bridge = HaleBridge()
status = bridge.get_bridge_status()
print(status)
```

### 3. Manual Sync

```python
import asyncio
from hale_bridge_relayer import HaleBridge

async def test():
    bridge = HaleBridge()
    
    # Register mapping
    bridge.register_mapping(
        solana_attestation="YOUR_ATTESTATION_PUBKEY",
        arc_seller="0x876f7ee6D6AA43c5A6cC13c05522eb47363E5907"
    )
    
    # Sync manually
    success = await bridge.sync_attestation_to_arc("YOUR_ATTESTATION_PUBKEY")
    print(f"Sync success: {success}")

asyncio.run(test())
```

---

## Troubleshooting

### Issue: "Attestation not found"
**Solution**: Make sure the attestation exists on Solana devnet

```bash
solana account YOUR_ATTESTATION_PUBKEY --url devnet
```

### Issue: "Not ready for bridge"
**Solution**: Attestation must be `Audited` status

```bash
# Check status in Solana dashboard
# Or run audit script
cd /Users/krewdev/new1/hale-solana
npm run audit
```

### Issue: "Arc transaction failed"
**Solution**: Check oracle has funds and correct permissions

```bash
# Check oracle balance
cast balance 0x876f7ee6D6AA43c5A6cC13c05522eb47363E5907 --rpc-url https://rpc.testnet.arc.network

# Check oracle is set correctly
cast call 0x4596d58ee50A9db2538eDe9E157324A24C327E4C "oracle()" --rpc-url https://rpc.testnet.arc.network
```

---

## Security Considerations

1. **Finality**: Wait for Solana finality (32 confirmations) before syncing
2. **Replay Protection**: Use unique transaction IDs
3. **Oracle Authority**: Only oracle can trigger Arc escrow
4. **Dispute Handling**: Disputed attestations trigger refunds

---

## Roadmap

### Phase 1: MVP ✅
- [x] Basic bridge relayer
- [x] Attestation parser
- [x] Manual mapping registration
- [x] Polling-based monitoring

### Phase 2: Automation 🚧
- [ ] Automatic seller address mapping
- [ ] Event-driven architecture
- [ ] Web dashboard for bridge ops

### Phase 3: Trustless 🔮
- [ ] Wormhole integration
- [ ] On-chain verification
- [ ] Multi-sig oracle

---

## Files Created

```
/Users/krewdev/Haleoracle/HaleOracle-/
├── hale_bridge_relayer.py       # Main bridge logic
├── solana_attestation_parser.py # Attestation parser
├── demo_bridge.py                # Demo script
├── bridge_mappings.json          # Mapping database
└── BRIDGE_QUICKSTART.md          # This guide
```

---

## Next Steps

1. **Create attestation on Solana**
   ```bash
   cd /Users/krewdev/new1/hale-solana
   npm run demo:jupiter
   ```

2. **Register mapping**
   ```python
   bridge.register_mapping(attestation_pubkey, arc_seller)
   ```

3. **Run bridge**
   ```bash
   ./venv/bin/python3 hale_bridge_relayer.py
   ```

4. **Watch the magic happen!** 🎉

---

**Questions?** Check `BRIDGE_ARCHITECTURE.md` for detailed design docs.

**Ready to bridge?** Run `./venv/bin/python3 demo_bridge.py` to get started! 🚀
