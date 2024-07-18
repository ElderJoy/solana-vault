import express from 'express';
import cors from 'cors';
import { calculateAccountId } from '../src/components/common';

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

app.post('/v1/register_account', (req, res) => {
    console.log('Request body:', req.body);

    const userAddress = req.body.userAddress;
    const brokerId = req.body.message.brokerId;
    console.log('userAddress:', userAddress);
    console.log('brokerId:', brokerId);

    const accountId = calculateAccountId(userAddress, brokerId);
    console.log('accountId:', accountId);

    res.json({
        "success": true,
        "data": {
            "user_id": 22,
            "account_id": accountId
        },
        "timestamp": Date.now()
    });
});

app.post('/v1/orderly_key', (req, res) => {
    console.log('Request body:', req.body);

    res.json({
        "success": true,
        "data": {
            "orderly_key": req.body.message.orderlyKey
        },
        "timestamp": Date.now()
    });
});

app.post('/v1/withdraw_request', (req, res) => {
    console.log('Request body:', req.body);

    res.json({
        "success": true,
        "data": {
            "withdraw_receiver": req.body.message.receiver
        },
        "timestamp": Date.now()
    });
});