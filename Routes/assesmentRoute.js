import express from "express";
import { createAssessment, deleteAssessment, getAllAssessments, getAssesmentByStatus, toggleAssessmentStatus, updateAssessment } from "../Controllers/assesmentController.js";
import adminAuth from "../Middleware/adminAuth.js";

const assessmentRouter = express.Router();

assessmentRouter.post("/assesment/create",adminAuth, createAssessment);
assessmentRouter.get("/assesment/get",adminAuth, getAllAssessments);
assessmentRouter.get("/assesment/get/:status",adminAuth, getAssesmentByStatus);
assessmentRouter.put("/assesment/update/:id",adminAuth, updateAssessment);
assessmentRouter.patch("/assesment/statusToggle/:id",adminAuth, toggleAssessmentStatus);
assessmentRouter.delete("/assesment/delete/:id",adminAuth, deleteAssessment);

export default assessmentRouter;
