import academicYearModel from "../Models/academicYearModel.js";
import assessmentModel from "../Models/assesmentModel.js";
import collegeModel from "../Models/collegeModel.js";
import courseModel from "../Models/courseModel.js";
import studentModel from "../Models/studentModel.js";
import remarkModel from "../Models/remarkModel.js";
import resultModel from "../Models/resultModel.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";


export const studen_reg_without_contact = async (req, res) => {
  try {
    const { name, college, year, course, code } = req.body;

    if (!name || !college || !year || !course || !code) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const assessment = await assessmentModel.findOne({
      assessmentCode: code.toUpperCase()
    });

    if (!assessment) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment code"
      });
    }

    const newStudent = await studentModel.create({ name, college, year, course, code });

    return res.status(201).json({
      success: true,
      message: "Registration successfully",
      newStudent
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


export const studen_reg = async (req, res) => {
  try {
    const { name, mobile, email, college, year, course, code } = req.body;

    // 🔹 basic validation
    if (!name || !mobile || !email || !college || !year || !course || !code) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // 🔹 check assessment by code
    const assessment = await assessmentModel.findOne({
      assessmentCode: code.toUpperCase()
    });

    if (!assessment) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment code"
      });
    }

    // 🔹 check assessment status
    // 🔹 create student
    const newStudent = await studentModel.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Registration successfully",
      newStudent
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};



export const updateStuednt = async (req, res) => {
  try {
    const { id } = req.params;

    // 🟢 CASE 1 → certificate image update (LOCAL)
    if (req.file) {

      // 🌐 local image URL (same logic as certificate)
      const certificateUrl = `${process.env.CERT_BASE_URL}/uploads/certificates/${req.file.filename}`;

      const student = await studentModel.findByIdAndUpdate(
        id,
        { certificate: certificateUrl },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Certificate uploaded successfully",
        student
      });
    }

    // 🟢 CASE 2 → only student data update
    if (Object.keys(req.body).length > 0) {
      const updatedStudent = await studentModel.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Student updated successfully",
        student: updatedStudent
      });
    }

    return res.status(400).json({
      success: false,
      message: "No data or certificate provided"
    });

  } catch (error) {
    console.error("UPDATE STUDENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



export const existStudent = async (req, res) => {
  try {
    const { mobile } = req.body;
    const existMobile = await studentModel.findOne({ mobile });
    if (existMobile) {
      return res.status(200).json({ success: true, message: `wlecome ${existMobile.name}`, existMobile })
    }
    return res.status(200).json({ success: true, message: "new student" })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'intetnal server error', error: error.message })
  }
}

