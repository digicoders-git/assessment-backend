import express from 'express'
import { createCourse, deleteCourse, getCourses, updateCourse } from "../Controllers/courseController.js";
import adminAuth from '../Middleware/adminAuth.js';


const courseRouter = express.Router();

courseRouter.post("/course-add",adminAuth, createCourse);
courseRouter.get("/course-get",adminAuth, getCourses);
courseRouter.put("/course-update/:id",adminAuth, updateCourse);
courseRouter.delete("/course-delete/:id",adminAuth, deleteCourse);

export default courseRouter;
