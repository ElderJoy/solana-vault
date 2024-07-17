import { useState, type FC, useCallback } from 'react';
import { brockerIds, chainIds, CommonProps } from '../common';
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import BoxWithTitle from '../BoxWithTitle';
import { useNotify } from '../notify';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { hexToBytes, bytesToHex } from 'ethereum-cryptography/utils';
import { defaultAbiCoder } from '@ethersproject/abi';
import { useWallet } from '@solana/wallet-adapter-react';
import { encodeBase58, solidityPackedKeccak256 } from 'ethers';

type RegistrationNonceData = {
    success: boolean;
    data: {
        registration_nonce: string;
    };
    timestamp: number;
};

interface AccountRegistrationMessage {
    message: {
        brokerId: string;
        chainId: BigInt;
        timestamp: BigInt;
        registrationNonce: BigInt;
        chainType: string;
    };
    signature: string;
    userAddress: string;
}

function replacer(key: string, value: any) {
    if (typeof value === 'bigint') {
        return value.toString();
    } else {
        return value;
    }
}

export const RegisterUserAccountBox: FC<CommonProps> = (props) => {
    const [selectedBrokerId, setSelectedBrokerId] = useState<string>();
    const [selectedChainId, setSelectedChainId] = useState<number>();
    const notify = useNotify();
    const { publicKey, signMessage, signTransaction } = useWallet();

    const getRegistrationNonce = async () => {
        const response = await fetch(props.cefiBaseURL + '/v1/registration_nonce', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new Error('Network response was not ok');
        }

        const registrationNonceData: RegistrationNonceData = await response.json();

        if (!registrationNonceData.success) {
            throw new Error('Request was not successful');
        }

        return registrationNonceData.data.registration_nonce;
    };

    const doRegisterAccount = async (accountRegistrationMessage: AccountRegistrationMessage) => {
        const requestBody = JSON.stringify(accountRegistrationMessage, replacer);
        console.log('Request body:', requestBody);
        const response = await fetch(props.cefiBaseURL + '/v1/register_account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody,
        });

        console.log('Response from external server:', response);

        if (response.status !== 200) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Data from external server:', data);

        if (!data.success) {
            throw new Error('Request was not successful');
        }
    };

    const registerAccount = async () => {
        try {
            if (!selectedBrokerId || !selectedChainId) throw new Error('Broker ID and Chain ID must be selected');
            if (!publicKey) throw new Error('Wallet not connected!');
            if (!signMessage) throw new Error('Wallet does not support message signing!');
            if (!signTransaction) throw new Error('Wallet does not support transaction signing!');

            const registrationNonce = BigInt(await getRegistrationNonce());
            const timestamp = BigInt(Date.now());

            const brokerIdHash = solidityPackedKeccak256(['string'], [selectedBrokerId]);
            console.log('Broker ID hash:', brokerIdHash);

            const msgToSign = keccak256(
                hexToBytes(
                    defaultAbiCoder.encode(
                        ['bytes32', 'uint256', 'uint256', 'uint256'],
                        [brokerIdHash, selectedChainId, timestamp, registrationNonce]
                    )
                )
            );

            const msgToSignHex = bytesToHex(msgToSign);
            const msgToSignTextEncoded: Uint8Array = new TextEncoder().encode(msgToSignHex);

            console.log('Broker ID:', selectedBrokerId);
            console.log('Chain ID:', selectedChainId);
            console.log('Registration nonce:', registrationNonce);
            console.log('Timestamp:', timestamp);

            console.log('Message to sign bytes:', msgToSign);
            console.log('Message to sign hex string:', bytesToHex(msgToSign));
            console.log('Message to sign text encoded:', msgToSignTextEncoded);

            const signature = '0x' + bytesToHex(await signMessage(msgToSignTextEncoded));
            console.log('Signature:', signature);

            const accountRegistrationMessage: AccountRegistrationMessage = {
                message: {
                    brokerId: selectedBrokerId,
                    chainId: BigInt(selectedChainId),
                    timestamp: timestamp,
                    registrationNonce: registrationNonce,
                    chainType: 'SOL',
                },
                signature: signature,
                userAddress: encodeBase58(publicKey.toBytes()),
            };

            console.log('Account registration message:', accountRegistrationMessage);
            await doRegisterAccount(accountRegistrationMessage);

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

    const onClick = useCallback(async () => {
        await registerAccount();
    }, []);

    return (
        <BoxWithTitle title="User Registration">
            <FormControl fullWidth margin="normal" variant="standard">
                <InputLabel>Broker ID</InputLabel>
                <Select
                    value={selectedBrokerId}
                    label="Broker ID"
                    onChange={(event) => setSelectedBrokerId(event.target.value)}
                >
                    {brockerIds.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" variant="standard">
                <InputLabel>Chain ID</InputLabel>
                <Select
                    value={selectedChainId}
                    label="Chain ID"
                    onChange={(event) => setSelectedChainId(event.target.value as number)}
                >
                    {chainIds.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Button
                variant="contained"
                color="secondary"
                onClick={registerAccount}
                disabled={!publicKey || !signTransaction || !signMessage || !selectedBrokerId || !selectedChainId}
            >
                Register Account
            </Button>
        </BoxWithTitle>
    );
};
