import express from "express";
import { addQuestionsToAssessment, deleteQuestionFromAssessment, getAssesmentById } from "../Controllers/assesmentsQuestionsController.js";
const assesmentQuestionRrouter = express.Router();

// create / save multiple question ids
assesmentQuestionRrouter.post("/assesment/assign-questions/:id",addQuestionsToAssessment);
assesmentQuestionRrouter.get("/assesment/get-question/:id",getAssesmentById);
assesmentQuestionRrouter.put("/assesment/delete-questions/:assesmentQuestionId/:questionId",deleteQuestionFromAssessment);

export default assesmentQuestionRrouter;
