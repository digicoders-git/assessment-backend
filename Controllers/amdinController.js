import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import amdidnModel from "../Models/adminModel.js";
import studentModel from "../Models/studentModel.js";
import certificateModel from "../Models/certificateModel.js";
import assessmentModel from "../Models/assesmentModel.js";
import resultModel from "../Models/resultModel.js";
import topicModel from "../Models/topic.js";
import questionModel from "../Models/questionModel.js";

export const adminLogin = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    const admin = await amdidnModel.findOne({ userName });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid Username"
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password"
      });
    }

    const token = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Login successful"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


export const adminLogout = async (req, res) => {
  res.clearCookie("adminToken");
  res.status(200).json({ success: true, message: "Logout successful" });
};

// get admin
export const getAdmin = async (req, res) => {
  try {
    const admin = await amdidnModel.find().select('-password');
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    res.status(200).json({ success: true, admin });
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

