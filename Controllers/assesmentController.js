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
    const { status } = req.params;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const assessments = await assessmentModel
      .find({ status })
      .populate("certificateName");

    const formattedAssessments = await Promise.all(
      assessments.map(async (assessment) => {
        const obj = assessment.toObject();

        const assessmentQuestions = await assesmentQuestionIdModel.findOne({
          assesmentId: obj._id,
        });

        const questionCount = assessmentQuestions
          ? assessmentQuestions.questionIds.length
          : 0;


        const startCount = await studentModel.countDocuments({
          code: obj.assessmentCode,
        });


        const submittedStudents = await resultModel
          .find()
          .populate({
            path: "student",
            match: { code: obj.assessmentCode },
            select: "_id",
          });

        // unique student ids
        const uniqueStudentIds = new Set(
          submittedStudents
            .filter((r) => r.student) // only matching code
            .map((r) => r.student._id.toString())
        );

        const submitCount = uniqueStudentIds.size;

        const updatePayload = {};

        if (obj.count !== questionCount) updatePayload.count = questionCount;
        if (obj.start !== startCount) updatePayload.start = startCount;
        if (obj.submit !== submitCount) updatePayload.submit = submitCount;

        if (Object.keys(updatePayload).length) {
          await assessmentModel.findByIdAndUpdate(obj._id, updatePayload);
        }


        return {
          ...obj,
          count: questionCount,
          start: startCount,
          submit: submitCount,

          //  convert only if exists
          startDateTime: obj.startDateTime
            ? toKolkataTime(obj.startDateTime)
            : null,

          endDateTime: obj.endDateTime
            ? toKolkataTime(obj.endDateTime)
            : null,
        };

      })
    );

    return res.status(200).json({
      success: true,
      assessments: formattedAssessments,
    });
  } catch (error) {
    console.error("GET ASSESSMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
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


