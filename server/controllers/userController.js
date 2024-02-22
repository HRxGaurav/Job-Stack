import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {User} from "../models/user.js";

dotenv.config();


const loggedIn= async (req, res) => {
  const token = req.header('Authorization');
    if (!token) {
      res.status(401).json({ message: 'failed' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      res.status(200).json({ message: 'success', user: decoded.userID });
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };



export default {loggedIn};
