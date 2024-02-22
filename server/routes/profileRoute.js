import express from "express";
import { addCompanyDetails, postJob,getAllJobs,applyJob, getTransactionHistory, getUserById } from "../controllers/companyController.js";
import checkAuthUser from "../middlewares/auth-middleware.js";

const router = express.Router();

// Route to add company details
router.post('/company/add-details', addCompanyDetails);
router.post('/post-job', postJob);
router.get('/jobs', getAllJobs);
router.post('/apply', applyJob);
router.post('/apply', applyJob);
router.get('/transaction_history', getTransactionHistory);
router.get('/user', getUserById);








export default router;
