import express from "express";
import { addQuestionsToAssessment, deleteQuestionFromAssessment, getAssesmentByCode } from "../Controllers/assesmentsQuestionsController.js";
import adminAuth from "../Middleware/adminAuth.js";
const assesmentQuestionRrouter = express.Router();

assesmentQuestionRrouter.post("/assesment/assign-questions/:id",adminAuth,addQuestionsToAssessment);
assesmentQuestionRrouter.get("/assesment/get-question/:code",adminAuth,getAssesmentByCode);
assesmentQuestionRrouter.put("/assesment/delete-questions/:assesmentQuestionId/:questionId",adminAuth,deleteQuestionFromAssessment);

export default assesmentQuestionRrouter;
