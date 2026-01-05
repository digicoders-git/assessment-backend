
import express from 'express';
import { adminLogin, adminLogout, getAdmin, updateAdmin } from '../Controllers/amdinController.js';
import adminAuth from '../Middleware/adminAuth.js';
import { uploadCertificateImage } from '../Middleware/multer.js';


const adminRoute = express.Router();

adminRoute.post('/login',adminLogin)
adminRoute.post('/logout',adminLogout)
adminRoute.get('/get',getAdmin)
adminRoute.get("/dashboard", adminAuth, (req, res) => {
  res.status(200).json({ success:true, message:`Welcome ${req.admin.userName}` },req.admin);
});
adminRoute.put("/update/:id",uploadCertificateImage.single("image"),adminAuth,updateAdmin);

export default adminRoute;
