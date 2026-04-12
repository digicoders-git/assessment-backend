import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import amdidnModel from "../Models/adminModel.js";
import studentModel from "../Models/studentModel.js";
import certificateModel from "../Models/certificateModel.js";
import assessmentModel from "../Models/assesmentModel.js";
import resultModel from "../Models/resultModel.js";
import topicModel from "../Models/topic.js";
import questionModel from "../Models/questionModel.js";
import { sendOtpEmail, sendDownloadOtpEmail } from "../utils/mailer.js";

// In-memory OTP store: { email: { otp, expiresAt, pendingData } }
const otpStore = {};
const downloadOtpStore = {};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Step 1: Send OTP before creating user — REMOVED
// Direct user creation (no OTP needed for admin creating user)
export const createAdmin = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const existing = await amdidnModel.findOne({ $or: [{ userName }, { email }] });
    if (existing) {
      return res.status(409).json({ success: false, message: "User with this username or email already exists" });
    }
    let userId;
    let isUnique = false;
    while (!isUnique) {
      userId = 'USR' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);
      const exists = await amdidnModel.findOne({ userId });
      if (!exists) isUnique = true;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await amdidnModel.create({ userName, email, userId, password: hashedPassword, role: 'user' });
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      admin: { _id: newAdmin._id, userName: newAdmin.userName, email: newAdmin.email, userId: newAdmin.userId, role: newAdmin.role }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (email !== process.env.SMTP_FROM) {
      return res.status(401).json({ success: false, message: "Invalid admin email" });
    }
    const admin = await amdidnModel.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Admin not found" });
    }
    const otp = generateOtp();
    otpStore['admin'] = { otp, expiresAt: Date.now() + 5 * 60 * 1000, adminId: admin._id };
    try {
      await sendDownloadOtpEmail(process.env.SMTP_FROM, otp, admin.userName);
    } catch (mailError) {
      console.error('Mail send failed:', mailError.message);
      return res.status(500).json({ success: false, message: 'Failed to send OTP: ' + mailError.message });
    }
    return res.status(200).json({ success: true, otpSent: true, message: "OTP sent to admin email" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const verifyAdminLoginOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ success: false, message: "OTP is required" });
    const record = otpStore['admin'];
    if (!record) return res.status(400).json({ success: false, message: "OTP not found. Please request again." });
    if (Date.now() > record.expiresAt) {
      delete otpStore['admin'];
      return res.status(400).json({ success: false, message: "OTP expired. Please request again." });
    }
    if (record.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
    delete otpStore['admin'];
    const token = jwt.sign({ adminId: record.adminId }, process.env.JWT_SECRET, { expiresIn: "5h" });
    res.cookie("adminToken", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 5 * 60 * 60 * 1000 });
    return res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Direct user login - no OTP
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    const user = await amdidnModel.findOne({ role: 'user', email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Email" });
    }
    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: "Your account is inactive. Contact admin." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Password" });
    }
    const token = jwt.sign({ adminId: user._id }, process.env.JWT_SECRET, { expiresIn: "5h" });
    res.cookie("adminToken", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 5 * 60 * 60 * 1000 });
    return res.status(200).json({ success: true, message: "Login successful", role: 'user' });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


export const adminLogout = async (req, res) => {
  res.clearCookie("adminToken");
  res.status(200).json({ success: true, message: "Logout successful" });
};

// change user password by admin (no current password needed)
export const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const user = await amdidnModel.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// get current logged in user info
export const getMe = async (req, res) => {
  try {
    const admin = await amdidnModel.findById(req.admin._id).select('-password');
    res.status(200).json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// get admin
export const getAdmin = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: 'user' };
    if (search) {
      query = {
        role: 'user',
        $or: [
          { userName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { userId: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const admin = await amdidnModel.find(query).select('-password');
    res.status(200).json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await amdidnModel.findById(id);
    if (!admin) return res.status(404).json({ success: false, message: "User not found" });
    if (admin.role === 'admin') return res.status(403).json({ success: false, message: "Super admin cannot be deleted" });
    await amdidnModel.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// toggle admin status
export const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await amdidnModel.findById(id);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
    admin.isActive = !admin.isActive;
    await admin.save();
    res.status(200).json({ success: true, message: `Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`, isActive: admin.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// update admin

import fs from "fs";
import path from "path";

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Admin ID required"
      });
    }

    const admin = await amdidnModel.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    const {
      userName,
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

    /* 🔐 PASSWORD UPDATE */
    const isPasswordUpdate =
      currentPassword || newPassword || confirmPassword;

    if (isPasswordUpdate) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "All password fields are required"
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect"
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "New password and confirm password do not match"
        });
      }

      admin.password = await bcrypt.hash(newPassword, 10);
    }

    /* ✏️ USERNAME UPDATE */
    if (userName) {
      admin.userName = userName;
    }

    /* ✏️ EMAIL & USERID UPDATE */
    if (req.body.email !== undefined) admin.email = req.body.email;
    if (req.body.userId !== undefined) admin.userId = req.body.userId;

    /* 🖼️ IMAGE UPDATE (LOCAL) */
    if (req.file) {
      // 🔥 purani local image delete
      if (admin.image && admin.image.includes("/uploads/")) {
        const oldPath = path.join(
          process.cwd(),
          admin.image.replace(/^.*\/uploads/, "uploads")
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // 🌐 new local image URL
      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/certificates/${req.file.filename}`;
      admin.image = imageUrl;
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      admin
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};



// dashboard data counts 

export const dashboardData = async (req, res) => {
  try {
    // students counts
    const uniqueMobiles = await studentModel.distinct("mobile");
    const totalStudents = uniqueMobiles.length;

    // certificaet counts
    const totalCertificates = await certificateModel.countDocuments();

    // active assesment counts
    const activeAssesment = await assessmentModel.countDocuments({ status: true });

    // history assesment
    const historyAssesment = await assessmentModel.countDocuments({ status: false });

    // reuslts counts
    const results = await resultModel.countDocuments();

    // active topics count
    const activeTopics = await topicModel.countDocuments({ status: true });

    // inactive topics count
    const inactiveTopics = await topicModel.countDocuments({ status: false });

    // questions counts
    const questions = await questionModel.countDocuments();

    // total users (role: 'user') count
    const totalUsers = await amdidnModel.countDocuments({ role: 'user' });

    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        totalStudents,
        activeAssesment,
        historyAssesment,
        results,
        activeTopics,
        inactiveTopics,
        questions,
        totalCertificates,
        totalUsers,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};



// Send OTP for download verification
export const sendDownloadOtp = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const admin = await amdidnModel.findById(adminId);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
    
    const otp = generateOtp();
    downloadOtpStore[adminId] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
    
    await sendDownloadOtpEmail(process.env.SMTP_FROM, otp, admin.userName);
    return res.status(200).json({ success: true, message: "OTP sent to admin email" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
  }
};

// Verify OTP for download
export const verifyDownloadOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const adminId = req.admin._id;
    
    if (!otp) return res.status(400).json({ success: false, message: "OTP is required" });
    
    const record = downloadOtpStore[adminId];
    if (!record) return res.status(400).json({ success: false, message: "OTP not found. Please request again." });
    
    if (Date.now() > record.expiresAt) {
      delete downloadOtpStore[adminId];
      return res.status(400).json({ success: false, message: "OTP expired. Please request again." });
    }
    
    if (record.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
    
    delete downloadOtpStore[adminId];
    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
