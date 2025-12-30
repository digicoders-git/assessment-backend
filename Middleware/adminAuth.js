import jwt from "jsonwebtoken";
import amdidnModel from "../Models/adminModel.js";

const adminAuth = async (req, res, next) => {
  const token = req.cookies.adminToken;

  if (!token) {
    return res.status(401).json({ success:false, message:"Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await amdidnModel.findById({_id : decoded.adminId});

    if (!admin) {
      return res.status(401).json({ success:false, message:"Unauthorized" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success:false, message:"Invalid token" });
  }
};

export default adminAuth;
