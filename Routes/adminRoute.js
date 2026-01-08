
import express from 'express';
import { adminLogin, adminLogout, dashboardData, getAdmin, updateAdmin } from '../Controllers/amdinController.js';
import adminAuth from '../Middleware/adminAuth.js';
import { uploadCertificateImage } from '../Middleware/multer.js';


const adminRoute = express.Router();

adminRoute.post('/login',adminLogin)
adminRoute.post('/logout',adminLogout)
adminRoute.get('/get',adminAuth,getAdmin)
adminRoute.put("/update/:id",uploadCertificateImage.single("image"),adminAuth,updateAdmin);

// dashboard data 
adminRoute.get("/dashboard-data", adminAuth, dashboardData);

export default adminRoute;
