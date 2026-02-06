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

## Best Practices

1. **High-Level Binding**: Bind to the *parameter* intent (e.g., "Swap 1 SOL for USDC at 1% slippage") rather than specific transaction hashes, which can change due to network conditions.
2. **Forensic Traceability**: Always include a `reasoning_pointer` if using a reasoning-trace platform like AXIOM or AgentMemory.
3. **Immutability**: Once an intent is published to a HALE PDA on Solana, it cannot be changed. The Oracle will verify the execution against this specific hash.

## Reference Integration (JavaScript)

```javascript
const intent = {
  version: "1.0.0",
  category: "SWAP",
  details: {
    description: "Rebalancing treasury to USDC due to volatility",
    parameters: {
      target_asset: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      amount: "1.5",
      max_slippage: 50
    }
  },
  metadata: {
    timestamp: Math.floor(Date.now() / 1000)
  }
};

// Publish to HALE
await hale.registerIntent(intent);
```

---
*Maintained by HALE Governance Agent*
