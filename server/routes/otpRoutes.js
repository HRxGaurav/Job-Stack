import express from 'express';
import { sendOTP, verifyOTP } from '../controllers/otpController.js';

const router = express.Router();


router.post('/send_otp', sendOTP);


router.post('/verify_otp', verifyOTP);

export default router;
