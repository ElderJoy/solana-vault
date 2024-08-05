use crate::*;

#[derive(Accounts)]
#[instruction(params: OAppSendParams)]
pub struct OAppSend<'info> {
    pub signer: Signer<'info>,
    // #[account(
    //     mut,
    //     seeds = [
    //         PEER_SEED,
    //         &oapp_config.key().to_bytes(),
    //         &params.dst_eid.to_be_bytes()
    //     ],
    //     bump = peer.bump
    // )]
    // pub peer: Account<'info, Peer>,
    // #[account(
    //     seeds = [
    //         ENFORCED_OPTIONS_SEED,
    //         &oapp_config.key().to_bytes(),
    //         &params.dst_eid.to_be_bytes()
    //     ],
    //     bump = enforced_options.bump
    // )]
    // pub enforced_options: Account<'info, EnforcedOptions>,
    // #[account(
    //     seeds = [OAPP_SEED],
    //     bump = oapp_config.bump
    // )]
    // pub oapp_config: Account<'info, OAppConfig>,
}

impl OAppSend<'_> {
    pub fn apply(_ctx: &mut Context<OAppSend>, _params: &OAppSendParams) -> Result<()> {
        Ok(())
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct OAppSendParams {
    pub dst_eid: u32,
    pub to: [u8; 32],
    pub options: Vec<u8>,
    pub message: Option<Vec<u8>>,
    pub native_fee: u64,
    pub lz_token_fee: u64,
}
