import { type FC, useCallback } from 'react';
import { CommonProps } from '../common';
import { Button } from '@mui/material';
import { useNotify } from '../notify';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair, Transaction } from '@solana/web3.js';
import {
    Account,
    TOKEN_PROGRAM_ID,
    TokenAccountNotFoundError,
    TokenInvalidAccountOwnerError,
    createAssociatedTokenAccountInstruction,
    getAccount,
    getAssociatedTokenAddress,
    // Token
} from "@solana/spl-token";
import { BN, Program } from "@coral-xyz/anchor";


export const DepositButton: FC<CommonProps> = (props) => {
    const { publicKey, sendTransaction, signTransaction } = useWallet();
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const notify = useNotify();

    const getUserTokenAccount = useCallback(async (mint: PublicKey, owner: PublicKey) => {
        const associatedToken = await getAssociatedTokenAddress(
            mint,
            owner
        );
        let account: Account;
        try {
            account = await getAccount(connection, associatedToken, 'confirmed');
        } catch (error: unknown) {
            if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
                throw new Error('User token account not found');
            } else {
                throw error;
            }
        }

        return account;
    }, [publicKey, connection, sendTransaction, notify]);

    const getOrCreateAssociatedTokenAccount = useCallback(async (mint: PublicKey, owner: PublicKey) => {
        const associatedToken = await getAssociatedTokenAddress(
            mint,
            owner
        );
        let account: Account;
        try {
            account = await getAccount(connection, associatedToken, 'confirmed');
        } catch (error: unknown) {
            if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
                try {
                    const transaction = new Transaction().add(
                        createAssociatedTokenAccountInstruction(
                            publicKey!,
                            associatedToken,
                            owner,
                            mint
                        )
                    );

                    await sendTransaction(transaction, connection);
                } catch (error: unknown) {
                }
                account = await getAccount(connection, associatedToken, 'confirmed');
            } else {
                throw error;
            }
        }

        return account;
    }, [publicKey, connection, sendTransaction, notify]);

    const Deposit = useCallback(async () => {
        try {
            if (!publicKey || !wallet || !signTransaction || !sendTransaction || !props.testUsdcTokenAddress || !props.vaultProgram || !props.adminAddress) {
                throw new Error('Wallet, testUsdcTokenAddress, vaultProgram, or adminAddress not available');
            }

            const tokenPublicKey = new PublicKey(props.testUsdcTokenAddress);
            const adminPublicKey = new PublicKey(props.adminAddress);

            const userTokenAccount = await getUserTokenAccount(tokenPublicKey, publicKey);
            const userAssociatedTokenAddress = userTokenAccount.address;

            const adminTokenAccount = await getOrCreateAssociatedTokenAccount(tokenPublicKey, adminPublicKey);
            const adminAssociatedTokenAddress = adminTokenAccount.address;

            const [pda] = PublicKey.findProgramAddressSync(
                [publicKey.toBuffer()],
                props.vaultProgram.programId
            );

            console.log(`tokenPublicKey: ${tokenPublicKey.toBase58()}`);
            console.log(`adminPublicKey: ${adminPublicKey.toBase58()}`);
            console.log(`adminAssociatedTokenAddress: ${adminAssociatedTokenAddress.toBase58()}`);
            console.log(`userAssociatedTokenAddress: ${userAssociatedTokenAddress.toBase58()}`);
            console.log(`user token amount: ${userTokenAccount.amount.toString()}`);
            console.log(`pda: ${pda.toBase58()}`);

            let transaction = await props.vaultProgram.methods.deposit(new BN(1000)).accounts({
                user: publicKey,
                admin: adminPublicKey,
                userInfo: pda,
                userDepositWallet: userAssociatedTokenAddress,
                adminDepositWallet: adminAssociatedTokenAddress,
                depositToken: tokenPublicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
            }).transaction();
            console.log("Deposit transaction signature", transaction);

            const transactionSignature = await sendTransaction(transaction, connection);

            console.log(`View on explorer: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);

            notify('success', 'Deposit successful');
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
            onClick={Deposit}
            disabled={!publicKey || !sendTransaction || !props.vaultProgram || !props.adminAddress}
        >
            Deposit
        </Button>
    );
};
