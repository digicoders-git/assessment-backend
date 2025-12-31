import express from 'express'
import { createAcademicYear, deleteAcademicYear, getAcademicYears, updateAcademicYear } from "../Controllers/academicYearController.js";


const academicYearRoute = express.Router();

academicYearRoute.post("/academic-year-add", createAcademicYear);
academicYearRoute.get("/academic-year-get", getAcademicYears);
academicYearRoute.put("/academic-year-update/:id", updateAcademicYear);
academicYearRoute.delete("/academic-year-delete/:id", deleteAcademicYear);

export default academicYearRoute;
