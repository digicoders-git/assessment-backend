import express from "express";
import { createResult, getResultsByAssessmentId, getResultsByStudent } from "../Controllers/resultController.js";

const resultRouter = express.Router();

resultRouter.post("/result", createResult);
resultRouter.get("/result/:id", getResultsByAssessmentId);
resultRouter.get("/result-single/:id", getResultsByStudent);

export default resultRouter;
