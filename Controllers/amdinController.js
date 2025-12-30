import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import amdidnModel from "../Models/adminModel.js";

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
