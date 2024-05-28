import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
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

app.get('/ping', (req, res) => {
    res.send('Server is awake');
});

app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
});
