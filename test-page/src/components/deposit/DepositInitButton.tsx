import { type FC, useCallback } from 'react';
import { CommonProps } from '../common';
import { Button } from '@mui/material';
import { useNotify } from '../notify';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair } from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    // Token
} from "@solana/spl-token";
import { BN, Program } from "@coral-xyz/anchor";


export const DepositInitButton: FC<CommonProps> = (props) => {
    const { publicKey, sendTransaction, signTransaction } = useWallet();
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const notify = useNotify();

    const DepositInit = useCallback(async () => {
        try {
            if (!publicKey || !wallet || !signTransaction || !sendTransaction || !props.testUsdcTokenAddress || !props.vaultProgram || !props.adminAddress) {
                throw new Error('Wallet, testUsdcTokenAddress, vaultProgram, or adminAddress not available');
            }

            const tokenPublicKey = new PublicKey(props.testUsdcTokenAddress);
            const adminPublicKey = new PublicKey(props.adminAddress);
            const adminAssociatedTokenAddress = await getAssociatedTokenAddress(
                tokenPublicKey,
                adminPublicKey
            );
            const userAssociatedTokenAddress = await getAssociatedTokenAddress(
                tokenPublicKey,
                publicKey
            );
            const [pda] = PublicKey.findProgramAddressSync(
                [publicKey.toBuffer()],
                props.vaultProgram.programId
            );

            console.log(`tokenPublicKey: ${tokenPublicKey.toBase58()}`);
            console.log(`adminPublicKey: ${adminPublicKey.toBase58()}`);
            console.log(`adminAssociatedTokenAddress: ${adminAssociatedTokenAddress.toBase58()}`);
            console.log(`userAssociatedTokenAddress: ${userAssociatedTokenAddress.toBase58()}`);
            console.log(`pda: ${pda.toBase58()}`);

            let transaction = await props.vaultProgram.methods.initialize().accounts({
                user: publicKey,
                userInfo: pda,
            }).transaction();
            console.log("Deposit initialize transaction signature", transaction);

            // const { blockhash } = await connection.getLatestBlockhash();
            // transaction.recentBlockhash = blockhash;
            // transaction.feePayer = publicKey;

            // transaction = await signTransaction(transaction);

            const transactionSignature = await sendTransaction(transaction, connection);

            console.log(`View on explorer: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);

            notify('success', 'Deposit init successful');
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
    }, [publicKey, connection, sendTransaction, notify]);

    return (
        <Button
            variant="contained"
            color="primary"
            onClick={DepositInit}
            disabled={!publicKey || !sendTransaction || !props.vaultProgram || !props.adminAddress}
        >
            Deposit init
        </Button>
    );
};
