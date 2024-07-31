use anchor_lang::prelude::*;
use orderly_oapp::cpi::accounts::OAppSend;
use orderly_oapp::program::OrderlyOapp;
use orderly_oapp::OAppSendParams;

#[derive(Accounts)]
pub struct CallOapp<'info> {
    pub signer: Signer<'info>,
    pub orderly_oapp_program: Program<'info, OrderlyOapp>,
}

impl CallOapp<'_> {
    pub fn apply(ctx: &mut Context<CallOapp>, params: OAppSendParams) -> Result<()> {
        msg!("Calling OApp with params.message: {:?}", params.message);

        let orderly_oapp_program = ctx.accounts.orderly_oapp_program.to_account_info();
        let orderly_oapp_send_accounts = OAppSend {
            signer: ctx.accounts.signer.to_account_info(),
        };
        let orderly_oapp_ctx = CpiContext::new(orderly_oapp_program, orderly_oapp_send_accounts);

        orderly_oapp::cpi::oapp_send(orderly_oapp_ctx, params)?;
        Ok(())
    }
}
