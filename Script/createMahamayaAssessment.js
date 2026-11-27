import mongoose from "mongoose";
import dotenv from "dotenv";
import collegeModel from "../Models/collegeModel.js";
import assessmentModel from "../Models/assesmentModel.js";
import counterModel from "../Models/counterModel.js";
import certificateModel from "../Models/certificateModel.js";

dotenv.config();

async function createCollegeAndAssessment() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB Atlas");

  // 1. ADD COLLEGE
  const collegeName = "Mahamaya College of Agricultural Engineering and Technology Ambedkar Nagar";
  const location = "Ambedkar Nagar";

  let college = await collegeModel.findOne({
    collegeName: { $regex: new RegExp("^" + collegeName.trim() + "$", "i") }
  });

  if (!college) {
    college = await collegeModel.create({
      collegeName: collegeName.trim(),
      location: location.trim()
    });
    console.log("✅ Created new College:", college.collegeName, "ID:", college._id);
  } else {
    console.log("ℹ️ College already exists:", college.collegeName, "ID:", college._id);
  }

  // 2. CHECK CERTIFICATE TEMPLATE
  // Workshop Certificate - 1
  const certId = "697b32afdaa98dbfa877cac3";
  const cert = await certificateModel.findById(certId);
  if (!cert) {
    throw new Error("Certificate template not found: " + certId);
  }
  console.log("✅ Using Certificate Template:", cert.certificateName, "ID:", cert._id);

  // 3. GENERATE UNIQUE ASSESSMENT CODE
  let code = "DCT3589";
  let existing = await assessmentModel.findOne({ assessmentCode: code });
  while (existing) {
    code = "DCT35" + Math.floor(10 + Math.random() * 89);
    existing = await assessmentModel.findOne({ assessmentCode: code });
  }

  // 4. INCREMENT ASSESSMENT COUNTER
  const counter = await counterModel.findOneAndUpdate(
    { name: "assessment" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const now = new Date();
  const startDateTime = new Date(now.getTime() - 4 * 60 * 60 * 1000); // 4 hours ago (active now)
  const endDateTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days validity

  // 5. CREATE ASSESSMENT
  const assessment = await assessmentModel.create({
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

  console.log("\n========================================================");
  console.log("🎉 ASSESSMENT CREATED SUCCESSFULLY!");
  console.log("========================================================");
  console.log("Assessment ID       :", assessment.assessmentId);
  console.log("Assessment Name     :", assessment.assessmentName);
  console.log("Assessment Code     :", assessment.assessmentCode);
  console.log("College / Remark    :", assessment.remark);
  console.log("Certificate Only    :", assessment.certificateOnly);
  console.log("Status              :", assessment.status ? "ACTIVE" : "INACTIVE");
  console.log("Certificate Template:", cert.certificateName, `(${cert._id})`);
  console.log("Valid From          :", startDateTime.toISOString());
  console.log("Valid Until         :", endDateTime.toISOString());
  console.log("--------------------------------------------------------");
  console.log("🔗 Certificate Link :");
  console.log(`https://assessment.thedigicoders.com/certificate/${cert._id}/${assessment.assessmentCode}`);
  console.log("🔗 Direct Test Link :");
  console.log(`https://assessment.thedigicoders.com/${assessment.assessmentCode}`);
  console.log("========================================================");

  await mongoose.disconnect();
}

createCollegeAndAssessment().catch(err => {
  console.error("❌ Error:", err);
  mongoose.disconnect();
  process.exit(1);
});
