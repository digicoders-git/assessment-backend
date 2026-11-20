import mongoose from "mongoose";
import dotenv from "dotenv";
import collegeModel from "../Models/collegeModel.js";
import assessmentModel from "../Models/assesmentModel.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // 1. Add College: Babasaheb Bhimrao Ambedkar University
  const collegeName = "Babasaheb Bhimrao Ambedkar University";
  const location = "Lucknow";

  let college = await collegeModel.findOne({
    collegeName: new RegExp("^" + collegeName + "$", "i")
  });

  if (!college) {
    college = await collegeModel.create({
      collegeName,
      location
    });
    console.log("College added successfully:", college.collegeName, "ID:", college._id);
  } else {
    console.log("College already exists:", college.collegeName, "ID:", college._id);
  }

  // 2. Update DCT3089 remark
  const updatedAssessment = await assessmentModel.findOneAndUpdate(
    { assessmentCode: "DCT3089" },
    { remark: collegeName },
    { new: true }
  );

  console.log("\nAssessment DCT3089 Updated:", {
    _id: updatedAssessment._id,
    code: updatedAssessment.assessmentCode,
    name: updatedAssessment.assessmentName,
    remark: updatedAssessment.remark,
    status: updatedAssessment.status
  });

  await mongoose.disconnect();
}

run().catch(err => {
  console.error("Error:", err);
  mongoose.disconnect();
  process.exit(1);
});

