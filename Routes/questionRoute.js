import express from "express";
import multer from "multer";
import { createQuestions, deleteQuestion, getQuestionsByTopic, importQuestionsFromExcel, updateQuestion } from "../Controllers/qustionController.js";
import { uploadExcel } from "../Middleware/multer.js";
import adminAuth from "../Middleware/adminAuth.js";


const questionRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

questionRouter.post("/question/create/:id",adminAuth, createQuestions);
questionRouter.get("/question/get/:id",adminAuth, getQuestionsByTopic);
questionRouter.put("/question/update/:id",adminAuth, updateQuestion);
questionRouter.delete("/question/delete/:id",adminAuth, deleteQuestion);
questionRouter.post("/question/excel/import/:id",adminAuth, uploadExcel.single("file"), importQuestionsFromExcel);

export default questionRouter;
