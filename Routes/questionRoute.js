import express from "express";
import multer from "multer";
import { createQuestions, deleteQuestion, getQuestionsByTopic, importQuestionsFromExcel, updateQuestion } from "../Controllers/qustionController.js";


const questionRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

questionRouter.post("/question/create/:id", createQuestions);
questionRouter.get("/question/get/:id", getQuestionsByTopic);
questionRouter.put("/question/update/:id", updateQuestion);
questionRouter.delete("/question/delete/:id", deleteQuestion);
questionRouter.post("/question/excel/import/:id", upload.single("file"), importQuestionsFromExcel);

export default questionRouter;
