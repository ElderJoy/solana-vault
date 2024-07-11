import { FormControlLabel, Switch, Table, TableBody, TableCell, TableRow, Tooltip } from '@mui/material';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';
import { useAutoConnect } from '../components/wallet/AutoConnectProvider';
import RegisterUserAccountBox from '../components/withdraw/RegisterUserAccount';

const MaterialUIWalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-material-ui')).WalletMultiButton,
    { ssr: false }
);

const RequestAirdropDynamic = dynamic(
    async () => (await import('../components/wallet/RequestAirdrop')).RequestAirdrop,
    {
        ssr: false,
    }
);
const SendLegacyTransactionDynamic = dynamic(
    async () => (await import('../components/wallet/SendLegacyTransaction')).SendLegacyTransaction,
    { ssr: false }
);
const SendTransactionDynamic = dynamic(
    async () => (await import('../components/wallet/SendTransaction')).SendTransaction,
    {
        ssr: false,
    }
);
const SendV0TransactionDynamic = dynamic(
    async () => (await import('../components/wallet/SendV0Transaction')).SendV0Transaction,
    { ssr: false }
);
const SignInDynamic = dynamic(async () => (await import('../components/wallet/SignIn')).SignIn, { ssr: false });
const SignMessageDynamic = dynamic(async () => (await import('../components/wallet/SignMessage')).SignMessage, {
    ssr: false,
});
const SignTransactionDynamic = dynamic(
    async () => (await import('../components/wallet/SignTransaction')).SignTransaction,
    {
        ssr: false,
    }
);

const Index: NextPage = () => {
    const { autoConnect, setAutoConnect } = useAutoConnect();

    return (
        <>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <MaterialUIWalletMultiButtonDynamic />
                        </TableCell>
                        <TableCell>
                            <Tooltip title="Only runs if the wallet is ready to connect" placement="left">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="autoConnect"
                                            color="secondary"
                                            checked={autoConnect}
                                            onChange={(event, checked) => setAutoConnect(checked)}
                                        />
                                    }
                                    label="AutoConnect"
                                />
                            </Tooltip>
                        </TableCell>{' '}
                    </TableRow>
                </TableBody>
            </Table>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <RequestAirdropDynamic />
                        </TableCell>
                        <TableCell>
                            <SignTransactionDynamic />
                        </TableCell>
                        <TableCell>
                            <SignMessageDynamic />
                        </TableCell>
                        <TableCell>
                            <SignInDynamic />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <SendTransactionDynamic />
                        </TableCell>
                        <TableCell>
                            <SendLegacyTransactionDynamic />
                        </TableCell>
                        <TableCell>
                            <SendV0TransactionDynamic />
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <RegisterUserAccountBox />
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </>
    );
};

export default Index;
