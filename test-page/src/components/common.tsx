import { decodeBase58, solidityPackedKeccak256 } from 'ethers';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { hexToBytes, bytesToHex } from 'ethereum-cryptography/utils';
import { defaultAbiCoder } from '@ethersproject/abi';

export interface CommonProps {
    cefiBaseURL: string;
}

export const chainIds = [900900900, 901901901, 902902902];

export const brockerIds = ['woofi_dex', 'orderly', 'woofi_pro'];

export const getCeFiBaseURL = (): string => {
    return process.env.CEFI_BASE_UI ? process.env.CEFI_BASE_UI : 'http://localhost:3001';
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