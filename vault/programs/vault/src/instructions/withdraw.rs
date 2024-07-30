use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer, transfer};

use crate::{state::{UserInfo, VaultDepositAuthority}, VaultError};

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account()]
    pub user: AccountInfo<'info>,
    
    #[account(mut, has_one = user)]
    pub user_info: Account<'info, UserInfo>,
    
    #[account(
        mut,
        associated_token::mint = deposit_token,
        associated_token::authority = user
    )]
    pub user_deposit_wallet: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"vault_deposit_authority", deposit_token.key().as_ref()],
        bump = vault_deposit_authority.bump,
        constraint = vault_deposit_authority.deposit_token == deposit_token.key()
    )]
    pub vault_deposit_authority: Account<'info, VaultDepositAuthority>,

    #[account(
        mut,
        associated_token::mint = deposit_token,
        associated_token::authority = vault_deposit_authority
    )]
    pub vault_deposit_wallet: Account<'info, TokenAccount>,
    
    #[account()]
    pub deposit_token: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

pub fn withdraw_handler(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    msg!("Withdraw amount: {}", amount);

    let user_info = &mut ctx.accounts.user_info;

    if user_info.amount < amount {
        return Err(VaultError::InsufficientFunds.into());
    }

    let cpi_accounts = Transfer {
        from: ctx.accounts.vault_deposit_wallet.to_account_info(),
        to: ctx.accounts.user_deposit_wallet.to_account_info(),
        authority: ctx.accounts.vault_deposit_authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    let deposit_token_key = ctx.accounts.deposit_token.key();

    let vault_deposit_authority = &ctx.accounts.vault_deposit_authority;
    let vault_deposit_authority_seeds = &[&b"vault_deposit_authority"[..], &deposit_token_key.as_ref(), &[vault_deposit_authority.bump]];
    transfer(cpi_ctx.with_signer(&[&vault_deposit_authority_seeds[..]]), amount)?;

    user_info.amount -= amount;
    msg!("User deposit balance: {}", user_info.amount);

    Ok(())
}