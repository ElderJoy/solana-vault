use anchor_lang::prelude::*;

mod errors;
mod events;
mod instructions;
mod state;

use errors::*;
use instructions::*;

declare_id!("4HkkMSFPcDargBgEXv2EuLRLmZp3HnGMscBxABzZ9deD");

pub const VAULT_DEPOSIT_AUTHORITY_SEED: &[u8] = b"vault_deposit_authority";

#[program]
pub mod vault {
    use super::*;

    pub fn initialize(mut ctx: Context<InitVault>) -> Result<()> {
        InitVault::apply(&mut ctx)
    }

    pub fn deposit(mut ctx: Context<Deposit>, amount: u64) -> Result<()> {
        Deposit::apply(&mut ctx, amount)
    }

    pub fn withdraw(mut ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        Withdraw::apply(&mut ctx, amount)
    }
}
