use anchor_lang::prelude::*;

mod instructions;

use instructions::*;

declare_id!("HEaubs3uaAoBNVksBBeBsgUQc1BRU4ogC4y5k6TkK3Tu");

pub const OAPP_SEED: &[u8] = b"OApp";
pub const PEER_SEED: &[u8] = b"Peer";
pub const ENFORCED_OPTIONS_SEED: &[u8] = b"EnforcedOptions";

#[program]
pub mod oapp_mock {
    use super::*;

    pub fn oapp_send(mut ctx: Context<OAppSend>, params: OAppSendParams) -> Result<()> {
        OAppSend::apply(&mut ctx, &params)
    }
}
