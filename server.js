import dotenv from "dotenv";
dotenv.config();   // 👈 MUST be first, before any other imports

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnect from "./Config/db.js";

// Routes
import studentRoute from "./Routes/student-router.js";
import adminRoute from "./Routes/adminRoute.js";
import topicRouter from "./Routes/topicRoute.js";
import questionRouter from "./Routes/questionRoute.js";
import assessmentRouter from "./Routes/assesmentRoute.js";
import assesmentQuestionRrouter from "./Routes/assesmentQuestionsRoute.js";
import collegeRouter from "./Routes/collegeRoute.js";
import academicYearRoute from "./Routes/academicYearRoute.js";
import courseRouter from "./Routes/courseRoute.js";
import certificateRouter from "./Routes/certificateRoute.js";



const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Database connection
dbConnect();

// Routes
app.use('/registration', studentRoute);
app.use('/admin', adminRoute);
app.use('/admin', topicRouter);
app.use('/admin', questionRouter);
app.use('/admin', assessmentRouter);
app.use('/admin', assesmentQuestionRrouter);
app.use('/admin', collegeRouter);
app.use('/admin', academicYearRoute);
app.use('/admin', courseRouter);
app.use('/admin', certificateRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
