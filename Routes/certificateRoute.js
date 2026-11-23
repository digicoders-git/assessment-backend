import express from "express";
import { createCertificate, deleteCertificate, getAllCertificates, getSingleCertificate, toggleCertificateStatus, updateCertificate, duplicateCertificate } from "../Controllers/certificateController.js";
import { generateCertificate } from "../Controllers/resultController.js";
import { uploadCertificateImage } from "../Middleware/multer.js";
import adminAuth from "../Middleware/adminAuth.js";

const certificateRouter = express.Router();

certificateRouter.post("/certificate/create",uploadCertificateImage.single("certificateImage"),adminAuth,createCertificate);
certificateRouter.get("/certificate/getAll",getAllCertificates);
certificateRouter.get("/certificate/get/:id",getSingleCertificate);
certificateRouter.get("/certificate/download/:studentId/:assesmentId?", generateCertificate);
certificateRouter.put("/certificate/update/:id",uploadCertificateImage.single("certificateImage"),adminAuth,updateCertificate);
certificateRouter.delete("/certificate/delete/:id",adminAuth,deleteCertificate);
certificateRouter.patch("/certificate/toggle-status/:id",adminAuth,toggleCertificateStatus);
certificateRouter.post("/certificate/duplicate/:id",adminAuth,duplicateCertificate);

export default certificateRouter;
