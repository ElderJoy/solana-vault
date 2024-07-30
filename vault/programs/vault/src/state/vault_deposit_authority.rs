use anchor_lang::prelude::*;

#[account]
pub struct VaultDepositAuthority {
    /// The token account, users can deposit into (USDC by default)
    pub deposit_token: Pubkey,
    /// Bump seed for the vault deposit authority PDA
    pub bump: u8,
}

impl VaultDepositAuthority {
    /// don't count the bump seed 8 bytes (need to be added to the total length)
    pub const LEN: usize = 32 + 1;

    pub fn bump_seeds<'a>(deposit_token: &'a Pubkey) -> [&'a [u8]; 2] {
        [b"vault_deposit_authority", deposit_token.as_ref()]
    }
}