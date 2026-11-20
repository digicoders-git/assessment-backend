import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
await mongoose.connect(process.env.MONGO_URI);
console.log('DB Connected');

// ── Models ───────────────────────────────────────────────
const topicSchema = new mongoose.Schema({ topicName: String });
const Topic = mongoose.model('Topic', topicSchema);

const questionSchema = new mongoose.Schema({
  topic: mongoose.Schema.Types.ObjectId,
  course: mongoose.Schema.Types.ObjectId,
  year: mongoose.Schema.Types.ObjectId,
});
const Question = mongoose.model('Question', questionSchema);

const assessmentSchema = new mongoose.Schema({ assessmentName: String }, { strict: false });
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

// ── Get assessment ───────────────────────────────────────
const assessment = await Assessment.findOne({ assessmentName: 'DigiCoders Talent Hunt 3.O - Scholarship Test' });
console.log('Assessment:', assessment.assessmentName);

// ── Topic → course+year mapping ──────────────────────────
// Each entry: topicName, courseId, yearId
const courseSchema2 = new mongoose.Schema({ course: String }, { timestamps: true });
const Course = mongoose.model('Course', courseSchema2);
const yearSchema2 = new mongoose.Schema({ academicYear: String });
const Year = mongoose.model('AcademicYear', yearSchema2);

const courses = await Course.find().lean();
const years = await Year.find().lean();

const getCourse = (name) => courses.find(c => c.course === name)?._id;
const getYear = (name) => years.find(y => y.academicYear === name)?._id;

const Y3 = getYear('3rd Year');
const Y4 = getYear('4th Year');
const YP = getYear('PASSOUT');

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

