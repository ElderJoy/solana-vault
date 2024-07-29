import { useCallback } from 'react';
import { decodeBase58, encodeBase58, solidityPackedKeccak256 } from 'ethers';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { hexToBytes, bytesToHex } from 'ethereum-cryptography/utils';
import { defaultAbiCoder } from '@ethersproject/abi';
import * as solanaWeb3 from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { IDL, Vault } from '../idl/vault';
import { clusterApiUrl, Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
    Account,
    TOKEN_PROGRAM_ID,
    TokenAccountNotFoundError,
    TokenInvalidAccountOwnerError,
    createAssociatedTokenAccountInstruction,
    getAccount,
    getAssociatedTokenAddress,
    getAssociatedTokenAddressSync,
    // Token
} from '@solana/spl-token';

export interface CommonProps {
    cefiBaseURL: string;
    brokerId: string;
    chainId: BigInt;
    orderlyKeypair?: solanaWeb3.Keypair;
    testUsdcTokenAddress?: string;
    vaultProgramAddress: string;
    vaultProgram?: Program<Vault>;
    adminAddress?: string;
    setCefiBaseUrl: (url: string) => void;
    setBrokerId: (brokerId: string) => void;
    setChainId: (chainId: BigInt) => void;
    setOrderlyKeypair: (keypair: solanaWeb3.Keypair) => void;
    setTestUsdcTokenAddress: (address: string) => void;
    setVaultProgramAddress: (address: string) => void;
    setAdminAddress: (address: string) => void;
}

export const chainIds = [900900900, 901901901, 902902902];

export const brockerIds = ['woofi_dex', 'orderly', 'woofi_pro'];

export const localCeFiMockUrl = 'http://localhost:3001';

export const getCeFiBaseURL = (): string => {
    return process.env.CEFI_BASE_UI ? process.env.CEFI_BASE_UI : localCeFiMockUrl;
};

export const defaultLedgerContractAddress = '0x8794E7260517B1766fc7b55cAfcd56e6bf08600e';

export const getLedgerContractAddress = (): string => {
    return process.env.LEDGER_CONTRACT_ADDRESS ? process.env.LEDGER_CONTRACT_ADDRESS : defaultLedgerContractAddress;
};

export const DEFAULT_VAULT_PROGRAM_ADDRESS = '9RhmwHNcLztgcJLHJFU4A3fMsFQMnVwwvnkhxdJQUAEa';
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export const getVaultProgram = (vaultProgramAddress: string) => {
    return new Program<Vault>(IDL, new PublicKey(vaultProgramAddress), {
        connection,
    });
};

export const DEFAULT_USDC_TOKEN_ADDRESS = 'GCbuQSPFGmHpoTaZ9o7zQChYMuprw8qY3FsYQjKjpJMJ';

export const DEFAULT_ADMIN_ADDRESS = '9XCffTvLgdtZmUCZLr2ZStxdKqxajFafA8xrv2jYQxV2';

export const calculateAccountId = (address: string, brokerId: string): string => {
    if (!brokerId || brokerId.trim().length === 0) {
        throw new Error('brokerId illegal');
    }

    const brokerIdHash = bytesToHex(hexToBytes(solidityPackedKeccak256(['string'], [brokerId])));
    // console.log('brokerIdHash:', brokerIdHash);

    let addressBase58Decoded = decodeBase58(address).toString(16);
    // if addressBase58Decoded is less than 64 characters, pad it with zeros
    if (addressBase58Decoded.length < 64) {
        addressBase58Decoded = '0'.repeat(64 - addressBase58Decoded.length) + addressBase58Decoded;
    }

    // console.log('addressBase58Decoded:', addressBase58Decoded);
    const addressBytes = hexToBytes(addressBase58Decoded);
    const addressEncode = defaultAbiCoder.encode(['bytes32'], [addressBytes]);
    // console.log('addressEncode:', addressEncode);

    const concatenate = addressEncode + brokerIdHash;
    // console.log('concatenatedAbiString:', concatenate);

    // Return the keccak256 hash of the concatenated bytes as a hex string
    return '0x' + bytesToHex(keccak256(hexToBytes(concatenate)));
};

export const getAccountId = (props: CommonProps) => {
    return calculateAccountId(encodeBase58(props.orderlyKeypair!.publicKey.toBytes()), props.brokerId);
};

export function bigIntReplacer(key: string, value: any) {
    if (typeof value === 'bigint') {
        return value.toString();
    } else {
        return value;
    }
}

export const doCeFiRequest = async (
    url: string,
    method: string,
    body: string = '',
    headers: any = { 'Content-Type': 'application/json' }
) => {
    // console.log('Request body:', body);
    const response = await fetch(url, {
        method,
        headers: headers,
        body: method === 'POST' ? body : undefined,
    });

    if (response.status !== 200) {
        console.log('Response from external server:', response);
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('Data from CeFi server:', data);

    if (!data.success) {
        throw new Error('Request was not successful');
    }

    return data;
};

// export const getUserTokenAccount = useCallback(async (connection: Connection, mint: PublicKey, owner: PublicKey) => {
//     const associatedToken = await getAssociatedTokenAddress(mint, owner);
//     let account: Account;
//     try {
//         account = await getAccount(connection, associatedToken, 'confirmed');
//     } catch (error: unknown) {
//         if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
//             throw new Error('User token account not found');
//         } else {
//             throw error;
//         }
//     }

//     return account;
// }, []);
