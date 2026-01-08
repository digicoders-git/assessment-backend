import express from "express";
import { createResult, getResultsByAssessmentId, getResultsByStudent } from "../Controllers/resultController.js";
import adminAuth from "../Middleware/adminAuth.js";

const resultRouter = express.Router();

resultRouter.post("/result",adminAuth, createResult);
resultRouter.get("/result/:id",adminAuth, getResultsByAssessmentId);
resultRouter.get("/result-single/:id",adminAuth, getResultsByStudent);
// resultRouter.post("/result-certificate/:studentId/:assesmentId", generateCertificate);

export default resultRouter;