// topic → { courseId, yearId }
const topicMap = [
  { name: `${PREFIX}-B.tech-CS/IT/PGDCA/BCA/MCA-3rd-Year`,     course: C['B.tech-CS'],           year: Y3 },
  { name: `${PREFIX}-B.tech-CS/IT/PGDCA/BCA/MCA-4th-Year`,     course: C['B.tech-CS'],           year: Y4 },
  { name: `${PREFIX}-B.tech-CS/IT/PGDCA/BCA/MCA-Passout-Year`, course: C['B.tech-CS'],           year: YP },
  { name: `${PREFIX}-B.tech-Civil-3rd-Year`,                    course: C['B.tech-Civil'],        year: Y3 },
  { name: `${PREFIX}-B.tech-Civil-4th-Year`,                    course: C['B.tech-Civil'],        year: Y4 },
  { name: `${PREFIX}-B.tech-Civil-Passout-Year`,                course: C['B.tech-Civil'],        year: YP },
  { name: `${PREFIX}-B.tech-Electrical-3rd-Year`,               course: C['B.tech-Electrical'],   year: Y3 },
  { name: `${PREFIX}-B.tech-Electrical-4th-Year`,               course: C['B.tech-Electrical'],   year: Y4 },
  { name: `${PREFIX}-B.tech-Electrical-Passout-Year`,           course: C['B.tech-Electrical'],   year: YP },
  { name: `${PREFIX}-B.tech-Electronics-3rd-Year`,              course: C['B.tech-Electronics'],  year: Y3 },
  { name: `${PREFIX}-B.tech-Electronics-4th-Year`,              course: C['B.tech-Electronics'],  year: Y4 },
  { name: `${PREFIX}-B.tech-Electronics-Passout-Year`,          course: C['B.tech-Electronics'],  year: YP },
  { name: `${PREFIX}-B.tech-Mechanical-3rd-Year`,               course: C['B.tech-Mechanical'],   year: Y3 },
  { name: `${PREFIX}-B.tech-Mechanical-4th-Year`,               course: C['B.tech-Mechanical'],   year: Y4 },
  { name: `${PREFIX}-B.tech-Mechanical-Passout-Year`,           course: C['B.tech-Mechanical'],   year: YP },
  { name: `${PREFIX}-B.tech-Architecture-3rd-Year`,             course: C['B.tech-Architecture'], year: Y3 },
  { name: `${PREFIX}-B.tech-Architecture-4th-Year`,             course: C['B.tech-Architecture'], year: Y4 },
  { name: `${PREFIX}-B.tech-Architecture-Passout-Year`,         course: C['B.tech-Architecture'], year: YP },
  { name: `${PREFIX}-Diploma-CS/IT/PGDCA/BCA/MCA-3rd-Year`,     course: C['Diploma-CS'],          year: Y3 },
  { name: `${PREFIX}-Diploma-CS/IT/PGDCA/BCA/MCA-Passout-Year`, course: C['Diploma-CS'],          year: YP },
  { name: `${PREFIX}-Diploma-Civil-3rd-Year`,                    course: C['Diploma-Civil'],       year: Y3 },
  { name: `${PREFIX}-Diploma-Civil-Passout-Year`,                course: C['Diploma-Civil'],       year: YP },
  { name: `${PREFIX}-Diploma-Electrical-3rd-Year`,               course: C['Diploma-Electrical'],  year: Y3 },
  { name: `${PREFIX}-Diploma-Electrical-Passout-Year`,           course: C['Diploma-Electrical'],  year: YP },
  { name: `${PREFIX}-Diploma-Electronics-3rd-Year`,              course: C['Diploma-Electronics'], year: Y3 },
  { name: `${PREFIX}-Diploma-Electronics-Passout-Year`,          course: C['Diploma-Electronics'], year: YP },
  { name: `${PREFIX}-Diploma-Mechanical-3rd-Year`,               course: C['Diploma-Mechanical'],  year: Y3 },
  { name: `${PREFIX}-Diploma-Mechanical-Passout-Year`,           course: C['Diploma-Mechanical'],  year: YP },
  { name: `${PREFIX}-Diploma-Architecture-3rd-Year`,             course: C['Diploma-Architecture'],year: Y3 },
  { name: `${PREFIX}-Diploma-Architecture-Passout-Year`,         course: C['Diploma-Architecture'],year: YP },
  { name: `${PREFIX}-BSC-CS/IT/PGDCA/BCA/MCA-3rd-Year`,         course: C['BSC'],                 year: Y3 },
  { name: `${PREFIX}-BSC-CS/IT/PGDCA/BCA/MCA-Passout-Year`,     course: C['BSC'],                 year: YP },
  { name: `${PREFIX}-M.tech-CS/IT/PGDCA/BCA/MCA-Passout-Year`,  course: C['M.tech'],              year: YP },
  { name: `${PREFIX}-MCA-CS/IT/PGDCA/BCA/MCA-Passout-Year`,     course: C['MCA'],                 year: YP },
  { name: `${PREFIX}-BCA-CS/IT/PGDCA/BCA/MCA-3rd-Year`,         course: C['BCA'],                 year: Y3 },
  { name: `${PREFIX}-BCA-CS/IT/PGDCA/BCA/MCA-Passout-Year`,     course: C['BCA'],                 year: YP },
];

// ── Build courseYearGroups ───────────────────────────────
const courseYearGroups = [];
const allQuestionIds = [];

for (const def of topicMap) {
  const topic = await Topic.findOne({ topicName: def.name });
  if (!topic) { console.log('❌ Topic not found:', def.name); continue; }

  const questions = await Question.find({ topic: topic._id }, { _id: 1 }).lean();
  const qIds = questions.map(q => q._id);

  courseYearGroups.push({
    course: def.course,
    year: def.year,
    questionIds: qIds
  });

  allQuestionIds.push(...qIds);
  console.log(`✅ ${qIds.length} q | ${def.name}`);
}

// ── Update AQ doc ────────────────────────────────────────
await AQ.findOneAndUpdate(
  { assesmentId: assessment._id },
  {
    courseYearGroups,
    questionIds: [...new Set(allQuestionIds.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id))
  },
  { new: true }
);

console.log('\n══════════════════════════════════════════');
console.log('courseYearGroups set:', courseYearGroups.length);
console.log('Total flat questionIds:', allQuestionIds.length);
console.log('Fix complete ✅');
console.log('══════════════════════════════════════════');
process.exit(0);
