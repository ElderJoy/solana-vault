use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::Mint};

use crate::{state::VaultDepositAuthority, VAULT_DEPOSIT_AUTHORITY_SEED};

#[derive(Accounts)]
pub struct InitVault<'info> {
    #[account()]
    pub deposit_token: Account<'info, Mint>,

    #[account(
        init,
        payer = user,
        space = 8 + VaultDepositAuthority::LEN,
        seeds = [VAULT_DEPOSIT_AUTHORITY_SEED, deposit_token.key().as_ref()],
        bump
    )]
    pub vault_deposit_authority: Account<'info, VaultDepositAuthority>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl InitVault<'_> {
    pub fn apply(ctx: &mut Context<InitVault>) -> Result<()> {
        ctx.accounts.vault_deposit_authority.deposit_token = ctx.accounts.deposit_token.key();
        ctx.accounts.vault_deposit_authority.bump = ctx.bumps.vault_deposit_authority;

        Ok(())
    }
}
