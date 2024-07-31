use crate::*;

#[derive(Accounts)]
#[instruction(params: OAppSendParams)]
pub struct OAppSend<'info> {
    pub signer: Signer<'info>,
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
