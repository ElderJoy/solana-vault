export type Vault = {
  "version": "0.1.0",
  "name": "vault",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "depositToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultDepositAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "userInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userDepositWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultDepositAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultDepositWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userDepositWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultDepositAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultDepositWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "userInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "vaultDepositAuthority",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositToken",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InsufficientFunds",
      "msg": "deposited fundc are insufficient"
    },
    {
      "code": 6001,
      "name": "PdaBelongsToAnotherUser",
      "msg": "pda belongs to another user"
    }
  ]
};

export const IDL: Vault = {
  "version": "0.1.0",
  "name": "vault",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "depositToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultDepositAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "userInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userDepositWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultDepositAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultDepositWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userDepositWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultDepositAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultDepositWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "userInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "vaultDepositAuthority",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositToken",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InsufficientFunds",
      "msg": "deposited fundc are insufficient"
    },
    {
      "code": 6001,
      "name": "PdaBelongsToAnotherUser",
      "msg": "pda belongs to another user"
    }
  ]
};
