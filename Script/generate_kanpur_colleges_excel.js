import "dotenv/config";
import mongoose from "mongoose";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = "/Users/kiran_maddheshiya/Downloads/assesment/Kanpur_Colleges_Workshop_Data";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Target Kanpur Colleges Configuration
const KANPUR_COLLEGES = [
  {
    key: "brahmanand",
    order: 1,
    sheetName: "Brahmanand_Degree_College",
    collegeDisplayName: "Brahmanand Degree College, Kanpur",
    fileName: "01_Brahmanand_Degree_College_Kanpur.xlsx",
    primaryCode: "DCT2267",
    workshopDate: "22 October 2026",
    topic: "Generative AI Workshop & Assessment",
    matchFn: (s) => s.code === "DCT2267" || (s.college && /brahmanand/i.test(s.college))
  },
  {
    key: "dav",
    order: 2,
    sheetName: "DAV_College",
    collegeDisplayName: "DAV College, Kanpur",
    fileName: "02_DAV_College_Kanpur.xlsx",
    primaryCode: "DCT2306",
    workshopDate: "23 October 2026",
    topic: "Generative AI Workshop & Assessment",
    matchFn: (s) => s.code === "DCT2306" || (s.college && /dav college/i.test(s.college))
  },
  {
    key: "jagran",
    order: 3,
    sheetName: "Jagran_College",
    collegeDisplayName: "Jagran College of Arts, Science & Commerce, Kanpur",
    fileName: "03_Jagran_College_Arts_Science_Commerce_Kanpur.xlsx",
    primaryCode: "DCT2812",
    workshopDate: "28 September 2026",
    topic: "Generative AI Workshop & Assessment",
    matchFn: (s) => s.code === "DCT2812" || (s.college && /jagran/i.test(s.college))
  },
  {
    key: "prabhat",
    order: 4,
    sheetName: "Prabhat_Eng_College",
    collegeDisplayName: "Prabhat Engineering College, Kanpur",
    fileName: "04_Prabhat_Engineering_College_Kanpur.xlsx",
    primaryCode: "DCT1583",
    workshopDate: "15 September 2026",
    topic: "Python - AI/ML Workshop & Assessment",
    matchFn: (s) => s.code === "DCT1583" || (s.college && /prabhat/i.test(s.college))
  },
  {
    key: "apollo",
    order: 5,
    sheetName: "Apollo_Institute_Tech",
    collegeDisplayName: "Apollo Institute of Technology, Kanpur",
    fileName: "05_Apollo_Institute_of_Technology_Kanpur.xlsx",
    primaryCode: "DCT2972",
    workshopDate: "29 September 2026",
    topic: "Generative AI Workshop & Assessment",
    matchFn: (s) => s.code === "DCT2972" || (s.college && /apollo/i.test(s.college))
  },
  {
    key: "banshi",
    order: 6,
    sheetName: "Banshi_Group_Institutions",
    collegeDisplayName: "Banshi Group of Institutions, Kanpur",
    fileName: "06_Banshi_Group_of_Institutions_Kanpur.xlsx",
    primaryCode: "DCT0550",
    workshopDate: "05 October 2026",
    topic: "Generative AI Workshop & Assessment",
    matchFn: (s) => s.code === "DCT0550" || (s.college && /banshi/i.test(s.college))
  },
  {
    key: "sn_sen",
    order: 7,
    sheetName: "SN_Sen_PG_College",
    collegeDisplayName: "S N Sen PG College, Kanpur",
    fileName: "07_SN_Sen_PG_College_Kanpur.xlsx",
    primaryCode: "DCT1550",
    workshopDate: "15 October 2026",
    topic: "Generative AI Workshop & Assessment",
    matchFn: (s) => s.code === "DCT1550" || (s.college && /s n sen|sn sen|sn college/i.test(s.college))
  }
];

// Excel Color Schemes
const HEADER_FILL_TEAL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF0D9488" }
};

const HEADER_FILL_INDIGO = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF4338CA" }
};

const HEADER_FILL_NAVY = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1E3A8A" }
};

const HEADER_FONT = {
  name: "Segoe UI",
  size: 11,
  bold: true,
  color: { argb: "FFFFFFFF" }
};

