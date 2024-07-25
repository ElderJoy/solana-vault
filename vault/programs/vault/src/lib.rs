use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

declare_id!("BaAvEW8J8da9a9Lzn1ScxLYS4z17gGsHsd7smG2jfXyh");

#[program]
pub mod vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Instruction: Initialize");

        let user_info = &mut ctx.accounts.user_info;
        user_info.user = ctx.accounts.user.key();
        user_info.amount = 0;

        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        msg!("Instruction: Deposit");

        let cpi_accounts = Transfer {
            from: ctx.accounts.user_deposit_wallet.to_account_info(),
            to: ctx.accounts.admin_deposit_wallet.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        let user_info = &mut ctx.accounts.user_info;
        user_info.amount += amount;

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        msg!("Instruction: Withdraw");

        let user_info = &mut ctx.accounts.user_info;

        if user_info.amount < amount {
            return Err(ErrorCode::InsufficientFunds.into());
        }

        let cpi_accounts = Transfer {
            from: ctx.accounts.admin_deposit_wallet.to_account_info(),
            to: ctx.accounts.user_deposit_wallet.to_account_info(),
            authority: ctx.accounts.admin.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        user_info.amount -= amount;

        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("deposited fundc are insufficient")]
    InsufficientFunds,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub admin: AccountInfo<'info>,
    #[account(init, payer = user, space = 8 + UserInfo::LEN, seeds = [user.key().as_ref()], bump)]
    pub user_info: Account<'info, UserInfo>,
    #[account(mut)]
    pub user_deposit_wallet: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub admin_deposit_wallet: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub deposit_token: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub admin: AccountInfo<'info>,
    #[account(mut, has_one = user)]
    pub user_info: Account<'info, UserInfo>,
    #[account(mut)]
    pub user_deposit_wallet: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub admin_deposit_wallet: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub deposit_token: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: AccountInfo<'info>,
    #[account(mut)]
    pub admin: AccountInfo<'info>,
    #[account(mut, has_one = user)]
    pub user_info: Account<'info, UserInfo>,
    #[account(mut)]
    pub user_deposit_wallet: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub admin_deposit_wallet: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub deposit_token: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[account]
pub struct UserInfo {
    pub user: Pubkey,
    pub amount: u64,
}

impl UserInfo {
    pub const LEN: usize = 32 + 8;
}
