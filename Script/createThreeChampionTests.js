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

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Certificate template: Training Quiz Certificate - 1
  const targetCertId = "6a2cf0da392c9ac737d14b34";
  const cert = await certificateModel.findById(targetCertId);
  if (!cert) throw new Error("Certificate template not found: " + targetCertId);
  console.log("Using Certificate:", cert.certificateName, cert._id);

  // Default course & year for question schema references
  const defaultCourse = await courseModel.findOne({ course: /BCA/i }) || await courseModel.findOne();
  const defaultYear = await academicYearModel.findOne({ academicYear: /1st Year/i }) || await academicYearModel.findOne();
  console.log("Default course:", defaultCourse.course, "year:", defaultYear.academicYear);

  const now = new Date();
  const startDateTime = new Date(now.getTime() - 4 * 60 * 60 * 1000); // 4 hours ago
  const endDateTime = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days active

  // ==========================================
  // 1. JavaScript Champion Test
  // ==========================================
  console.log("\n--- Processing JavaScript Champion Test ---");
  const topicName1 = "JavaScript Champion (50 Questions)";
  let topic1 = await topicModel.findOne({ topicName: topicName1 });
  if (!topic1) {
    topic1 = await topicModel.create({ topicName: topicName1, status: true, questionCout: 50 });
  }

  const wbJs = xlsx.readFile(path.resolve("../JsQuestions.xlsx"));
  const sheetJs = wbJs.Sheets[wbJs.SheetNames[0]];
  const qDocs1 = [];

  for (let r = 2; r <= 51; r++) {
    const qNum = r - 1;
    const qText = sheetJs["A" + r]?.v ? String(sheetJs["A" + r].v).trim() : "";
    const ans = sheetJs["F" + r]?.v ? String(sheetJs["F" + r].v).trim().toUpperCase() : "";

    let optA = sheetJs["B" + r]?.w || sheetJs["B" + r]?.v || "";
    let optB = sheetJs["C" + r]?.w || sheetJs["C" + r]?.v || "";
    let optC = sheetJs["D" + r]?.w || sheetJs["D" + r]?.v || "";
    let optD = sheetJs["E" + r]?.w || sheetJs["E" + r]?.v || "";

    if (qNum === 34) { // Row 35
      optA = "==";
      optB = "=";
      optC = "===";
      optD = "!==";
    } else {
      optA = String(optA).trim();
      optB = String(optB).trim();
      optC = String(optC).trim();
      optD = String(optD).trim();
    }

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
  await topicModel.findByIdAndUpdate(topic1._id, { questionCout: qDocs1.length });
  console.log("JavaScript questions ready:", qDocs1.length);

  const counter1 = await counterModel.findOneAndUpdate(
    { name: "assessment" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const assessment1 = await assessmentModel.create({
    assessmentId: counter1.seq,
    assessmentName: "JavaScript Champion Test",
    assessmentCode: "DCT0251",
    certificateOnly: false,
    totalQuestions: 50,
    timeDuration: 30,
    startDateTime,
    endDateTime,
    generateCertificate: true,
    certificateName: cert._id,
    remark: "JavaScript Champion Test",
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
  console.log("Created Assessment 1: DCT0251 - JavaScript Champion Test");

  // ==========================================
  // 2. PHP & Laravel Champion Test
  // ==========================================
  console.log("\n--- Processing PHP & Laravel Champion Test ---");
  const topicName2 = "PHP & Laravel (50 Questions)";
  let topic2 = await topicModel.findOne({ topicName: topicName2 });
  if (!topic2) {
    topic2 = await topicModel.create({ topicName: topicName2, status: true, questionCout: 50 });
  }

  const wbPhp = xlsx.readFile(path.resolve("../Core_PHP_Laravel_50_MCQ.xlsx"));
  const sheetPhp = wbPhp.Sheets[wbPhp.SheetNames[0]];
  const qDocs2 = [];

  for (let r = 2; r <= 51; r++) {
    const qText = sheetPhp["A" + r]?.v ? String(sheetPhp["A" + r].v).trim() : "";
    const ans = sheetPhp["F" + r]?.v ? String(sheetPhp["F" + r].v).trim().toUpperCase() : "";

    let optA = String(sheetPhp["B" + r]?.w || sheetPhp["B" + r]?.v || "").trim();
    let optB = String(sheetPhp["C" + r]?.w || sheetPhp["C" + r]?.v || "").trim();
    let optC = String(sheetPhp["D" + r]?.w || sheetPhp["D" + r]?.v || "").trim();
    let optD = String(sheetPhp["E" + r]?.w || sheetPhp["E" + r]?.v || "").trim();

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
  await topicModel.findByIdAndUpdate(topic2._id, { questionCout: qDocs2.length });
  console.log("PHP & Laravel questions ready:", qDocs2.length);

  const counter2 = await counterModel.findOneAndUpdate(
    { name: "assessment" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const assessment2 = await assessmentModel.create({
    assessmentId: counter2.seq,
    assessmentName: "PHP & Laravel Champion Test",
    assessmentCode: "DCT0252",
    certificateOnly: false,
    totalQuestions: 50,
    timeDuration: 30,
    startDateTime,
    endDateTime,
    generateCertificate: true,
    certificateName: cert._id,
    remark: "PHP & Laravel Champion Test",
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
  console.log("Created Assessment 2: DCT0252 - PHP & Laravel Champion Test");

  // ==========================================
  // 3. C Programming Champion Test
  // ==========================================
  console.log("\n--- Processing C Programming Champion Test ---");
  const topicName3 = "C Programming (50 Questions)";
  let topic3 = await topicModel.findOne({ topicName: topicName3 });
  if (!topic3) {
    topic3 = await topicModel.create({ topicName: topicName3, status: true, questionCout: 50 });
  }

  const wbC = xlsx.readFile(path.resolve("../C_Programming_50_MCQ.xlsx"));
  const sheetC = wbC.Sheets[wbC.SheetNames[0]];
  const qDocs3 = [];

  for (let r = 2; r <= 51; r++) {
    const qNum = r - 1;
    const qText = sheetC["A" + r]?.v ? String(sheetC["A" + r].v).trim() : "";
    const ans = sheetC["F" + r]?.v ? String(sheetC["F" + r].v).trim().toUpperCase() : "";

    let optA = sheetC["B" + r]?.w || sheetC["B" + r]?.v || "";
    let optB = sheetC["C" + r]?.w || sheetC["C" + r]?.v || "";
    let optC = sheetC["D" + r]?.w || sheetC["D" + r]?.v || "";
    let optD = sheetC["E" + r]?.w || sheetC["E" + r]?.v || "";

    if (qNum === 16) { // Row 17
      optA = "=";
      optB = "==";
      optC = "!=";
      optD = ">=";
    } else if (qNum === 22) { // Row 23
      optA = "&&";
      optB = "?:";
      optC = "||";
      optD = "%";
    } else {
      optA = String(optA).trim();
      optB = String(optB).trim();
      optC = String(optC).trim();
      optD = String(optD).trim();
    }

    let q = await questionModel.findOne({ topic: topic3._id, question: qText });
    if (!q) {
      q = await questionModel.create({
        topic: topic3._id,
        course: defaultCourse._id,
        year: defaultYear._id,
        question: qText,
        options: { A: optA, B: optB, C: optC, D: optD },
        correctOption: ans
      });
    }
    qDocs3.push(q._id);
  }
  await topicModel.findByIdAndUpdate(topic3._id, { questionCout: qDocs3.length });
  console.log("C Programming questions ready:", qDocs3.length);

  const counter3 = await counterModel.findOneAndUpdate(
    { name: "assessment" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const assessment3 = await assessmentModel.create({
    assessmentId: counter3.seq,
    assessmentName: "C Programming Champion Test",
    assessmentCode: "DCT0253",
    certificateOnly: false,
    totalQuestions: 50,
    timeDuration: 30,
    startDateTime,
    endDateTime,
    generateCertificate: true,
    certificateName: cert._id,
    remark: "C Programming Champion Test",
    allowedYears: [],
    status: true,
    start: 0,
    submit: 0,
    count: 0
  });

  await assesmentQuestionIdModel.create({
    assesmentId: assessment3._id,
    questionIds: qDocs3,
    courseYearGroups: []
  });
  console.log("Created Assessment 3: DCT0253 - C Programming Champion Test");

  console.log("\n=== ALL 3 TESTS CREATED SUCCESSFULLY ===");
  console.log(`Test 1 (JavaScript):    https://assessment.thedigicoders.com/${assessment1.assessmentCode}`);
  console.log(`Test 2 (PHP & Laravel): https://assessment.thedigicoders.com/${assessment2.assessmentCode}`);
  console.log(`Test 3 (C Programming): https://assessment.thedigicoders.com/${assessment3.assessmentCode}`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error("Error creating assessments:", err);
  mongoose.disconnect();
  process.exit(1);
});

