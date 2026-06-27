import qs from "qs";
import certificateModel from "../Models/certificateModel.js";
import sizeOf from "image-size";
import fs from "fs";
import cloudinary from "../Config/cloudinary.js";
import path from "path";



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

    // 1️⃣ basic validation
    if (!certificateName) {
      return res.status(400).json({
        success: false,
        message: "certificateName is required",
      });
    }

    // 2️⃣ unique check
    const exists = await certificateModel.findOne({ certificateName });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "certificateName must be unique",
      });
    }

    // 3️⃣ image required
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "certificate image required",
      });
    }

    // 4️⃣ REQUIRED field
    const studentName = buildTextConfig(req.body, "studentName");
    if (!isValidTextConfig(studentName)) {
      return res.status(400).json({
        success: false,
        message: "studentName config invalid",
      });
    }

    // 5️⃣ OPTIONAL fields
    const optionalFields = [
      "assessmentName",
      "assessmentCode",
      "collegeName",
      "date",
    ];

    const optionalData = {};
    optionalFields.forEach((key) => {
      const cfg = buildTextConfig(req.body, key);
      if (cfg && isValidTextConfig(cfg)) {
        optionalData[key] = cfg;
      }
    });

    // 6️⃣ ORIGINAL IMAGE SIZE (LOCAL FILE)
    const imageBuffer = fs.readFileSync(req.file.path);
    const { width, height } = sizeOf(imageBuffer);


    // 7️⃣ LOCAL IMAGE URL
    const certificateImageUrl = `${process.env.CERT_BASE_URL}/uploads/certificates/${req.file.filename}`;

    // 8️⃣ SAVE TO DB
    const certificate = await certificateModel.create({
      certificateName,
      certificateImage: certificateImageUrl,
      studentName,
      ...optionalData,
      width,
      height,
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
    res.status(200).json({ success: true, message: "certificates found", certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// GET single certificate by ID
export const getSingleCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Certificate ID is required" });
    const certificate = await certificateModel.findById(id);
    if (!certificate) return res.status(404).json({ success: false, message: "Certificate not found" });
    res.status(200).json(certificate);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
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

    // ===== STUDENT NAME (never unset) =====
    const studentName = buildTextConfig(req.body, "studentName");
    if (studentName && isValidTextConfig(studentName)) {
      updateData.studentName = studentName;
    }

    // ===== OPTIONAL FIELDS =====
    const optionalFields = [
      "assessmentName",
      "assessmentCode",
      "collegeName",
      "date"
    ];

    optionalFields.forEach((key) => {
      const cfg = buildTextConfig(req.body, key);

      if (cfg && isValidTextConfig(cfg)) {
        updateData[key] = cfg;
      } else {
        unsetData[key] = "";
      }
    });

    // ===== CERTIFICATE IMAGE (LOCAL) =====
    if (req.file) {
      const certificateUrl =
        `${process.env.CERT_BASE_URL}/uploads/certificates/${req.file.filename}`;

      updateData.certificateImage = certificateUrl;
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

    const certificate = await certificateModel.findById(id);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const imageUrl = certificate.certificateImage;

    // 🔹 CASE 1: CLOUDINARY IMAGE
    if (imageUrl && imageUrl.includes("cloudinary")) {
      // extract public_id
      const parts = imageUrl.split("/");
      const fileName = parts[parts.length - 1]; // abc123.png
      const publicId = `certificates/${fileName.split(".")[0]}`;

      await cloudinary.uploader.destroy(publicId);
    }

    // 🔹 CASE 2: LOCAL IMAGE
    else if (imageUrl) {
      // imageUrl example:
      // http://localhost:5000/uploads/certificates/abc.png

      const filePath = imageUrl.split("/uploads/")[1]; 
      if (filePath) {
        const fullPath = path.join(
          process.cwd(),
          "uploads",
          filePath
        );

        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    // 🔹 DELETE DB DOCUMENT
    await certificateModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Certificate and image deleted successfully",
    });

  } catch (error) {
    console.error("DELETE CERTIFICATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete certificate",
    });
  }
};
;

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

/* DUPLICATE CERTIFICATE */
export const duplicateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { certificateName } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Original Certificate ID is required",
      });
    }

    if (!certificateName) {
      return res.status(400).json({
        success: false,
        message: "New Certificate Name is required",
      });
    }

    // Check if name is already taken
    const exists = await certificateModel.findOne({ certificateName });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "A certificate with this name already exists",
      });
    }

    // Find original certificate
    const original = await certificateModel.findById(id);
    if (!original) {
      return res.status(404).json({
        success: false,
        message: "Original certificate not found",
      });
    }

    let newImageUrl = original.certificateImage;

    // Duplicate image to avoid shared deletion side effects
    if (newImageUrl) {
      // Case 1: Local Image
      if (newImageUrl.includes("/uploads/certificates/")) {
        const parts = newImageUrl.split("/uploads/certificates/");
        const originalFilename = parts[1];
        if (originalFilename) {
          const ext = path.extname(originalFilename);
          const baseName = path.basename(originalFilename, ext);
          const newFilename = `${baseName}-copy-${Date.now()}${ext}`;
          
          const srcPath = path.join(process.cwd(), "uploads", "certificates", originalFilename);
          const destPath = path.join(process.cwd(), "uploads", "certificates", newFilename);
          
          if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            const prefix = parts[0];
            newImageUrl = `${prefix}/uploads/certificates/${newFilename}`;
          }
        }
      }
      // Case 2: Cloudinary Image
      else if (newImageUrl.includes("cloudinary")) {
        try {
          const uploadRes = await cloudinary.uploader.upload(newImageUrl, {
            folder: "certificates",
          });
          newImageUrl = uploadRes.secure_url;
        } catch (cloudinaryErr) {
          console.error("Cloudinary duplication failed, using original URL fallback:", cloudinaryErr);
        }
      }
    }

    // Clone configuration
    const newCertificate = await certificateModel.create({
      certificateName,
      certificateImage: newImageUrl,
      studentName: original.studentName,
      assessmentName: original.assessmentName,
      assessmentCode: original.assessmentCode,
      collegeName: original.collegeName,
      date: original.date,
      height: original.height,
      width: original.width,
      status: true
    });

    return res.status(201).json({
      success: true,
      message: "Certificate duplicated successfully",
      certificate: newCertificate,
    });
  } catch (error) {
    console.error("DUPLICATE CERTIFICATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};







