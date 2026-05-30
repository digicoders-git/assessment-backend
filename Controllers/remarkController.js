import remarkModel from "../Models/remarkModel.js";
import studentModel from "../Models/studentModel.js";

// Add a new remark to a student
export const addRemark = async (req, res) => {
  try {
    const { studentId, text, status } = req.body;
    const adminId = req.admin._id;

    if (!studentId || !text || text.trim() === "" || !status || status.trim() === "") {
      return res.status(400).json({ success: false, message: "Student ID, remark text, and status are required" });
    }

    // Verify student exists
    const studentDoc = await studentModel.findById(studentId);
    if (!studentDoc) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const remark = await remarkModel.create({
      student: studentId,
      admin: adminId,
      text: text.trim(),
      status: status.trim()
    });

    const populated = await remarkModel.findById(remark._id).populate("admin", "userName");

    return res.status(201).json({ success: true, message: "Remark added successfully", remark: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Retrieve all remarks for a student
export const getRemarksByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ success: false, message: "Student ID is required" });
    }

    const remarks = await remarkModel.find({ student: studentId })
      .populate("admin", "userName")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, remarks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
