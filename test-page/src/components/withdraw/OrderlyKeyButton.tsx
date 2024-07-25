import { type FC } from 'react';
import { bigIntReplacer, CommonProps, doCeFiRequest } from '../common';
import { Button } from '@mui/material';
import { useNotify } from '../notify';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { hexToBytes, bytesToHex } from 'ethereum-cryptography/utils';
import { defaultAbiCoder } from '@ethersproject/abi';
import { useWallet } from '@solana/wallet-adapter-react';
import { encodeBase58, solidityPackedKeccak256 } from 'ethers';
import * as solanaWeb3 from "@solana/web3.js"

interface OrderlyKeyMessage extends BaseMessage {
    orderlyKey: string;
    scope: string;
    expiration: BigInt;
}

interface OrderlyKeyBody extends BaseBody<OrderlyKeyMessage> { }

export const OrderlyKeyButton: FC<CommonProps> = (props) => {
    const notify = useNotify();
    const { publicKey, signMessage } = useWallet();

    const orderlyKey = async () => {
        try {
            if (!publicKey) throw new Error('Wallet not connected!');
            if (!signMessage) throw new Error('Wallet does not support message signing!');

            const brokerIdHash = solidityPackedKeccak256(['string'], [props.brokerId]);
            const keypair = solanaWeb3.Keypair.generate();
            const orderlyKey = 'ed25519:' + keypair.publicKey.toBase58();
            const orderlyKeyHash = solidityPackedKeccak256(['string'], [orderlyKey]);
            const scope = 'read';
            const scopeHash = solidityPackedKeccak256(['string'], [scope]);
            const timestamp = BigInt(Date.now());
            const expiration = timestamp + BigInt(3600000);
            const msgToSign = keccak256(
                hexToBytes(
                    defaultAbiCoder.encode(
                        ['bytes32', 'bytes32', 'bytes32', 'uint256', 'uint256', 'uint256'],
                        [brokerIdHash, orderlyKeyHash, scopeHash, props.chainId, timestamp, expiration]
                    )
                )
            );
            const msgToSignHex = bytesToHex(msgToSign);
            const msgToSignTextEncoded: Uint8Array = new TextEncoder().encode(msgToSignHex);

            // console.log('Broker ID:', props.brokerId);
            // console.log('Broker ID hash:', brokerIdHash);
            // console.log('Chain ID:', props.chainId);
            // console.log('Orderly key:', orderlyKey);
            // console.log('Orderly key hash:', orderlyKeyHash);
            // console.log('Scope:', scope);
            // console.log('Scope hash:', scopeHash);
            // console.log('Timestamp:', timestamp);
            // console.log('Expiration:', expiration);
            // console.log('Message to sign hex string:', bytesToHex(msgToSign));
            // console.log('Message to sign text encoded:', msgToSignTextEncoded);

            const signature = '0x' + bytesToHex(await signMessage(msgToSignTextEncoded));
            // console.log('Signature:', signature);

            const orderlyKeyBody: OrderlyKeyBody = {
                message: {
                    brokerId: props.brokerId,
                    chainId: props.chainId,
                    orderlyKey: orderlyKey,
                    scope: scope,
                    timestamp: timestamp,
                    expiration: expiration,
                    chainType: 'SOL',
                },
                signature: signature,
                userAddress: encodeBase58(publicKey.toBytes()),
            };

            console.log('Orderly key message:', orderlyKeyBody);
            await doCeFiRequest(props.cefiBaseURL + '/v1/orderly_key', 'POST', JSON.stringify(orderlyKeyBody, bigIntReplacer));

            props.setOrderlyKeypair(keypair);
            notify('success', 'Orderly key successful');
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
            onClick={orderlyKey}
            disabled={!publicKey || !signMessage}
        >
            Orderly Key
        </Button>
    );
};
