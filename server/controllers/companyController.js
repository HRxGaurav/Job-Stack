
import { User, JobPost } from '../models/user.js';
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const serviceEmail = process.env.ServiceEmail;
const serviceEmailPassword = process.env.ServiceEmailPassword;

const sendJobNotificationEmail = async (jobDetails) => {
    try {
        
        const studentUsers = await User.find({ userType: 'student' });

        
        const studentEmails = studentUsers.map(user => user.username); 

        
        const emailSubject = 'New Job Opportunity';
        const emailBody = `Dear Student,\n\nA new job opportunity is available:\nRole: ${jobDetails.role}\nMin CTC: ${jobDetails.minCTC}\nMax CTC: ${jobDetails.maxCTC}\nLocation: ${jobDetails.location}\n\nRegards,\nThe Job Board Team`;

        
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: serviceEmail, 
                pass: serviceEmailPassword 
            }
        });

        
        await Promise.all(studentEmails.map(async (email) => {
            await transporter.sendMail({
                from: serviceEmail, 
                to: email, 
                subject: emailSubject,
                text: emailBody
            });
        }));

        console.log('Job notification emails sent successfully to all student users');
    } catch (error) {
        console.error('Error sending job notification emails:', error);
    }
};


const addCompanyDetails = async (req, res) => {
    const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    userId = decoded.userID;
  } catch (error) {
    console.error("Error decoding token:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
    const {  companyName, logoLink } = req.body;
    console.log(req.body);

    try {
        
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        user.companyName = companyName;
        user.companyLogo = logoLink;

        
        user = await user.save();

        return res.status(200).json({ message: 'Company details added successfully', user });
    } catch (error) {
        console.error('Error adding company details:', error);
        return res.status(500).json({ message: 'Error adding company details' });
    }
};


const calculateRequiredCoins = (jobDetails) => {
    const roleNameLength = jobDetails.role.length;
    const minCTCLength = jobDetails.minCTC.toString().length;
    const maxCTCLength = jobDetails.maxCTC.toString().length;
    const locationLength = jobDetails.location.length;
    return roleNameLength + minCTCLength + maxCTCLength + locationLength;
};

const postJob = async (req, res) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Authorization token missing' });
    }

    let userId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        userId = decoded.userID;
    } catch (error) {
        console.error('Error decoding token:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }

    
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        const requiredCoins = calculateRequiredCoins(req.body);
        if (user.totalCoins < requiredCoins) {
            return res.status(403).json({ message: 'Insufficient coins to post the job' });
        }

        
        const jobPostData = {
            company: userId,
            ...req.body,
            requiredRupees: requiredCoins
        };
        const jobPost = new JobPost(jobPostData);
        await jobPost.save();

        
        user.totalCoins -= requiredCoins;
        await user.save();

       
        const transaction = {
            userId: userId,
            transactionType: 'debit',
            amount: requiredCoins,
            description: 'Job posting fee',
            createdAt: new Date()
        };
        user.transactionHistory.push(transaction);
        await user.save();

        
        await sendJobNotificationEmail(req.body);

        return res.status(200).json({ message: 'Job posted successfully', jobPost });
    } catch (error) {
        console.error('Error posting job:', error);
        return res.status(500).json({ message: 'Error posting job' });
    }
};

const getAllJobs = async (req, res) => {
    try {
        
        const jobs = await JobPost.find().populate('company', 'companyLogo username companyName');

        
        return res.status(200).json({ jobs });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return res.status(500).json({ message: 'Error fetching jobs' });
    }
};

const sendJobApplicationEmail = async (companyUsername, emailBody) => {
    try {
        
        const companyUser = await User.findOne({ username: companyUsername, userType: 'company' });

        
        if (companyUser) {
            
            const emailSubject = 'New Job Application';
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: serviceEmail,
                    pass: serviceEmailPassword
                }
            });

            
            await transporter.sendMail({
                from: serviceEmail,
                to: companyUser.username,
                subject: emailSubject,
                text: emailBody
            });

            console.log('Job application email sent successfully to the company');
        } else {
            console.error('Company user not found');
        }
    } catch (error) {
        console.error('Error sending job application email:', error);
    }
};

const applyJob = async (req, res) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Authorization token missing' });
    }

    let studentId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        studentId = decoded.userID;
    } catch (error) {
        console.error('Error decoding token:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }

   
    try {
        const student = await User.findById(studentId);
        if (!student || student.userType !== 'student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        
        const {jobId} = req.body; 
        const jobPost = await JobPost.findById(jobId);
        
        if (!jobPost) {
            return res.status(404).json({ message: 'Job not found' });
        }

        
        if (student.totalCoins < jobPost.requiredRupees) {
            return res.status(403).json({ message: 'Insufficient Rupees to apply for the job' });
        }

        
        student.totalCoins -= jobPost.requiredRupees;
        await student.save();

        
        const company = await User.findById(jobPost.company);
        if (company && company.userType === 'company') {
            const creditedRupees = jobPost.requiredRupees / 2;
            company.totalCoins += creditedRupees;
            await company.save();

            
            const companyTransaction = {
                userId: company._id,
                transactionType: 'credit',
                amount: creditedRupees,
                description: `Received Rupees from student ${student.username} for job application`,
                createdAt: new Date()
            };
            company.transactionHistory.push(companyTransaction);
            await company.save();
        }

        
        const studentTransaction = {
            userId: studentId,
            transactionType: 'debit',
            amount: jobPost.requiredRupees,
            description: `Spent Rupees for job application: ${jobPost.role}`,
            createdAt: new Date()
        };
        student.transactionHistory.push(studentTransaction);
        await student.save();

       
        const emailBody = `${student.username} applied for the role ${jobPost.role}`;
        await sendJobApplicationEmail(company.username, emailBody);

        return res.status(200).json({ message: 'Job application successful' });
    } catch (error) {
        console.error('Error applying for job:', error);
        return res.status(500).json({ message: 'Error applying for job' });
    }
};

const getTransactionHistory = async (req, res) => {
    
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Authorization token missing' });
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID;

        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        return res.status(200).json({ transactionHistory: user.transactionHistory });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};



export { addCompanyDetails, postJob, getAllJobs,applyJob, getTransactionHistory };
