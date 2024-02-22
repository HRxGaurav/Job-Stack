// otpRoutes.js

import express from 'express';
import { sendOTP, verifyOTP } from '../controllers/otpController.js';

const router = express.Router();

// Route to send OTP
router.post('/send_otp', sendOTP);

// Route to verify OTP
router.post('/verify_otp', verifyOTP);

export default router;
