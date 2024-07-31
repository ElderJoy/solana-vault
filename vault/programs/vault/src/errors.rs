use anchor_lang::prelude::error_code;

#[error_code]
pub enum VaultError {
    #[msg("Deposited funds are insufficient for withdrawal")]
    InsufficientFunds,
    #[msg("User info pda belongs to another user")]
    UserInfoBelongsToAnotherUser,
}
