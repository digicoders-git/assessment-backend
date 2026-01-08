import express from "express";
import { createCollege, deleteCollege, getAllColleges, updateCollege } from "../Controllers/collegeController.js";
import adminAuth from "../Middleware/adminAuth.js";


const collegeRouter = express.Router();

collegeRouter.post("/college-add",adminAuth, createCollege);
collegeRouter.get("/college-get",adminAuth, getAllColleges);
collegeRouter.put("/college-update/:id",adminAuth, updateCollege);
collegeRouter.delete("/college-delete/:id",adminAuth, deleteCollege);

export default collegeRouter;
