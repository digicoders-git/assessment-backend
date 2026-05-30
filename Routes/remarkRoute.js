import express from "express";
import { addRemark, getRemarksByStudent } from "../Controllers/remarkController.js";
import adminAuth from "../Middleware/adminAuth.js";

const remarkRouter = express.Router();

remarkRouter.post("/remark", adminAuth, addRemark);
remarkRouter.get("/remark/:studentId", adminAuth, getRemarksByStudent);

export default remarkRouter;
