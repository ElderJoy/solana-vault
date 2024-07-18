import { decodeBase58, solidityPackedKeccak256 } from 'ethers';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { hexToBytes, bytesToHex } from 'ethereum-cryptography/utils';
import { defaultAbiCoder } from '@ethersproject/abi';
import * as solanaWeb3 from "@solana/web3.js"

export interface CommonProps {
    cefiBaseURL: string;
    brokerId: string;
    chainId: BigInt;
    keypair: solanaWeb3.Keypair | undefined;
    setCefiBaseUrl: (url: string) => void;
    setBrokerId: (brokerId: string) => void;
    setChainId: (chainId: BigInt) => void;
    setKeypair: (keypair: solanaWeb3.Keypair) => void;
}

export const chainIds = [900900900, 901901901, 902902902];

export const brockerIds = ['woofi_dex', 'orderly', 'woofi_pro'];

export const localCeFiMockUrl = 'http://localhost:3001';

export const getCeFiBaseURL = (): string => {
    return process.env.CEFI_BASE_UI ? process.env.CEFI_BASE_UI : localCeFiMockUrl;
};

export const calculateAccountId = (address: string, brokerId: string): string => {
    if (!brokerId || brokerId.trim().length === 0) {
        throw new Error("brokerId illegal");
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
    return bytesToHex(keccak256(hexToBytes(concatenate)));
}

export function bigIntReplacer(key: string, value: any) {
    if (typeof value === 'bigint') {
        return value.toString();
    } else {
        return value;
    }
}

export const doCeFiRequest = async (method: string, body: string, url: string) => {
    // console.log('Request body:', body);
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
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