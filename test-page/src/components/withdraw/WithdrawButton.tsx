import { type FC } from 'react';
import { bigIntReplacer, calculateAccountId, CommonProps, doCeFiRequest } from '../common';
import { Button } from '@mui/material';
import { useNotify } from '../notify';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { hexToBytes, bytesToHex } from 'ethereum-cryptography/utils';
import { defaultAbiCoder } from '@ethersproject/abi';
import { useWallet } from '@solana/wallet-adapter-react';
import { encodeBase58, solidityPackedKeccak256 } from 'ethers';
import nacl from "tweetnacl";

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

    const getWithdrawNonce = async (timestamp: BigInt) => {
        const messageToSign = Buffer.from(timestamp.toString() + "GET/v1/withdraw_nonce");
        const signature = Buffer.from(nacl.sign.detached(messageToSign, props.keypair!.secretKey)).toString('base64');
        const orderlyKey = 'ed25519:' + props.keypair?.publicKey.toBase58();
        const userAddress = encodeBase58(publicKey!.toBytes());
        const orderlyAccountId = calculateAccountId(userAddress, props.brokerId);
        console.log('Orderly account ID:', orderlyAccountId);
        const headers = {
            'orderly-account-id': orderlyAccountId,
            'orderly-key': orderlyKey,
            'orderly-timestamp': timestamp.toString(),
            'orderly-signature': signature,
        };
        const withdrawNonce = BigInt((await doCeFiRequest(props.cefiBaseURL + '/v1/withdraw_nonce', 'GET', '', headers)).data.withdraw_nonce);
        return withdrawNonce;
    };

    const withdraw = async () => {
        try {
            if (!publicKey) throw new Error('Wallet not connected!');
            if (!signMessage) throw new Error('Wallet does not support message signing!');

            const timestamp = BigInt(Date.now());
            const withdrawNonce = await getWithdrawNonce(timestamp);
            const tokenSymbol = 'USDC';
            const tokenAmount = BigInt(100000000);
            const userAddress = encodeBase58(publicKey.toBytes());
            const brokerIdHash = solidityPackedKeccak256(['string'], [props.brokerId]);
            const tokenSymbolHash = solidityPackedKeccak256(['string'], [tokenSymbol]);
            console.log('Broker ID hash:', brokerIdHash);
            console.log('Token symbol hash:', tokenSymbolHash);
            const salt = keccak256(Buffer.from("Orderly Network"));
            console.log('Salt:', salt);
            const msgToSign = keccak256(
                hexToBytes(
                    defaultAbiCoder.encode(
                        ['bytes32', 'bytes32', 'uint256', 'bytes32', 'uint256', 'uint64', 'uint64', 'bytes32'],
                        [brokerIdHash, tokenSymbolHash, props.chainId, publicKey.toBytes(), tokenAmount, withdrawNonce, timestamp, salt]
                    )
                )
            );

            const msgToSignHex = bytesToHex(msgToSign);
            const msgToSignTextEncoded: Uint8Array = new TextEncoder().encode(msgToSignHex);
            const solanaSignature = '0x' + bytesToHex(await signMessage(msgToSignTextEncoded));
            const withdrawBody: AccountWithdrawBody = {
                message: {
                    brokerId: props.brokerId,
                    chainId: props.chainId,
                    receiver: userAddress,
                    token: tokenSymbol,
                    amount: tokenAmount,
                    withdrawNonce,
                    timestamp,
                    chainType: 'SOL',
                },
                signature: solanaSignature,
                userAddress,
                verifyingContract: "0x8794E7260517B1766fc7b55cAfcd56e6bf08600e"
            };

            console.log(withdrawBody);
            const withdrawBodyString = JSON.stringify(withdrawBody, bigIntReplacer);
            const withdrawMessageToSign = timestamp.toString() + 'POST/v1/withdraw_request' + withdrawBodyString;
            console.log(withdrawMessageToSign);

            const orderlySignature = Buffer.from(nacl.sign.detached(Buffer.from(withdrawMessageToSign), props.keypair!.secretKey)).toString('base64');
            const orderlyKey = 'ed25519:' + props.keypair?.publicKey.toBase58();
            const orderlyAccountId = calculateAccountId(userAddress, props.brokerId);
            const headers = {
                'orderly-account-id': orderlyAccountId,
                'orderly-key': orderlyKey,
                'orderly-timestamp': timestamp.toString(),
                'orderly-signature': orderlySignature,
                'Content-Type': 'application/json'
            };
            console.log(headers);

            await doCeFiRequest(props.cefiBaseURL + '/v1/withdraw_request', 'POST', withdrawBodyString, headers);

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
            color="primary"
            onClick={withdraw}
            style={{ marginRight: '1rem' }}
            disabled={!publicKey || !signMessage || !props.keypair}
        >
            Withdraw Account
        </Button>
    );
};
