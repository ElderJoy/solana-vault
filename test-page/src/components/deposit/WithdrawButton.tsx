import { type FC, useCallback } from 'react';
import { CommonProps } from '../common';
import { Button } from '@mui/material';
import { useNotify } from '../notify';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
    Account,
    TOKEN_PROGRAM_ID,
    TokenAccountNotFoundError,
    TokenInvalidAccountOwnerError,
    getAccount,
    getAssociatedTokenAddress,
    getAssociatedTokenAddressSync,
    // Token
} from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';

export const WithdrawButton: FC<CommonProps> = (props) => {
    const { publicKey, sendTransaction, signTransaction } = useWallet();
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const notify = useNotify();

    const getUserTokenAccount = useCallback(
        async (mint: PublicKey, owner: PublicKey) => {
            const associatedToken = await getAssociatedTokenAddress(mint, owner);
            let account: Account;
            try {
                account = await getAccount(connection, associatedToken, 'confirmed');
            } catch (error: unknown) {
                if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
                    throw new Error('User token account should be created before depositing');
                } else {
                    throw error;
                }
            }

            return account;
        },
        [publicKey, connection, sendTransaction, notify]
    );

    const Withdraw = useCallback(async () => {
        try {
            if (
                !publicKey ||
                !wallet ||
                !signTransaction ||
                !sendTransaction ||
                !props.testUsdcTokenAddress ||
                !props.vaultProgram ||
                !props.adminAddress
            ) {
                throw new Error('Wallet, testUsdcTokenAddress, vaultProgram, or adminAddress not available');
            }

            const tokenPublicKey = new PublicKey(props.testUsdcTokenAddress);

            const userTokenAccount = await getUserTokenAccount(tokenPublicKey, publicKey);
            const userDepositWallet = userTokenAccount.address;

            const [vaultDepositAuthority] = PublicKey.findProgramAddressSync(
                [Buffer.from('vault_deposit_authority'), tokenPublicKey.toBuffer()],
                props.vaultProgram.programId
            );

            const vaultDepositWallet = getAssociatedTokenAddressSync(tokenPublicKey, vaultDepositAuthority, true);

            const [pda] = PublicKey.findProgramAddressSync([publicKey.toBuffer()], props.vaultProgram.programId);

            console.log(`tokenPublicKey: ${tokenPublicKey.toBase58()}`);
            console.log(`userDepositWallet: ${userDepositWallet.toBase58()}`);
            console.log(`user token amount: ${userTokenAccount.amount.toString()}`);
            console.log(`pda: ${pda.toBase58()}`);
            console.log(`vaultDepositAuthority: ${vaultDepositAuthority.toBase58()}`);
            console.log(`vaultDepositWallet: ${vaultDepositWallet.toBase58()}`);

            let transaction = await props.vaultProgram.methods
                .withdraw(new BN(1000))
                .accounts({
                    user: publicKey,
                    userInfo: pda,
                    userDepositWallet,
                    vaultDepositAuthority,
                    vaultDepositWallet,
                    depositToken: tokenPublicKey,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .transaction();
            console.log('Withdraw transaction signature', transaction);

            const transactionSignature = await sendTransaction(transaction, connection);

            console.log(`View on explorer: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);

            notify('success', 'Withdraw successful');
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
            onClick={Withdraw}
            disabled={!publicKey || !sendTransaction || !props.vaultProgram || !props.adminAddress}
        >
            Withdraw from Vault
        </Button>
    );
};
