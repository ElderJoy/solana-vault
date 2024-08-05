use crate::*;

#[account]
#[derive(InitSpace)]
pub struct OAppConfig {
    pub endpoint_program: Pubkey,
    pub bump: u8,
    // mutable
    pub admin: Pubkey,
}
