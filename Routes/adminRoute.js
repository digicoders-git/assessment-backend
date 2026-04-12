import express from 'express';
import { adminLogin, verifyAdminLoginOtp, adminLogout, dashboardData, getAdmin, updateAdmin, createAdmin, deleteAdmin, toggleAdminStatus, userLogin, getMe, changeUserPassword, sendDownloadOtp, verifyDownloadOtp } from '../Controllers/amdinController.js';
import adminAuth from '../Middleware/adminAuth.js';
import { uploadCertificateImage } from '../Middleware/multer.js';

const adminRoute = express.Router();

adminRoute.post('/login', adminLogin)
adminRoute.post('/login-verify-otp', verifyAdminLoginOtp)
adminRoute.post('/user-login', userLogin)
adminRoute.post('/logout', adminLogout)
adminRoute.get('/me', adminAuth, getMe)
adminRoute.get('/get', adminAuth, getAdmin)
adminRoute.post('/create', adminAuth, createAdmin)
adminRoute.put("/update/:id", uploadCertificateImage.single("image"), adminAuth, updateAdmin);
adminRoute.delete("/delete/:id", adminAuth, deleteAdmin);
adminRoute.patch("/toggle-status/:id", adminAuth, toggleAdminStatus);
adminRoute.patch("/change-password/:id", adminAuth, changeUserPassword);
adminRoute.post('/send-download-otp', adminAuth, sendDownloadOtp);
adminRoute.post('/verify-download-otp', adminAuth, verifyDownloadOtp);

// dashboard data 
adminRoute.get("/dashboard-data", adminAuth, dashboardData);

export default adminRoute;
