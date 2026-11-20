import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const xlsx = require('xlsx');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

await mongoose.connect(process.env.MONGO_URI);
console.log('✅ MongoDB Connected');

// ── Models ──────────────────────────────────────────────
const topicSchema = new mongoose.Schema({ topicName: String, status: { type: Boolean, default: true }, questionCout: { type: Number, default: 0 } });
const Topic = mongoose.model('Topic', topicSchema);

const courseSchema = new mongoose.Schema({ course: String }, { timestamps: true });
const Course = mongoose.model('Course', courseSchema);

const yearSchema = new mongoose.Schema({ academicYear: String });
const Year = mongoose.model('AcademicYear', yearSchema);

const questionSchema = new mongoose.Schema({
  topic: mongoose.Schema.Types.ObjectId,
  course: mongoose.Schema.Types.ObjectId,
  year: mongoose.Schema.Types.ObjectId,
  question: String,
  options: { A: String, B: String, C: String, D: String },
  correctOption: String
});
questionSchema.index({ topic: 1, course: 1, year: 1, question: 1 }, { unique: true });
const Question = mongoose.model('Question', questionSchema);

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

const aqSchema = new mongoose.Schema({
  assesmentId: mongoose.Schema.Types.ObjectId,
  questionIds: [mongoose.Schema.Types.ObjectId],
  courseYearGroups: [{
    course: mongoose.Schema.Types.ObjectId,
    year: mongoose.Schema.Types.ObjectId,
    questionIds: [mongoose.Schema.Types.ObjectId],
    _id: false
  }]
}, { timestamps: true });
const AQ = mongoose.model('AssesmentQuestion', aqSchema);

// ── Load Excel Questions ─────────────────────────────────
const questionsBaseDir = path.resolve(__dirname, '../../questions');

const loadExcel = (fileName, sheetName) => {
  const filePath = path.join(questionsBaseDir, fileName);
  const wb = xlsx.readFile(filePath);
  const sheet = sheetName || wb.SheetNames[0];
  return xlsx.utils.sheet_to_json(wb.Sheets[sheet]).map(r => ({
    question: String(r.question).trim(),
    options: {
      A: String(r.optionA || r.A || '').trim(),
      B: String(r.optionB || r.B || '').trim(),
      C: String(r.optionC || r.C || '').trim(),
      D: String(r.optionD || r.D || '').trim()
    },
    correctOption: String(r.correctOption || r.ans || '').trim().toUpperCase()
  }));
};

const csQuestions   = loadExcel('CS-Final.xlsx', 'Sheet1');
const civilQuestions= loadExcel('Civil_Diploma_50-fina.xlsx', 'Questions');
const elecQuestions = loadExcel('Electrical_Final_50.xlsx', 'Sheet1');
const mechQuestions = loadExcel('Mechanical_Final_50.xlsx', 'Sheet1');
const elxQuestions  = loadExcel('elx-final.xlsx', 'Sheet1');

console.log('Loaded Questions:');
console.log(`- CS/IT: ${csQuestions.length}`);
console.log(`- Civil/Arch: ${civilQuestions.length}`);
console.log(`- Electrical: ${elecQuestions.length}`);
console.log(`- Mechanical: ${mechQuestions.length}`);
console.log(`- Electronics: ${elxQuestions.length}`);

// ── Fetch Courses & Years ────────────────────────────────
const courses = await Course.find().lean();
const years   = await Year.find().lean();

const getCourse = (name) => {
  const c = courses.find(c => c.course === name);
  if (!c) throw new Error('Course not found: ' + name);
  return c._id;
};
const getYear = (name) => {
  const y = years.find(y => y.academicYear === name);
  if (!y) throw new Error('Year not found: ' + name);
  return y._id;
};

const Y2  = getYear('2nd Year');
const Y3  = getYear('3rd Year');
const Y4  = getYear('4th Year');
const YP  = getYear('PASSOUT');

const C = {
  'B.tech-CS':           getCourse('B. Tech in CS/IT'),
  'B.tech-Civil':        getCourse('B. Tech in Civil'),
  'B.tech-Electrical':   getCourse('B. Tech in Electrical'),
  'B.tech-Electronics':  getCourse('B. Tech in Electronics'),
  'B.tech-Mechanical':   getCourse('B. Tech in Mechanical'),
  'B.tech-Architecture': getCourse('B. Tech in Architecture'),
  'Diploma-CS':          getCourse('Diploma in CS/IT/PGDCA'),
  'Diploma-Civil':       getCourse('Diploma in Civil'),
  'Diploma-Electrical':  getCourse('Diploma in Electrical'),
  'Diploma-Electronics': getCourse('Diploma in Electronics'),
  'Diploma-Mechanical':  getCourse('Diploma in Mechanical'),
  'Diploma-Architecture':getCourse('Diploma in Architecture'),
  'BCA':                 getCourse('BCA'),
  'BSC':                 getCourse('BSC - IT/CS'),
  'M.tech':              getCourse('M. Tech'),
  'MCA':                 getCourse('MCA'),
};

const PREFIX = 'DigiCoders-TalentHunt3.O';

