import express from "express";
import { addCompanyDetails, postJob,getAllJobs,applyJob, getTransactionHistory } from "../controllers/companyController.js";
import checkAuthUser from "../middlewares/auth-middleware.js";

const router = express.Router();

// Route to add company details
router.post('/company/add-details', addCompanyDetails);
router.post('/post-job', postJob);
router.get('/jobs', getAllJobs);
router.post('/apply', applyJob);
router.post('/apply', applyJob);
router.get('/transaction_history', getTransactionHistory);







// Protected route
// router.post('/store_profile', checkAuthUser, storeProfile);
// router.post('/apply/:jobId', checkAuthUser, applyJob);
// router.get('/get_profile', getUserProfile);

export default router;
