/**
 * Clone DCT3800 → PAP
 * - Same assessment details, new code "PAP"
 * - Same courseYearGroups but question order shuffled per group
 * - Same flat questionIds also shuffled
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import assessmentModel from "../Models/assesmentModel.js";
import assesmentQuestionIdModel from "../Models/assesmentQuestionsModel.js";
import counterModel from "../Models/counterModel.js";

dotenv.config();

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

async function clone() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const SOURCE_CODE = "DCT3800";
  const NEW_CODE = "PAP";

  // 1. Find source assessment
  const src = await assessmentModel.findOne({ assessmentCode: SOURCE_CODE });
  if (!src) throw new Error(`Assessment ${SOURCE_CODE} not found`);
  console.log("✅ Source assessment found:", src.assessmentName);

  // 2. Check if PAP already exists
  const existing = await assessmentModel.findOne({ assessmentCode: NEW_CODE });
  if (existing) {
    console.log("⚠️  Assessment PAP already exists, skipping creation. ID:", existing._id);
    // Still proceed to check/fix questions
    await cloneQuestions(src._id, existing._id);
    await mongoose.disconnect();
    return;
  }

  // 3. Create new assessment with code PAP
  const counter = await counterModel.findOneAndUpdate(
    { name: "assessment" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const newAssessment = await assessmentModel.create({
    assessmentId: counter.seq,
    assessmentName: src.assessmentName,
    assessmentCode: NEW_CODE,
    certificateOnly: src.certificateOnly,
    totalQuestions: src.totalQuestions,
    timeDuration: src.timeDuration,
    startDateTime: src.startDateTime,
    endDateTime: src.endDateTime,
    generateCertificate: src.generateCertificate,
    certificateName: src.certificateName,
    remark: src.remark,
    allowedYears: src.allowedYears,
    status: src.status,
  });

  console.log("✅ New assessment PAP created. ID:", newAssessment._id);

  await cloneQuestions(src._id, newAssessment._id);
  await mongoose.disconnect();
  console.log("✅ Done! Assessment PAP is ready.");
}

async function cloneQuestions(srcAssessmentId, newAssessmentId) {
  // Find source question doc
  const srcDoc = await assesmentQuestionIdModel.findOne({ assesmentId: srcAssessmentId });
  if (!srcDoc) throw new Error("Source question doc not found");

  console.log(`✅ Source question doc found. Flat questions: ${srcDoc.questionIds.length}, Groups: ${srcDoc.courseYearGroups.length}`);

  // Check if PAP question doc already exists
  const existingDoc = await assesmentQuestionIdModel.findOne({ assesmentId: newAssessmentId });
  if (existingDoc) {
    console.log("⚠️  Question doc for PAP already exists, deleting and recreating...");
    await assesmentQuestionIdModel.deleteOne({ assesmentId: newAssessmentId });
  }

  // Shuffle flat questionIds
  const shuffledFlat = shuffle(srcDoc.questionIds.map(q => q.toString()));

  // Shuffle each courseYearGroup's questionIds independently
  const shuffledGroups = srcDoc.courseYearGroups.map(g => ({
    course: g.course,
    year: g.year,
    questionIds: shuffle(g.questionIds.map(q => q.toString()))
  }));

  await assesmentQuestionIdModel.create({
    assesmentId: newAssessmentId,
    questionIds: shuffledFlat,
    courseYearGroups: shuffledGroups,
  });

  console.log(`✅ Questions cloned with shuffled order.`);
  console.log(`   Flat questions: ${shuffledFlat.length}`);
  console.log(`   Groups: ${shuffledGroups.length}`);
  shuffledGroups.forEach(g => {
    console.log(`   Group course:${g.course} year:${g.year} → ${g.questionIds.length} questions`);
  });
}

clone().catch(err => {
  console.error("❌ Error:", err.message);
  mongoose.disconnect();
  process.exit(1);
});
