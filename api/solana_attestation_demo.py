#!/usr/bin/env python3
import os
import sys
import time
import argparse
from hale_oracle_backend import HaleOracle

def run_demo(transaction_id=None):
    # Ensure we can find the oracle and its dependencies
    gemini_api_key = os.getenv('GEMINI_API_KEY') or "DEMO_KEY"
    
    print("\n" + "═"*60)
    print("  🛡️  HALE SOLANA ATTESTATION CLI DEMO")
    print("═"*60)

    oracle = HaleOracle(gemini_api_key)
    
    if not oracle.solana_keypair:
        print("❌ Error: solana-keypair.json not found or could not be loaded.")
        print("Please ensure you have the oracle keypair in the api/ directory.")
        return

    if not transaction_id:
        transaction_id = f"cli_{int(time.time())}"
    
    print(f"🔑 Oracle Pubkey: {oracle.solana_keypair.pubkey()}")
    print(f"🆔 Transaction:  {transaction_id}")
    print("─" * 60)
    
    # Step 1: Initialize
    print("\n🚀 Step 1: Initializing Attestation Account...")
    try:
        init_tx = oracle.initialize_solana_attestation(transaction_id)
        if init_tx.startswith("MOCK"):
            print(f"⚠️  MOCK MODE: {init_tx}")
        else:
            print(f"✅ Success! Attestation initialized.")
            print(f"🔗 https://explorer.solana.com/tx/{init_tx}?cluster=devnet")
    except Exception as e:
        print(f"❌ Error during initialization: {e}")
        return

    # Wait for confirmation and indexing
    print("\n⏳ Step 2: Syncing with Solana Devnet (6 seconds)...")
    time.sleep(6)
    
    # Step 3: Seal
    print("\n🛡️  Step 3: Sealing Attestation (Reputation Seal)...")
    try:
        # We manually pass True for the demo seal
        seal_tx = oracle.seal_solana_attestation(transaction_id, is_valid=True)
        if seal_tx.startswith("MOCK"):
            print(f"⚠️  MOCK MODE: {seal_tx}")
        else:
            print(f"✅ Success! Attestation state 'Audited' anchored to blockchain.")
            print(f"🔗 https://explorer.solana.com/tx/{seal_tx}?cluster=devnet")
    except Exception as e:
        print(f"❌ Error during sealing: {e}")
        print("Tip: Make sure the initialization transaction was confirmed on-chain.")
        return

    print("\n" + "═"*60)
    print("✨ DEMO COMPLETE: On-chain Agent Reputation Verified")
    print("═"*60 + "\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="HALE Solana Attestation CLI Demo")
    parser.add_argument("--id", type=str, help="Optional custom transaction ID")
    args = parser.parse_args()
    
    try:
        run_demo(args.id)
    except KeyboardInterrupt:
        print("\nDemo interrupted.")
        sys.exit(0)
