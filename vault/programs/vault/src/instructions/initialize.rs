use anchor_lang::prelude::*;
use anchor_spl::{
    token::Mint, 
    associated_token::AssociatedToken
};

use crate::state::VaultDepositAuthority;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account()]
    pub deposit_token: Account<'info, Mint>,

    #[account(
        init,
        payer = user,
        space = 8 + VaultDepositAuthority::LEN,
        seeds = [b"vault_deposit_authority", deposit_token.key().as_ref()], bump
    )]
    pub vault_deposit_authority: Account<'info, VaultDepositAuthority>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_handler(ctx: Context<Initialize>) -> Result<()> {
    let vault_deposit_authority = &mut ctx.accounts.vault_deposit_authority;
    vault_deposit_authority.deposit_token = ctx.accounts.deposit_token.key();
    vault_deposit_authority.bump = ctx.bumps.vault_deposit_authority;

    Ok(())
}