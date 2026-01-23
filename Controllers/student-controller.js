import academicYearModel from "../Models/academicYearModel.js";
import assessmentModel from "../Models/assesmentModel.js";
import collegeModel from "../Models/collegeModel.js";
import courseModel from "../Models/courseModel.js";
import studentModel from "../Models/studentModel.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { uploadBufferToCloudinary } from "../utils/uploadCloudinary.js";


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
    if (!assessment.status) {
      return res.status(400).json({
        success: false,
        message: "Assessment is inactive"
      });
    }


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

    //  CASE 1 → only certificate upload
    if (req.file) {
      const certificateUrl = await uploadBufferToCloudinary(req.file.buffer);

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

    //  CASE 2 → only student data update
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

    //  nothing sent
    return res.status(400).json({
      success: false,
      message: "No data or certificate provided"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
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

    // ---------------- MATCH FILTER ----------------
    const matchStage = {};

    if (college) matchStage.college = { $regex: college, $options: "i" };
    if (course) matchStage.course = { $regex: course, $options: "i" };
    if (year) matchStage.year = { $regex: year, $options: "i" };

    // ---------------- SEARCH (name OR mobile) ----------------
    if (search && search.trim() !== "") {
      const orConditions = [{ name: { $regex: search, $options: "i" } }];

      // mobile search: only digits, convert to number
      const mobileSearch = search.replace(/\D/g, "");
      if (mobileSearch) {
        orConditions.push({ mobile: Number(mobileSearch) });
      }

      matchStage.$or = orConditions;
    }

    // ---------------- AGGREGATION PIPELINE ----------------
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

    // total count
    const totalStudents = await studentModel.aggregate(pipeline);
    const total = totalStudents.length;

    // pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const students = await studentModel.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      students,
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

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // search & filters
    const search = req.query.search || "";
    const { college, year, course } = req.query;

    // ---------------- BASE QUERY ----------------
    let query = {};
    if (assesmentCode && assesmentCode !== "all") {
      query.code = assesmentCode;
    }

    // ---------------- FILTERS ----------------
    if (college && college !== "all") query.college = college;
    if (year && year !== "all") query.year = year;
    if (course && course !== "all") query.course = course;

    // ---------------- SEARCH (OR) ----------------
    if (search && search.trim() !== "") {
      const orConditions = [
        { name: { $regex: search, $options: "i" } } // name search
      ];

      // mobile search: remove non-digits and convert to number
      const mobileSearch = search.replace(/\D/g, "");
      if (mobileSearch) {
        orConditions.push({ mobile: Number(mobileSearch) });
      }

      query.$or = orConditions;
    }

    // ---------------- TOTAL COUNT ----------------
    const total = await studentModel.countDocuments(query);

    if (!total) {
      return res.status(200).json({
        success: true,
        message: "No Student found",
        students: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      });
    }

    // ---------------- DATA FETCH ----------------
    const students = await studentModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Student(s) found",
      students,
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
      message: "Internal server error",
      error: error.message
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








