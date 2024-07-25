import { FormControlLabel, Switch, Table, TableBody, TableCell, TableCellProps, TableRow, Tooltip } from '@mui/material';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';
import { useAutoConnect } from '../components/wallet/AutoConnectProvider';
import { DEFAULT_VAULT_PROGRAM_ADDRESS, brockerIds, chainIds, CommonProps, getCeFiBaseURL, getVaultProgram, localCeFiMockUrl, DEFAULT_USDC_TOKEN_ADDRESS, DEFAULT_ADMIN_ADDRESS } from '../components/common';
import { CeFiBaseUrlView } from '../components/withdraw/CeFiBaseUrl';
import { CommonValuesCheck } from '../components/withdraw/CommonValuesCheck';
import { RegisterUserAccountButton } from '../components/withdraw/RegisterUserAccountButton';
import { OrderlyKeyButton } from '../components/withdraw/OrderlyKeyButton';
import { WithdrawButton } from '../components/withdraw/WithdrawButton';
import * as solanaWeb3 from "@solana/web3.js"
import { OrderlySignCheckButton } from '../components/withdraw/OrderlySignCheckButton';
import { DepositInitButton } from '../components/deposit/DepositInitButton';
import BoxWithTitle from '../components/BoxWithTitle';

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
    const [showWalletAdapterWidgets, setShowWalletAdapterWidgets] = React.useState<boolean>(false);
    const [cefiBaseURL, setCefiBaseUrl] = React.useState<string>(getCeFiBaseURL());
    const [brokerId, setBrokerId] = React.useState<string>(brockerIds[0]);
    const [chainId, setChainId] = React.useState<BigInt>(BigInt(chainIds[2]));
    const [orderlyKeypair, setOrderlyKeypair] = React.useState<solanaWeb3.Keypair>();
    const [testUsdcTokenAddress, setTestUsdcTokenAddress] = React.useState<string>(process.env.TEST_USDC_TOKEN_ADDRESS ? process.env.TEST_USDC_TOKEN_ADDRESS : DEFAULT_USDC_TOKEN_ADDRESS);
    const [vaultProgramAddress, setVaultProgramAddress] = React.useState<string>(process.env.VAULT_PROGRAM_ADDRESS ? process.env.VAULT_PROGRAM_ADDRESS : DEFAULT_VAULT_PROGRAM_ADDRESS);
    const [vaultProgram, setVaultProgram] = React.useState(getVaultProgram(vaultProgramAddress));
    const [adminAddress, setAdminAddress] = React.useState<string>(process.env.ADMIN_ADDRESS ? process.env.ADMIN_ADDRESS : DEFAULT_ADMIN_ADDRESS);

    const setVaultProgramAddressAndProgram = (address: string) => {
        setVaultProgramAddress(address);
        setVaultProgram(getVaultProgram(address));
    }

    const commonProps: CommonProps = {
        cefiBaseURL,
        brokerId,
        chainId,
        orderlyKeypair,
        testUsdcTokenAddress,
        vaultProgramAddress,
        vaultProgram,
        adminAddress,
        setCefiBaseUrl,
        setBrokerId,
        setChainId,
        setOrderlyKeypair,
        setTestUsdcTokenAddress,
        setVaultProgramAddress: setVaultProgramAddressAndProgram,
        setAdminAddress,
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
                                            name="LocalCeFiMock"
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
                    <TableRow>
                        <QuaterWidthTableCell>
                            <BoxWithTitle title="Vault program address">{commonProps.vaultProgramAddress ? commonProps.vaultProgramAddress : 'not set'}</BoxWithTitle>
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <BoxWithTitle title="Test USDC token address">{commonProps.testUsdcTokenAddress ? commonProps.testUsdcTokenAddress : 'not set'}</BoxWithTitle>
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <BoxWithTitle title="Admin address">{commonProps.adminAddress ? commonProps.adminAddress : 'not set'}</BoxWithTitle>
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell></QuaterWidthTableCell>
                    </TableRow>
                    <TableRow>
                        <QuaterWidthTableCell>
                            <DepositInitButton {...commonProps} />
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell></QuaterWidthTableCell>
                        <QuaterWidthTableCell></QuaterWidthTableCell>
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
                            <WithdrawButton {...commonProps} />
                        </QuaterWidthTableCell>
                    </TableRow>
                    {/* <TableRow>
                        <QuaterWidthTableCell>
                            <OrderlySignCheckButton {...commonProps} />
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell></QuaterWidthTableCell>
                        <QuaterWidthTableCell></QuaterWidthTableCell>
                        <QuaterWidthTableCell></QuaterWidthTableCell>
                    </TableRow> */}
                    <TableRow>
                        <QuaterWidthTableCell>
                            <Tooltip title="Show wallet-adapter widgets" placement="left">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="ShowWalletAdapterWidgets"
                                            color="secondary"
                                            checked={showWalletAdapterWidgets === true}
                                            onChange={(event, checked) => { setShowWalletAdapterWidgets(checked); }}
                                        />
                                    }
                                    label="Show wallet-adapter widgets"
                                />
                            </Tooltip>
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <div style={{ display: showWalletAdapterWidgets ? 'block' : 'none' }}>
                                <SignInDynamic />
                            </div>
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <div style={{ display: showWalletAdapterWidgets ? 'block' : 'none' }}>
                                <SignMessageDynamic />
                            </div>
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <div style={{ display: showWalletAdapterWidgets ? 'block' : 'none' }}>
                                <RequestAirdropDynamic />
                            </div>
                        </QuaterWidthTableCell>
                    </TableRow>
                    <TableRow sx={{ display: showWalletAdapterWidgets ? 'table-row' : 'none' }}>
                        <QuaterWidthTableCell>
                            <SignTransactionDynamic />
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <SendTransactionDynamic />
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <SendLegacyTransactionDynamic />
                        </QuaterWidthTableCell>
                        <QuaterWidthTableCell>
                            <SendV0TransactionDynamic />
                        </QuaterWidthTableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </>
    );
};

export default Index;
