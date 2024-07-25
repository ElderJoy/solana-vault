import { type FC, useCallback } from 'react';
import { CommonProps } from '../common';
import { Button } from '@mui/material';
import { useNotify } from '../notify';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

export const DepositInitButton: FC<CommonProps> = (props) => {
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const notify = useNotify();

    const DepositInit = useCallback(async () => {
        try {
            const transaction = await props.vaultProgram!.methods.initialize().transaction();

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
            disabled={!publicKey || !sendTransaction || !props.vaultProgram}
        >
            Deposit Init
        </Button>
    );
};
