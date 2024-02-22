import express from "express";
import userController from "../controllers/userController.js";

const router = express.Router();

//Unprotected routes
router.get('/loggedin',userController.loggedIn);

export default router;