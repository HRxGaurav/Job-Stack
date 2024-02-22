import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import {User} from "../models/user.js";

dotenv.config();

const ServiceEmail = process.env.ServiceEmail;
const ServiceEmailPassword = process.env.ServiceEmailPassword;


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: ServiceEmail,
        pass: ServiceEmailPassword
    }
});


const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
};


const sendOTP = async (req, res) => {
    const { email, userType } = req.body;

    if (!email || !userType) {
        return res.status(400).json({ message: 'Email and userType are required' });
    }

    const otp = generateOTP();
    console.log(otp);

    const mailOptions = {
        from: ServiceEmail,
        to: email,
        subject: 'JobNest: OTP for Verification',
        text: `Your OTP (One Time Password) for JobNest is: ${otp}`
    };

    try {
        await transporter.sendMail(mailOptions);
        let user = await User.findOne({ username: email });

        if (user) {
            user.lastOtp = otp;
            await user.save();
            return res.status(200).json({ message: 'OTP sent successfully' });
        } else {
            user = new User({ 
                username: email, 
                lastOtp: otp, 
                userType: userType,
                
            });

            
            if (userType === 'company') {
                user.totalCoins = 200;
            } else if (userType === 'student') {
                user.totalCoins = 300;
            }

            await user.save();
            return res.status(200).json({ message: 'OTP sent successfully', email: email, userType: userType, otp: otp });
        }
    } catch (error) {
        console.error('Error occurred while sending email:', error);
        return res.status(500).json({ message: 'Error sending OTP' });
    }
};


const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  console.log("otp", otp);

  try {
      const user = await User.findOne({ username: email });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      if (otp == user.lastOtp && otp > -1) {
          user.lastOtp = -1111;
          await user.save();
          
        
          const token = jwt.sign({ userID: user._id}, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
          
         
          return res.status(200).json({ message: 'OTP is valid', token, username: email.split('@')[0], id: user._id, userType:user.userType });
      } else {
          return res.status(401).json({ message: 'Invalid OTP' });
      }
  } catch (error) {
      console.error('Error occurred while verifying OTP:', error);
      return res.status(500).json({ message: 'Error verifying OTP' });
  }
};

export { sendOTP, verifyOTP };
