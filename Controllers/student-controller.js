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
    const students = await studentModel.aggregate([
      { $sort: { createdAt: -1 } },

      {
        $group: {
          _id: "$mobile",
          student: { $first: "$$ROOT" } // latest student
        }
      },

      { $replaceRoot: { newRoot: "$student" } },

      { $sort: { createdAt: -1 } }
    ]);

    if (!students.length) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student found",
      students
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message
    });
  }
};

export const getSingle = async (req,res) => {
  try {
    const {id} = req.params;
    const student = await studentModel.findOne({_id: id});
    if(!student) return res.status(404).json({success: false,message:"no student found"});
    return res.status(200).json({success:true,message:"studen found",student})
  } catch (error) {
    return res.status(500).json({success:false,message:"internel server error",error:error.message})
  }
}


export const getStudentByAssesmet = async (req, res) => {
  try {
    const { assesmentCode } = req.params;
    const student = await studentModel.find({ code: assesmentCode });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" })
    }
    return res.status(200).json({ success: true, message: "Student found", student })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'intetnal server error', error: error.message })
  }
}


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


export const downloadStudentsByAssessmentExcel = async (req, res) => {
  try {
    const { assesmentCode } = req.params;

    if (!assesmentCode) {
      return res.status(400).json({
        success: false,
        message: "Assessment code is required",
      });
    }

    const students = await studentModel
      .find({ code: assesmentCode })
      .sort({ createdAt: 1 }); // oldest first (optional)

    if (!students.length) {
      return res.status(404).json({
        success: false,
        message: "No students found",
      });
    }

    // ================= EXCEL =================
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students List");

    // 🔹 Columns
    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "College", key: "college", width: 30 },
      { header: "Year", key: "year", width: 15 },
      { header: "Course", key: "course", width: 15 },
      { header: "Date & Time", key: "datetime", width: 22 },
    ];

    // 🔹 Rows
    students.forEach((student) => {
      worksheet.addRow({
        name: student.name,
        phone: student.mobile,
        college: student.college,
        year: student.year,
        course: student.course,
        datetime: new Date(student.createdAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
      });
    });

    // 🔹 Header bold
    worksheet.getRow(1).font = { bold: true };

    // 🔹 Response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=students-${assesmentCode}.xlsx`
    );

    // 🔹 Send file
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("STUDENT EXCEL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download excel",
      error: error.message,
    });
  }
};

