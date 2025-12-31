import express from "express";
import { createCertificate, deleteCertificate, getAllCertificates, getSingleCertificate, updateCertificate } from "../Controllers/certificateController.js";
import { uploadCertificateImage } from "../Middleware/multer.js";

const certificateRouter = express.Router();

certificateRouter.post("/certificate/create",uploadCertificateImage.single("certificateImage"),createCertificate);
certificateRouter.get("/certificate/getAll",getAllCertificates);
certificateRouter.get("/certificate/get/:id",getSingleCertificate);
certificateRouter.put("/certificate/update/:id",updateCertificate);
certificateRouter.delete("/certificate/delete/:id",deleteCertificate);

export default certificateRouter;
