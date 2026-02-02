import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";
import * as fs from "fs";
import idl from "./idl.json" with { type: "json" };

async function main() {
    const connection = new Connection("http://127.0.0.1:8899", "processed");

    // Auditor identity
    const secretKey = JSON.parse(fs.readFileSync("/Users/krewdev/.config/solana/id.json", "utf8"));
    const auditorKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
    const wallet = new anchor.Wallet(auditorKeypair);

    const provider = new anchor.AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
    });
    const program = new anchor.Program(idl as any, provider);

    console.log("HALE Auditor started:", auditorKeypair.publicKey.toBase58());
    console.log("Program ID:", program.programId.toBase58());

    const accounts = await program.account.attestation.all();
    console.log(`Found ${accounts.length} total attestation accounts.`);

    for (const { publicKey, account } of accounts) {
        console.log(`Account: ${publicKey.toBase58()} | Status: ${JSON.stringify(account.status)}`);
        if (Object.keys(account.status)[0] === "sealed" || Object.keys(account.status)[0].toLowerCase() === "sealed") {
            console.log(`\nFound sealed attestation: ${publicKey.toBase58()}`);
            console.log(`Authority: ${account.authority.toBase58()}`);
            console.log(`Metadata URI: ${account.metadataUri}`);

            // Verification Logic (Demo mode)
            // 1. Fetch metadata (we'll assume it's valid for the demo)
            // 2. Mocking on-chain verification
            const isValid = true;
            const reportHash = Buffer.from(new Uint8Array(32).fill(7)); // Audit report hash

            console.log(`Submitting audit report: ${isValid ? "VALID" : "INVALID"}`);

            try {
                await program.methods
                    .auditAttestation(Array.from(reportHash), isValid)
                    .accounts({
                        attestation: publicKey,
                        auditor: auditorKeypair.publicKey,
                    } as any)
                    .rpc();

                console.log(`Audit recorded on-chain for ${publicKey.toBase58()}`);
            } catch (err) {
                console.error("Failed to submit audit:", err);
            }
        }
    }
}

main().catch(console.error);
