use anchor_lang::prelude::*;

declare_id!("CnwQj2kPHpTbAvJT3ytzekrp7xd4HEtZJuEua9yn9MMe");

#[program]
pub mod hale_solana {
    use super::*;

    pub fn initialize_attestation(
        ctx: Context<InitializeAttestation>,
        intent_hash: [u8; 32],
        metadata_uri: String,
    ) -> Result<()> {
        let attestation = &mut ctx.accounts.attestation;
        attestation.authority = ctx.accounts.authority.key();
        attestation.intent_hash = intent_hash;
        attestation.metadata_uri = metadata_uri;
        attestation.status = AttestationStatus::Draft;
        attestation.bump = ctx.bumps.attestation;
        
        msg!("Attestation initialized for intent: {:?}", intent_hash);
        Ok(())
    }

    pub fn seal_attestation(
        ctx: Context<SealAttestation>,
        outcome_hash: [u8; 32],
    ) -> Result<()> {
        let attestation = &mut ctx.accounts.attestation;
        attestation.outcome_hash = Some(outcome_hash);
        attestation.status = AttestationStatus::Sealed;
        
        msg!("Attestation sealed with outcome: {:?}", outcome_hash);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(intent_hash: [u8; 32], metadata_uri: String)]
pub struct InitializeAttestation<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 4 + 200 + 1 + 33 + 1, // Cap metadata_uri at 200
        seeds = [b"attestation", authority.key().as_ref(), intent_hash.as_ref()],
        bump
    )]
    pub attestation: Account<'info, Attestation>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SealAttestation<'info> {
    #[account(
        mut,
        has_one = authority,
        seeds = [b"attestation", authority.key().as_ref(), attestation.intent_hash.as_ref()],
        bump = attestation.bump,
    )]
    pub attestation: Account<'info, Attestation>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Attestation {
    pub authority: Pubkey,
    pub intent_hash: [u8; 32],
    pub metadata_uri: String,
    pub status: AttestationStatus,
    pub outcome_hash: Option<[u8; 32]>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AttestationStatus {
    Draft,
    Sealed,
    Audited,
}
