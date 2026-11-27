import assessmentModel from "../Models/assesmentModel.js";
import assesmentQuestionIdModel from "../Models/assesmentQuestionsModel.js";
import counterModel from "../Models/counterModel.js";
import resultModel from "../Models/resultModel.js";
import studentModel from "../Models/studentModel.js";
import certificateModel from "../Models/certificateModel.js";
import academicYearModel from "../Models/academicYearModel.js";
import assignmentModel from "../Models/assignmentModel.js";
import { toKolkataTime } from "../utils/timezoneHelper.js";



export const createAssessment = async (req, res) => {
  try {
    const {
      assessmentName,
      assessmentCode,
      assessmentType,
      certificateOnly,
      totalQuestions,
      timeDuration,
      startDateTime,
      endDateTime,
      generateCertificate,
      certificateName,
      remark
    } = req.body;

    if (
      !assessmentName ||
      !assessmentCode ||
      // !totalQuestions ||
      // !timeDuration ||
      !startDateTime ||
      !endDateTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    if (new Date(endDateTime) <= new Date(startDateTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment time range"
      });
    }

    if (generateCertificate && !certificateName) {
      return res.status(400).json({
        success: false,
        message: "Certificate name required"
      });
    }

    const counter = await counterModel.findOneAndUpdate(
      { name: "assessment" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const assessment = await assessmentModel.create({
      assessmentId: counter.seq,
      assessmentName,
      assessmentCode,
      assessmentType: assessmentType || null,
      certificateOnly,
      totalQuestions,
      timeDuration,
      startDateTime,
      endDateTime,
      generateCertificate,
      certificateName: generateCertificate ? certificateName : null,
      remark,
      allowedYears: req.body.allowedYears || []
    });

    return res.status(201).json({
      success: true,
      message: "Assessment created successfully",
      assessment
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate assessment code or id"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// QUICK DUPLICATE ASSESSMENT
export const duplicateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      assessmentName,
      assessmentCode,
      assessmentType,
      startDateTime,
      endDateTime,
      remark,
      totalQuestions,
      timeDuration,
      certificateOnly,
      generateCertificate,
      certificateName,
      allowedYears
    } = req.body;

    const srcAssessment = await assessmentModel.findById(id);
    if (!srcAssessment) {
      return res.status(404).json({
        success: false,
        message: "Source assessment not found"
      });
    }

    // Determine unique new assessment code
    let newCode = assessmentCode ? assessmentCode.trim().toUpperCase() : null;
    if (!newCode) {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      newCode = `DCT${day}${minutes.charAt(1)}${seconds.charAt(1)}`;

      let exists = await assessmentModel.findOne({ assessmentCode: newCode });
      while (exists) {
        newCode = `DCT${Math.floor(1000 + Math.random() * 9000)}`;
        exists = await assessmentModel.findOne({ assessmentCode: newCode });
      }
    } else {
      const exists = await assessmentModel.findOne({ assessmentCode: newCode });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: `Assessment code "${newCode}" already exists. Please choose a different code.`
        });
      }
    }

    const start = startDateTime ? new Date(startDateTime) : srcAssessment.startDateTime;
    const end = endDateTime ? new Date(endDateTime) : srcAssessment.endDateTime;

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End Date-Time must be greater than Start Date-Time"
      });
    }

    const counter = await counterModel.findOneAndUpdate(
      { name: "assessment" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const isCertOnly = certificateOnly !== undefined ? Boolean(certificateOnly) : Boolean(srcAssessment.certificateOnly);
    const genCert = generateCertificate !== undefined ? Boolean(generateCertificate) : Boolean(srcAssessment.generateCertificate);

    const newAssessment = await assessmentModel.create({
      assessmentId: counter.seq,
      assessmentName: assessmentName || srcAssessment.assessmentName,
      assessmentCode: newCode,
      assessmentType: assessmentType || srcAssessment.assessmentType || "College Workshop",
      certificateOnly: isCertOnly,
      totalQuestions: isCertOnly ? 0 : (totalQuestions !== undefined ? parseInt(totalQuestions) : srcAssessment.totalQuestions),
      timeDuration: isCertOnly ? 0 : (timeDuration !== undefined ? parseInt(timeDuration) : srcAssessment.timeDuration),
      startDateTime: start,
      endDateTime: end,
      generateCertificate: isCertOnly ? true : genCert,
      certificateName: certificateName || srcAssessment.certificateName || null,
      remark: remark !== undefined ? remark : srcAssessment.remark,
      allowedYears: allowedYears || srcAssessment.allowedYears || [],
      status: true
    });

    // Clone assigned questions & course-year groups from source assessment
    const srcQuestions = await assesmentQuestionIdModel.findOne({ assesmentId: id });
    if (srcQuestions) {
      await assesmentQuestionIdModel.create({
        assesmentId: newAssessment._id,
        questionIds: srcQuestions.questionIds ? [...srcQuestions.questionIds] : [],
        courseYearGroups: srcQuestions.courseYearGroups ? JSON.parse(JSON.stringify(srcQuestions.courseYearGroups)) : []
      });
    }

    return res.status(201).json({
      success: true,
      message: "Assessment duplicated successfully with all questions!",
      assessment: newAssessment
    });

  } catch (error) {
    console.error("DUPLICATE ASSESSMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




export const getAllAssessments = async (req, res) => {
  try {
    let query = {};

    // If role === 'user', only return assigned assessments
    if (req.admin && req.admin.role === "user") {
      const activeAssignments = await assignmentModel.find({
        assignedTo: req.admin._id,
        status: "active",
        type: "assessment"
      });
      const assignedCodes = activeAssignments.map(a => a.targetId);
      query.assessmentCode = { $in: assignedCodes };
    }

    const assessments = await assessmentModel
      .find(query)
      .populate("certificateName")
      .sort({ createdAt: -1 });

    //  Empty is NOT error
    if (!assessments || assessments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No assessments found",
        count: 0,
        assessments: []
      });
    }

    // Fast batch aggregation to find the primary college for each assessment code (sorted by highest count)
    const codes = assessments.map(a => a.assessmentCode).filter(Boolean);
    let codeCollegeMap = {};
    if (codes.length > 0) {
      try {
        const grouped = await studentModel.aggregate([
          { $match: { code: { $in: codes }, college: { $exists: true, $ne: "" } } },
          { $group: { _id: { code: "$code", college: "$college" }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $group: { _id: "$_id.code", colleges: { $push: "$_id.college" } } }
        ]);
        grouped.forEach(item => {
          if (item._id && item.colleges) {
            codeCollegeMap[item._id] = item.colleges;
          }
        });
      } catch (e) {
        console.error("Aggregation code colleges error:", e);
      }
    }

    //  Convert UTC → IST ONLY for response
    const formattedAssessments = assessments.map((a) => {
      const obj = a.toObject();
      const linkedColleges = codeCollegeMap[obj.assessmentCode] || [];
      // Prefer assessment.remark if it contains the college name / workshop name, otherwise the top college from students
      const primaryCollege = obj.remark || linkedColleges[0] || null;

      return {
        ...obj,
        linkedColleges,
        primaryCollege,
        startDateTime: obj.startDateTime
          ? toKolkataTime(obj.startDateTime)
          : null,
        endDateTime: obj.endDateTime
          ? toKolkataTime(obj.endDateTime)
          : null
      };
    });


    return res.status(200).json({
      success: true,
      message: "Assessments found",
      count: formattedAssessments.length,
      assessments: formattedAssessments
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


export const getAssesmentByStatus = async (req, res) => {
  try {
    const statusParam = req.params.status;
    let statusFilter = {};
    if (statusParam === "all") {
      // no status condition
    } else {
      statusFilter = { status: statusParam === "true" };
    }

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // search inputs
    const search = req.query.search?.trim(); // name / code / remark
    const date = req.query.date?.trim();     // DD/MM/YYYY

    // ===== base filter =====
    let filter = { ...statusFilter };

    // ===== text search =====
    if (search) {
      filter.$or = [
        { assessmentName: { $regex: search, $options: "i" } },
        { assessmentCode: { $regex: search, $options: "i" } },
        { remark: { $regex: search, $options: "i" } },
      ];
    }

    // ===== date search (startDateTime) =====
    if (date) {
      const [day, month, year] = date.split("/");

      if (day && month && year) {
        const startOfDay = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        const endOfDay = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

        filter.startDateTime = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }
    }

    // ===== tab filter (assessmentType) =====
    const assessmentType = req.query.assessmentType?.trim();
    if (assessmentType && assessmentType !== "All") {
      filter.assessmentType = assessmentType;
    }

    // Calculate tab counts under search/date filter (INDEPENDENT of current tab status)
    const baseFilterWithoutStatus = {};
    if (search) {
      baseFilterWithoutStatus.$or = [
        { assessmentName: { $regex: search, $options: "i" } },
        { assessmentCode: { $regex: search, $options: "i" } },
        { remark: { $regex: search, $options: "i" } },
      ];
    }
    if (date) {
      const [day, month, year] = date.split("/");
      if (day && month && year) {
        baseFilterWithoutStatus.startDateTime = {
          $gte: new Date(`${year}-${month}-${day}T00:00:00.000Z`),
          $lte: new Date(`${year}-${month}-${day}T23:59:59.999Z`),
        };
      }
    }

    const allTypeCount = await assessmentModel.countDocuments(baseFilterWithoutStatus);
    const inactiveCount = await assessmentModel.countDocuments({
      ...baseFilterWithoutStatus,
      status: false
    });
    const trainingClassCount = await assessmentModel.countDocuments({
      ...baseFilterWithoutStatus,
      assessmentType: "Training Class"
    });
    const collegeWorkshopCount = await assessmentModel.countDocuments({
      ...baseFilterWithoutStatus,
      assessmentType: "College Workshop"
    });

    // ===== total count (PURE FILTERED DATA) =====
    const totalCount = await assessmentModel.countDocuments(filter);

    const assessments = await assessmentModel
      .find(filter)
      .populate("certificateName")
      .populate("allowedYears", "academicYear")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formatted = await Promise.all(
      assessments.map(async (obj) => {
        const quesDoc = await assesmentQuestionIdModel.findOne(
          { assesmentId: obj._id },
          { questionIds: 1 }
        );

        const questionCount = quesDoc?.questionIds?.length || 0;

        const startCount = await studentModel.countDocuments({
          code: obj.assessmentCode,
        });

        const submitCount = await resultModel.countDocuments({
          assessmentCode: obj.assessmentCode,
        });

        return {
          ...obj,
          count: questionCount,
          start: startCount,
          submit: submitCount,
          startDateTime: obj.startDateTime
            ? toKolkataTime(obj.startDateTime)
            : null,
          endDateTime: obj.endDateTime
            ? toKolkataTime(obj.endDateTime)
            : null,
        };
      })
    );

    res.json({
      success: true,
      assessments: formatted,
      totalCount,
      typeCounts: {
        all: allTypeCount,
        collegeWorkshop: collegeWorkshopCount,
        trainingClass: trainingClassCount,
        inactive: inactiveCount
      },
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};





export const updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    let {
      assessmentId,
      generateCertificate,
      certificateName,
      ...rest
    } = req.body;

    const updateData = { ...rest };

    if (generateCertificate !== undefined) {
      generateCertificate =
        generateCertificate === true ||
        generateCertificate === "true";

      if (generateCertificate === false) {
        updateData.generateCertificate = false;
        updateData.certificateName = null;
      }

      if (generateCertificate === true) {
        if (!certificateName) {
          return res.status(400).json({
            success: false,
            message: "Certificate name is required when certificate is enabled"
          });
        }
        updateData.generateCertificate = true;
        updateData.certificateName = certificateName;
      }
    }

    const assessment = await assessmentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assessment updated successfully",
      assessment
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Assessment code already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



export const toggleAssessmentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await assessmentModel.findById(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found"
      });
    }

    // 🔁 SIMPLE TOGGLE (NO DATE CHECK)
    assessment.status = !assessment.status;
    await assessment.save();

    return res.status(200).json({
      success: true,
      message: `Status ${assessment.status ? "Activated" : "DeActivated"}`,
      status: assessment.status
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};





export const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await assessmentModel.findById(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found"
      });
    }

    await assessmentModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Assessment deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reset all legacy assessments categories so admin can manually categorize them
export const resetAssessmentCategories = async (req, res) => {
  try {
    const result = await assessmentModel.updateMany(
      {},
      { $unset: { assessmentType: "" } }
    );

    return res.status(200).json({
      success: true,
      message: `Successfully reset assessment categories for ${result.modifiedCount} assessments. You can now manually categorize them!`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


