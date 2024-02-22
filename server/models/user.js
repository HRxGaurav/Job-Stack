import mongoose from 'mongoose';

// Schema for transaction history
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transactionType: { type: String, enum: ['debit', 'credit'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Schema for job posts
const jobPostSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true, trim: true },
    minCTC: { type: Number, required: true },
    maxCTC: { type: Number, required: true },
    location: { type: String, required: true, trim: true },
    requiredRupees: { type: Number, required: true } 
});

// Schema for user/company
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },
    userType: { type: String, enum: ['company', 'student'], required: true },
    totalCoins: { type: Number, default: 0 },
    transactionHistory: [transactionSchema],
    lastOtp: { type: Number },
    companyName: { type: String }, 
    companyLogo: { type: String }
});



const User = mongoose.model('User', userSchema);
const JobPost = mongoose.model('JobPost', jobPostSchema);

export { User, JobPost };
