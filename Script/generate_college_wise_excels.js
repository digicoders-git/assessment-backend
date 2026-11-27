import "dotenv/config";
import mongoose from "mongoose";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = "/Users/kiran_maddheshiya/Downloads/assesment/College_Wise_Assessments_Aug_Nov_2026";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function normalizeCollege(rawCol, asmtRemark) {
  let target = (rawCol || "").trim();
  const r = (asmtRemark || "").trim();

  // If student wrote "OTHER" or empty, inspect assessment remark
  if (!target || target.toUpperCase() === "OTHER") {
    if (r) {
      const lowerR = r.toLowerCase();
      // Ignore generic online test remarks
      const isOnlineTest = lowerR.includes("champion test") ||
        lowerR.includes("talent hunt") ||
        lowerR.includes("mastery") ||
        lowerR.includes("pay after placement") ||
        lowerR.includes("class test") ||
        lowerR.includes("trial") ||
        lowerR.includes("test assesment") ||
        lowerR.includes("delete") ||
        lowerR.includes("assessment");
      if (!isOnlineTest) {
        target = r;
      }
    }
  }

  if (!target || target.toUpperCase() === "OTHER") {
    return "Other Colleges & Open Tests";
  }

  const lower = target.toLowerCase();

  // Common Aliases & Variant Merging
  if (lower.includes("fgiet") || lower.includes("feroz") || lower.includes("feroze gandhi")) return "FGIET Raebareli";
  if (lower.includes("mviet")) return "MVIET Kaushambi";
  if (lower.includes("prayag institute")) return "Prayag Institute of Technology And Management, Prayagraj";
  if (lower.includes("government girls polytechnic gorakhpur") || lower.includes("ggp gkp") || lower.includes("ggp gorakhpur")) return "Government Girls Polytechnic Gorakhpur";
  if (lower.includes("buddha polytechnic")) return "Buddha Polytechnic College GIDA Gorakhpur";
  if (lower.includes("buddha institute of technology")) return "Buddha Institute of Technology GIDA Gorakhpur";
  if (lower.includes("kipm")) return "KIPM College Gorakhpur";
  if (lower.includes("maharishi")) return "Maharishi University Lucknow";
  if (lower.includes("jagran college")) return "Jagran College of Arts Science & Commerce Kanpur";
  if (lower.includes("brahmanand")) return "Brahmanand Degree College Kanpur";
  if (lower.includes("islamia")) return "Islamia College of Commerce Lucknow";
  if (lower.includes("s n sen") || lower.includes("sn sen")) return "S N Sen PG College Kanpur";
  if (lower.includes("banshi")) return "Banshi Group of Institutions Kanpur";
  if (lower.includes("jhun jhun wala")) return "Jhun Jhun Wala PG College Ayodhya";
  if (lower.includes("bhavdiya")) return "Bhavdiya Group of College Ayodhya";
  if (lower.includes("ganga devi kapil dev")) return "Ganga Devi Kapil Dev Tiwari Mahavidyalaya";
  if (lower.includes("apollo")) return "Apollo Institute of Technology Kanpur";
  if (lower.includes("bbau") || lower.includes("babasaheb bhimrao ambedkar")) return "Babasaheb Bhimrao Ambedkar University (BBAU)";
  if (lower.includes("halim muslim")) return "Halim Muslim PG College Kanpur";
  if (lower.includes("dav college")) return "DAV College Kanpur";
  if (lower.includes("prabhat engineering")) return "Prabhat Engineering College Kanpur";
  if (lower.includes("fiemits")) return "FIeMITS BCA Industrial Visit";
  if (lower.includes("girls polytechnic lucknow") || lower.includes("ggp lko")) return "Govt Girls Polytechnic Lucknow";
  if (lower.includes("polytechnic jaunpur")) return "Govt Polytechnic Jaunpur";
  if (lower.includes("polytechnic ghaziabad")) return "Govt Polytechnic Ghaziabad";
  if (lower.includes("mmit maharajganj")) return "MMIT Maharajganj";
  if (lower.includes("jlnp") || lower.includes("mahmodabad")) return "JLNP Mahmodabad Sitapur";
  if (lower.includes("charkhari") || lower.includes("mahoba")) return "Govt Girls Polytechnic Charkhari Mahoba";
  if (lower.includes("csjm ambedkar nagar")) return "CSJM Govt Polytechnic Ambedkar Nagar";
  if (lower.includes("bncet")) return "BNCET Lucknow";
  if (lower.includes("government polytechnic lucknow") || lower.includes("gp lucknow")) return "Government Polytechnic Lucknow";
  if (lower.includes("khwaja moinuddin") || lower.includes("language university")) return "Khwaja Moinuddin Chisti Language University Lucknow";
  if (lower.includes("polytechnic meja")) return "Government Girls Polytechnic Meja Prayagraj";
  if (lower.includes("rajgarh") || lower.includes("mirzapur")) return "Govt Polytechnic Rajgarh Mirzapur";
  if (lower.includes("raj school of management")) return "Raj School of Management and Sciences Varanasi";
  if (lower.includes("rampur")) return "Govt Polytechnic Rampur";
  if (lower.includes("hewett")) return "Hewett Polytechnic Lucknow";
  if (lower.includes("changipur") || lower.includes("bijnor") && lower.includes("changipur")) return "Govt Polytechnic Changipur Bijnor";
  if (lower.includes("mmit") && lower.includes("siddharth")) return "MMIT Siddharth Nagar";
  if (lower.includes("aurai")) return "Govt Polytechnic Aurai Bhadohi";
  if (lower.includes("shravasti")) return "Mahamaya Polytechnic of IT Shravasti";
  if (lower.includes("bachhraon") || lower.includes("amroha")) return "Mahamaya Polytechnic of IT Bachhraon Amroha";
  if (lower.includes("rajarshi rananjay")) return "Rajarshi Rananjay Sinh Institute Amethi";
  if (lower.includes("sikandara")) return "Govt Polytechnic Sikandara Kanpur Dehat";
  if (lower.includes("polytechnic  mau") || lower.includes("polytechnic mau")) return "Govt Polytechnic Mau";
  if (lower.includes("talbehat") || lower.includes("lalitpur")) return "Govt Polytechnic Talbehat Lalitpur";
  if (lower.includes("ambekeshwar")) return "Ambekeshwar Group of Institutions Lucknow";
  if (lower.includes("goel institute")) return "Goel Institute Lucknow";
  if (lower.includes("hariharpur")) return "MMIT Hariharpur Gorakhpur";
  if (lower.includes("bara prayagraj")) return "Government Polytechnic Bara Prayagraj";
  if (lower.includes("handia")) return "Handia Polytechnic Handia Prayagraj";
  if (lower.includes("saltanat bahadur")) return "Saltanat Bahadur PG College Badlapur Jaunpur";
  if (lower.includes("maharana pratap")) return "Maharana Pratap Institute of Technology";
  if (lower.includes("bkt lucknow")) return "Govt Polytechnic BKT Lucknow";
  if (lower.includes("tilhar") || lower.includes("shahjahanpur")) return "Govt Girls Polytechnic Tilhar Shahjahanpur";
  if (lower.includes("dn polytechnic")) return "DN Polytechnic Meerut";
  if (lower.includes("bighapur") || lower.includes("unnao") && lower.includes("bighapur")) return "Govt Polytechnic Bighapur Unnao";
  if (lower.includes("kushinagar")) return "MMIT Kushinagar";
  if (lower.includes("srgi jhansi")) return "SRGI Jhansi";
  if (lower.includes("daurala")) return "CMS Govt Girls Polytechnic Daurala Meerut";
  if (lower.includes("polytechnic gonda")) return "Govt Polytechnic Gonda";
  if (lower.includes("b n collage") || lower.includes("bn college")) return "BN College Lucknow";
  if (lower.includes("polytechnic saharanpur") && !lower.includes("girls")) return "Govt Polytechnic Saharanpur";
  if (lower.includes("rbs polytechnic")) return "RBS Polytechnic Agra";
  if (lower.includes("ggp jhansi")) return "Govt Girls Polytechnic Jhansi";
  if (lower.includes("shamshabad")) return "Govt Polytechnic Shamshabad Agra";
  if (lower.includes("prasad polytechnic")) return "Prasad Polytechnic Jaunpur";
  if (lower.includes("mg polytechnic") || lower.includes("hathras")) return "MG Polytechnic Hathras";
  if (lower.includes("gcrg")) return "GCRG Group of Institutions Lucknow";
  if (lower.includes("polytechnic kanpur") && !lower.includes("sikandara")) return "Government Polytechnic Kanpur";
  if (lower.includes("svn polytechnic")) return "SVN Polytechnic Sultanpur";
  if (lower.includes("polytechnic bijnor") && !lower.includes("changipur")) return "Government Polytechnic Bijnor";
  if (lower.includes("swami sahajanand")) return "Swami Sahajanand Polytechnic Azamgarh";
  if (lower.includes("ggp amethi") || lower.includes("girls polytechnic amethi")) return "Govt Girls Polytechnic Amethi";
  if (lower.includes("lovely professional")) return "Lovely Professional University";
  if (lower.includes("polytechnic unnao") && !lower.includes("bighapur")) return "Govt Polytechnic Unnao";
  if (lower.includes("karma devi")) return "Karma Devi Group of Institutions Basti";
  if (lower.includes("srmu")) return "Shri Ramswaroop Memorial University (SRMU) Lucknow";
  if (lower.includes("bilsi") || lower.includes("budaun")) return "Govt Polytechnic Bilsi Budaun";
  if (lower.includes("poly ayodhya")) return "Govt Girls Polytechnic Ayodhya";
  if (lower.includes("mohammadi") || lower.includes("kheri")) return "Government Polytechnic Mohammadi Kheri";
  if (lower.includes("santkabir") || lower.includes("sant kabir")) return "MMIT Sant Kabir Nagar";
  if (lower.includes("jyotiba phule") || lower.includes("mjpgp")) return "Mahatma Jyotiba Phule Govt Polytechnic Kaushambi";
  if (lower.includes("girls polytechnic saharanpur")) return "Govt Girls Polytechnic Saharanpur";
  if (lower.includes("ballia")) return "Govt Girls Polytechnic Ballia";
  if (lower.includes("buxar")) return "Government Polytechnic Buxar";
  if (lower.includes("polytechnic mahoba") && !lower.includes("charkhari")) return "Govt Polytechnic Mahoba";
  if (lower.includes("apcs college")) return "APCS College of IT & Management";

  return target.replace(/\s+/g, " ").trim();
}

