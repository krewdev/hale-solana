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
        
        emit!(AttestationSealed {
            authority: attestation.authority,
            intent_hash: attestation.intent_hash,
            outcome_hash,
        });

        msg!("Attestation sealed with outcome: {:?}", outcome_hash);
        Ok(())
    }

    pub fn audit_attestation(
        ctx: Context<AuditAttestation>,
        report_hash: [u8; 32],
        is_valid: bool,
    ) -> Result<()> {
        let attestation = &mut ctx.accounts.attestation;
        attestation.status = if is_valid {
            AttestationStatus::Audited
        } else {
            AttestationStatus::Disputed
        };
        attestation.report_hash = Some(report_hash);

        emit!(AttestationAudited {
            authority: attestation.authority,
            auditor: ctx.accounts.auditor.key(),
            intent_hash: attestation.intent_hash,
            report_hash,
            is_valid,
        });

        msg!("Attestation audited. Valid: {}", is_valid);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(intent_hash: [u8; 32], metadata_uri: String)]
pub struct InitializeAttestation<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 4 + 200 + 1 + 33 + 33 + 1 + 1, // Increased space for hashes and bump
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

#[derive(Accounts)]
pub struct AuditAttestation<'info> {
    #[account(
        mut,
        seeds = [b"attestation", attestation.authority.as_ref(), attestation.intent_hash.as_ref()],
        bump = attestation.bump,
    )]
    pub attestation: Account<'info, Attestation>,
    pub auditor: Signer<'info>,
}

#[account]
pub struct Attestation {
    pub authority: Pubkey,
    pub intent_hash: [u8; 32],
    pub metadata_uri: String,
    pub status: AttestationStatus,
    pub outcome_hash: Option<[u8; 32]>,
    pub report_hash: Option<[u8; 32]>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AttestationStatus {
    Draft,
    Sealed,
    Audited,
    Disputed,
}

#[event]
pub struct AttestationSealed {
    pub authority: Pubkey,
    pub intent_hash: [u8; 32],
    pub outcome_hash: [u8; 32],
}

#[event]
pub struct AttestationAudited {
    pub authority: Pubkey,
    pub auditor: Pubkey,
    pub intent_hash: [u8; 32],
    pub report_hash: [u8; 32],
    pub is_valid: bool,
}
