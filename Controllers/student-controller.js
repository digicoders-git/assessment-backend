import academicYearModel from "../Models/academicYearModel.js";
import assessmentModel from "../Models/assesmentModel.js";
import collegeModel from "../Models/collegeModel.js";
import courseModel from "../Models/courseModel.js";
import studentModel from "../Models/studentModel.js";


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
    const { name, mobile, email, college, year, course } = req.body;
    if (!name || !mobile || !email || !college || !year || !course) {
      return res.status(400).json({ success: false, message: "Every fields required" })
    }
    const updateStudent = await studentModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updateStudent) {
      return res.status(400).json({ success: false, message: "Something wnet wrong" })
    }
    return res.status(200).json({ success: true, message: "Student updated successfully", updateStudent })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'intetnal server error', error: error.message })
  }
}

export const existStudent = async (req, res) => {
  try {
    const { mobile } = req.body;
    const existMobile = await studentModel.findOne({ mobile });
    if (existMobile) {
      return res.status(200).json({ success: true, message: `wlecome ${existMobile.name}`, existMobile })
    }
    return res.status(404).json({ success: false, message: "new student" })
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