function sanitizeFileName(name) {
  return name.replace(/[*?:/\\\[\]]/g, "_").replace(/\s+/g, "_").replace(/_+/g, "_");
}

function getSafeSheetName(name, usedSet) {
  let clean = name.replace(/[*?:/\\\[\]]/g, "_").replace(/\s+/g, "_").substring(0, 31);
  if (!clean) clean = "Sheet";
  let candidate = clean;
  let counter = 1;
  while (usedSet.has(candidate.toLowerCase())) {
    const suffix = `_${counter}`;
    candidate = clean.substring(0, 31 - suffix.length) + suffix;
    counter++;
  }
  usedSet.add(candidate.toLowerCase());
  return candidate;
}

const HEADER_FILL_NAVY = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
const HEADER_FILL_TEAL = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F766E" } };
const HEADER_FILL_INDIGO = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
const HEADER_FONT = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
const CENTER_ALIGN = { vertical: "middle", horizontal: "center" };
const LEFT_ALIGN = { vertical: "middle", horizontal: "left" };

async function main() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  console.log("✅ MongoDB Connected");

  const aug1_2026 = new Date("2026-08-01T00:00:00.000Z");

  // 1. Fetch Assessments created/started >= Aug 1, 2026
  const asmts = await db.collection("assessments").find({
    $or: [{ createdAt: { $gte: aug1_2026 } }, { startDateTime: { $gte: aug1_2026 } }]
  }).sort({ createdAt: -1 }).toArray();

  const asmtMap = new Map();
  const augCodes = [];
  asmts.forEach(a => {
    const code = a.assessmentCode || a.assesmentCode;
    if (code) {
      asmtMap.set(code, a);
      augCodes.push(code);
    }
  });

  console.log(`Found ${asmts.length} assessments created/active since 1 Aug 2026`);

  // 2. Fetch all students for these assessments OR registered >= Aug 1, 2026
  const students = await db.collection("students").find({
    $or: [
      { code: { $in: augCodes } },
      { createdAt: { $gte: aug1_2026 } }
    ]
  }).sort({ createdAt: -1 }).toArray();

  console.log(`Found ${students.length} students in the period`);

  // 3. Fetch all test results for these students
  const studentIds = students.map(s => s._id);
  const results = await db.collection("results").find({
    student: { $in: studentIds }
  }).toArray();

  const resultMap = new Map();
  results.forEach(r => {
    const key1 = `${String(r.student)}_${r.assessmentCode || ""}`;
    const key2 = `${String(r.student)}_`;
    resultMap.set(key1, r);
    resultMap.set(key2, r);
  });
  console.log(`Fetched ${results.length} test completion records`);

  // 4. Group Students into College Buckets
  const collegeBuckets = new Map(); // collegeName -> array of student records with enriched data

  students.forEach(st => {
    const asmt = asmtMap.get(st.code) || {};
    const colName = normalizeCollege(st.college, asmt.remark);

    const resItem = resultMap.get(`${String(st._id)}_${st.code}`) || resultMap.get(`${String(st._id)}_`);
    const hasCompleted = !!resItem;

    const enriched = {
      _id: st._id,
      name: st.name || "",
      mobile: st.mobile || "",
      email: st.email || "",
      originalCollege: st.college || "",
      normalizedCollege: colName,
      course: st.course || "",
      year: st.year || "",
      code: st.code || "",
      asmtName: asmt.assessmentName || asmt.name || "Assessment",
      asmtRemark: asmt.remark || "",
      marks: hasCompleted ? (resItem.marks ?? "-") : "Not Attempted",
      total: hasCompleted ? (resItem.total ?? "-") : "-",
      correct: hasCompleted ? (resItem.correct ?? "-") : "-",
      incorrect: hasCompleted ? (resItem.incorrect ?? "-") : "-",
      testStatus: hasCompleted ? "Completed" : "Registered",
      dateStr: st.createdAt ? new Date(st.createdAt).toLocaleString("en-IN") : ""
    };

    if (!collegeBuckets.has(colName)) {
      collegeBuckets.set(colName, []);
    }
    collegeBuckets.get(colName).push(enriched);
  });

  // Sort college buckets by student count descending (keeping "Other Colleges" at the end)
  const sortedColleges = Array.from(collegeBuckets.entries()).sort((a, b) => {
    if (a[0] === "Other Colleges & Open Tests") return 1;
    if (b[0] === "Other Colleges & Open Tests") return -1;
    return b[1].length - a[1].length;
  });

  console.log(`\nGenerated ${sortedColleges.length} College Buckets.`);

  // 5. MASTER SUMMARY WORKBOOK
  const masterWorkbook = new ExcelJS.Workbook();
  masterWorkbook.creator = "DigiCoders Assessment Portal";
  masterWorkbook.created = new Date();

  const summarySheet = masterWorkbook.addWorksheet("00_Colleges_Summary");
  summarySheet.views = [{ state: "frozen", ySplit: 1 }];
  summarySheet.columns = [
    { header: "S.No", key: "sno", width: 8 },
    { header: "College / Institution Name", key: "college", width: 45 },
    { header: "Total Students", key: "total", width: 16 },
    { header: "Tests Completed", key: "completed", width: 18 },
    { header: "Assessments Conducted", key: "asmts", width: 40 },
    { header: "Excel File Name", key: "fileName", width: 45 }
  ];

  summarySheet.getRow(1).height = 28;
  summarySheet.getRow(1).eachCell(cell => {
    cell.fill = HEADER_FILL_TEAL;
    cell.font = HEADER_FONT;
    cell.alignment = CENTER_ALIGN;
  });

  const consolidatedSheet = masterWorkbook.addWorksheet("All_Students_Consolidated");
  consolidatedSheet.views = [{ state: "frozen", ySplit: 1 }];
  consolidatedSheet.columns = [
    { header: "S.No", key: "sno", width: 8 },
    { header: "College Name", key: "college", width: 38 },
    { header: "Student Name", key: "name", width: 26 },
    { header: "Mobile", key: "mobile", width: 16 },
    { header: "Email", key: "email", width: 28 },
    { header: "Course", key: "course", width: 16 },
    { header: "Year", key: "year", width: 12 },
    { header: "Assessment Code", key: "code", width: 18 },
    { header: "Assessment Name", key: "asmtName", width: 30 },
    { header: "Marks", key: "marks", width: 12 },
    { header: "Total Marks", key: "total", width: 12 },
    { header: "Correct", key: "correct", width: 12 },
    { header: "Incorrect", key: "incorrect", width: 12 },
    { header: "Test Status", key: "testStatus", width: 16 },
    { header: "Registration Date", key: "dateStr", width: 20 }
  ];

  consolidatedSheet.getRow(1).height = 28;
  consolidatedSheet.getRow(1).eachCell(cell => {
    cell.fill = HEADER_FILL_INDIGO;
    cell.font = HEADER_FONT;
    cell.alignment = CENTER_ALIGN;
  });

  let consolidatedIdx = 1;
  const manifest = [];

  // 6. Generate Individual Excel Workbooks for Each College
  for (let i = 0; i < sortedColleges.length; i++) {
    const [colName, stList] = sortedColleges[i];
    const rankPrefix = String(i + 1).padStart(2, "0");
    const safeBaseName = sanitizeFileName(colName);
    const fileName = `${rankPrefix}_${safeBaseName}.xlsx`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    const completedCount = stList.filter(s => s.testStatus === "Completed").length;
    const uniqueAsmts = Array.from(new Set(stList.map(s => `${s.code} (${s.asmtName})`))).join(", ");

    // Add to Master Summary
    summarySheet.addRow({
      sno: i + 1,
      college: colName,
      total: stList.length,
      completed: completedCount,
      asmts: uniqueAsmts,
      fileName: fileName
    });

    // Create Individual College Workbook
    const colWorkbook = new ExcelJS.Workbook();
    colWorkbook.creator = "DigiCoders Assessment Portal";
    colWorkbook.created = new Date();

    const usedSheetNames = new Set();

    // Sheet 1: Master All Students for this College
    const mainSheet = colWorkbook.addWorksheet(getSafeSheetName("All_Students", usedSheetNames));
    mainSheet.views = [{ state: "frozen", ySplit: 1 }];
    mainSheet.columns = [
      { header: "S.No", key: "sno", width: 8 },
      { header: "Student Name", key: "name", width: 26 },
      { header: "Mobile", key: "mobile", width: 16 },
      { header: "Email", key: "email", width: 28 },
      { header: "College", key: "college", width: 35 },
      { header: "Course", key: "course", width: 16 },
      { header: "Year", key: "year", width: 12 },
      { header: "Assessment Code", key: "code", width: 18 },
      { header: "Assessment Name", key: "asmtName", width: 30 },
      { header: "Marks", key: "marks", width: 12 },
      { header: "Total Marks", key: "total", width: 12 },
      { header: "Correct", key: "correct", width: 12 },
      { header: "Incorrect", key: "incorrect", width: 12 },
      { header: "Result Status", key: "testStatus", width: 16 },
      { header: "Registered Date", key: "dateStr", width: 20 }
    ];

    mainSheet.getRow(1).height = 26;
    mainSheet.getRow(1).eachCell(cell => {
      cell.fill = HEADER_FILL_NAVY;
      cell.font = HEADER_FONT;
      cell.alignment = CENTER_ALIGN;
    });

    stList.forEach((st, sIdx) => {
      mainSheet.addRow({
        sno: sIdx + 1,
        name: st.name,
        mobile: st.mobile,
        email: st.email,
        college: st.originalCollege || colName,
        course: st.course,
        year: st.year,
        code: st.code,
        asmtName: st.asmtName,
        marks: st.marks,
        total: st.total,
        correct: st.correct,
        incorrect: st.incorrect,
        testStatus: st.testStatus,
        dateStr: st.dateStr
      });

      // Also add to consolidated master sheet
      consolidatedSheet.addRow({
        sno: consolidatedIdx++,
        college: colName,
        name: st.name,
        mobile: st.mobile,
        email: st.email,
        course: st.course,
        year: st.year,
        code: st.code,
        asmtName: st.asmtName,
        marks: st.marks,
        total: st.total,
        correct: st.correct,
        incorrect: st.incorrect,
        testStatus: st.testStatus,
        dateStr: st.dateStr
      });
    });

    // If there are multiple assessments in this college, also add separate tabs for each assessment
    const asmtGroups = new Map();
    stList.forEach(st => {
      if (!asmtGroups.has(st.code)) asmtGroups.set(st.code, []);
      asmtGroups.get(st.code).push(st);
    });

    if (asmtGroups.size > 1) {
      asmtGroups.forEach((subList, code) => {
        const asmtTitle = subList[0]?.asmtName || code;
        const tabName = getSafeSheetName(`${code}_${asmtTitle}`, usedSheetNames);
        const subSheet = colWorkbook.addWorksheet(tabName);
        subSheet.views = [{ state: "frozen", ySplit: 1 }];
        subSheet.columns = [
          { header: "S.No", key: "sno", width: 8 },
          { header: "Student Name", key: "name", width: 26 },
          { header: "Mobile", key: "mobile", width: 16 },
          { header: "Email", key: "email", width: 28 },
          { header: "Course", key: "course", width: 16 },
          { header: "Year", key: "year", width: 12 },
          { header: "Assessment Code", key: "code", width: 18 },
          { header: "Marks", key: "marks", width: 12 },
          { header: "Total", key: "total", width: 12 },
          { header: "Correct", key: "correct", width: 12 },
          { header: "Incorrect", key: "incorrect", width: 12 },
          { header: "Status", key: "testStatus", width: 16 },
          { header: "Registered Date", key: "dateStr", width: 20 }
        ];

        subSheet.getRow(1).height = 26;
        subSheet.getRow(1).eachCell(cell => {
          cell.fill = HEADER_FILL_TEAL;
          cell.font = HEADER_FONT;
          cell.alignment = CENTER_ALIGN;
        });

        subList.forEach((st, idx) => {
          subSheet.addRow({
            sno: idx + 1,
            name: st.name,
            mobile: st.mobile,
            email: st.email,
            course: st.course,
            year: st.year,
            code: st.code,
            marks: st.marks,
            total: st.total,
            correct: st.correct,
            incorrect: st.incorrect,
            testStatus: st.testStatus,
            dateStr: st.dateStr
          });
        });
      });
    }

    await colWorkbook.xlsx.writeFile(filePath);

    manifest.push({
      college: colName,
      totalStudents: stList.length,
      completedTests: completedCount,
      fileName: fileName
    });
  }

  // Save Master Summary File
  const masterPath = path.join(OUTPUT_DIR, "00_MASTER_COLLEGE_SUMMARY_AUG_TO_NOV_2026.xlsx");
  await masterWorkbook.xlsx.writeFile(masterPath);

  console.log(`\n🎉 SUCCESS! All college files saved to: ${OUTPUT_DIR}`);
  console.log(`Generated ${sortedColleges.length} college excel files + 1 Master Summary workbook.`);
  console.log(`Total students processed: ${consolidatedIdx - 1}`);

  process.exit(0);
}

main().catch(err => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