const DATA_FONT = {
  name: "Segoe UI",
  size: 10
};

const THIN_BORDER = {
  top: { style: "thin", color: { argb: "FFE2E8F0" } },
  left: { style: "thin", color: { argb: "FFE2E8F0" } },
  bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
  right: { style: "thin", color: { argb: "FFE2E8F0" } }
};

const CENTER_ALIGN = { vertical: "middle", horizontal: "center" };
const LEFT_ALIGN = { vertical: "middle", horizontal: "left" };

function formatKolkataDate(dateVal) {
  if (!dateVal) return "-";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch (e) {
    return String(dateVal);
  }
}

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  console.log("Loading all Assessments & Results...");
  const allAssessments = await db.collection("assessments").find().toArray();
  const asmtMap = new Map();
  allAssessments.forEach(a => asmtMap.set(a.assessmentCode, a));

  // Load all students and results
  const allStudents = await db.collection("students").find().sort({ createdAt: 1 }).toArray();
  const allResults = await db.collection("results").find().toArray();

  const resultMap = new Map();
  allResults.forEach(r => {
    const sId = r.student ? r.student.toString() : "";
    if (sId) resultMap.set(sId, r);
  });

  console.log(`Total students in DB: ${allStudents.length}`);
  console.log(`Total results in DB: ${allResults.length}`);

  // Process data for each Kanpur college
  const collegeDataMap = new Map();
  const seenStudentIds = new Set();

  for (const cfg of KANPUR_COLLEGES) {
    const matchedStudents = [];

    for (const stu of allStudents) {
      if (cfg.matchFn(stu)) {
        const sId = stu._id.toString();
        seenStudentIds.add(sId);

        const resDoc = resultMap.get(sId);
        const asmt = asmtMap.get(stu.code);

        const isCompleted = Boolean(resDoc);
        const marks = isCompleted ? resDoc.marks : null;
        const total = isCompleted ? resDoc.total : (asmt ? asmt.totalQuestions : 0);
        const correct = isCompleted ? resDoc.correct : null;
        const incorrect = isCompleted ? resDoc.incorrect : null;
        const rank = isCompleted ? (resDoc.rank || "-") : "-";

        matchedStudents.push({
          _id: sId,
          name: (stu.name || "").trim(),
          mobile: stu.mobile || "-",
          email: stu.email || "-",
          college: cfg.collegeDisplayName,
          rawCollege: stu.college || "-",
          course: stu.course || "-",
          year: stu.year || "-",
          code: stu.code || cfg.primaryCode,
          asmtName: asmt ? asmt.assessmentName : cfg.topic,
          testStatus: isCompleted ? "Completed / Submitted" : "Registered Only",
          marks: marks !== null ? marks : "-",
          totalMarks: total || "-",
          correct: correct !== null ? correct : "-",
          incorrect: incorrect !== null ? incorrect : "-",
          percentage: (isCompleted && total > 0 && marks !== null) ? `${((marks / total) * 100).toFixed(1)}%` : "-",
          rank: rank,
          registeredAt: formatKolkataDate(stu.createdAt),
          rawCreatedAt: stu.createdAt
        });
      }
    }

    // Sort students: Completed first by Marks (desc), then Registered
    matchedStudents.sort((a, b) => {
      if (a.testStatus.startsWith("Completed") && !b.testStatus.startsWith("Completed")) return -1;
      if (!a.testStatus.startsWith("Completed") && b.testStatus.startsWith("Completed")) return 1;
      if (typeof a.marks === "number" && typeof b.marks === "number") {
        return b.marks - a.marks;
      }
      return new Date(a.rawCreatedAt || 0) - new Date(b.rawCreatedAt || 0);
    });

    collegeDataMap.set(cfg.key, {
      config: cfg,
      students: matchedStudents
    });

    console.log(`[${cfg.collegeDisplayName}] Total: ${matchedStudents.length} (Completed: ${matchedStudents.filter(s => s.testStatus.startsWith("Completed")).length})`);
  }

  // ==========================================
  // 1. GENERATE CONSOLIDATED MASTER WORKBOOK
  // ==========================================
  console.log("\nGenerating Master Workbook: Kanpur_All_Colleges_Workshop_Master_Export.xlsx ...");
  const masterWorkbook = new ExcelJS.Workbook();
  masterWorkbook.creator = "DigiCoders Technologies";
  masterWorkbook.lastModifiedBy = "DigiCoders";
  masterWorkbook.created = new Date();
  masterWorkbook.modified = new Date();

  // SHEET 1: Master Summary
  const summarySheet = masterWorkbook.addWorksheet("00_Master_Summary");
  summarySheet.views = [{ state: "frozen", ySplit: 1 }];
  summarySheet.columns = [
    { header: "S.No", key: "sno", width: 8 },
    { header: "College / Institution Name", key: "college", width: 45 },
    { header: "Workshop Date", key: "date", width: 20 },
    { header: "Workshop Topic / Subject", key: "topic", width: 35 },
    { header: "Assessment Code", key: "code", width: 18 },
    { header: "Total Registered", key: "total", width: 16 },
    { header: "Tests Completed", key: "completed", width: 16 },
    { header: "Attendance / Completion %", key: "percent", width: 24 },
    { header: "Highest Score", key: "highScore", width: 16 },
    { header: "Average Score", key: "avgScore", width: 16 }
  ];

  summarySheet.getRow(1).height = 30;
  summarySheet.getRow(1).eachCell(cell => {
    cell.fill = HEADER_FILL_TEAL;
    cell.font = HEADER_FONT;
    cell.alignment = CENTER_ALIGN;
  });

  let grandTotalStudents = 0;
  let grandTotalCompleted = 0;

  KANPUR_COLLEGES.forEach((cfg, idx) => {
    const data = collegeDataMap.get(cfg.key);
    const stList = data.students;
    const completedList = stList.filter(s => s.testStatus.startsWith("Completed") && typeof s.marks === "number");

    grandTotalStudents += stList.length;
    grandTotalCompleted += completedList.length;

    const completionRate = stList.length > 0 ? `${((completedList.length / stList.length) * 100).toFixed(1)}%` : "0.0%";
    const marksArr = completedList.map(s => s.marks);
    const highScore = marksArr.length > 0 ? Math.max(...marksArr) : "-";
    const avgScore = marksArr.length > 0 ? (marksArr.reduce((a, b) => a + b, 0) / marksArr.length).toFixed(1) : "-";

    const row = summarySheet.addRow({
      sno: idx + 1,
      college: cfg.collegeDisplayName,
      date: cfg.workshopDate,
      topic: cfg.topic,
      code: cfg.primaryCode,
      total: stList.length,
      completed: completedList.length,
      percent: completionRate,
      highScore: highScore,
      avgScore: avgScore
    });

    row.height = 22;
    row.eachCell((cell, colNum) => {
      cell.font = DATA_FONT;
      cell.border = THIN_BORDER;
      if (colNum === 2 || colNum === 4) cell.alignment = LEFT_ALIGN;
      else cell.alignment = CENTER_ALIGN;
    });
  });

  // Summary Total Row
  const totalRow = summarySheet.addRow({
    sno: "TOTAL",
    college: "All 7 Kanpur Colleges Combined",
    date: "Sep - Oct 2026",
    topic: "Generative AI & Python Workshops",
    code: "7 Assessments",
    total: grandTotalStudents,
    completed: grandTotalCompleted,
    percent: `${((grandTotalCompleted / grandTotalStudents) * 100).toFixed(1)}%`,
    highScore: "-",
    avgScore: "-"
  });
  totalRow.height = 26;
  totalRow.eachCell(cell => {
    cell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FF0D9488" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0FDFA" } };
    cell.border = THIN_BORDER;
    cell.alignment = CENTER_ALIGN;
  });

  // SHEET 2: All Kanpur Students Consolidated
  const consolidatedSheet = masterWorkbook.addWorksheet("All_Kanpur_Students");
  consolidatedSheet.views = [{ state: "frozen", ySplit: 1 }];
  consolidatedSheet.columns = [
    { header: "S.No", key: "sno", width: 8 },
    { header: "College Name", key: "college", width: 42 },
    { header: "Student Name", key: "name", width: 28 },
    { header: "Mobile Number", key: "mobile", width: 16 },
    { header: "Email Address", key: "email", width: 30 },
    { header: "Course", key: "course", width: 20 },
    { header: "Year", key: "year", width: 12 },
    { header: "Assessment Code", key: "code", width: 18 },
    { header: "Workshop / Test Name", key: "asmtName", width: 32 },
    { header: "Marks", key: "marks", width: 12 },
    { header: "Total", key: "totalMarks", width: 12 },
    { header: "Percentage", key: "percentage", width: 14 },
    { header: "Rank", key: "rank", width: 12 },
    { header: "Test Status", key: "testStatus", width: 22 },
    { header: "Registration Date & Time", key: "registeredAt", width: 24 }
  ];

  consolidatedSheet.getRow(1).height = 30;
  consolidatedSheet.getRow(1).eachCell(cell => {
    cell.fill = HEADER_FILL_INDIGO;
    cell.font = HEADER_FONT;
    cell.alignment = CENTER_ALIGN;
  });

  let globalSno = 1;
  KANPUR_COLLEGES.forEach(cfg => {
    const data = collegeDataMap.get(cfg.key);
    data.students.forEach(st => {
      const row = consolidatedSheet.addRow({
        sno: globalSno++,
        college: st.college,
        name: st.name,
        mobile: st.mobile,
        email: st.email,
        course: st.course,
        year: st.year,
        code: st.code,
        asmtName: st.asmtName,
        marks: st.marks,
        totalMarks: st.totalMarks,
        percentage: st.percentage,
        rank: st.rank,
        testStatus: st.testStatus,
        registeredAt: st.registeredAt
      });

      row.height = 20;
      row.eachCell((cell, colNum) => {
        cell.font = DATA_FONT;
        cell.border = THIN_BORDER;
        if (colNum === 2 || colNum === 3 || colNum === 5 || colNum === 9) {
          cell.alignment = LEFT_ALIGN;
        } else {
          cell.alignment = CENTER_ALIGN;
        }

        // Color coding for test status
        if (colNum === 14) {
          if (st.testStatus.startsWith("Completed")) {
            cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF15803D" } };
          } else {
            cell.font = { name: "Segoe UI", size: 10, color: { argb: "FFB45309" } };
          }
        }
      });
    });
  });

  // SHEETS 3 to 9: Individual College Sheets in Master Workbook
  KANPUR_COLLEGES.forEach(cfg => {
    const data = collegeDataMap.get(cfg.key);
    const colSheet = masterWorkbook.addWorksheet(cfg.sheetName);
    colSheet.views = [{ state: "frozen", ySplit: 1 }];
    colSheet.columns = [
      { header: "S.No", key: "sno", width: 8 },
      { header: "Student Name", key: "name", width: 28 },
      { header: "Mobile Number", key: "mobile", width: 16 },
      { header: "Email Address", key: "email", width: 30 },
      { header: "Course", key: "course", width: 20 },
      { header: "Year", key: "year", width: 12 },
      { header: "Assessment Code", key: "code", width: 18 },
      { header: "Workshop / Test Topic", key: "asmtName", width: 32 },
      { header: "Marks", key: "marks", width: 12 },
      { header: "Total", key: "totalMarks", width: 12 },
      { header: "Correct", key: "correct", width: 12 },
      { header: "Incorrect", key: "incorrect", width: 12 },
      { header: "Percentage", key: "percentage", width: 14 },
      { header: "Rank", key: "rank", width: 12 },
      { header: "Status", key: "testStatus", width: 22 },
      { header: "Registered Date", key: "registeredAt", width: 24 }
    ];

    colSheet.getRow(1).height = 28;
    colSheet.getRow(1).eachCell(cell => {
      cell.fill = HEADER_FILL_NAVY;
      cell.font = HEADER_FONT;
      cell.alignment = CENTER_ALIGN;
    });

    data.students.forEach((st, idx) => {
      const row = colSheet.addRow({
        sno: idx + 1,
        name: st.name,
        mobile: st.mobile,
        email: st.email,
        course: st.course,
        year: st.year,
        code: st.code,
        asmtName: st.asmtName,
        marks: st.marks,
        totalMarks: st.totalMarks,
        correct: st.correct,
        incorrect: st.incorrect,
        percentage: st.percentage,
        rank: st.rank,
        testStatus: st.testStatus,
        registeredAt: st.registeredAt
      });

      row.height = 20;
      row.eachCell((cell, colNum) => {
        cell.font = DATA_FONT;
        cell.border = THIN_BORDER;
        if (colNum === 2 || colNum === 4 || colNum === 8) {
          cell.alignment = LEFT_ALIGN;
        } else {
          cell.alignment = CENTER_ALIGN;
        }

        if (colNum === 15) {
          if (st.testStatus.startsWith("Completed")) {
            cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF15803D" } };
          } else {
            cell.font = { name: "Segoe UI", size: 10, color: { argb: "FFB45309" } };
          }
        }
      });
    });
  });

  const masterFilePath = path.join(OUTPUT_DIR, "Kanpur_All_Colleges_Workshop_Master_Export.xlsx");
  await masterWorkbook.xlsx.writeFile(masterFilePath);
  console.log(`Saved Master Workbook -> ${masterFilePath}`);

  // ==========================================
  // 2. GENERATE INDIVIDUAL COLLEGE EXCEL FILES
  // ==========================================
  console.log("\nGenerating Individual College Excel Files...");
  for (const cfg of KANPUR_COLLEGES) {
    const data = collegeDataMap.get(cfg.key);
    const wb = new ExcelJS.Workbook();
    wb.creator = "DigiCoders Technologies";
    wb.created = new Date();

    const sheet = wb.addWorksheet(cfg.sheetName);
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.columns = [
      { header: "S.No", key: "sno", width: 8 },
      { header: "Student Name", key: "name", width: 28 },
      { header: "Mobile Number", key: "mobile", width: 16 },
      { header: "Email Address", key: "email", width: 30 },
      { header: "College", key: "college", width: 42 },
      { header: "Course", key: "course", width: 20 },
      { header: "Year", key: "year", width: 12 },
      { header: "Assessment Code", key: "code", width: 18 },
      { header: "Workshop / Test", key: "asmtName", width: 32 },
      { header: "Marks", key: "marks", width: 12 },
      { header: "Total", key: "totalMarks", width: 12 },
      { header: "Correct", key: "correct", width: 12 },
      { header: "Incorrect", key: "incorrect", width: 12 },
      { header: "Percentage", key: "percentage", width: 14 },
      { header: "Rank", key: "rank", width: 12 },
      { header: "Status", key: "testStatus", width: 22 },
      { header: "Registered Date", key: "registeredAt", width: 24 }
    ];

    sheet.getRow(1).height = 28;
    sheet.getRow(1).eachCell(cell => {
      cell.fill = HEADER_FILL_TEAL;
      cell.font = HEADER_FONT;
      cell.alignment = CENTER_ALIGN;
    });

    data.students.forEach((st, idx) => {
      const row = sheet.addRow({
        sno: idx + 1,
        name: st.name,
        mobile: st.mobile,
        email: st.email,
        college: st.college,
        course: st.course,
        year: st.year,
        code: st.code,
        asmtName: st.asmtName,
        marks: st.marks,
        totalMarks: st.totalMarks,
        correct: st.correct,
        incorrect: st.incorrect,
        percentage: st.percentage,
        rank: st.rank,
        testStatus: st.testStatus,
        registeredAt: st.registeredAt
      });

      row.height = 20;
      row.eachCell((cell, colNum) => {
        cell.font = DATA_FONT;
        cell.border = THIN_BORDER;
        if (colNum === 2 || colNum === 4 || colNum === 5 || colNum === 9) {
          cell.alignment = LEFT_ALIGN;
        } else {
          cell.alignment = CENTER_ALIGN;
        }

        if (colNum === 16) {
          if (st.testStatus.startsWith("Completed")) {
            cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF15803D" } };
          } else {
            cell.font = { name: "Segoe UI", size: 10, color: { argb: "FFB45309" } };
          }
        }
      });
    });

    const indFilePath = path.join(OUTPUT_DIR, cfg.fileName);
    await wb.xlsx.writeFile(indFilePath);
    console.log(`Saved: ${cfg.fileName} (${data.students.length} students)`);
  }

  console.log("\nALL KANPUR WORKSHOP EXCELS GENERATED SUCCESSFULLY!");
  process.exit(0);
}

run().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
