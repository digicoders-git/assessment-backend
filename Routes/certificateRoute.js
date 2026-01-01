import express from "express";
import { createCertificate, deleteCertificate, getAllCertificates, getSingleCertificate, toggleCertificateStatus, updateCertificate } from "../Controllers/certificateController.js";
import { uploadCertificateImage } from "../Middleware/multer.js";

const certificateRouter = express.Router();

certificateRouter.post("/certificate/create",uploadCertificateImage.single("certificateImage"),createCertificate);
certificateRouter.get("/certificate/getAll",getAllCertificates);
certificateRouter.get("/certificate/get/:id",getSingleCertificate);
certificateRouter.put("/certificate/update/:id",uploadCertificateImage.single("certificateImage"),updateCertificate);
certificateRouter.put("/certificate/update/:id",uploadCertificateImage.single("certificateImage"),updateCertificate);
certificateRouter.patch("/certificate/toggle-status/:id",toggleCertificateStatus);

export default certificateRouter;