const topicDefs = [
  // ── B.tech ──────────────────────────────────────────────
  { name: `${PREFIX}-B.tech-CS/IT/PGDCA/BCA/MCA-3rd-Year`,     course: C['B.tech-CS'],           year: Y3, questions: csQuestions },
  { name: `${PREFIX}-B.tech-CS/IT/PGDCA/BCA/MCA-4th-Year`,     course: C['B.tech-CS'],           year: Y4, questions: csQuestions },
  { name: `${PREFIX}-B.tech-CS/IT/PGDCA/BCA/MCA-Passout-Year`, course: C['B.tech-CS'],           year: YP, questions: csQuestions },

  { name: `${PREFIX}-B.tech-Civil-3rd-Year`,                    course: C['B.tech-Civil'],        year: Y3, questions: civilQuestions },
  { name: `${PREFIX}-B.tech-Civil-4th-Year`,                    course: C['B.tech-Civil'],        year: Y4, questions: civilQuestions },
  { name: `${PREFIX}-B.tech-Civil-Passout-Year`,                course: C['B.tech-Civil'],        year: YP, questions: civilQuestions },

  { name: `${PREFIX}-B.tech-Electrical-3rd-Year`,               course: C['B.tech-Electrical'],   year: Y3, questions: elecQuestions },
  { name: `${PREFIX}-B.tech-Electrical-4th-Year`,               course: C['B.tech-Electrical'],   year: Y4, questions: elecQuestions },
  { name: `${PREFIX}-B.tech-Electrical-Passout-Year`,           course: C['B.tech-Electrical'],   year: YP, questions: elecQuestions },

  { name: `${PREFIX}-B.tech-Electronics-3rd-Year`,              course: C['B.tech-Electronics'],  year: Y3, questions: elxQuestions },
  { name: `${PREFIX}-B.tech-Electronics-4th-Year`,              course: C['B.tech-Electronics'],  year: Y4, questions: elxQuestions },
  { name: `${PREFIX}-B.tech-Electronics-Passout-Year`,          course: C['B.tech-Electronics'],  year: YP, questions: elxQuestions },

  { name: `${PREFIX}-B.tech-Mechanical-3rd-Year`,               course: C['B.tech-Mechanical'],   year: Y3, questions: mechQuestions },
  { name: `${PREFIX}-B.tech-Mechanical-4th-Year`,               course: C['B.tech-Mechanical'],   year: Y4, questions: mechQuestions },
  { name: `${PREFIX}-B.tech-Mechanical-Passout-Year`,           course: C['B.tech-Mechanical'],   year: YP, questions: mechQuestions },

  { name: `${PREFIX}-B.tech-Architecture-3rd-Year`,             course: C['B.tech-Architecture'], year: Y3, questions: civilQuestions },
  { name: `${PREFIX}-B.tech-Architecture-4th-Year`,             course: C['B.tech-Architecture'], year: Y4, questions: civilQuestions },
  { name: `${PREFIX}-B.tech-Architecture-Passout-Year`,         course: C['B.tech-Architecture'], year: YP, questions: civilQuestions },

  // ── Diploma ─────────────────────────────────────────────
  { name: `${PREFIX}-Diploma-CS/IT/PGDCA/BCA/MCA-3rd-Year`,     course: C['Diploma-CS'],          year: Y3, questions: csQuestions },
  { name: `${PREFIX}-Diploma-CS/IT/PGDCA/BCA/MCA-Passout-Year`, course: C['Diploma-CS'],          year: YP, questions: csQuestions },

  { name: `${PREFIX}-Diploma-Civil-3rd-Year`,                    course: C['Diploma-Civil'],       year: Y3, questions: civilQuestions },
  { name: `${PREFIX}-Diploma-Civil-Passout-Year`,                course: C['Diploma-Civil'],       year: YP, questions: civilQuestions },

  { name: `${PREFIX}-Diploma-Electrical-3rd-Year`,               course: C['Diploma-Electrical'],  year: Y3, questions: elecQuestions },
  { name: `${PREFIX}-Diploma-Electrical-Passout-Year`,           course: C['Diploma-Electrical'],  year: YP, questions: elecQuestions },

  { name: `${PREFIX}-Diploma-Electronics-3rd-Year`,              course: C['Diploma-Electronics'], year: Y3, questions: elxQuestions },
  { name: `${PREFIX}-Diploma-Electronics-Passout-Year`,          course: C['Diploma-Electronics'], year: YP, questions: elxQuestions },

  { name: `${PREFIX}-Diploma-Mechanical-3rd-Year`,               course: C['Diploma-Mechanical'],  year: Y3, questions: mechQuestions },
  { name: `${PREFIX}-Diploma-Mechanical-Passout-Year`,           course: C['Diploma-Mechanical'],  year: YP, questions: mechQuestions },

  { name: `${PREFIX}-Diploma-Architecture-3rd-Year`,             course: C['Diploma-Architecture'],year: Y3, questions: civilQuestions },
  { name: `${PREFIX}-Diploma-Architecture-Passout-Year`,         course: C['Diploma-Architecture'],year: YP, questions: civilQuestions },

  // ── BCA ─────────────────────────────────────────────────
  { name: `${PREFIX}-BCA-Second-Year`,                           course: C['BCA'],                 year: Y2, questions: csQuestions },
  { name: `${PREFIX}-BCA-Third-Year`,                            course: C['BCA'],                 year: Y3, questions: csQuestions },
  { name: `${PREFIX}-BCA-CS/IT/PGDCA/BCA/MCA-3rd-Year`,         course: C['BCA'],                 year: Y3, questions: csQuestions },
  { name: `${PREFIX}-BCA-CS/IT/PGDCA/BCA/MCA-Passout-Year`,     course: C['BCA'],                 year: YP, questions: csQuestions },

  // ── BSC ─────────────────────────────────────────────────
  { name: `${PREFIX}-Bsc-it-Second-Year`,                        course: C['BSC'],                 year: Y2, questions: csQuestions },
  { name: `${PREFIX}-Bsc-it-Third-Year`,                         course: C['BSC'],                 year: Y3, questions: csQuestions },
  { name: `${PREFIX}-BSC-CS/IT/PGDCA/BCA/MCA-3rd-Year`,         course: C['BSC'],                 year: Y3, questions: csQuestions },
  { name: `${PREFIX}-BSC-CS/IT/PGDCA/BCA/MCA-Passout-Year`,     course: C['BSC'],                 year: YP, questions: csQuestions },

  // ── M.tech ──────────────────────────────────────────────
  { name: `${PREFIX}-M.tech-CS/IT/PGDCA/BCA/MCA-2nd-Year`,      course: C['M.tech'],              year: Y2, questions: csQuestions },
  { name: `${PREFIX}-M.tech-CS/IT/PGDCA/BCA/MCA-Passout-Year`,  course: C['M.tech'],              year: YP, questions: csQuestions },

  // ── MCA ─────────────────────────────────────────────────
  { name: `${PREFIX}-MCA-CS/IT/PGDCA/BCA/MCA-2nd-Year`,         course: C['MCA'],                 year: Y2, questions: csQuestions },
  { name: `${PREFIX}-MCA-CS/IT/PGDCA/BCA/MCA-Passout-Year`,     course: C['MCA'],                 year: YP, questions: csQuestions },
];

