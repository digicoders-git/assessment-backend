import mongoose from "mongoose";
import dotenv from "dotenv";
import assessmentModel from "../Models/assesmentModel.js";
import counterModel from "../Models/counterModel.js";
import certificateModel from "../Models/certificateModel.js";

dotenv.config();

async function duplicateAssessment() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const SOURCE_CODE = "DCT2889";
  const src = await assessmentModel.findOne({ assessmentCode: SOURCE_CODE });
  if (!src) throw new Error(`Source assessment ${SOURCE_CODE} not found`);
  console.log("Source assessment found:", src.assessmentName, "Code:", src.assessmentCode);

  // Generate unique code: DCT3089 (or DCT30xx)
  let newCode = "DCT3089";
  let exists = await assessmentModel.findOne({ assessmentCode: newCode });
  let tryCount = 1;
  while (exists) {
    newCode = "DCT30" + Math.floor(10 + Math.random() * 89);
    exists = await assessmentModel.findOne({ assessmentCode: newCode });
    tryCount++;
    if (tryCount > 20) throw new Error("Could not find free assessment code");
  }

  // Increment counter
  const counter = await counterModel.findOneAndUpdate(
    { name: "assessment" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const now = new Date();
  const startDateTime = new Date(now.getTime() - 4 * 60 * 60 * 1000); // 4 hours ago so active immediately
  const endDateTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days active

  const newAssessment = await assessmentModel.create({
    assessmentId: counter.seq,
    assessmentName: src.assessmentName,
    assessmentCode: newCode,
    certificateOnly: src.certificateOnly,
    totalQuestions: src.totalQuestions || 0,
    timeDuration: src.timeDuration || 0,
    startDateTime,
    endDateTime,
    generateCertificate: src.generateCertificate,
    certificateName: src.certificateName,
    remark: src.remark,
    allowedYears: src.allowedYears || [],
    status: true,
    start: 0,
    submit: 0,
    count: 0
  });

  const cert = await certificateModel.findById(src.certificateName);

  console.log("\n=== ASSESSMENT DUPLICATED SUCCESSFULLY ===");
  console.log({
    _id: newAssessment._id,
    assessmentId: newAssessment.assessmentId,
    assessmentName: newAssessment.assessmentName,
    assessmentCode: newAssessment.assessmentCode,
    certificateOnly: newAssessment.certificateOnly,
    generateCertificate: newAssessment.generateCertificate,
    certificateName: cert ? cert.certificateName : src.certificateName,
    certificateId: src.certificateName.toString(),
    status: newAssessment.status,
    startDateTime: newAssessment.startDateTime,
    endDateTime: newAssessment.endDateTime,
    remark: newAssessment.remark
  });

  const link = `https://assessment.thedigicoders.com/certificate/${src.certificateName}/${newAssessment.assessmentCode}`;
  console.log("\nCertificate Link:", link);

  await mongoose.disconnect();
}

duplicateAssessment().catch(err => {
  console.error("Error during duplication:", err);
  mongoose.disconnect();
  process.exit(1);
});

