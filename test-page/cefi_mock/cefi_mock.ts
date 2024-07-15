import express from 'express';
import cors from 'cors';

import { keccak256 } from 'ethereum-cryptography/keccak';
import { hexToBytes, bytesToHex } from 'ethereum-cryptography/utils';
import { defaultAbiCoder } from '@ethersproject/abi';

const app = express();
const port = process.env.PORT || 3001; // Use a different port from Next.js
let registration_nonce = 119747133480;
let withdraw_nonce = 14001212121234;

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
    res.json({ message: 'Hello from Express!' });
});

app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});

app.get('/v1/registration_nonce', (req, res) => {
    res.json({
        "success": true,
        "data": {
            "registration_nonce": registration_nonce++
        },
        "timestamp": Date.now()
    });
});

app.get('/v1/withdraw_nonce', (req, res) => {
    res.json({
        "success": true,
        "data": {
            "withdraw_nonce": withdraw_nonce++
        },
        "timestamp": Date.now()
    });
});

app.post('/v1/register_account_solana', (req, res) => {
    console.log('Request body:', req.body);

    const userAddress = req.body.userAddress;
    const brokerId = req.body.message.brokerId;
    console.log('userAddress:', userAddress);
    console.log('brokerId:', brokerId);

    // const accountId = CeFiMock.calculateAccountId(userAddress, brokerId);
    // console.log('accountId:', accountId);

    res.json({
        "success": true,
        "data": {
            "user_id": 22,
            "account_id": "0xe08634ad199202b8ee405986ebb3f20c56f8456a07fc55ec6a3a457dc129604e"
        },
        "timestamp": Date.now()
    });
});

class CeFiMock {
    public static calculateAccountId(address: string, brokerId: string): string {
        if (!brokerId || brokerId.trim().length === 0) {
            throw new Error("brokerId illegal");
        }

        const addressTextEncoded = new TextEncoder().encode(address);
        console.log('addressTextEncoded:', addressTextEncoded);

        const brokerIdHash = keccak256(hexToBytes(defaultAbiCoder.encode(['string'], [brokerId])));
        console.log('brokerIdHash:', bytesToHex(brokerIdHash));

        const concatenatedAbiString = defaultAbiCoder.encode(['bytes32', 'bytes32'], [addressTextEncoded, brokerIdHash]);
        console.log('concatenatedAbiString:', concatenatedAbiString);

        // Return the keccak256 hash of the concatenated bytes as a hex string
        return bytesToHex(keccak256(hexToBytes(concatenatedAbiString)));
    }
}
