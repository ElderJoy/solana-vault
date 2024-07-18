import { type FC } from 'react';
import { bigIntReplacer, CommonProps, doCeFiRequest } from '../common';
import { Button } from '@mui/material';
import { useNotify } from '../notify';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { hexToBytes, bytesToHex } from 'ethereum-cryptography/utils';
import { defaultAbiCoder } from '@ethersproject/abi';
import { useWallet } from '@solana/wallet-adapter-react';
import { encodeBase58, solidityPackedKeccak256 } from 'ethers';

type WithdrawNonceData = {
    success: boolean;
    data: {
        withdraw_nonce: string;
    };
    timestamp: number;
};

interface WithdrawMessage extends BaseMessage {
    receiver: string;
    token: string;
    amount: BigInt;
    withdrawNonce: BigInt;
}

interface AccountWithdrawBody extends BaseBody<WithdrawMessage> {
    verifyingContract: string;
}

export const WithdrawButton: FC<CommonProps> = (props) => {
    const notify = useNotify();
    const { publicKey, signMessage } = useWallet();

    const withdrawAccount = async () => {
        try {
            if (!publicKey) throw new Error('Wallet not connected!');
            if (!signMessage) throw new Error('Wallet does not support message signing!');

            const withdrawNonce = BigInt((await doCeFiRequest('GET', '', props.cefiBaseURL + '/v1/withdraw_nonce')).data.withdraw_nonce);
            const timestamp = BigInt(Date.now());
            const brokerIdHash = solidityPackedKeccak256(['string'], [props.brokerId]);
            const msgToSign = keccak256(
                hexToBytes(
                    defaultAbiCoder.encode(
                        ['bytes32', 'uint256', 'uint256', 'uint256'],
                        [brokerIdHash, props.chainId, timestamp, withdrawNonce]
                    )
                )
            );
            const msgToSignHex = bytesToHex(msgToSign);
            const msgToSignTextEncoded: Uint8Array = new TextEncoder().encode(msgToSignHex);

            // console.log('Broker ID:', props.brokerId);
            // console.log('Broker ID hash:', brokerIdHash);
            // console.log('Chain ID:', props.chainId);
            // console.log('Withdraw nonce:', withdrawNonce);
            // console.log('Timestamp:', timestamp);
            // console.log('Message to sign hex string:', bytesToHex(msgToSign));
            // console.log('Message to sign text encoded:', msgToSignTextEncoded);

            const signature = '0x' + bytesToHex(await signMessage(msgToSignTextEncoded));
            // console.log('Signature:', signature);

            const userAddress = encodeBase58(publicKey.toBytes());

            const accountWithdrawBody: AccountWithdrawBody = {
                message: {
                    brokerId: props.brokerId,
                    chainId: props.chainId,
                    timestamp: timestamp,
                    receiver: userAddress,
                    token: 'USDC',
                    amount: BigInt(100000000),
                    withdrawNonce: withdrawNonce,
                    chainType: 'SOL',
                },
                signature: signature,
                userAddress,
                verifyingContract: "0x8794E7260517B1766fc7b55cAfcd56e6bf08600e"
            };

            console.log('Account withdraw message:', accountWithdrawBody);
            await doCeFiRequest('POST', JSON.stringify(accountWithdrawBody, bigIntReplacer), props.cefiBaseURL + '/v1/withdraw_request');

            notify('success', 'Account withdraw successful');
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
            onClick={withdrawAccount}
            style={{ marginRight: '1rem' }}
            disabled={!publicKey || !signMessage || !props.keypair}
        >
            Withdraw Account
        </Button>
    );
};
