use anchor_lang::prelude::*;

mod instructions;
mod state;

use instructions::*;

declare_id!("9RhmwHNcLztgcJLHJFU4A3fMsFQMnVwwvnkhxdJQUAEa");

#[program]
pub mod vault {
    use super::*;
    
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize_handler(ctx)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        deposit_handler(ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        withdraw_handler(ctx, amount)
    }
}

#[error_code]
pub enum VaultError {
    #[msg("deposited fundc are insufficient")]
    InsufficientFunds,
    #[msg("pda belongs to another user")]
    PdaBelongsToAnotherUser,
}