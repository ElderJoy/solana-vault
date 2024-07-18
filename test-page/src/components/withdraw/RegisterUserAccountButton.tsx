import { type FC } from 'react';
import { bigIntReplacer, CommonProps, doCeFiRequest } from '../common';
import { Button } from '@mui/material';
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

interface AccountRegistrationMessage extends BaseMessage {
    registrationNonce: BigInt;
}

interface AccountRegistrationBody extends BaseBody<AccountRegistrationMessage> { }

export const RegisterUserAccountButton: FC<CommonProps> = (props) => {
    const notify = useNotify();
    const { publicKey, signMessage } = useWallet();

    const registerAccount = async () => {
        try {
            if (!publicKey) throw new Error('Wallet not connected!');
            if (!signMessage) throw new Error('Wallet does not support message signing!');

            // const registrationNonce = BigInt(await getRegistrationNonce());
            const registrationNonce = BigInt((await doCeFiRequest('GET', '', props.cefiBaseURL + '/v1/registration_nonce')).data.registration_nonce);
            const timestamp = BigInt(Date.now());
            const brokerIdHash = solidityPackedKeccak256(['string'], [props.brokerId]);
            const msgToSign = keccak256(
                hexToBytes(
                    defaultAbiCoder.encode(
                        ['bytes32', 'uint256', 'uint256', 'uint256'],
                        [brokerIdHash, props.chainId, timestamp, registrationNonce]
                    )
                )
            );
            const msgToSignHex = bytesToHex(msgToSign);
            const msgToSignTextEncoded: Uint8Array = new TextEncoder().encode(msgToSignHex);

            // console.log('Broker ID:', props.brokerId);
            // console.log('Broker ID hash:', brokerIdHash);
            // console.log('Chain ID:', props.chainId);
            // console.log('Registration nonce:', registrationNonce);
            // console.log('Timestamp:', timestamp);
            // console.log('Message to sign hex string:', bytesToHex(msgToSign));
            // console.log('Message to sign text encoded:', msgToSignTextEncoded);

            const signature = '0x' + bytesToHex(await signMessage(msgToSignTextEncoded));
            // console.log('Signature:', signature);

            const accountRegistrationBody: AccountRegistrationBody = {
                message: {
                    brokerId: props.brokerId,
                    chainId: props.chainId,
                    timestamp: timestamp,
                    registrationNonce: registrationNonce,
                    chainType: 'SOL',
                },
                signature: signature,
                userAddress: encodeBase58(publicKey.toBytes()),
            };

            console.log('Account registration message:', accountRegistrationBody);
            await doCeFiRequest('POST', JSON.stringify(accountRegistrationBody, bigIntReplacer), props.cefiBaseURL + '/v1/register_account');

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
        <Button
            variant="contained"
            color="secondary"
            onClick={registerAccount}
            style={{ marginRight: '1rem' }}
            disabled={!publicKey || !signMessage}
        >
            Register Account
        </Button>
    );
};
