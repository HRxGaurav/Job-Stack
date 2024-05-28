import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import http from 'http';
import cron from 'node-cron';
import connectDB from './config/connectDB.js';
import otpRoutes from './routes/otpRoutes.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoute.js';

const app = express();

dotenv.config();
const PORT = process.env.PORT || 5000;

//Cors policy
app.use(cors());

//Connect Database
connectDB();

//JSON
app.use(express.json());

//Load Routes
app.use(authRoutes);
app.use(otpRoutes);
app.use(profileRoutes);

// Pinging the server itself to keep it awake
const pingServer = async () => {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:${PORT}/ping`, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                resolve(data);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
};

cron.schedule('*/5 * * * *', async () => {
    try {
        const res = await pingServer();
        console.log('Pinged the server to keep it awake:', res);
    } catch (error) {
        console.error('Error pinging the server:', error.message);
    }
});

app.get('/ping', (req, res) => {
    res.send('Server is awake');
});

app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
});
