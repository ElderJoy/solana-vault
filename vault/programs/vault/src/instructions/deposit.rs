use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount, Transfer, transfer}, 
    associated_token::AssociatedToken
};

use crate::{state::{UserInfo, VaultDepositAuthority}, VaultError};

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserInfo::LEN,
        seeds = [user.key().as_ref()], bump
    )]
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
        init_if_needed,
        payer = user,
        associated_token::mint = deposit_token,
        associated_token::authority = vault_deposit_authority
    )]
    pub vault_deposit_wallet: Account<'info, TokenAccount>,

    #[account()]
    pub deposit_token: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> Deposit<'info> {
    pub fn transfer_token_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.user_deposit_wallet.to_account_info(),
            to: self.vault_deposit_wallet.to_account_info(),
            authority: self.user.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

pub fn deposit_handler(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    msg!("Deposit: amount={}", amount);

    transfer(ctx.accounts.transfer_token_ctx(), amount)?;

    let user_info = &mut ctx.accounts.user_info;

    if user_info.user == Pubkey::default() {
        // PDA just created, let's set the user field
        msg!("PDA just created, setting user field");
        user_info.user = ctx.accounts.user.key();
    } else if user_info.user != ctx.accounts.user.key() {
        return Err(VaultError::PdaBelongsToAnotherUser.into());
    }
    user_info.amount += amount;
    msg!("User deposit balance: {}", user_info.amount);

    Ok(())
}