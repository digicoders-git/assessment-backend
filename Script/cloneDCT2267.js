import mongoose from "mongoose";
import dotenv from "dotenv";
import assessmentModel from "../Models/assesmentModel.js";
import assesmentQuestionIdModel from "../Models/assesmentQuestionsModel.js";
import counterModel from "../Models/counterModel.js";

dotenv.config();

async function cloneAssessment() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const SOURCE_CODE = "DCT2267";
  const NEW_CODE = "DCT2767";

  // 1. Fetch source assessment
  const src = await assessmentModel.findOne({ assessmentCode: SOURCE_CODE });
  if (!src) throw new Error(`Source assessment ${SOURCE_CODE} not found`);
  console.log("Source assessment found:", src.assessmentName, "Code:", src.assessmentCode);

  // 2. Fetch source questions
  const srcQDoc = await assesmentQuestionIdModel.findOne({ assesmentId: src._id });
  if (!srcQDoc) throw new Error(`Questions for ${SOURCE_CODE} not found`);
  console.log(`Source questions found: ${srcQDoc.questionIds.length} questions`);

  // 3. Check if new assessment code already exists
  let newAssessment = await assessmentModel.findOne({ assessmentCode: NEW_CODE });
  if (newAssessment) {
    console.log(`Assessment with code ${NEW_CODE} already exists! ID:`, newAssessment._id);
  } else {
    // Increment counter
    const counter = await counterModel.findOneAndUpdate(
      { name: "assessment" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Current time setup
    // Start from today morning (e.g., 07:30 AM IST)
    const now = new Date();
    const startDateTime = new Date(now.getTime() - 4 * 60 * 60 * 1000); // 4 hours before now
    // Active until tomorrow end / end of month so it does not auto-expire
    const endDateTime = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours validity

    newAssessment = await assessmentModel.create({
      assessmentId: counter.seq,
      assessmentName: src.assessmentName,
      assessmentCode: NEW_CODE,
      certificateOnly: src.certificateOnly,
      totalQuestions: src.totalQuestions,
      timeDuration: src.timeDuration, // 10 minutes
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      generateCertificate: src.generateCertificate,
      certificateName: src.certificateName,
      remark: src.remark,
      allowedYears: src.allowedYears || [],
      status: true,
      start: 0,
      submit: 0,
      count: 0
    });

    console.log(`Created new assessment ${NEW_CODE} with ID:`, newAssessment._id);
  }

  // 4. Create or update question mapping
  let qDoc = await assesmentQuestionIdModel.findOne({ assesmentId: newAssessment._id });
  if (qDoc) {
    console.log("Question document already exists for new assessment, updating...");
    qDoc.questionIds = srcQDoc.questionIds;
    qDoc.courseYearGroups = srcQDoc.courseYearGroups || [];
    await qDoc.save();
  } else {
    qDoc = await assesmentQuestionIdModel.create({
      assesmentId: newAssessment._id,
      questionIds: srcQDoc.questionIds,
      courseYearGroups: srcQDoc.courseYearGroups || []
    });
    console.log("Created question mapping doc for new assessment:", qDoc._id);
  }

  console.log("Verification:");
  console.log({
    _id: newAssessment._id,
    assessmentCode: newAssessment.assessmentCode,
    assessmentName: newAssessment.assessmentName,
    timeDuration: newAssessment.timeDuration,
    totalQuestions: newAssessment.totalQuestions,
    status: newAssessment.status,
    startDateTime: newAssessment.startDateTime,
    endDateTime: newAssessment.endDateTime,
    assignedQuestionsCount: qDoc.questionIds.length
  });

  await mongoose.disconnect();
  console.log("Completed successfully!");
}

cloneAssessment().catch(err => {
  console.error("Error during cloning:", err);
  mongoose.disconnect();
  process.exit(1);
});
