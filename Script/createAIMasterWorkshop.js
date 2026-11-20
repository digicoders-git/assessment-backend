import mongoose from "mongoose";
import dotenv from "dotenv";
import assessmentModel from "../Models/assesmentModel.js";
import counterModel from "../Models/counterModel.js";
import certificateModel from "../Models/certificateModel.js";

dotenv.config();

async function createAIMasterWorkshopAssessment() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const certId = "697b32afdaa98dbfa877cac3"; // Workshop Certificate - 1
  const cert = await certificateModel.findById(certId);
  if (!cert) throw new Error("Certificate template not found: " + certId);
  console.log("Using Certificate:", cert.certificateName, cert._id);

  // Generate unique code: DCT3199
  let code = "DCT3199";
  let exists = await assessmentModel.findOne({ assessmentCode: code });
  while (exists) {
    code = "DCT31" + Math.floor(10 + Math.random() * 89);
    exists = await assessmentModel.findOne({ assessmentCode: code });
  }

  // Increment counter
  const counter = await counterModel.findOneAndUpdate(
    { name: "assessment" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const now = new Date();
  const startDateTime = new Date(now.getTime() - 4 * 60 * 60 * 1000); // 4 hours ago so active immediately
  const endDateTime = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days active

  const assessment = await assessmentModel.create({
    assessmentId: counter.seq,
    assessmentName: "AI Master Workshop",
    assessmentCode: code,
    certificateOnly: true,
    totalQuestions: 0,
    timeDuration: 0,
    startDateTime,
    endDateTime,
    generateCertificate: true,
    certificateName: cert._id,
    remark: "AI Master Workshop",
    allowedYears: [],
    status: true,
    start: 0,
    submit: 0,
    count: 0
  });

  const certificateLink = `https://assessment.thedigicoders.com/certificate/${cert._id}/${assessment.assessmentCode}`;

  console.log("\n=== ASSESSMENT CREATED SUCCESSFULLY ===");
  console.log({
    _id: assessment._id,
    assessmentId: assessment.assessmentId,
    assessmentName: assessment.assessmentName,
    assessmentCode: assessment.assessmentCode,
    certificateOnly: assessment.certificateOnly,
    generateCertificate: assessment.generateCertificate,
    certificateName: cert.certificateName,
    certificateId: cert._id.toString(),
    status: assessment.status,
    startDateTime: assessment.startDateTime,
    endDateTime: assessment.endDateTime,
    remark: assessment.remark
  });

  console.log("\nCertificate Link:", certificateLink);

  await mongoose.disconnect();
}

createAIMasterWorkshopAssessment().catch(err => {
  console.error("Error creating AI Master Workshop assessment:", err);
  mongoose.disconnect();
  process.exit(1);
});

