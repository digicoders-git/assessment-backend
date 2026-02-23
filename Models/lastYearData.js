import mongoose from "mongoose";

const lastYearData = new mongoose.Schema({
  studentName: String,
  obtainedMarks: Number,
  totalMarks: Number,
  dateTime: String,
  phone: String,
  studentBatch: String,
  college: String,
  course: String,
  year: String,
}, { timestamps: true });

export default mongoose.model("lastYearData", lastYearData);