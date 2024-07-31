use anchor_lang::prelude::*;

mod instructions;

pub use instructions::oapp_send::OAppSendParams;
use instructions::*;

declare_id!("9qrP7gUnchdY9eJqKWAa7xYqj9ve6XGi7jkiCFtCtjW7");

pub const OAPP_SEED: &[u8] = b"OApp";
pub const PEER_SEED: &[u8] = b"Peer";
pub const ENFORCED_OPTIONS_SEED: &[u8] = b"EnforcedOptions";

#[program]
pub mod orderly_oapp {
    use super::*;

    pub fn oapp_send(mut ctx: Context<OAppSend>, params: OAppSendParams) -> Result<()> {
        OAppSend::apply(&mut ctx, &params)
    }
}
