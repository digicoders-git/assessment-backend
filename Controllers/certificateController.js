import qs from "qs";
import certificateModel from "../Models/certificateModel.js";
import cloudinary from "../Config/cloudinary.js";


/* ===== HELPER FUNCTIONS ===== */


export const buildTextConfig = (body, key) => {
  let data = body[key];
  if (!data) return null;

  // multipart/form-data case (JSON string)
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (err) {
      return null;
    }
  }

  return {
    fontFamily: data.fontFamily,
    bold: data.bold === "true" || data.bold === true,
    italic: data.italic === "true" || data.italic === true,
    underline: data.underline === "true" || data.underline === true,
    fontSize: data.fontSize,
    textColor: data.textColor,
    verticalPosition: data.verticalPosition,
    horizontalPosition: data.horizontalPosition,
  };
};

/* Helper to validate text config (all fields present) */
export const isValidTextConfig = (cfg) => {
  if (!cfg) return false;
  return (
    typeof cfg.fontFamily === "string" &&
    typeof cfg.bold === "boolean" &&
    typeof cfg.italic === "boolean" &&
    typeof cfg.underline === "boolean" &&
    typeof cfg.fontSize === "string" &&
    typeof cfg.textColor === "string" &&
    typeof cfg.verticalPosition === "string" &&
    typeof cfg.horizontalPosition === "string"
  );
};

/* CREATE CERTIFICATE */
export const createCertificate = async (req, res) => {
  try {
    const { certificateName } = req.body;

    if (!certificateName) {
      return res.status(400).json({
        success: false,
        message: "certificateName is required",
      });
    }

    // Check unique
    const exists = await certificateModel.findOne({ certificateName });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "certificateName must be unique",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "certificate image required",
      });
    }

    // REQUIRED: studentName
    const studentName = buildTextConfig(req.body, "studentName");
    if (!isValidTextConfig(studentName)) {
      return res.status(400).json({
        success: false,
        message: "studentName config invalid",
      });
    }

    // OPTIONAL FIELDS: include only if present & valid
    const optionalFields = ["assessmentName", "assessmentCode", "collegeName", "date"];
    const optionalData = {};
    optionalFields.forEach((key) => {
      const cfg = buildTextConfig(req.body, key);
      if (cfg && isValidTextConfig(cfg)) {
        optionalData[key] = cfg; // save full config object if valid
      }
    });

    // Upload certificate image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      { folder: "certificates" }
    );

    const certificate = await certificateModel.create({
      certificateName,
      certificateImage: uploadResult.secure_url,
      studentName,
      ...optionalData, // spread optional fields if valid
    });

    return res.status(201).json({
      success: true,
      message: "Certificate created successfully",
      certificate,
    });
  } catch (error) {
    console.error("CREATE CERTIFICATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};


// GET all certificates
export const getAllCertificates = async (req, res) => {
  try {
    const certificates = await certificateModel.find();
    res.status(200).json({success:true,message:"certificates found",certificates});
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error",error:error.message });
  }
};

// GET single certificate by ID
export const getSingleCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    if(!id) return res.status(400).json({ success: false, message: "Certificate ID is required" });
    const certificate = await certificateModel.findById(id);
    if (!certificate) return res.status(404).json({ success: false, message: "Certificate not found" });
    res.status(200).json(certificate);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error",error:error.message });
  }
};

// UPDATE certificate by ID

export const updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "certificate id required",
      });
    }

    const certificate = await certificateModel.findById(id);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "certificate not found",
      });
    }

    const updateData = {};
    const unsetData = {};

    // ===== REQUIRED / MAIN FIELDS =====
    if (req.body.certificateName) {
      updateData.certificateName = req.body.certificateName;
    }

    // ===== STUDENT NAME (optional update, never unset) =====
    const studentName = buildTextConfig(req.body, "studentName");
    if (studentName && isValidTextConfig(studentName)) {
      updateData.studentName = studentName;
    }

    // ===== OPTIONAL FIELDS (unset if missing) =====
    const optionalFields = ["assessmentName", "assessmentCode", "collegeName", "date"];

    optionalFields.forEach((key) => {
      const cfg = buildTextConfig(req.body, key);

      if (cfg && isValidTextConfig(cfg)) {
        updateData[key] = cfg;       // update/add
      } else {
        unsetData[key] = "";         // remove from DB
      }
    });

    // ===== CERTIFICATE IMAGE (optional) =====
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "certificates" }
      );
      updateData.certificateImage = uploadResult.secure_url;
    }

    const updatedCertificate = await certificateModel.findByIdAndUpdate(
      id,
      {
        ...(Object.keys(updateData).length && { $set: updateData }),
        ...(Object.keys(unsetData).length && { $unset: unsetData }),
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Certificate updated successfully",
      certificate: updatedCertificate,
    });

  } catch (error) {
    console.error("UPDATE CERTIFICATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// DELETE certificate by ID

export const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    if(!id) return res.status(400).json({success:false, message:"Certificate ID is required"} )

    const certificate = await certificateModel.findById(id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    //  Extract public_id from Cloudinary URL
    if (certificate.certificateImage) {
      const imageUrl = certificate.certificateImage;

      const publicId = imageUrl
        .split("/")
        .slice(-2)
        .join("/")
        .replace(/\.[^/.]+$/, ""); // remove extension

      await cloudinary.uploader.destroy(publicId);
    }

    await certificateModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Certificate deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Toggle certificate stauts

export const toggleCertificateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Certificate ID is required"
      });
    }

    const certificate = await certificateModel.findById(id);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found"
      });
    }

    certificate.status = !certificate.status;
    await certificate.save();

    return res.status(200).json({
      success: true,
      message: `Certificate ${certificate.status ? "Activated" : "DeActivated"}`,
      status: certificate.status
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};






