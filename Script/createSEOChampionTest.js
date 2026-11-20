import mongoose from "mongoose";
import dotenv from "dotenv";
import xlsx from "xlsx";
import path from "path";
import topicModel from "../Models/topic.js";
import questionModel from "../Models/questionModel.js";
import assessmentModel from "../Models/assesmentModel.js";
import assesmentQuestionIdModel from "../Models/assesmentQuestionsModel.js";
import counterModel from "../Models/counterModel.js";
import courseModel from "../Models/courseModel.js";
import academicYearModel from "../Models/academicYearModel.js";
import certificateModel from "../Models/certificateModel.js";

dotenv.config();

async function createSEOAssessment() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Certificate template: Training Quiz Certificate - 1
  const targetCertId = "6a2cf0da392c9ac737d14b34";
  const cert = await certificateModel.findById(targetCertId);
  if (!cert) throw new Error("Certificate template not found: " + targetCertId);
  console.log("Using Certificate Template:", cert.certificateName, cert._id);

  // Default course & year
  const defaultCourse = await courseModel.findOne({ course: /BCA/i }) || await courseModel.findOne();
  const defaultYear = await academicYearModel.findOne({ academicYear: /1st Year/i }) || await academicYearModel.findOne();

  // Topic: SEO (50 Questions)
  const topicName = "SEO (50 Questions)";
  let topic = await topicModel.findOne({ topicName });
  if (!topic) {
    topic = await topicModel.create({
      topicName,
      status: true,
      questionCout: 50
    });
    console.log("Created Topic:", topic.topicName, topic._id);
  } else {
    console.log("Found existing Topic:", topic.topicName, topic._id);
  }

  // Parse Excel
  const filePath = path.resolve("../SEO_MCQ_Test_50_Questions.xlsx");
  const wb = xlsx.readFile(filePath);
  const sheet = wb.Sheets["SEO MCQ Test"];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  const qDocs = [];
  for (const r of rows) {
    const questionText = String(r.Question || "").trim();
    const optA = String(r["Option A"] || "").trim();
    const optB = String(r["Option B"] || "").trim();
    const optC = String(r["Option C"] || "").trim();
    const optD = String(r["Option D"] || "").trim();
    const correctOption = String(r["Correct Option"] || "").trim().toUpperCase();

    let q = await questionModel.findOne({ topic: topic._id, question: questionText });
    if (!q) {
      q = await questionModel.create({
        topic: topic._id,
        course: defaultCourse._id,
        year: defaultYear._id,
        question: questionText,
        options: { A: optA, B: optB, C: optC, D: optD },
        correctOption
      });
    }
    qDocs.push(q._id);
  }

  await topicModel.findByIdAndUpdate(topic._id, { questionCout: qDocs.length });
  console.log("SEO questions ready in database:", qDocs.length);

  // Timing: 20 minutes duration, active for 14 days
  const now = new Date();
  const startDateTime = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const endDateTime = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  // Assessment Code: DCT0256
  const code = "DCT0256";

  // Increment counter
  const counter = await counterModel.findOneAndUpdate(
    { name: "assessment" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const assessment = await assessmentModel.create({
    assessmentId: counter.seq,
    assessmentName: "SEO Champion Test",
    assessmentCode: code,
    certificateOnly: false,
    totalQuestions: 50,
    timeDuration: 20, // 20 minutes as requested
    startDateTime,
    endDateTime,
    generateCertificate: true,
    certificateName: cert._id,
    remark: "SEO Champion Test",
    allowedYears: [],
    status: true,
    start: 0,
    submit: 0,
    count: 0
  });

  await assesmentQuestionIdModel.create({
    assesmentId: assessment._id,
    questionIds: qDocs,
    courseYearGroups: []
  });

  console.log("\n=== SEO CHAMPION TEST CREATED SUCCESSFULLY ===");
  console.log({
    _id: assessment._id,
    assessmentId: assessment.assessmentId,
    assessmentName: assessment.assessmentName,
    assessmentCode: assessment.assessmentCode,
    totalQuestions: assessment.totalQuestions,
    timeDuration: assessment.timeDuration + " Minutes",
    generateCertificate: assessment.generateCertificate,
    certificateName: cert.certificateName,
    certificateId: cert._id.toString(),
    status: assessment.status,
    questionsAssigned: qDocs.length
  });

  console.log("\nTest Link: https://assessment.thedigicoders.com/" + assessment.assessmentCode);

  await mongoose.disconnect();
}

createSEOAssessment().catch(err => {
  console.error("Error creating SEO assessment:", err);
  mongoose.disconnect();
  process.exit(1);
});

