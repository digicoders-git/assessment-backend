import express from "express";
import { createResult, downloadAssessmentResultsExcel, getResultsByAssessmentId, getResultsByStudent } from "../Controllers/resultController.js";
import adminAuth from "../Middleware/adminAuth.js";

const resultRouter = express.Router();

resultRouter.post("/result", createResult);
resultRouter.get("/result/:id", getResultsByAssessmentId);
resultRouter.get("/result-single/:id", getResultsByStudent);
resultRouter.get("/result-excel/:id", downloadAssessmentResultsExcel);
// resultRouter.post("/result-certificate/:studentId/:assesmentId", generateCertificate);

export default resultRouter;
