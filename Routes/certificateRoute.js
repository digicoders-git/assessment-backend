import express from "express";
import { createCertificate, deleteCertificate, getAllCertificates, getSingleCertificate, toggleCertificateStatus, updateCertificate } from "../Controllers/certificateController.js";
import { uploadCertificateImage } from "../Middleware/multer.js";
import adminAuth from "../Middleware/adminAuth.js";

const certificateRouter = express.Router();

certificateRouter.post("/certificate/create",uploadCertificateImage.single("certificateImage"),adminAuth,createCertificate);
certificateRouter.get("/certificate/getAll",adminAuth,getAllCertificates);
certificateRouter.get("/certificate/get/:id",adminAuth,getSingleCertificate);
certificateRouter.put("/certificate/update/:id",uploadCertificateImage.single("certificateImage"),adminAuth,updateCertificate);
certificateRouter.delete("/certificate/delete/:id",adminAuth,deleteCertificate);
certificateRouter.patch("/certificate/toggle-status/:id",adminAuth,toggleCertificateStatus);

export default certificateRouter;
