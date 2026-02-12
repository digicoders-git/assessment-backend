import assessmentModel from "../Models/assesmentModel.js";
import assesmentQuestionIdModel from "../Models/assesmentQuestionsModel.js";
import counterModel from "../Models/counterModel.js";
import resultModel from "../Models/resultModel.js";
import studentModel from "../Models/studentModel.js";
import { toKolkataTime } from "../utils/timezoneHelper.js";



export const createAssessment = async (req, res) => {
  try {
    const {
      assessmentName,
      assessmentCode,
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
      certificateOnly,
      totalQuestions,
      timeDuration,
      startDateTime,
      endDateTime,
      generateCertificate,
      certificateName: generateCertificate ? certificateName : null,
      remark
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




export const getAllAssessments = async (req, res) => {
  try {
    const assessments = await assessmentModel
      .find()
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

    //  Convert UTC → IST ONLY for response
    const formattedAssessments = assessments.map(a => {
      const obj = a.toObject();

      return {
        ...obj,
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
    const status = req.params.status === "true";

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // search inputs
    const search = req.query.search?.trim(); // name / code / remark
    const date = req.query.date?.trim();     // DD/MM/YYYY

    // ===== base filter (STATUS NEVER MIX) =====
    let filter = { status };

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

    // ===== total count (PURE FILTERED DATA) =====
    const totalCount = await assessmentModel.countDocuments(filter);

    const assessments = await assessmentModel
      .find(filter)
      .populate("certificateName")
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


