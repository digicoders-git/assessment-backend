import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
await mongoose.connect(process.env.MONGO_URI);
console.log('DB Connected');

// ── Models ───────────────────────────────────────────────
const assessmentSchema = new mongoose.Schema({
  assessmentId: Number, assessmentName: String, assessmentCode: String,
  certificateOnly: { type: Boolean, default: false },
  totalQuestions: Number, timeDuration: Number,
  startDateTime: Date, endDateTime: Date,
  generateCertificate: { type: Boolean, default: false },
  certificateName: mongoose.Schema.Types.ObjectId,
  remark: String, status: { type: Boolean, default: true },
  start: { type: Number, default: 0 }, submit: { type: Number, default: 0 },
  count: { type: Number, default: 0 },
  allowedYears: [mongoose.Schema.Types.ObjectId]
}, { timestamps: true });
const Assessment = mongoose.model('Assessment', assessmentSchema);

const counterSchema = new mongoose.Schema({ name: String, seq: Number });
const Counter = mongoose.model('Counter', counterSchema);

const aqSchema = new mongoose.Schema({
  assesmentId: mongoose.Schema.Types.ObjectId,
  questionIds: [mongoose.Schema.Types.ObjectId]
});
const AQ = mongoose.model('AssesmentQuestion', aqSchema);

const topicSchema = new mongoose.Schema({ topicName: String });
const Topic = mongoose.model('Topic', topicSchema);

const questionSchema = new mongoose.Schema({
  topic: mongoose.Schema.Types.ObjectId,
  course: mongoose.Schema.Types.ObjectId,
  year: mongoose.Schema.Types.ObjectId,
  question: String,
  options: { A: String, B: String, C: String, D: String },
  correctOption: String
});
const Question = mongoose.model('Question', questionSchema);

const certSchema = new mongoose.Schema({ certificateName: String, status: Boolean });
const Certificate = mongoose.model('Certificate', certSchema);

// ── Check already exists ─────────────────────────────────
const exists = await Assessment.findOne({ assessmentName: 'DigiCoders Talent Hunt 3.O - Scholarship Test' });
if (exists) {
  console.log('❌ Assessment already exists:', exists.assessmentCode);
  process.exit(0);
}

// ── Get same certificate as 2.O ──────────────────────────
const cert = await Certificate.findById('69f59be8e5918c20fff80f7a');
console.log('Certificate:', cert?.certificateName);

// ── Same allowedYears as 2.O ─────────────────────────────
const allowedYears = [
  '6986d8228b1df47cf85c5897', // PASSOUT
  '697c25482149a8cd787c64d1', // 4th Year
  '697c25442149a8cd787c64c8', // 3rd Year
];

// ── Create Assessment ────────────────────────────────────
const counter = await Counter.findOneAndUpdate(
  { name: 'assessment' },
  { $inc: { seq: 1 } },
  { new: true, upsert: true }
);

// Same config as 2.O: 3800 questions, 30 min, certificate enabled
const assessment = await Assessment.create({
  assessmentId: counter.seq,
  assessmentName: 'DigiCoders Talent Hunt 3.O - Scholarship Test',
  assessmentCode: 'DCT3800',
  certificateOnly: false,
  totalQuestions: 3600,
  timeDuration: 30,
  startDateTime: new Date('2026-07-01T06:00:00.000Z'), // adjust as needed
  endDateTime:   new Date('2026-07-01T09:00:00.000Z'), // adjust as needed
  generateCertificate: true,
  certificateName: cert._id,
  remark: 'DigiCoders Talent Hunt 3.O - Scholarship Test',
  status: true,
  allowedYears
});
console.log('✅ Assessment created:', assessment.assessmentName, '| Code:', assessment.assessmentCode);

