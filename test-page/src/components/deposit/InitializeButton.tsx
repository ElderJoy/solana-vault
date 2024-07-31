import { type FC, useCallback } from 'react';
import { CommonProps } from '../common';
import { Button } from '@mui/material';
import { useNotify } from '../notify';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
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
import { BN } from '@coral-xyz/anchor';

export const InitializeButton: FC<CommonProps> = (props) => {
    const { publicKey, sendTransaction, signTransaction } = useWallet();
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const notify = useNotify();

    const Initialize = useCallback(async () => {
        try {
            if (!publicKey || !wallet || !sendTransaction || !props.testUsdcTokenAddress || !props.vaultProgram) {
                throw new Error('Wallet, publicKey, testUsdcTokenAddress, or vaultProgram not available');
            }

            const tokenPublicKey = new PublicKey(props.testUsdcTokenAddress);

            const [vaultDepositAuthority] = PublicKey.findProgramAddressSync(
                [Buffer.from('vault_deposit_authority'), tokenPublicKey.toBuffer()],
                props.vaultProgram.programId
            );

            const vaultDepositWallet = getAssociatedTokenAddressSync(tokenPublicKey, vaultDepositAuthority, true);

            console.log(`tokenPublicKey: ${tokenPublicKey.toBase58()}`);
            console.log(`vaultDepositAuthority: ${vaultDepositAuthority.toBase58()}`);

            let transaction = await props.vaultProgram.methods
                .initialize()
                .accounts({
                    depositToken: tokenPublicKey,
                    vaultDepositAuthority,
                    user: publicKey,
                })
                .transaction();
            console.log('Initialize transaction signature', transaction);

            const transactionSignature = await sendTransaction(transaction, connection);

            console.log(`View on explorer: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);

            notify('success', 'Initialize successful');
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
            onClick={Initialize}
            disabled={!publicKey || !sendTransaction || !props.vaultProgram || !props.adminAddress}
        >
            Initialize Vault
        </Button>
    );
};
