import json
import hashlib
from collections import OrderedDict

def get_canonical_hash(details):
    """
    Produces a deterministic SHA-256 hash of the intent details.
    1. Sort keys alphabetically.
    2. Serialize to compact JSON (no spaces).
    3. Hash with SHA-256.
    """
    # Sort dictionaries recursively
    def sort_dict(d):
        if isinstance(d, dict):
            return OrderedDict(sorted((k, sort_dict(v)) for k, v in d.items()))
        if isinstance(d, list):
            return [sort_dict(x) for x in d]
        return d

    sorted_details = sort_dict(details)
    compact_json = json.dumps(sorted_details, separators=(',', ':'))
    return "0x" + hashlib.sha256(compact_json.encode('utf-8')).hexdigest()

# Example Usage
intent_details = {
    "description": "Swap 1.5 SOL for USDC on Jupiter",
    "parameters": {
        "target_asset": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "amount": "1.5",
        "max_slippage": 50
    }
}

print(f"Details: {json.dumps(intent_details, indent=2)}")
print(f"Canonical Hash: {get_canonical_hash(intent_details)}")
