import { FormControlLabel, Switch, Table, TableBody, TableCell, TableCellProps, TableRow, Tooltip } from '@mui/material';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';
import { useAutoConnect } from '../components/wallet/AutoConnectProvider';
import { brockerIds, chainIds, CommonProps, getCeFiBaseURL, localCeFiMockUrl } from '../components/common';
import { CeFiBaseUrlView } from '../components/withdraw/CeFiBaseUrl';
import { SignCheckButton } from '../components/withdraw/SignCheckButton';
import { CommonValuesCheck } from '../components/withdraw/CommonValuesCheck';
import { RegisterUserAccountButton } from '../components/withdraw/RegisterUserAccountButton';
import { OrderlyKeyButton } from '../components/withdraw/OrderlyKeyButton';

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
    const [cefiBaseURL, setCefiBaseUrl] = React.useState<string>(getCeFiBaseURL());
    const [brokerId, setBrokerId] = React.useState<string>(brockerIds[0]);
    const [chainId, setChainId] = React.useState<BigInt>(BigInt(chainIds[0]));

    const commonProps: CommonProps = {
        cefiBaseURL,
        brokerId,
        chainId,
        setCefiBaseUrl,
        setBrokerId,
        setChainId,
    };

    const QuaterWidthTableCell: React.FC<TableCellProps> = (props) => {
        return <TableCell style={{ width: '25%' }} {...props} />;
    };

    return (
        <>
            <Table>
                <TableBody>
                    <TableRow>
                        <QuaterWidthTableCell>
                            <MaterialUIWalletMultiButtonDynamic />
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
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
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <Tooltip title="Switch to local CeFi mock" placement="left">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="Local CeFi mock"
                                            color="secondary"
                                            checked={cefiBaseURL === localCeFiMockUrl}
                                            onChange={(event, checked) => { if (checked) setCefiBaseUrl(localCeFiMockUrl); else setCefiBaseUrl(getCeFiBaseURL()); }}
                                        />
                                    }
                                    label="Local CeFi mock"
                                />
                            </Tooltip>
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <CeFiBaseUrlView {...commonProps} />
                        </QuaterWidthTableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Table>
                <TableBody>
                    <TableRow>
                        <QuaterWidthTableCell>
                            <RequestAirdropDynamic />
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <SignTransactionDynamic />
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <SignMessageDynamic />
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <SignInDynamic />
                        </QuaterWidthTableCell>
                    </TableRow>
                    <TableRow>
                        <QuaterWidthTableCell>
                            <SendTransactionDynamic />
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <SendLegacyTransactionDynamic />
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <SendV0TransactionDynamic />
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell></QuaterWidthTableCell>
                    </TableRow>
                    <TableRow>
                        <QuaterWidthTableCell>
                            <CommonValuesCheck {...commonProps} />
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <RegisterUserAccountButton {...commonProps} />
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <OrderlyKeyButton {...commonProps} />
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <SignCheckButton {...commonProps} />
                        </QuaterWidthTableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </>
    );
};

export default Index;
