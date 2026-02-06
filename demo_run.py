from api.hale_sdk import HaleSDK
import os

# Initialize SDK pointing to production
sdk = HaleSDK(api_url="https://hale-oracle.vercel.app")

print("🚀 Starting HALE Forensic Demo (via SDK)...")

# Define the scenario
intent = "Create a Fibonacci function in Python."
requirement = "The function must be recursive and handle n=0 and n=1 correctly."
code_to_audit = """
def fib(n):
    if n <= 0: return 0
    if n == 1: return 1
    return fib(n-1) + fib(n-2)
"""

print(f"📡 Sending delivery for forensic audit...")
try:
    # We use a random placeholder for seller_address if not provided
    result = sdk.verify_delivery(
        intent=intent,
        requirement=requirement,
        delivery_content=code_to_audit,
        seller_address="0x1234567890123456789012345678901234567890" # Example address
    )

    print(f"\n✅ AUDIT COMPLETE")
    print(f"Verdict: {result.get('verdict')}")
    print(f"Confidence: {result.get('confidence_score')}%")
    print(f"Reasoning: {result.get('reasoning', 'No reasoning provided')[:200]}...")

    print(f"\n🔗 PROOFS:")
    if result.get('solana_seal_tx'):
        print(f"Solana Reputation: https://explorer.solana.com/tx/{result['solana_seal_tx']}?cluster=devnet")
    else:
        print("Solana Reputation: [Pending or Mapped to Existing Job]")
        
    if result.get('transaction_success'):
         print(f"Arc Settlement Success: {result['transaction_success']}")

except Exception as e:
    print(f"❌ SDK Error: {e}")
