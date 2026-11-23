import express from "express";
import { 
  createResult, 
  downloadAssessmentResultsExcel, 
  generateCertificate, 
  getResultsByAssessmentId, 
  getResultsByMobile, 
  getResultsByStudent 
} from "../Controllers/resultController.js";
import adminAuth from "../Middleware/adminAuth.js";

const resultRouter = express.Router();

resultRouter.post("/result", createResult);
resultRouter.get("/result/:id", getResultsByAssessmentId);
resultRouter.get("/result/mobile/:mobile", getResultsByMobile);
resultRouter.get("/student-history/:mobile", getResultsByMobile);
resultRouter.get("/result-single/:id", getResultsByStudent);
resultRouter.get("/result-excel/:id", downloadAssessmentResultsExcel);
resultRouter.get("/result-certificate/:studentId/:assesmentId?", generateCertificate);

export default resultRouter;
