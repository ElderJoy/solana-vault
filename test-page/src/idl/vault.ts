export type Vault = {
  "version": "0.1.0",
  "name": "vault",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
          "isMut": true,
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
          "name": "adminDepositWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
          "isMut": true,
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
          "name": "adminDepositWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositToken",
          "isMut": true,
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
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
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
          "name": "adminDepositWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositToken",
          "isMut": true,
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
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InsufficientFunds",
      "msg": "deposited fundc are insufficient"
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
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
          "isMut": true,
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
          "name": "adminDepositWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
          "isMut": true,
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
          "name": "adminDepositWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositToken",
          "isMut": true,
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
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
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
          "name": "adminDepositWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositToken",
          "isMut": true,
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
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InsufficientFunds",
      "msg": "deposited fundc are insufficient"
    }
  ]
};
