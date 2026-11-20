import mongoose from "mongoose";
import dotenv from "dotenv";
import assessmentModel from "../Models/assesmentModel.js";
import counterModel from "../Models/counterModel.js";
import certificateModel from "../Models/certificateModel.js";

dotenv.config();

async function create() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Certificate template: Workshop Certificate - 1
  const certId = "697b32afdaa98dbfa877cac3";
  const cert = await certificateModel.findById(certId);
  if (!cert) throw new Error("Certificate template not found");
  console.log("Using Certificate:", cert.certificateName, "ID:", cert._id);

  // Generate unique code: DCT27 + 2 digits (e.g., DCT2789)
  let code = "DCT2789";
  let exists = await assessmentModel.findOne({ assessmentCode: code });
  let counter_try = 1;
  while (exists) {
    code = "DCT27" + Math.floor(10 + Math.random() * 89);
    exists = await assessmentModel.findOne({ assessmentCode: code });
    counter_try++;
    if (counter_try > 20) throw new Error("Could not generate unique code");
  }

  // Increment counter
  const counter = await counterModel.findOneAndUpdate(
    { name: "assessment" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const now = new Date();
  const startDateTime = new Date(now.getTime() - 4 * 60 * 60 * 1000); // 4 hours ago
  const endDateTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days active

  const newAssessment = await assessmentModel.create({
    assessmentId: counter.seq,
    assessmentName: "AI-Powered Career Roadmap Workshop",
    assessmentCode: code,
    certificateOnly: true,
    totalQuestions: 0,
    timeDuration: 0,
    startDateTime: startDateTime,
    endDateTime: endDateTime,
    generateCertificate: true,
    certificateName: cert._id,
    remark: "AI-Powered Career Roadmap Workshop",
    allowedYears: [],
    status: true,
    start: 0,
    submit: 0,
    count: 0
  });

  console.log("SUCCESSFULLY CREATED ASSESSMENT:");
  console.log({
    _id: newAssessment._id,
    assessmentId: newAssessment.assessmentId,
    assessmentName: newAssessment.assessmentName,
    assessmentCode: newAssessment.assessmentCode,
    certificateOnly: newAssessment.certificateOnly,
    generateCertificate: newAssessment.generateCertificate,
    certificateName: cert.certificateName,
    certificateId: cert._id,
    status: newAssessment.status,
    startDateTime: newAssessment.startDateTime,
    endDateTime: newAssessment.endDateTime,
    remark: newAssessment.remark
  });

  await mongoose.disconnect();
  console.log("Database disconnected.");
}

create().catch(err => {
  console.error("Error creating assessment:", err);
  mongoose.disconnect();
  process.exit(1);
});

