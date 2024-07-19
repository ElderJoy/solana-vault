import { type FC } from 'react';
import { calculateAccountId, CommonProps, doCeFiRequest, getAccountId } from '../common';
import { Button } from '@mui/material';
import { useNotify } from '../notify';
import { bytesToHex } from 'ethereum-cryptography/utils';
import nacl from "tweetnacl";

export const OrderlySignCheckButton: FC<CommonProps> = (props) => {
    const notify = useNotify();

    const checkSignature = async () => {
        try {
            const timestamp = Date.now();
            console.log('Timestamp:', timestamp);
            const urlString = "GET/v1/withdraw_nonce";

            const msgToSign = timestamp + urlString;
            console.log('Message to sign:', msgToSign);
            const messageBytes = Buffer.from(msgToSign);
            const signature = nacl.sign.detached(messageBytes, props.keypair!.secretKey);
            console.log('Signature:', bytesToHex(signature));
            const signatureBase64 = Buffer.from(signature).toString('base64');
            console.log('Signature base64:', signatureBase64);

            const orderlyKey = 'ed25519:' + props.keypair?.publicKey.toBase58();
            const orderlyAccountId = getAccountId(props);
            const headers = {
                'orderly-account-id': orderlyAccountId,
                'orderly-key': orderlyKey,
                'orderly-timestamp': timestamp.toString(),
                'orderly-signature': signatureBase64,
            };
            const withdrawNonce = BigInt((await doCeFiRequest(props.cefiBaseURL + '/v1/withdraw_nonce', 'GET', '', headers)).data.withdraw_nonce);
            console.log('Withdraw nonce:', withdrawNonce);

            notify('success', 'Orderly signature check successful');
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
            onClick={checkSignature}
            disabled={!props.keypair}
        >
            Check Signature
        </Button>
    );
};
