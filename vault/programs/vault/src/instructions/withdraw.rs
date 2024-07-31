use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

use crate::{
    events::Withdrawn,
    state::{UserInfo, VaultDepositAuthority},
    VaultError, VAULT_DEPOSIT_AUTHORITY_SEED,
};

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
        seeds = [VAULT_DEPOSIT_AUTHORITY_SEED, deposit_token.key().as_ref()],
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

impl<'info> Withdraw<'info> {
    fn transfer_token_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault_deposit_wallet.to_account_info(),
            to: self.user_deposit_wallet.to_account_info(),
            authority: self.vault_deposit_authority.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }

    pub fn apply(ctx: &mut Context<Withdraw>, amount: u64) -> Result<()> {
        require!(
            ctx.accounts.user_info.amount >= amount,
            VaultError::InsufficientFunds
        );

        let deposit_token_key = ctx.accounts.deposit_token.key();
        let vault_deposit_authority_seeds = &[
            VAULT_DEPOSIT_AUTHORITY_SEED,
            deposit_token_key.as_ref(),
            &[ctx.accounts.vault_deposit_authority.bump],
        ];

        transfer(
            ctx.accounts
                .transfer_token_ctx()
                .with_signer(&[&vault_deposit_authority_seeds[..]]),
            amount,
        )?;

        ctx.accounts.user_info.amount -= amount;
        msg!("User deposit balance: {}", ctx.accounts.user_info.amount);

        emit!(Withdrawn {
            user: *ctx.accounts.user.key,
            amount,
        });

        Ok(())
    }
}
