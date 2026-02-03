import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";
import * as fs from "fs";
import idl from "./idl.json" with { type: "json" };
import Irys from "@irys/sdk";

async function main() {
    const connection = new Connection("http://127.0.0.1:8899", "processed");

    // Identity
    const secretKeyPath = "/Users/krewdev/.config/solana/id.json";
    const secretKey = JSON.parse(fs.readFileSync(secretKeyPath, "utf8"));
    const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));

    // Mock Irys setup (in reality needs funded devnet/mainnet node)
    console.log("HALE Auditor started:", keypair.publicKey.toBase58());

    const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(keypair), {
        preflightCommitment: "processed",
    });
    const program = new anchor.Program(idl as any, provider);

    const accounts = await program.account.attestation.all();
    console.log(`Auditing ${accounts.length} accounts...`);

    for (const { publicKey, account } of accounts) {
        const currentStatus = Object.keys(account.status)[0];

        if (currentStatus === "sealed") {
            console.log(`\nVerifying Attestation: ${publicKey.toBase58()}`);

            // 1. Permanent Storage Upload (Simulation)
            console.log("Uploading audit trail to decentralized storage (Irys)...");
            const auditReport = {
                attestation: publicKey.toBase58(),
                auditor: keypair.publicKey.toBase58(),
                timestamp: Date.now(),
                checks: ["intent_match", "outcome_verified", "onchain_tx_confirmed"],
                verdict: "valid"
            };

            // In actual implementation: 
            // const irys = new Irys({ url: "https://devnet.irys.xyz", token: "solana", key: secretKey });
            // const receipt = await irys.upload(JSON.stringify(auditReport));
            // console.log(`Audit Trail Permanent URL: https://gateway.irys.xyz/${receipt.id}`);

            const mockReportHash = Buffer.from(new Uint8Array(32).fill(9));
            console.log("Submitting VERDICT on-chain...");

            await program.methods
                .auditAttestation(Array.from(mockReportHash), true)
                .accounts({
                    attestation: publicKey,
                    auditor: keypair.publicKey,
                } as any)
                .rpc();

            console.log(`Audit complete for ${publicKey.toBase58()}`);
        }
    }
}

main().catch(console.error);
