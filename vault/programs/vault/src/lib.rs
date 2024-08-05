use anchor_lang::prelude::*;

mod errors;
mod events;
mod instructions;
mod state;

use errors::*;
use instructions::*;
use orderly_oapp::OAppSendParams;

declare_id!("BKXJXj9RkGuXWrFcQV7vFgvWnEc7ajD3yW7mvvaL3C7A");

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

    // pub fn call_oapp(mut ctx: Context<CallOapp>, params: OAppSendParams) -> Result<()> {
    //     CallOapp::apply(&mut ctx, params)
    // }

    pub fn call_oapp<'info>(
        mut ctx: Context<'_, '_, '_, 'info, CallOapp<'info>>,
        params: OAppSendParams,
    ) -> Result<()> {
        CallOapp::apply(&mut ctx, params)
    }
}