console.log(`\nDeleting old questions for ${PREFIX} topics...`);
const allTopicNames = topicDefs.map(t => t.name);
const existingTopics = await Topic.find({ topicName: { $in: allTopicNames } });
const topicIds = existingTopics.map(t => t._id);

const delResult = await Question.deleteMany({ topic: { $in: topicIds } });
console.log(`Deleted ${delResult.deletedCount} old questions.`);

// ── Re-Insert Questions ──────────────────────────────────
console.log('\nInserting new questions...');
const courseYearGroups = [];
const allQuestionIds = [];
let totalInserted = 0;

for (const def of topicDefs) {
  let topic = await Topic.findOne({ topicName: def.name });
  if (!topic) {
    topic = await Topic.create({ topicName: def.name, status: true });
    console.log('✅ Created Topic:', def.name);
  }

  const questionPayload = def.questions.map(q => ({
    topic: topic._id,
    course: def.course,
    year: def.year,
    question: q.question,
    options: q.options,
    correctOption: q.correctOption
  }));

  const insertedDocs = await Question.insertMany(questionPayload, { ordered: false });
  const qIds = insertedDocs.map(d => d._id);
  totalInserted += qIds.length;

  courseYearGroups.push({
    course: def.course,
    year: def.year,
    questionIds: qIds
  });

  allQuestionIds.push(...qIds);
  console.log(`✅ Inserted ${qIds.length} questions for: ${def.name}`);
}

// ── Update Assessment & AQ for DCT3800 ───────────────────
const assessment = await Assessment.findOne({
  $or: [
    { assessmentCode: 'DCT3800' },
    { assessmentName: 'DigiCoders Talent Hunt 3.O - Scholarship Test' }
  ]
});

if (!assessment) {
  console.error('❌ Assessment DCT3800 not found!');
  process.exit(1);
}

const uniqueFlatIds = [...new Set(allQuestionIds.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));

await AQ.findOneAndUpdate(
  { assesmentId: assessment._id },
  {
    courseYearGroups,
    questionIds: uniqueFlatIds
  },
  { upsert: true, new: true }
);

// Update Assessment totalQuestions count if appropriate
await Assessment.findByIdAndUpdate(assessment._id, {
  totalQuestions: uniqueFlatIds.length
});

console.log('\n════════════════════════════════════════════════════════');
console.log('🎉 RESEED COMPLETED SUCCESSFULLY!');
console.log('Assessment Name     :', assessment.assessmentName);
console.log('Assessment Code     :', assessment.assessmentCode);
console.log('Total Topics        :', topicDefs.length);
console.log('Total Questions New :', totalInserted);
console.log('Unique Flat Q-IDs   :', uniqueFlatIds.length);
console.log('Course-Year Groups  :', courseYearGroups.length);
console.log('════════════════════════════════════════════════════════');

process.exit(0);
