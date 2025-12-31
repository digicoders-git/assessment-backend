import express from "express";
import { createAssessment, deleteAssessment, getAssesmentByStatus, toggleAssessmentStatus, updateAssessment } from "../Controllers/assesmentController.js";

const assessmentRouter = express.Router();

assessmentRouter.post("/assesment/create", createAssessment);
assessmentRouter.get("/assesment/get/:status", getAssesmentByStatus);
assessmentRouter.put("/assesment/update/:id", updateAssessment);
assessmentRouter.patch("/assesment/statusToggle/:id", toggleAssessmentStatus);
assessmentRouter.delete("/assesment/delete/:id", deleteAssessment);

export default assessmentRouter;
