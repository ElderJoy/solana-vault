import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001; // Use a different port from Next.js

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
            "registration_nonce": "119747133480"
        },
        "timestamp": 1689074684188
    });
});

app.get('/v1/withdraw_nonce', (req, res) => {
    res.json({
        "success": true,
        "data": {
            "withdraw_nonce": 14001212121234
        },
        "timestamp": 1685673968302
    });
});