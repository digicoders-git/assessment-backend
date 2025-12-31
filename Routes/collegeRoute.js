import express from "express";
import { createCollege, deleteCollege, getAllColleges, updateCollege } from "../Controllers/collegeController.js";


const collegeRouter = express.Router();

collegeRouter.post("/college-add", createCollege);
collegeRouter.get("/college-get", getAllColleges);
collegeRouter.put("/college-update/:id", updateCollege);
collegeRouter.delete("/college-delete/:id", deleteCollege);

export default collegeRouter;
