import dotenv from "dotenv";
dotenv.config(); 

// corn for auto deactive assesemnt after its enddatetime 
import "./utils/corn.js"

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnect from "./Config/db.js";
import path from "path";


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
import resultRouter from "./Routes/resultRoute.js";
import lastYearData from "./Routes/lastYearData.js";



const app = express();

app.use(express.json());


app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: ["https://assessment.thedigicoders.com/","http://localhost:5173","https://assesment-portal-digicoders.vercel.app","http://localhost:5174","https://erp.thedigicoders.com","https://student.thedigicoders.com"],
  credentials: true
}));app.use(express.urlencoded({ extended: true }));


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
app.use('/admin', resultRouter);
app.use('/admin', lastYearData);

// route not found 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
  // Database connection
dbConnect();

  console.log(`Server is running on port http://localhost:${port}`);
});
