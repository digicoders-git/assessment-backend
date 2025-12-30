import express from "express";
import env from "dotenv";
import cors from "cors";
import dbConnect from "./Config/db.js";
import studentRoute from "./Routes/student-router.js";
import adminRoute from "./Routes/adminRoute.js";
import topicRouter from "./Routes/topicRoute.js";
import questionRouter from "./Routes/questionRoute.js";
import cookieParser from "cookie-parser";
import assessmentRouter from "./Routes/assesmentRoute.js";
import assesmentQuestionRrouter from "./Routes/assesmentQuestionsRoute.js";
env.config()

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
dbConnect()

const port = process.env.PORT || 5000;

app.use('/registration',studentRoute)
app.use('/admin',adminRoute)
app.use('/admin',topicRouter)
app.use('/admin',questionRouter)
app.use('/admin',assessmentRouter)
app.use('/admin',assesmentQuestionRrouter)

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});