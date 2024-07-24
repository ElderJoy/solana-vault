use anchor_lang::prelude::*;

declare_id!("7u49DKPmZd3M1PtpNishUTjM6EV2yU72AaqN1RSiZBXs");

#[program]
pub mod vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
