import mongoose from "mongoose";
import dotenv from "dotenv";
import assessmentModel from "../Models/assesmentModel.js";
import resultModel from "../Models/resultModel.js";
import studentModel from "../Models/studentModel.js";
import assesmentQuestionIdModel from "../Models/assesmentQuestionsModel.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const assessment = await assessmentModel.findOne({ assessmentCode: "DCT2767" }).lean();
  console.log("Assessment:", assessment ? { _id: assessment._id, name: assessment.assessmentName, code: assessment.assessmentCode } : "Not found");

  if (!assessment) {
    await mongoose.disconnect();
    return;
  }

  // Find all results with assessmentCode: 'DCT2767' OR assesmentQuestions belonging to assessment
  const resultsByCode = await resultModel.find({ assessmentCode: "DCT2767" }).populate("student").lean();
  console.log("Total results by assessmentCode DCT2767:", resultsByCode.length);

  const aqDocs = await assesmentQuestionIdModel.find({ assesmentId: assessment._id }, "_id").lean();
  const aqIds = aqDocs.map(d => d._id);
  const resultsByAQ = await resultModel.find({ assesmentQuestions: { $in: aqIds } }).populate("student").lean();
  console.log("Total results by assesmentQuestions:", resultsByAQ.length);

  // Combine unique results
  const allResultsMap = new Map();
  [...resultsByCode, ...resultsByAQ].forEach(r => {
    allResultsMap.set(r._id.toString(), r);
  });
  const allResults = Array.from(allResultsMap.values());
  console.log("Combined total results:", allResults.length);

  const durationToSeconds = (duration) => {
    if (!duration || duration === "N/A") return 999999;
    const parts = String(duration).split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return Number(duration) || 999999;
  };

  const mobileMap = new Map();
  for (const r of allResults) {
    const mobile = r.student?.mobile || r.student?._id?.toString() || r._id.toString();
    if (!mobileMap.has(mobile)) {
      mobileMap.set(mobile, []);
    }
    mobileMap.get(mobile).push(r);
  }

  // Official Ranking rule from resultController: First submission per mobile, sorted by marks desc, duration asc
  const firstSubmissions = [];
  for (const [mobile, list] of mobileMap.entries()) {
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    firstSubmissions.push(list[0]);
  }

  firstSubmissions.sort((a, b) => {
    const marksA = Number(a.marks) || 0;
    const marksB = Number(b.marks) || 0;
    if (marksB !== marksA) {
      return marksB - marksA;
    }
    return durationToSeconds(a.duration) - durationToSeconds(b.duration);
  });

  console.log("\n=== TOP 10 FIRST SUBMISSIONS (Official portal ranking) ===");
  firstSubmissions.slice(0, 10).forEach((r, idx) => {
    console.log(JSON.stringify({
      rank: idx + 1,
      name: r.student?.name,
      mobile: r.student?.mobile,
      college: r.student?.college,
      marks: r.marks,
      total: r.total,
      duration: r.duration,
      submittedAt: r.createdAt
    }));
  });

  // Also Best attempt per student
  const bestSubmissions = [];
  for (const [mobile, list] of mobileMap.entries()) {
    list.sort((a, b) => {
      const marksA = Number(a.marks) || 0;
      const marksB = Number(b.marks) || 0;
      if (marksB !== marksA) return marksB - marksA;
      return durationToSeconds(a.duration) - durationToSeconds(b.duration);
    });
    bestSubmissions.push(list[0]);
  }
  bestSubmissions.sort((a, b) => {
    const marksA = Number(a.marks) || 0;
    const marksB = Number(b.marks) || 0;
    if (marksB !== marksA) return marksB - marksA;
    return durationToSeconds(a.duration) - durationToSeconds(b.duration);
  });

  console.log("\n=== TOP 10 BEST SUBMISSIONS ===");
  bestSubmissions.slice(0, 10).forEach((r, idx) => {
    console.log(JSON.stringify({
      rank: idx + 1,
      name: r.student?.name,
      mobile: r.student?.mobile,
      college: r.student?.college,
      marks: r.marks,
      total: r.total,
      duration: r.duration,
      submittedAt: r.createdAt
    }));
  });

  await mongoose.disconnect();
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});

