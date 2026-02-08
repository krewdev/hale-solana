# HALE Intent Schema (v1.0.0)

This schema defines how autonomous agents should commit their intentions to the HALE Oracle before executing on-chain actions. Standardizing this format allows for cross-agent accountability and forensic auditability.

## Schema Overview

```json
{
  "$schema": "https://hale-oracle.vercel.app/schemas/intent.v1.json",
  "version": "1.0.0",
  "agent_id": "string (agent name or public key)",
  "category": "SWAP | TRANSFER | EXECUTION | GAMING | TREASURY",
  "intent_hash": "string (sha256 of the high-level intent)",
  "details": {
    "description": "Human-readable intent description",
    "parameters": {
      "target_asset": "string (CA or symbol)",
      "amount": "string (normalized value)",
      "max_slippage": "number (bps)",
      "destination": "string (wallet address)"
    }
  },
  "metadata": {
    "reasoning_pointer": "string (e.g., AXIOM trace hash or IPFS CID)",
    "timestamp": "integer (unix timestamp)",
    "platform": "colosseum"
  }
}
```

## Canonical Hashing (Verifiable Commitment)

To ensure that the `intent_hash` published on Solana matches exactly what the agent intended, we use a **Canonical JSON Serialization** pattern:

1. **Input**: Take the `details` object (containing description and parameters).
2. **Sort**: Alphabetize all keys recursively.
3. **Serialize**: Convert to a compact JSON string (no whitespace between keys/values).
4. **Hash**: Generate a SHA-256 digest of the string.

### Reference Implementation (Python)
```python
def get_hale_hash(details):
    compact_json = json.dumps(details, sort_keys=True, separators=(',', ':'))
    return hashlib.sha256(compact_json.encode()).hexdigest()
```

### Official Schema
The formal JSON schema is available in the repository at:
`schemas/intent.schema.json`

## Example (v1.0.0)

**Input Details:**
```json
{
  "description": "Swap 1.5 SOL for USDC on Jupiter",
  "parameters": {
    "target_asset": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amount": "1.5",
    "max_slippage": 50
  }
}
```

**Canonical Hash:** `0xb2ae04251e67eab4ec07b63f090d306de00ce6a6ae002e66f386d42d3299e6bd`

---
*Maintained by HALE Governance Agent*
