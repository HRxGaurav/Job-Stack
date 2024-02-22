import jwt from "jsonwebtoken";
import {User} from "../models/user.js";


const storeProfile = async (req, res) => {
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

  const profileData = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profile = profileData;
    await user.save();

    return res
      .status(200)
      .json({
        message: "Profile data stored successfully",
        profile: user.profile,
      });
  } catch (error) {
    console.error("Error occurred while storing profile data:", error);
    return res.status(500).json({ message: "Error storing profile data" });
  }
};

const applyJob = async (req, res) => {
  const jobId = req.params.jobId; 
  const coinsToDeduct = 50;

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

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.profile.totalCoins >= coinsToDeduct) {
      user.profile.totalCoins -= coinsToDeduct;
      
      user.profile.appliedJobs.push(jobId);
      await user.save();
      return res.status(200).json({ message: "Applied successfully" });
    } else {
      //insufficient coins
      return res
        .status(400)
        .json({ message: "Oops! You don't have sufficient balance" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const getUserProfile = async (req, res) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userID;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }

    return res.status(200).json({ profile: user.profile });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Error fetching user profile" });
  }
};

export { storeProfile, applyJob, getUserProfile };
