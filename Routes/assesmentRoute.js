import express from "express";
import { 
  createAssessment, 
  deleteAssessment, 
  duplicateAssessment, 
  getAllAssessments, 
  getAssesmentByStatus, 
  toggleAssessmentStatus, 
  updateAssessment,
  resetAssessmentCategories 
} from "../Controllers/assesmentController.js";
import adminAuth from "../Middleware/adminAuth.js";

const assessmentRouter = express.Router();

assessmentRouter.post("/assesment/create",adminAuth, createAssessment);
assessmentRouter.get("/assesment/get", adminAuth, getAllAssessments);
assessmentRouter.get("/assesment/get/:status", getAssesmentByStatus);
assessmentRouter.post("/assesment/duplicate/:id", adminAuth, duplicateAssessment);
assessmentRouter.put("/assesment/update/:id",adminAuth, updateAssessment);
assessmentRouter.patch("/assesment/statusToggle/:id",adminAuth, toggleAssessmentStatus);
assessmentRouter.delete("/assesment/delete/:id",adminAuth, deleteAssessment);
assessmentRouter.post("/assesment/reset-categories", resetAssessmentCategories);

export default assessmentRouter;
