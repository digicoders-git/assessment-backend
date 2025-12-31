import express from 'express'
import { createCourse, deleteCourse, getCourses, updateCourse } from "../Controllers/courseController.js";


const courseRouter = express.Router();

courseRouter.post("/course-add", createCourse);
courseRouter.get("/course-get", getCourses);
courseRouter.put("/course-update/:id", updateCourse);
courseRouter.delete("/course-delete/:id", deleteCourse);

export default courseRouter;
