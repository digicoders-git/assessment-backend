import academicYearModel from "../Models/academicYearModel.js";
import assessmentModel from "../Models/assesmentModel.js";
import collegeModel from "../Models/collegeModel.js";
import courseModel from "../Models/courseModel.js";
import studentModel from "../Models/studentModel.js";
import ExcelJS from "exceljs";
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

    //  match filter
    const matchStage = {};

    if (college) {
      matchStage.college = { $regex: college, $options: "i" };
    }

    if (course) {
      matchStage.course = { $regex: course, $options: "i" };
    }

    if (year) {
      matchStage.year = { $regex: year, $options: "i" };
    }

    //  backend search (name OR mobile)
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } }
      ];
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

    //  total count
    const totalStudents = await studentModel.aggregate(pipeline);
    const total = totalStudents.length;

    //  pagination
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

    //  pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    //  search & filters
    const search = req.query.search || "";
    const { college, year, course } = req.query;

    if (!assesmentCode) {
      return res.status(400).json({
        success: false,
        message: "Assessment code is required"
      });
    }

    //  search only name & mobile
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { mobile: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    //  filters
    const filterQuery = {
      ...(college && { college }),
      ...(year && { year }),
      ...(course && { course })
    };

    //  final match
    const matchQuery = {
      code: assesmentCode,
      ...searchQuery,
      ...filterQuery
    };

    //  total count
    const total = await studentModel.countDocuments(matchQuery);

    if (!total) {
      return res.status(200).json({
        success: true,
        message: " No Student In This Assessment"
      });
    }

    //  paginated students
    const students = await studentModel
      .find(matchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Student found",
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
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
    //  assessmentCode from params
    const { assesmentCode } = req.params;

    //  other filters from query
    const { college, year, course, search } = req.query;

    const filter = {};

    //  assessment logic (same as before)
    if (assesmentCode) {
      filter.code = assesmentCode;
    }

    if (college) filter.college = college;
    if (year) filter.year = year;
    if (course) filter.course = course;

    //  Name OR Mobile (only one at a time)
    if (search) {
      if (/^\d{6,15}$/.test(search)) {
        filter.mobile = search;
      } else {
        filter.name = { $regex: search, $options: "i" };
      }
    }

    const students = await studentModel
      .find(filter)
      .sort({ createdAt: 1 });

    //  NO DATA → NO EXCEL
    if (!students.length) {
      return res.status(200).json({
        success: false,
        message: "No data available",
      });
    }

    //  Create Excel
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

    students.forEach((s) => {
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



