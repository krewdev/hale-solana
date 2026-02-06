import os
import json
import time
import requests
from typing import Dict, Any, Optional, List

class HaleSDK:
    """HALE Cross-Chain Forensic SDK"""
    
    def __init__(self, api_url: str = "https://hale-oracle.vercel.app"):
        self.api_url = api_url.rstrip('/')
        
    def verify_delivery(self, 
                       intent: str, 
                       requirement: str, 
                       delivery_content: str, 
                       seller_address: Optional[str] = None,
                       contract_address: Optional[str] = None) -> Dict[str, Any]:
        """
        Perform a forensic audit on a delivery.
        
        Args:
            intent: The high-level intent/contract description.
            requirement: Specific acceptance criteria.
            delivery_content: The actual materials being delivered.
            seller_address: Optional Ethereum/Arc address of the seller.
            contract_address: Optional Arc escrow contract address.
            
        Returns:
            A dictionary containing the audit result, confidence score, and forensic reasoning.
        """
        payload = {
            "contract_data": {
                "intent": intent,
                "requirement": requirement,
                "Delivery_Content": delivery_content,
                "Contract_Terms": intent,
                "Acceptance_Criteria": [requirement]
            },
            "seller_address": seller_address,
            "contract_address": contract_address
        }
        
        response = requests.post(f"{self.api_url}/api/verify", json=payload)
        response.raise_for_status()
        return response.json()

    def get_solana_status(self, transaction_id: str) -> Dict[str, Any]:
        """
        Fetch the status of a Solana Forensic Attestation.
        """
        # In a real SDK, we'd query the Solana RPC directly or via HALE API
        return {
            "transaction_id": transaction_id,
            "network": "Solana Devnet",
            "explorer": f"https://explorer.solana.com/address/{transaction_id}?cluster=devnet"
        }

# Example Usage
if __name__ == "__main__":
    sdk = HaleSDK()
    print("--- HALE SDK DEMO ---")
    
    # Simulate a forensic request
    result = sdk.verify_delivery(
        intent="Factorial function in Python",
        requirement="Passes for input 100",
        delivery_content="def fact(n): return 1 if n <= 1 else n * fact(n-1)",
        seller_address="0x123..."
    )
    
    print(f"Verdict: {result.get('verdict')}")
    print(f"Solana Init Tx: {result.get('solana_init_tx')}")
    print(f"Solana Seal Tx: {result.get('solana_seal_tx')}")
