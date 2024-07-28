use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{self, Mint, Token, TokenAccount, Transfer}};

declare_id!("2sXiDR5khwCMTC6Gusk9q1oDvpQ4FYrj9XYhkFg4mVAK");

#[program]
pub mod vault {
    use super::*;

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        msg!("Instruction: Deposit: amount={}", amount);

        let cpi_accounts = Transfer {
            from: ctx.accounts.user_deposit_wallet.to_account_info(),
            to: ctx.accounts.vault_deposit_wallet.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        let user_info = &mut ctx.accounts.user_info;

        if user_info.user == Pubkey::default() {
            // PDA just created, let's set the user field
            msg!("PDA just created, setting user field");
            user_info.user = ctx.accounts.user.key();
        } else if user_info.user != ctx.accounts.user.key() {
            return Err(ErrorCode::PdaBelongsToAnotherUser.into());
        }
        user_info.amount += amount;
        msg!("User deposit balance: {}", user_info.amount);

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        msg!("Instruction: Withdraw");

        let user_info = &mut ctx.accounts.user_info;

        if user_info.amount < amount {
            return Err(ErrorCode::InsufficientFunds.into());
        }

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_deposit_wallet.to_account_info(),
            to: ctx.accounts.user_deposit_wallet.to_account_info(),
            authority: ctx.accounts.vault_deposit_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        let deposit_token_key = ctx.accounts.deposit_token.key();
        let vault_deposit_authority_bump = ctx.bumps.vault_deposit_authority;
        let vault_deposit_authority_seeds = &[&b"vault_deposit_authority"[..], &deposit_token_key.as_ref(), &[vault_deposit_authority_bump]];
        token::transfer(cpi_ctx.with_signer(&[&vault_deposit_authority_seeds[..]]), amount)?;

        user_info.amount -= amount;
        msg!("User deposit balance: {}", user_info.amount);

        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("deposited fundc are insufficient")]
    InsufficientFunds,
    #[msg("pda belongs to another user")]
    PdaBelongsToAnotherUser,
}

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
        seeds = [b"vault_deposit_authority", deposit_token.key().as_ref()], bump
    )]
    pub vault_deposit_authority: AccountInfo<'info>,

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
        seeds = [b"vault_deposit_authority", deposit_token.key().as_ref()], bump
    )]
    pub vault_deposit_authority: AccountInfo<'info>,

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

#[account]
pub struct UserInfo {
    pub user: Pubkey,
    pub amount: u64,
}

impl UserInfo {
    pub const LEN: usize = 32 + 8;
}