// ── Same 38 topics as 2.O but with 3.O prefix ───────────
const topicNames = [
  'DigiCoders-TalentHunt3.O-B.tech-CS/IT/PGDCA/BCA/MCA-3rd-Year',
  'DigiCoders-TalentHunt3.O-B.tech-CS/IT/PGDCA/BCA/MCA-4th-Year',
  'DigiCoders-TalentHunt3.O-B.tech-CS/IT/PGDCA/BCA/MCA-Passout-Year',
  'DigiCoders-TalentHunt3.O-B.tech-Civil-3rd-Year',
  'DigiCoders-TalentHunt3.O-B.tech-Civil-4th-Year',
  'DigiCoders-TalentHunt3.O-B.tech-Civil-Passout-Year',
  'DigiCoders-TalentHunt3.O-B.tech-Electrical-3rd-Year',
  'DigiCoders-TalentHunt3.O-B.tech-Electrical-4th-Year',
  'DigiCoders-TalentHunt3.O-B.tech-Electrical-Passout-Year',
  'DigiCoders-TalentHunt3.O-B.tech-Electronics-3rd-Year',
  'DigiCoders-TalentHunt3.O-B.tech-Electronics-4th-Year',
  'DigiCoders-TalentHunt3.O-B.tech-Electronics-Passout-Year',
  'DigiCoders-TalentHunt3.O-B.tech-Mechanical-3rd-Year',
  'DigiCoders-TalentHunt3.O-B.tech-Mechanical-4th-Year',
  'DigiCoders-TalentHunt3.O-B.tech-Mechanical-Passout-Year',
  'DigiCoders-TalentHunt3.O-B.tech-Architecture-3rd-Year',
  'DigiCoders-TalentHunt3.O-B.tech-Architecture-4th-Year',
  'DigiCoders-TalentHunt3.O-B.tech-Architecture-Passout-Year',
  'DigiCoders-TalentHunt3.O-Diploma-CS/IT/PGDCA/BCA/MCA-3rd-Year',
  'DigiCoders-TalentHunt3.O-Diploma-CS/IT/PGDCA/BCA/MCA-Passout-Year',
  'DigiCoders-TalentHunt3.O-Diploma-Civil-3rd-Year',
  'DigiCoders-TalentHunt3.O-Diploma-Civil-Passout-Year',
  'DigiCoders-TalentHunt3.O-Diploma-Electrical-3rd-Year',
  'DigiCoders-TalentHunt3.O-Diploma-Electrical-Passout-Year',
  'DigiCoders-TalentHunt3.O-Diploma-Electronics-3rd-Year',
  'DigiCoders-TalentHunt3.O-Diploma-Electronics-Passout-Year',
  'DigiCoders-TalentHunt3.O-Diploma-Mechanical-3rd-Year',
  'DigiCoders-TalentHunt3.O-Diploma-Mechanical-Passout-Year',
  'DigiCoders-TalentHunt3.O-Diploma-Architecture-3rd-Year',
  'DigiCoders-TalentHunt3.O-Diploma-Architecture-Passout-Year',
  'DigiCoders-TalentHunt3.O-BSC-CS/IT/PGDCA/BCA/MCA-3rd-Year',
  'DigiCoders-TalentHunt3.O-BSC-CS/IT/PGDCA/BCA/MCA-Passout-Year',
  'DigiCoders-TalentHunt3.O-M.tech-CS/IT/PGDCA/BCA/MCA-Passout-Year',
  'DigiCoders-TalentHunt3.O-MCA-CS/IT/PGDCA/BCA/MCA-Passout-Year',
  'DigiCoders-TalentHunt3.O-BCA-CS/IT/PGDCA/BCA/MCA-3rd-Year',
  'DigiCoders-TalentHunt3.O-BCA-CS/IT/PGDCA/BCA/MCA-Passout-Year',
];

// ── Collect all 3800 question IDs (100 per topic) ────────
const allQuestionIds = [];

for (const name of topicNames) {
  const topic = await Topic.findOne({ topicName: name });
  if (!topic) { console.log('❌ Topic not found:', name); continue; }

  const questions = await Question.find({ topic: topic._id }, { _id: 1 }).limit(100).lean();
  if (questions.length < 100) {
    console.log(`⚠️  ${name} has only ${questions.length} questions`);
  }
  allQuestionIds.push(...questions.map(q => q._id));
  console.log(`  ✅ ${questions.length} questions from: ${name}`);
}

console.log('\nTotal question IDs collected:', allQuestionIds.length);

// ── Save to AssesmentQuestion ────────────────────────────
await AQ.create({
  assesmentId: assessment._id,
  questionIds: allQuestionIds
});

console.log('\n══════════════════════════════════════════');
console.log('Assessment  :', assessment.assessmentName);
console.log('Code        :', assessment.assessmentCode);
console.log('Certificate :', cert.certificateName);
console.log('Total Q     :', allQuestionIds.length);
console.log('Topics      :', topicNames.length);
console.log('Duration    : 30 Min');
console.log('Allowed Years: 3rd, 4th, PASSOUT');
console.log('Status      : Active');
console.log('══════════════════════════════════════════');
process.exit(0);
