import mongoose from "mongoose";
import dotenv from "dotenv";
import assessmentModel from "../Models/assesmentModel.js";
import counterModel from "../Models/counterModel.js";
import certificateModel from "../Models/certificateModel.js";
import collegeModel from "../Models/collegeModel.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // 1. Add College if not exists
  const collegeName = "Jhun Jhun Wala PG College Ayodhya";
  const location = "Ayodhya";

  let college = await collegeModel.findOne({
    collegeName: new RegExp("^" + collegeName + "$", "i")
  });

  if (!college) {
    college = await collegeModel.create({
      collegeName,
      location
    });
    console.log("College created:", college.collegeName, "ID:", college._id);
  } else {
    console.log("College already existed:", college.collegeName, "ID:", college._id);
  }

  // 2. Certificate template from DCT2789
  const certId = "697b32afdaa98dbfa877cac3"; // Workshop Certificate - 1
  const cert = await certificateModel.findById(certId);
  if (!cert) throw new Error("Certificate template not found");
  console.log("Using Certificate Template:", cert.certificateName, "ID:", cert._id);

  // 3. Generate unique assessment code
  let code = "DCT2889";
  let exists = await assessmentModel.findOne({ assessmentCode: code });
  let tryCount = 1;
  while (exists) {
    code = "DCT28" + Math.floor(10 + Math.random() * 89);
    exists = await assessmentModel.findOne({ assessmentCode: code });
    tryCount++;
    if (tryCount > 20) throw new Error("Could not find free assessment code");
  }

  // 4. Increment counter
  const counter = await counterModel.findOneAndUpdate(
    { name: "assessment" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const now = new Date();
  const startDateTime = new Date(now.getTime() - 4 * 60 * 60 * 1000); // 4 hours ago so active immediately
  const endDateTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days active

  // 5. Create Assessment
  const newAssessment = await assessmentModel.create({
    assessmentId: counter.seq,
    assessmentName: "AI-Powered Career Roadmap Workshop",
    assessmentCode: code,
    certificateOnly: true,
    totalQuestions: 0,
    timeDuration: 0,
    startDateTime,
    endDateTime,
    generateCertificate: true,
    certificateName: cert._id,
    remark: collegeName,
    allowedYears: [],
    status: true,
    start: 0,
    submit: 0,
    count: 0
  });

  console.log("\n=== ASSESSMENT CREATED SUCCESSFULLY ===");
  console.log({
    _id: newAssessment._id,
    assessmentId: newAssessment.assessmentId,
    assessmentName: newAssessment.assessmentName,
    assessmentCode: newAssessment.assessmentCode,
    certificateOnly: newAssessment.certificateOnly,
    generateCertificate: newAssessment.generateCertificate,
    certificateName: cert.certificateName,
    certificateId: cert._id.toString(),
    status: newAssessment.status,
    startDateTime: newAssessment.startDateTime,
    endDateTime: newAssessment.endDateTime,
    remark: newAssessment.remark,
    college: college.collegeName
  });

  console.log("\nCertificate Link:");
  console.log(`https://assessment.thedigicoders.com/certificate/${cert._id}/${newAssessment.assessmentCode}`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error("Error:", err);
  mongoose.disconnect();
  process.exit(1);
});

