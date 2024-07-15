import { useEffect, useState, type FC, useCallback } from 'react';
import { brockerIds, chainIds, CommonProps } from '../common';
import { Button, CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import BoxWithTitle from '../BoxWithTitle';
import { useNotify } from '../notify';
import { keccak256 as keccak256_2 } from 'ethereum-cryptography/keccak';
import { hexToBytes, bytesToHex } from 'ethereum-cryptography/utils';
import { defaultAbiCoder } from '@ethersproject/abi';
import { useWallet } from '@solana/wallet-adapter-react';
import { encodeBase58, toUtf8Bytes, keccak256 } from 'ethers';
import * as solanaWeb3 from '@solana/web3.js';

export const SignCheckBox: FC<CommonProps> = (props) => {
    const notify = useNotify();
    const { publicKey, signMessage } = useWallet();

    function bytes32StringToUint8Array(hexString: string): Uint8Array {
        // Remove '0x' prefix if present
        if (hexString.startsWith('0x')) {
            hexString = hexString.slice(2);
        }

        // Ensure the string is 64 hex characters long (32 bytes)
        if (hexString.length !== 64) {
            throw new Error('Invalid bytes32 string length');
        }

        // Convert hex string to Buffer
        const buffer = Buffer.from(hexString, 'hex');

        // Convert Buffer to Uint8Array
        return new Uint8Array(buffer);
    }

    function uint8ArrayToHexString(byteArray: Uint8Array): string {
        // Convert Uint8Array to Buffer
        const buffer = Buffer.from(byteArray);

        // Convert Buffer to hex string
        return buffer.toString('hex');
    }

    function appendZeroBytes(array: Uint8Array, numZeroBytes: number = 9): Uint8Array {
        // Create a new Uint8Array with the combined length
        const newArray = new Uint8Array(array.length + numZeroBytes);

        // Copy the original array into the new array
        newArray.set(array, 0);

        // The remaining bytes are already zero-initialized, so no need to set them manually

        return newArray;
    }

    const checkSignature = async () => {
        try {
            if (!publicKey) throw new Error('Wallet not connected!');
            if (!signMessage) throw new Error('Wallet does not support message signing!');

            const message = 'The quick brown fox jumps over the lazy dog';
            const msgHash = keccak256(toUtf8Bytes(message));
            console.log('msgHash:', msgHash);

            const messageBytes = appendZeroBytes(bytes32StringToUint8Array(msgHash));
            console.log(`messageBytes: ${uint8ArrayToHexString(messageBytes)}, length: ${messageBytes.length}`);

            const msgToSignHex = bytesToHex(messageBytes);
            const msgToSignTextEncoded: Uint8Array = new TextEncoder().encode(msgToSignHex);
            const signature = await signMessage(msgToSignTextEncoded);
            console.log(`signature: ${uint8ArrayToHexString(signature)}, length: ${signature.length}`);

            console.log(
                `publicKey: ${uint8ArrayToHexString(publicKey.toBytes())}, length: ${publicKey.toBytes().length}`
            );

            notify('success', 'Account registration successful');
        } catch (error) {
            console.log(error);
            if (error instanceof Error) {
                notify('error', error.message);
            } else {
                // Handle cases where the error is not an instance of Error
                // For example, you might want to set a generic error message
                notify('error', 'An unexpected error occurred');
            }
        }
    };

    return (
        <BoxWithTitle title="Check solana wallet sinature">
            <Button
                variant="contained"
                color="secondary"
                onClick={checkSignature}
                disabled={!publicKey || !signMessage}
            >
                Check Signature
            </Button>
        </BoxWithTitle>
    );
};
