import mongoose from "mongoose";
import dotenv from "dotenv";
import questionModel from "../Models/questionModel.js";
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const total = await questionModel.countDocuments();
  const withCourse = await questionModel.countDocuments({ course: { $exists: true, $ne: null } });
  const withoutCourse = await questionModel.countDocuments({ $or: [{ course: { $exists: false } }, { course: null }] });
  console.log({ total, withCourse, withoutCourse });
  const sampleWith = await questionModel.findOne({ course: { $exists: true, $ne: null } }).lean();
  console.log("Sample with course:", sampleWith);
  await mongoose.disconnect();
}
run().catch(console.error);

