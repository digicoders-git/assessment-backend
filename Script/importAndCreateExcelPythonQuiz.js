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

async function importAndCreateExcelPythonQuiz() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Certificate template: Training Quiz Certificate - 1 ("same certificate ke sath")
  const targetCertId = "6a2cf0da392c9ac737d14b34";
  const cert = await certificateModel.findById(targetCertId);
  if (!cert) throw new Error("Certificate template not found: " + targetCertId);
  console.log("Using Certificate Template:", cert.certificateName, cert._id);

  // Default course & year for question references
  const defaultCourse = await courseModel.findOne({ course: /BCA/i }) || await courseModel.findOne();
  const defaultYear = await academicYearModel.findOne({ academicYear: /1st Year/i }) || await academicYearModel.findOne();
  console.log("Using default course:", defaultCourse.course, "year:", defaultYear.academicYear);

  // 1. Topic: Excel & Python (50 Questions)
  const topicName = "Excel & Python (50 Questions)";
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

  // Parse file: Excel_and_Python_50_MCQs.xlsx
  const filePath = path.resolve("../Excel_and_Python_50_MCQs.xlsx");
  const wb = xlsx.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];

  const qDocs = [];
  for (let r = 2; r <= 51; r++) {
    const qNum = r - 1;
    const qText = sheet["A" + r]?.v ? String(sheet["A" + r].v).trim() : "";
    const ans = sheet["F" + r]?.v ? String(sheet["F" + r].v).trim().toUpperCase() : "";

    let optA = sheet["B" + r]?.w || sheet["B" + r]?.v || "";
    let optB = sheet["C" + r]?.w || sheet["C" + r]?.v || "";
    let optC = sheet["D" + r]?.w || sheet["D" + r]?.v || "";
    let optD = sheet["E" + r]?.w || sheet["E" + r]?.v || "";

    if (qNum === 1) {
      optA = "=ADD(A1:A10)";
      optB = "=SUM(A1:A10)";
      optC = "=TOTAL(A1:A10)";
      optD = "=SUMA(A1:A10)";
    } else if (qNum === 5) {
      optA = "=IF(logical_test, [value_if_true], [value_if_false])";
      optB = "=IF(condition, false_result, true_result)";
      optC = "=IF(range, criteria)";
      optD = "=IF(test, action)";
    } else if (qNum === 8) {
      optA = '=IF(AND(A1>10, A1<50), "Yes", "No")';
      optB = '=IF(AND(A1>=10, A1<=50), "Yes", "No")';
      optC = '=IF(A1>=10 AND A1<=50, "Yes", "No")';
      optD = '=IF(OR(A1>=10, A1<=50), "Yes", "No")';
    } else if (qNum === 15) {
      optA = "=INDEX(C:C, MATCH(F2, A:A, 0))";
      optB = "=MATCH(C:C, INDEX(F2, A:A, 0))";
      optC = "=INDEX(A:A, MATCH(F2, C:C, 0))";
      optD = "=LOOKUP(F2, A:A, C:C)";
    } else {
      optA = String(optA).trim();
      optB = String(optB).trim();
      optC = String(optC).trim();
      optD = String(optD).trim();
    }

    let q = await questionModel.findOne({ topic: topic._id, question: qText });
    if (!q) {
      q = await questionModel.create({
        topic: topic._id,
        course: defaultCourse._id,
        year: defaultYear._id,
        question: qText,
        options: { A: optA, B: optB, C: optC, D: optD },
        correctOption: ans
      });
    }
    qDocs.push(q._id);
  }

  console.log("Topic questions imported/ready:", qDocs.length);
  await topicModel.findByIdAndUpdate(topic._id, { questionCout: qDocs.length });

  // Generate unique code
  let code = "DCT3172";
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
  const startDateTime = new Date(now.getTime() - 4 * 60 * 60 * 1000); // 4 hours ago
  const endDateTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days active

  const newAssessment = await assessmentModel.create({
    assessmentId: counter.seq,
    assessmentName: "Excel & Python",
    assessmentCode: code,
    certificateOnly: false,
    totalQuestions: 50,
    timeDuration: 30,
    startDateTime,
    endDateTime,
    generateCertificate: true,
    certificateName: cert._id,
    remark: "Excel & Python Assessment",
    allowedYears: [],
    status: true,
    start: 0,
    submit: 0,
    count: 0
  });

  await assesmentQuestionIdModel.create({
    assesmentId: newAssessment._id,
    questionIds: qDocs,
    courseYearGroups: []
  });

  console.log("\n=== ASSESSMENT CREATED SUCCESSFULLY ===");
  console.log({
    _id: newAssessment._id,
    assessmentId: newAssessment.assessmentId,
    assessmentName: newAssessment.assessmentName,
    assessmentCode: newAssessment.assessmentCode,
    totalQuestions: newAssessment.totalQuestions,
    timeDuration: newAssessment.timeDuration,
    generateCertificate: newAssessment.generateCertificate,
    certificateName: cert.certificateName,
    certificateId: cert._id.toString(),
    status: newAssessment.status,
    questionsAssigned: qDocs.length
  });

  console.log("\nTest Link: https://assessment.thedigicoders.com/" + newAssessment.assessmentCode);

  await mongoose.disconnect();
}

importAndCreateExcelPythonQuiz().catch(err => {
  console.error("Error creating Excel & Python assessment:", err);
  mongoose.disconnect();
  process.exit(1);
});

