import express from 'express'
import { createAcademicYear, deleteAcademicYear, getAcademicYears, updateAcademicYear } from "../Controllers/academicYearController.js";
import adminAuth from '../Middleware/adminAuth.js';


const academicYearRoute = express.Router();

academicYearRoute.post("/academic-year-add",adminAuth, createAcademicYear);
academicYearRoute.get("/academic-year-get",adminAuth, getAcademicYears);
academicYearRoute.put("/academic-year-update/:id",adminAuth, updateAcademicYear);
academicYearRoute.delete("/academic-year-delete/:id",adminAuth, deleteAcademicYear);

export default academicYearRoute;
