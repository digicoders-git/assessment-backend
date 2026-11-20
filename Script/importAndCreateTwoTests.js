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

async function importAndCreateTests() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Certificate template: Workshop Certificate - 1
  const certId = "697b32afdaa98dbfa877cac3";
  const cert = await certificateModel.findById(certId);
  if (!cert) throw new Error("Certificate template not found");
  console.log("Using Certificate:", cert.certificateName, certId);

  // Default course and year for question documents
  const defaultCourse = await courseModel.findOne({ course: /BCA/i }) || await courseModel.findOne();
  const defaultYear = await academicYearModel.findOne({ academicYear: /1st Year/i }) || await academicYearModel.findOne();
  console.log("Using default course:", defaultCourse.course, "year:", defaultYear.academicYear);

  // 1. Topic 1: HTML & CSS (50 Questions)
  let topic1 = await topicModel.findOne({ topicName: "HTML & CSS (50 Questions)" });
  if (!topic1) {
    topic1 = await topicModel.create({
      topicName: "HTML & CSS (50 Questions)",
      status: true,
      questionCout: 50
    });
    console.log("Created Topic 1:", topic1.topicName, topic1._id);
  } else {
    console.log("Found existing Topic 1:", topic1.topicName, topic1._id);
  }

  // Parse file 1: html and css.xlsx
  const file1 = path.resolve("../html and css.xlsx");
  const wb1 = xlsx.readFile(file1);
  const rows1 = xlsx.utils.sheet_to_json(wb1.Sheets[wb1.SheetNames[0]], { defval: "" });

  const qDocs1 = [];
  for (const r of rows1) {
    const qText = String(r.Questions || r.Question || "").trim();
    const optA = String(r.optionA || "").trim();
    const optB = String(r.optionB || "").trim();
    const optC = String(r.optionC || "").trim();
    const optD = String(r.optionD || "").trim();
    const ans = String(r.correctoption || r.Correctoption || "").trim().toUpperCase();

    // Check if already in DB
    let q = await questionModel.findOne({ topic: topic1._id, question: qText });
    if (!q) {
      q = await questionModel.create({
        topic: topic1._id,
        course: defaultCourse._id,
        year: defaultYear._id,
        question: qText,
        options: { A: optA, B: optB, C: optC, D: optD },
        correctOption: ans
      });
    }
    qDocs1.push(q._id);
  }
  console.log("Topic 1 questions imported/ready:", qDocs1.length);
  await topicModel.findByIdAndUpdate(topic1._id, { questionCout: qDocs1.length });

  // 2. Topic 2: React JS & JavaScript (50 Questions)
  let topic2 = await topicModel.findOne({ topicName: "React JS & JavaScript (50 Questions)" });
  if (!topic2) {
    topic2 = await topicModel.create({
      topicName: "React JS & JavaScript (50 Questions)",
      status: true,
      questionCout: 50
    });
    console.log("Created Topic 2:", topic2.topicName, topic2._id);
  } else {
    console.log("Found existing Topic 2:", topic2.topicName, topic2._id);
  }

  // Parse file 2: react js and java Script.xlsx
  const file2 = path.resolve("../react js and java Script.xlsx");
  const wb2 = xlsx.readFile(file2);
  const sheet2 = wb2.Sheets[wb2.SheetNames[0]];

  const qDocs2 = [];
  for (let r = 2; r <= 51; r++) {
    const qText = sheet2["A" + r]?.v ? String(sheet2["A" + r].v).trim() : "";
    const optA = sheet2["B" + r]?.v !== undefined ? String(sheet2["B" + r].v).trim() : "";
    let optB = sheet2["C" + r]?.v !== undefined ? String(sheet2["C" + r].v).trim() : "";
    if (sheet2["C" + r]?.t === "e" || !optB) {
      optB = "---";
    }
    const optC = sheet2["D" + r]?.v !== undefined ? String(sheet2["D" + r].v).trim() : "";
    const optD = sheet2["E" + r]?.v !== undefined ? String(sheet2["E" + r].v).trim() : "";
    const ans = sheet2["F" + r]?.v ? String(sheet2["F" + r].v).trim().toUpperCase() : "";

    let q = await questionModel.findOne({ topic: topic2._id, question: qText });
    if (!q) {
      q = await questionModel.create({
        topic: topic2._id,
        course: defaultCourse._id,
        year: defaultYear._id,
        question: qText,
        options: { A: optA, B: optB, C: optC, D: optD },
        correctOption: ans
      });
    }
    qDocs2.push(q._id);
  }
  console.log("Topic 2 questions imported/ready:", qDocs2.length);
  await topicModel.findByIdAndUpdate(topic2._id, { questionCout: qDocs2.length });

  // Timing: 30 minutes duration, active now through next 7 days
  const now = new Date();
  const startDateTime = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const endDateTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Helper to generate unique assessment code
  async function getUniqueCode(candidate) {
    let code = candidate;
    let exists = await assessmentModel.findOne({ assessmentCode: code });
    while (exists) {
      code = "DCT31" + Math.floor(10 + Math.random() * 89);
      exists = await assessmentModel.findOne({ assessmentCode: code });
    }
    return code;
  }

  // 3. Create Assessment 1: HTML & CSS
  const code1 = await getUniqueCode("DCT3152");
  const counter1 = await counterModel.findOneAndUpdate(
    { name: "assessment" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const assessment1 = await assessmentModel.create({
    assessmentId: counter1.seq,
    assessmentName: "HTML & CSS",
    assessmentCode: code1,
    certificateOnly: false,
    totalQuestions: 50,
    timeDuration: 30,
    startDateTime,
    endDateTime,
    generateCertificate: true,
    certificateName: cert._id,
    remark: "HTML & CSS Assessment",
    allowedYears: [],
    status: true,
    start: 0,
    submit: 0,
    count: 0
  });

  await assesmentQuestionIdModel.create({
    assesmentId: assessment1._id,
    questionIds: qDocs1,
    courseYearGroups: []
  });
  console.log("\n Assessment 1 Created:", {
    id: assessment1._id,
    seq: assessment1.assessmentId,
    name: assessment1.assessmentName,
    code: assessment1.assessmentCode,
    questions: qDocs1.length,
    duration: assessment1.timeDuration
  });

  // 4. Create Assessment 2: React JS & JavaScript
  const code2 = await getUniqueCode("DCT3162");
  const counter2 = await counterModel.findOneAndUpdate(
    { name: "assessment" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const assessment2 = await assessmentModel.create({
    assessmentId: counter2.seq,
    assessmentName: "React JS & JavaScript",
    assessmentCode: code2,
    certificateOnly: false,
    totalQuestions: 50,
    timeDuration: 30,
    startDateTime,
    endDateTime,
    generateCertificate: true,
    certificateName: cert._id,
    remark: "React JS & JavaScript Assessment",
    allowedYears: [],
    status: true,
    start: 0,
    submit: 0,
    count: 0
  });

  await assesmentQuestionIdModel.create({
    assesmentId: assessment2._id,
    questionIds: qDocs2,
    courseYearGroups: []
  });
  console.log("\n Assessment 2 Created:", {
    id: assessment2._id,
    seq: assessment2.assessmentId,
    name: assessment2.assessmentName,
    code: assessment2.assessmentCode,
    questions: qDocs2.length,
    duration: assessment2.timeDuration
  });

  console.log("\n=== SUMMARY OF CREATED TESTS ===");
  console.log(`Test 1: https://assessment.thedigicoders.com/${assessment1.assessmentCode}`);
  console.log(`Test 2: https://assessment.thedigicoders.com/${assessment2.assessmentCode}`);

  await mongoose.disconnect();
}

importAndCreateTests().catch(err => {
  console.error("Error creating assessments:", err);
  mongoose.disconnect();
  process.exit(1);
});

