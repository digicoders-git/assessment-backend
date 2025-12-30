
import express from 'express';
import { adminLogin, adminLogout } from '../Controllers/amdinController.js';
import adminAuth from '../Middleware/adminAuth.js';


const adminRoute = express.Router();

adminRoute.post('/login',adminLogin)
adminRoute.post('/logout',adminLogout)
adminRoute.get("/dashboard", adminAuth, (req, res) => {
  res.status(200).json({ success:true, message:`Welcome ${req.admin.userName}` },req.admin);
});

export default adminRoute;
