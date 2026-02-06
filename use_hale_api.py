import requests
import json

def use_hale_oracle(contract_terms, delivery_content):
    """
    Demonstrates how an AI Agent or Developer would use the HALE Oracle API.
    """
    url = "https://hale-oracle.vercel.app/api/verify"
    
    payload = {
        "contract_terms": contract_terms,
        "acceptance_criteria": [
            "Must be valid syntax",
            "Must fulfill the intent of the terms"
        ],
        "delivery_content": delivery_content,
        "transaction_id": "agent_demo_tx_123"
    }
    
    headers = {
        "Content-Type": "application/json"
    }

    print(f"📡 Calling HALE Oracle for forensic audit...")
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        verdict = response.json()
        print("\n--- Forensic Verdict ---")
        print(f"Status: {verdict.get('verdict')}")
        print(f"Confidence: {verdict.get('confidence_score')}%")
        print(f"Reasoning: {verdict.get('reasoning')}")
        
        if verdict.get('tx_hash_solana'):
            print(f"⛓️  Solana Attestation: {verdict.get('tx_hash_solana')}")
        if verdict.get('tx_hash_arc'):
            print(f"💰 Arc Settlement Tx: {verdict.get('tx_hash_arc')}")
            
        return verdict
    else:
        print(f"❌ Error calling API: {response.status_code}")
        print(response.text)
        return None

if __name__ == "__main__":
    # Example usage: Verifying a simple script
    terms = "Create a python script that calculates the Fibonacci sequence."
    content = "def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)"
    
    use_hale_oracle(terms, content)