export const getAllStudent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { college, course, year, search } = req.query;

    const matchStage = {};

    // ---------- FILTERS ----------
    // ---------- FILTERS (PARTIAL + CASE INSENSITIVE) ----------
    if (college) {
      matchStage.college = { $regex: college.trim(), $options: "i" };
    }

    if (course) {
      matchStage.course = { $regex: course.trim(), $options: "i" };
    }

    if (year) {
      matchStage.year = { $regex: year.trim(), $options: "i" };
    }


    // ---------- SEARCH ----------
    if (search && search.trim()) {
      const digitSearch = search.replace(/\D/g, "");

      matchStage.$or = [
        { name: { $regex: search.trim(), $options: "i" } }
      ];

      if (digitSearch) {
        matchStage.$or.push({
          $expr: {
            $regexMatch: {
              input: { $toString: "$mobile" },
              regex: digitSearch
            }
          }
        });
      }
    }

    const pipeline = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },

      {
        $group: {
          _id: "$mobile",
          student: { $first: "$$ROOT" }
        }
      },

      { $replaceRoot: { newRoot: "$student" } },
      { $sort: { createdAt: -1 } }
    ];

    const totalData = await studentModel.aggregate(pipeline);
    const total = totalData.length;

    pipeline.push({ $skip: skip }, { $limit: limit });

    const students = await studentModel.aggregate(pipeline);

    // Fetch and attach remarks for the student IDs
    const studentIds = students.map(s => s._id);
    const allRemarks = await remarkModel.find({ student: { $in: studentIds } })
      .populate("admin", "userName")
      .sort({ createdAt: -1 });

    const remarksByStudent = {};
    allRemarks.forEach(rem => {
      const sId = String(rem.student);
      if (!remarksByStudent[sId]) {
        remarksByStudent[sId] = [];
      }
      remarksByStudent[sId].push({
        _id: rem._id,
        text: rem.text,
        status: rem.status,
        adminName: rem.admin?.userName || "N/A",
        createdAt: rem.createdAt
      });
    });

    const studentsWithRemarks = students.map(s => {
      const sId = String(s._id);
      const studentRemarks = remarksByStudent[sId] || [];
      return {
        ...s,
        remarks: studentRemarks,
        remarksCount: studentRemarks.length,
        latestRemark: studentRemarks[0] || null
      };
    });

    return res.status(200).json({
      success: true,
      students: studentsWithRemarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("GET ALL STUDENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};



export const getSingle = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await studentModel.findOne({ _id: id });
    if (!student) return res.status(404).json({ success: false, message: "no student found" });
    return res.status(200).json({ success: true, message: "studen found", student })
  } catch (error) {
    return res.status(500).json({ success: false, message: "internel server error", error: error.message })
  }
}


export const getStudentByAssesmet = async (req, res) => {
  try {
    const { assesmentCode } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, college, year, course } = req.query;

    const matchStage = {};

    if (assesmentCode && assesmentCode !== "all") {
      matchStage.code = assesmentCode;
    }

    if (college && college !== "all") {
      matchStage.college = { $regex: college.trim(), $options: "i" };
    }

    if (year && year !== "all") {
      matchStage.year = { $regex: year.trim(), $options: "i" };
    }

    if (course && course !== "all") {
      matchStage.course = { $regex: course.trim(), $options: "i" };
    }

    if (search && search.trim()) {
      const orConditions = [{ name: { $regex: search, $options: "i" } }];
      const mobileSearch = search.replace(/\D/g, "");
      if (mobileSearch) orConditions.push({ mobile: Number(mobileSearch) });
      matchStage.$or = orConditions;
    }

    const pipeline = [
      { $match: matchStage },

      // ✅ FIRST student per mobile (oldest)
      { $sort: { createdAt: 1 } },

      {
        $group: {
          _id: "$mobile",
          student: { $first: "$$ROOT" }
        }
      },

      { $replaceRoot: { newRoot: "$student" } },

      // 🔹 RESULT LOOKUP (marks / total)
      {
        $lookup: {
          from: "results",
          localField: "_id",
          foreignField: "student",
          as: "result"
        }
      },

      {
        $addFields: {
          marks: {
            $cond: [
              { $gt: [{ $size: "$result" }, 0] },
              { $toDouble: { $arrayElemAt: ["$result.marks", 0] } },
              null
            ]
          },
          total: {
            $cond: [
              { $gt: [{ $size: "$result" }, 0] },
              { $toDouble: { $arrayElemAt: ["$result.total", 0] } },
              null
            ]
          }
        }
      },

      { $project: { result: 0 } },

      { $sort: { createdAt: -1 } }
    ];

    const totalData = await studentModel.aggregate(pipeline);
    const total = totalData.length;

    pipeline.push({ $skip: skip }, { $limit: limit });

    const students = await studentModel.aggregate(pipeline);

    // Fetch and attach remarks for the student IDs
    const studentIds = students.map(s => s._id);
    const allRemarks = await remarkModel.find({ student: { $in: studentIds } })
      .populate("admin", "userName")
      .sort({ createdAt: -1 });

    const remarksByStudent = {};
    allRemarks.forEach(rem => {
      const sId = String(rem.student);
      if (!remarksByStudent[sId]) {
        remarksByStudent[sId] = [];
      }
      remarksByStudent[sId].push({
        _id: rem._id,
        text: rem.text,
        status: rem.status,
        adminName: rem.admin?.userName || "N/A",
        createdAt: rem.createdAt
      });
    });

    const studentsWithRemarks = students.map(s => {
      const sId = String(s._id);
      const studentRemarks = remarksByStudent[sId] || [];
      return {
        ...s,
        remarks: studentRemarks,
        remarksCount: studentRemarks.length,
        latestRemark: studentRemarks[0] || null
      };
    });

    return res.status(200).json({
      success: true,
      students: studentsWithRemarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("GET STUDENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};






// academic data 

export const academicData = async (req, res) => {
  try {
    const colleges = await collegeModel.find();
    const years = await academicYearModel.find();
    const course = await courseModel.find();

    return res.status(200).json({ success: true, message: "academic data", colleges, years, course })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'intetnal server error', error: error.message })
  }
}


// dowmload excel file for students by assesments



export const downloadStudentsExcel = async (req, res) => {
  try {
    const { assesmentCode } = req.params;
    const { college, year, course, search } = req.query;

    const filter = {};

    // Assessment filter
    if (assesmentCode) filter.code = assesmentCode;
    if (college) filter.college = college;
    if (year) filter.year = year;
    if (course) filter.course = course;

    // Name OR Mobile search
    if (search) {
      if (/^\d{6,15}$/.test(search)) {
        filter.mobile = search;
      } else {
        filter.name = { $regex: search, $options: "i" };
      }
    }

    // ------------------ FETCH DATA ------------------
    const students = await studentModel
      .find(filter)
      .sort({ createdAt: -1 }); // 🔥 latest first

    // ------------------ REMOVE DUPLICATES BY MOBILE ------------------
    const uniqueMap = new Map(); // mobile -> student

    students.forEach((s) => {
      if (!uniqueMap.has(s.mobile)) {
        uniqueMap.set(s.mobile, s); // first occurence = latest
      }
    });

    const uniqueStudents = Array.from(uniqueMap.values());

    // ------------------ NO DATA ------------------
    if (!uniqueStudents.length) {
      return res.status(200).json({
        success: false,
        message: "No data available",
      });
    }

    // ------------------ CREATE EXCEL ------------------
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Mobile", key: "mobile", width: 15 },
      { header: "Email", key: "email", width: 30 },
      { header: "College", key: "college", width: 30 },
      { header: "Year", key: "year", width: 10 },
      { header: "Course", key: "course", width: 15 },
      { header: "Assessment Code", key: "code", width: 20 },
      { header: "Date-Time", key: "createdAt", width: 22 },
    ];

    uniqueStudents.forEach((s) => {
      worksheet.addRow({
        name: s.name || "",
        mobile: s.mobile || "",
        email: s.email || "",
        college: s.college || "",
        year: s.year || "",
        course: s.course || "",
        code: s.code || "",
        createdAt: new Date(s.createdAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const fileName = assesmentCode
      ? `students-${assesmentCode}.xlsx`
      : `all-students.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("EXCEL DOWNLOAD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// downlaod pdf file for students


export const downloadStudentsPDF = async (req, res) => {
  try {
    const { assesmentCode } = req.params;
    const { college, year, course, search } = req.query;

    const filter = {};

    // ---------------- FILTERS ----------------
    if (assesmentCode) filter.code = assesmentCode;
    if (college) filter.college = college;
    if (year) filter.year = year;
    if (course) filter.course = course;

    if (search) {
      if (/^\d{6,15}$/.test(search)) {
        filter.mobile = Number(search);
      } else {
        filter.name = { $regex: search, $options: "i" };
      }
    }

    // ---------------- FETCH DATA ----------------
    const students = await studentModel
      .find(filter)
      .sort({ createdAt: -1 });

    // ---------------- REMOVE DUPLICATE MOBILE ----------------
    const uniqueMap = new Map();
    students.forEach((s) => {
      const key = s.mobile?.toString();
      if (!uniqueMap.has(key)) uniqueMap.set(key, s);
    });
    const uniqueStudents = Array.from(uniqueMap.values());

    if (!uniqueStudents.length) {
      return res.status(404).json({
        success: false,
        message: "No students found",
      });
    }

    // ---------------- PDF SETUP ----------------
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    const fileName = assesmentCode
      ? `students-${assesmentCode}.pdf`
      : `all-students.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    doc.pipe(res);

    // ---------------- TITLE ----------------
    doc.fontSize(14).font("Helvetica-Bold").text("Students Report", {
      align: "center",
    });
    doc.moveDown(1);

    // ---------------- TABLE CONFIG ----------------
    const columns = [
      { key: "name", label: "Name", x: 40, width: 90 },
      { key: "mobile", label: "Mobile", x: 130, width: 75 },
      { key: "email", label: "Email", x: 205, width: 140 },
      { key: "college", label: "College", x: 345, width: 95 },
      { key: "year", label: "Year", x: 440, width: 45 },
      { key: "course", label: "Course", x: 485, width: 60 },
      { key: "createdAt", label: "Reg. Date", x: 545, width: 80 },
    ];

    let y = doc.y + 10;

    // ---------------- HEADER ----------------
    doc.fontSize(9).font("Helvetica-Bold");
    columns.forEach((c) => {
      doc.text(c.label, c.x, y, { width: c.width });
    });

    y += 18;
    doc.font("Helvetica").fontSize(7);

    // ---------------- HELPERS ----------------
    const getCellText = (student, key) => {
      if (key === "createdAt") {
        const date = new Date(student.createdAt);
        return date.toLocaleDateString("en-IN");
      }
      return (student[key] || "").toString();
    };


    const getTextHeight = (text, width) =>
      doc.heightOfString(text || "", { width });

    // ---------------- ROWS ----------------
    uniqueStudents.forEach((s) => {
      let rowHeight = 0;

      // calculate max height
      columns.forEach((c) => {
        const h = getTextHeight(getCellText(s, c.key), c.width);
        rowHeight = Math.max(rowHeight, h);
      });

      // page break
      if (y + rowHeight > doc.page.height - 40) {
        doc.addPage();
        y = 40;
      }

      // draw row
      columns.forEach((c) => {
        doc.text(getCellText(s, c.key), c.x, y, {
          width: c.width,
          height: rowHeight,
        });
      });

      y += rowHeight + 6; // row spacing
    });

    // ---------------- END ----------------
    doc.end();
  } catch (error) {
    console.error("PDF DOWNLOAD ERROR:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
};










// =====================================================================
// MULTI-ASSESSMENT / ALL COLLEGE WORKSHOPS EXCEL EXPORT
// =====================================================================
export const downloadMultiAssessmentExcel = async (req, res) => {
  try {
    let { assessmentCodes, allWorkshops } = req.body;

    const workshopKeywords = [
      /college/i, /polytechnic/i, /institute/i, /university/i, /workshop/i,
      /campus/i, /fgiet/i, /mviet/i, /rec/i, /diet/i, /dit/i, /biet/i,
      /iet/i, /sit/i, /kiet/i, /aktu/i, /bteup/i, /engineering/i, /degree/i
    ];

    let targetCodes = [];
    if (allWorkshops) {
      const allAsmts = await assessmentModel.find({}).lean();
      const workshopAsmts = allAsmts.filter(a => {
        const text = `${a.remark || ""} ${a.name || ""} ${a.topic || ""}`;
        return workshopKeywords.some(kw => kw.test(text));
      });
      targetCodes = workshopAsmts.map(a => a.assesmentCode).filter(Boolean);
    } else if (Array.isArray(assessmentCodes) && assessmentCodes.length > 0) {
      targetCodes = assessmentCodes.map(c => String(c).trim()).filter(Boolean);
    }

    if (!targetCodes.length) {
      return res.status(400).json({
        success: false,
        message: "No assessment codes specified"
      });
    }

    // Fetch assessment details
    const assessments = await assessmentModel.find({ assesmentCode: { $in: targetCodes } }).lean();
    const asmtMap = new Map();
    assessments.forEach(a => asmtMap.set(a.assesmentCode, a));

    // Fetch all students for these assessments
    const students = await studentModel.find({ code: { $in: targetCodes } }).sort({ createdAt: -1 }).lean();

    // Group students by assessment code
    const studentsByCode = new Map();
    const studentIds = [];
    targetCodes.forEach(code => studentsByCode.set(code, []));

    students.forEach(s => {
      studentIds.push(s._id);
      if (studentsByCode.has(s.code)) {
        studentsByCode.get(s.code).push(s);
      }
    });

    // Fetch results
    const results = await resultModel.find({ student: { $in: studentIds } }).lean();
    const resultMap = new Map();
    results.forEach(r => {
      const key = `${String(r.student)}_${r.assessmentCode || ""}`;
      resultMap.set(key, r);
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "The DigiCoders Assessment Portal";
    workbook.created = new Date();

    const usedSheetNames = new Set();
    const getSafeSheetName = (code, label) => {
      let clean = (code ? `${code}_` : "") + (label || "Sheet");
      clean = clean.replace(/[*?:/\\\[\]]/g, "_").replace(/\s+/g, "_");
      clean = clean.substring(0, 31);
      let candidate = clean || "Sheet";
      let counter = 1;
      while (usedSheetNames.has(candidate.toLowerCase())) {
        const suffix = `_${counter}`;
        candidate = clean.substring(0, 31 - suffix.length) + suffix;
        counter++;
      }
      usedSheetNames.add(candidate.toLowerCase());
      return candidate;
    };

    const headerFill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E293B" }
    };
    const headerFont = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" }
    };
    const centerAlign = { vertical: "middle", horizontal: "center" };

    // 1. MASTER SUMMARY SHEET
    const summarySheet = workbook.addWorksheet(getSafeSheetName("", "00_Master_Summary"));
    summarySheet.views = [{ state: "frozen", ySplit: 1 }];
    summarySheet.columns = [
      { header: "S.No", key: "sno", width: 8 },
      { header: "Assessment Code", key: "code", width: 18 },
      { header: "Assessment Name", key: "name", width: 32 },
      { header: "College / Remark", key: "remark", width: 38 },
      { header: "Topic / Subject", key: "topic", width: 22 },
      { header: "Total Registered", key: "totalStudents", width: 18 },
      { header: "Tests Completed", key: "completed", width: 18 },
      { header: "Status", key: "status", width: 12 },
      { header: "Sheet Name", key: "sheetName", width: 32 }
    ];

    const summaryRows = [];

    // 2. ALL STUDENTS CONSOLIDATED SHEET
    const consolidatedSheet = workbook.addWorksheet(getSafeSheetName("", "All_Students_Consolidated"));
    consolidatedSheet.views = [{ state: "frozen", ySplit: 1 }];
    consolidatedSheet.columns = [
      { header: "S.No", key: "sno", width: 8 },
      { header: "Assessment Code", key: "code", width: 18 },
      { header: "Assessment Name", key: "asmtName", width: 28 },
      { header: "College / Workshop", key: "remark", width: 32 },
      { header: "Student Name", key: "name", width: 26 },
      { header: "Mobile", key: "mobile", width: 16 },
      { header: "Email", key: "email", width: 28 },
      { header: "Student College", key: "college", width: 30 },
      { header: "Course", key: "course", width: 16 },
      { header: "Year", key: "year", width: 12 },
      { header: "Marks", key: "marks", width: 12 },
      { header: "Correct", key: "correct", width: 12 },
      { header: "Incorrect", key: "incorrect", width: 12 },
      { header: "Status", key: "testStatus", width: 16 },
      { header: "Registration Date", key: "regDate", width: 20 }
    ];

    let consolidatedIndex = 1;

    // 3. INDIVIDUAL ASSESSMENT SHEETS
    targetCodes.forEach((code, idx) => {
      const asmt = asmtMap.get(code) || {};
      const list = studentsByCode.get(code) || [];
      const asmtName = asmt.name || "Assessment";
      const asmtRemark = asmt.remark || "";
      const label = asmtRemark ? asmtRemark.split(/[\s,]+/)[0] : asmtName.split(/[\s,]+/)[0];
      const sheetName = getSafeSheetName(code, label);

      let completedCount = 0;
      const asmtSheet = workbook.addWorksheet(sheetName);
      asmtSheet.views = [{ state: "frozen", ySplit: 1 }];
      asmtSheet.columns = [
        { header: "S.No", key: "sno", width: 8 },
        { header: "Student Name", key: "name", width: 26 },
        { header: "Mobile", key: "mobile", width: 16 },
        { header: "Email", key: "email", width: 28 },
        { header: "College", key: "college", width: 32 },
        { header: "Course", key: "course", width: 16 },
        { header: "Year", key: "year", width: 12 },
        { header: "Assessment Code", key: "code", width: 18 },
        { header: "Marks", key: "marks", width: 12 },
        { header: "Correct", key: "correct", width: 12 },
        { header: "Incorrect", key: "incorrect", width: 12 },
        { header: "Result Status", key: "testStatus", width: 16 },
        { header: "Registered At", key: "regDate", width: 20 }
      ];

      list.forEach((st, sIdx) => {
        const resKey1 = `${String(st._id)}_${code}`;
        const resKey2 = `${String(st._id)}_`;
        const resItem = resultMap.get(resKey1) || resultMap.get(resKey2);
        const hasCompleted = !!resItem;
        if (hasCompleted) completedCount++;

        const marksVal = hasCompleted ? (resItem.marks ?? "-") : "Not Attempted";
        const correctVal = hasCompleted ? (resItem.correct ?? "-") : "-";
        const incorrectVal = hasCompleted ? (resItem.incorrect ?? "-") : "-";
        const statusVal = hasCompleted ? "Completed" : "Registered";
        const dateStr = st.createdAt ? new Date(st.createdAt).toLocaleString("en-IN") : "";

        asmtSheet.addRow({
          sno: sIdx + 1,
          name: st.name || "",
          mobile: st.mobile || "",
          email: st.email || "",
          college: st.college || asmtRemark || "",
          course: st.course || "",
          year: st.year || "",
          code: st.code || code,
          marks: marksVal,
          correct: correctVal,
          incorrect: incorrectVal,
          testStatus: statusVal,
          regDate: dateStr
        });

        consolidatedSheet.addRow({
          sno: consolidatedIndex++,
          code: code,
          asmtName: asmtName,
          remark: asmtRemark,
          name: st.name || "",
          mobile: st.mobile || "",
          email: st.email || "",
          college: st.college || asmtRemark || "",
          course: st.course || "",
          year: st.year || "",
          marks: marksVal,
          correct: correctVal,
          incorrect: incorrectVal,
          testStatus: statusVal,
          regDate: dateStr
        });
      });

      // Format asmtSheet header
      const headerRow = asmtSheet.getRow(1);
      headerRow.height = 26;
      headerRow.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = centerAlign;
      });

      summaryRows.push({
        sno: idx + 1,
        code: code,
        name: asmtName,
        remark: asmtRemark,
        topic: asmt.topic || "",
        totalStudents: list.length,
        completed: completedCount,
        status: asmt.status ? "Active" : "Inactive",
        sheetName: sheetName
      });
    });

    // Populate Summary Sheet
    summaryRows.forEach(row => summarySheet.addRow(row));

    // Style summarySheet header
    const summaryHeader = summarySheet.getRow(1);
    summaryHeader.height = 28;
    summaryHeader.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F766E" } };
      cell.font = headerFont;
      cell.alignment = centerAlign;
    });

    // Style consolidatedSheet header
    const consolidatedHeader = consolidatedSheet.getRow(1);
    consolidatedHeader.height = 28;
    consolidatedHeader.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
      cell.font = headerFont;
      cell.alignment = centerAlign;
    });

    const fileName = allWorkshops
      ? `All_College_Workshops_Export_${Date.now()}.xlsx`
      : `Multi_Assessments_Export_${Date.now()}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("MULTI ASSESSMENT EXCEL ERROR:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to generate multi-assessment Excel: " + error.message
      });
    }
  }
};
