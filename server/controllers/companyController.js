
import { User, JobPost } from '../models/user.js';
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const serviceEmail = process.env.ServiceEmail;
const serviceEmailPassword = process.env.ServiceEmailPassword;

const sendJobNotificationEmail = async (jobDetails) => {
    try {
        // Find all student users
        const studentUsers = await User.find({ userType: 'student' });

        // Extract email addresses of student users
        const studentEmails = studentUsers.map(user => user.username); 

        // Compose email content
        const emailSubject = 'New Job Opportunity';
        const emailBody = `Dear Student,\n\nA new job opportunity is available:\nRole: ${jobDetails.role}\nMin CTC: ${jobDetails.minCTC}\nMax CTC: ${jobDetails.maxCTC}\nLocation: ${jobDetails.location}\n\nRegards,\nThe Job Board Team`;

        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: serviceEmail, 
                pass: serviceEmailPassword 
            }
        });

        // Send email to each student user
        await Promise.all(studentEmails.map(async (email) => {
            await transporter.sendMail({
                from: serviceEmail, // Use the service email as sender
                to: email, // Recipient email address
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
        // Find the user by userId
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update company details
        user.companyName = companyName;
        user.companyLogo = logoLink;

        // Save the updated user
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

    // Decode JWT token to get user ID
    let userId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        userId = decoded.userID;
    } catch (error) {
        console.error('Error decoding token:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }

    // Find user by user ID
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has enough coins to post a job
        const requiredCoins = calculateRequiredCoins(req.body);
        if (user.totalCoins < requiredCoins) {
            return res.status(403).json({ message: 'Insufficient coins to post the job' });
        }

        // Create new job post
        const jobPostData = {
            company: userId,
            ...req.body,
            requiredRupees: requiredCoins
        };
        const jobPost = new JobPost(jobPostData);
        await jobPost.save();

        // Deduct coins from user's totalCoins
        user.totalCoins -= requiredCoins;
        await user.save();

        // Add transaction history for the coin deduction
        const transaction = {
            userId: userId,
            transactionType: 'debit',
            amount: requiredCoins,
            description: 'Job posting fee',
            createdAt: new Date()
        };
        user.transactionHistory.push(transaction);
        await user.save();

        // Send job notification email to all student users
        await sendJobNotificationEmail(req.body);

        return res.status(200).json({ message: 'Job posted successfully', jobPost });
    } catch (error) {
        console.error('Error posting job:', error);
        return res.status(500).json({ message: 'Error posting job' });
    }
};

const getAllJobs = async (req, res) => {
    try {
        // Fetch all job posts from the database, populating the 'company' field to include 'companyLogo', 'username', and 'companyName'
        const jobs = await JobPost.find().populate('company', 'companyLogo username companyName');

        // Return the list of job posts as a response
        return res.status(200).json({ jobs });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return res.status(500).json({ message: 'Error fetching jobs' });
    }
};

const sendJobApplicationEmail = async (companyUsername, emailBody) => {
    try {
        // Find the company user
        const companyUser = await User.findOne({ username: companyUsername, userType: 'company' });

        // If company user found, send email notification
        if (companyUser) {
            // Compose email content
            const emailSubject = 'New Job Application';
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: serviceEmail,
                    pass: serviceEmailPassword
                }
            });

            // Send email notification to the company
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

    // Find student by ID
    try {
        const student = await User.findById(studentId);
        if (!student || student.userType !== 'student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Find the job post by ID
        const {jobId} = req.body; 
        const jobPost = await JobPost.findById(jobId);
        
        if (!jobPost) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if the student has enough Rupees to apply for the job
        if (student.totalCoins < jobPost.requiredRupees) {
            return res.status(403).json({ message: 'Insufficient Rupees to apply for the job' });
        }

        // Deduct the required Rupees from the student's totalCoins
        student.totalCoins -= jobPost.requiredRupees;
        await student.save();

        // Credit half of the Rupees to the company's account
        const company = await User.findById(jobPost.company);
        if (company && company.userType === 'company') {
            const creditedRupees = jobPost.requiredRupees / 2;
            company.totalCoins += creditedRupees;
            await company.save();

            // Add transaction history for the credited Rupees to the company
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

        // Add transaction history for the spent Rupees by the student
        const studentTransaction = {
            userId: studentId,
            transactionType: 'debit',
            amount: jobPost.requiredRupees,
            description: `Spent Rupees for job application: ${jobPost.role}`,
            createdAt: new Date()
        };
        student.transactionHistory.push(studentTransaction);
        await student.save();

        // Send email notification to the company
        const emailBody = `${student.username} applied for the role ${jobPost.role}`;
        await sendJobApplicationEmail(company.username, emailBody);

        return res.status(200).json({ message: 'Job application successful' });
    } catch (error) {
        console.error('Error applying for job:', error);
        return res.status(500).json({ message: 'Error applying for job' });
    }
};

const getTransactionHistory = async (req, res) => {
    // Extract JWT token from the request header
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Authorization token missing' });
    }

    try {
        // Decode JWT token to get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return transaction history as response
        return res.status(200).json({ transactionHistory: user.transactionHistory });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};



export { addCompanyDetails, postJob, getAllJobs,applyJob, getTransactionHistory };
