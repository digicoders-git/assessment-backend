import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const xlsx = require('xlsx');

await mongoose.connect(process.env.MONGO_URI);
console.log('DB Connected');

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

// ── Load Excel Questions ─────────────────────────────────
const loadExcel = (filePath, sheet) => {
  const wb = xlsx.readFile(filePath);
  return xlsx.utils.sheet_to_json(wb.Sheets[sheet]).map(r => ({
    question: String(r.question).trim(),
    options: {
      A: String(r.optionA).trim(),
      B: String(r.optionB).trim(),
      C: String(r.optionC).trim(),
      D: String(r.optionD).trim()
    },
    correctOption: String(r.correctOption).trim().toUpperCase()
  }));
};

const csQuestions    = loadExcel('../questions/CS-Final.xlsx', 'Sheet1');         // 100 questions
const civilQuestions = loadExcel('../questions/Civil_Diploma_50-fina.xlsx', 'Questions'); // 50 questions
const elxQuestions   = loadExcel('../questions/elx-final.xlsx', 'Sheet1');        // 50 questions

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

// ── Year ID map ──────────────────────────────────────────
const Y2  = getYear('2nd Year');
const Y3  = getYear('3rd Year');
const Y4  = getYear('4th Year');
const YP  = getYear('PASSOUT');

// ── Course ID map ────────────────────────────────────────
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

// ── Topic definitions ────────────────────────────────────
// Format: { topicName, courseId, yearId, questions[] }
const PREFIX = 'DigiCoders-TalentHunt3.O';

const topicDefs = [
  // ── B.tech ──────────────────────────────────────────────
  // CS/IT/PGDCA/BCA/MCA
  { name: `${PREFIX}-B.tech-CS/IT/PGDCA/BCA/MCA-3rd-Year`,     course: C['B.tech-CS'],           year: Y3, questions: csQuestions },
  { name: `${PREFIX}-B.tech-CS/IT/PGDCA/BCA/MCA-4th-Year`,     course: C['B.tech-CS'],           year: Y4, questions: csQuestions },
  { name: `${PREFIX}-B.tech-CS/IT/PGDCA/BCA/MCA-Passout-Year`, course: C['B.tech-CS'],           year: YP, questions: csQuestions },
  // Civil
  { name: `${PREFIX}-B.tech-Civil-3rd-Year`,                    course: C['B.tech-Civil'],        year: Y3, questions: civilQuestions },
  { name: `${PREFIX}-B.tech-Civil-4th-Year`,                    course: C['B.tech-Civil'],        year: Y4, questions: civilQuestions },
  { name: `${PREFIX}-B.tech-Civil-Passout-Year`,                course: C['B.tech-Civil'],        year: YP, questions: civilQuestions },
  // Electrical
  { name: `${PREFIX}-B.tech-Electrical-3rd-Year`,               course: C['B.tech-Electrical'],   year: Y3, questions: civilQuestions },
  { name: `${PREFIX}-B.tech-Electrical-4th-Year`,               course: C['B.tech-Electrical'],   year: Y4, questions: civilQuestions },
  { name: `${PREFIX}-B.tech-Electrical-Passout-Year`,           course: C['B.tech-Electrical'],   year: YP, questions: civilQuestions },
  // Electronics
  { name: `${PREFIX}-B.tech-Electronics-3rd-Year`,              course: C['B.tech-Electronics'],  year: Y3, questions: elxQuestions },
  { name: `${PREFIX}-B.tech-Electronics-4th-Year`,              course: C['B.tech-Electronics'],  year: Y4, questions: elxQuestions },
  { name: `${PREFIX}-B.tech-Electronics-Passout-Year`,          course: C['B.tech-Electronics'],  year: YP, questions: elxQuestions },
  // Mechanical
  { name: `${PREFIX}-B.tech-Mechanical-3rd-Year`,               course: C['B.tech-Mechanical'],   year: Y3, questions: civilQuestions },
  { name: `${PREFIX}-B.tech-Mechanical-4th-Year`,               course: C['B.tech-Mechanical'],   year: Y4, questions: civilQuestions },
  { name: `${PREFIX}-B.tech-Mechanical-Passout-Year`,           course: C['B.tech-Mechanical'],   year: YP, questions: civilQuestions },
  // Architecture
  { name: `${PREFIX}-B.tech-Architecture-3rd-Year`,             course: C['B.tech-Architecture'], year: Y3, questions: civilQuestions },
  { name: `${PREFIX}-B.tech-Architecture-4th-Year`,             course: C['B.tech-Architecture'], year: Y4, questions: civilQuestions },
  { name: `${PREFIX}-B.tech-Architecture-Passout-Year`,         course: C['B.tech-Architecture'], year: YP, questions: civilQuestions },

  // ── Diploma ─────────────────────────────────────────────
  { name: `${PREFIX}-Diploma-CS/IT/PGDCA/BCA/MCA-3rd-Year`,     course: C['Diploma-CS'],          year: Y3, questions: csQuestions },
  { name: `${PREFIX}-Diploma-CS/IT/PGDCA/BCA/MCA-Passout-Year`, course: C['Diploma-CS'],          year: YP, questions: csQuestions },
  { name: `${PREFIX}-Diploma-Civil-3rd-Year`,                    course: C['Diploma-Civil'],       year: Y3, questions: civilQuestions },
  { name: `${PREFIX}-Diploma-Civil-Passout-Year`,                course: C['Diploma-Civil'],       year: YP, questions: civilQuestions },
  { name: `${PREFIX}-Diploma-Electrical-3rd-Year`,               course: C['Diploma-Electrical'],  year: Y3, questions: civilQuestions },
  { name: `${PREFIX}-Diploma-Electrical-Passout-Year`,           course: C['Diploma-Electrical'],  year: YP, questions: civilQuestions },
  { name: `${PREFIX}-Diploma-Electronics-3rd-Year`,              course: C['Diploma-Electronics'], year: Y3, questions: elxQuestions },
  { name: `${PREFIX}-Diploma-Electronics-Passout-Year`,          course: C['Diploma-Electronics'], year: YP, questions: elxQuestions },
  { name: `${PREFIX}-Diploma-Mechanical-3rd-Year`,               course: C['Diploma-Mechanical'],  year: Y3, questions: civilQuestions },
  { name: `${PREFIX}-Diploma-Mechanical-Passout-Year`,           course: C['Diploma-Mechanical'],  year: YP, questions: civilQuestions },
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

// ── Seed ────────────────────────────────────────────────
let totalTopics = 0, totalQuestions = 0, skipped = 0;

for (const def of topicDefs) {
  // create topic
  let topic = await Topic.findOne({ topicName: def.name });
  if (!topic) {
    topic = await Topic.create({ topicName: def.name });
    totalTopics++;
    console.log('✅ Topic created:', def.name);
  } else {
    console.log('⚠️  Topic exists:', def.name);
  }

  // insert questions
  for (const q of def.questions) {
    try {
      await Question.create({
        topic: topic._id,
        course: def.course,
        year: def.year,
        question: q.question,
        options: q.options,
        correctOption: q.correctOption
      });
      totalQuestions++;
    } catch (e) {
      if (e.code === 11000) { skipped++; }
      else console.error('Error on question:', q.question.substring(0, 60), e.message);
    }
  }
  console.log(`   Questions inserted: ${def.questions.length - 0} | topic done`);
}

console.log('\n══════════════════════════════');
console.log('Topics created :', totalTopics);
console.log('Questions inserted:', totalQuestions);
console.log('Skipped (duplicate):', skipped);
console.log('══════════════════════════════');
process.exit(0);
