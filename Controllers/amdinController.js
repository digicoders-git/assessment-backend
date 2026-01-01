import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import amdidnModel from "../Models/adminModel.js";
import cloudinary from "../Config/cloudinary.js";

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await amdidnModel.findOne({ email });
  if (!admin) {
    return res.status(401).json({ success:false, message:"Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ success:false, message:"Invalid credentials" });
  }

  const token = jwt.sign(
    { adminId: admin._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("adminToken", token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict"
  });

  res.status(200).json({ success:true, message:"Login successful" });
};

export const adminLogout = async (req, res) => {
  res.clearCookie("adminToken");
  res.status(200).json({ success:true,message:"Logout successful" });
};

// update admin
export const getAdmin = async (req, res) => {
  try {
    const admin = await amdidnModel.findById(req.adminId);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    res.status(200).json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// update admin

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Admin ID required" });
    }

    const admin = await amdidnModel.findById(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const {
      userName,
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

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

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      admin.password = hashedPassword;
    }

    if (userName) {
      admin.userName = userName;
    }

    if (req.file) {
      if (admin.image) {
        const publicId = admin.image
          .split("/")
          .slice(-2)
          .join("/")
          .replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId);
      }

      const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "admin" }
      );

      admin.image = uploadResult.secure_url;
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

