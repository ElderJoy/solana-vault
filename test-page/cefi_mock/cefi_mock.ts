import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001; // Use a different port from Next.js
let registration_nonce = 119747133480;
let withdraw_nonce = 14001212121234;

app.use(cors());

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