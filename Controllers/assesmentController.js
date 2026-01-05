import assessmentModel from "../Models/assesmentModel.js";
import counterModel from "../Models/counterModel.js";


export const createAssessment = async (req, res) => {
  try {
    const {
      assessmentName,
      assessmentCode,
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
      !totalQuestions ||
      !timeDuration ||
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


export const getAssesmentByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }
    const assessments = await assessmentModel.find({ status: status }).populate("certificateName");
    return res.status(200).json({
      success: true,
      assessments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


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

    assessment.status = !assessment.status;
    await assessment.save();

    return res.status(200).json({
      success: true,
      message: `status ${assessment.status ? "Activated" : "DeActivated"}`,
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


