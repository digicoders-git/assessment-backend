import qs from "qs";
import certificateModel from "../Models/certificateModel.js";
import cloudinary from "../Config/cloudinary.js";


/* ===== HELPER FUNCTIONS ===== */

const buildTextConfig = (body, prefix) => {
    return {
        fontFamily: body[`${prefix}.fontFamily`],
        fontStyle: body[`${prefix}.fontStyle`],
        fontSize: body[`${prefix}.fontSize`],
        textColor: body[`${prefix}.textColor`],
        verticalPosition: body[`${prefix}.verticalPosition`],
        horizontalPosition: body[`${prefix}.horizontalPosition`]
    };
};

const isValidTextConfig = (obj) => {
    return (
        obj &&
        obj.fontFamily &&
        obj.fontStyle &&
        obj.fontSize !== undefined &&
        obj.textColor &&
        obj.verticalPosition !== undefined &&
        obj.horizontalPosition !== undefined
    );
};

/* CREATE CERTIFICATE */

export const createCertificate = async (req, res) => {
    try {
        const { certificateName } = req.body;

        if (!certificateName) {
            return res.status(400).json({
                success: false,
                message: "certificateName is required"
            });
        }

        const studentName = buildTextConfig(req.body, "studentName");
        const assessmentName = buildTextConfig(req.body, "assessmentName");
        const assessmentCode = buildTextConfig(req.body, "assessmentCode");
        const collegeName = buildTextConfig(req.body, "collegeName");
        const date = buildTextConfig(req.body, "date");

        if (!isValidTextConfig(studentName)) {
            return res.status(400).json({ success: false, message: "studentName config invalid" });
        }

        if (!isValidTextConfig(assessmentName)) {
            return res.status(400).json({ success: false, message: "assessmentName config invalid" });
        }

        if (!isValidTextConfig(assessmentCode)) {
            return res.status(400).json({ success: false, message: "assessmentCode config invalid" });
        }

        if (!isValidTextConfig(collegeName)) {
            return res.status(400).json({ success: false, message: "collegeName config invalid" });
        }

        if (!isValidTextConfig(date)) {
            return res.status(400).json({ success: false, message: "date config invalid" });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "certificate image required"
            });
        }

        const uploadResult = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
            { folder: "certificates" }
        );

        const certificate = await certificateModel.create({
            certificateName,
            certificateImage: uploadResult.secure_url,
            studentName,
            assessmentName,
            assessmentCode,
            collegeName,
            date
        });

        return res.status(201).json({
            success: true,
            message: "Certificate created successfully",
            certificate
        });

    } catch (error) {
        console.error("CREATE CERTIFICATE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "internal server error"
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
        message: "Certificate ID is required"
      });
    }

    // Parse nested form-data fields correctly
    const updatedData = qs.parse(req.body);

    // Fetch existing certificate
    const existingCertificate = await certificateModel.findById(id);
    if (!existingCertificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found"
      });
    }

    // If new image uploaded
    if (req.file) {
      // Delete old image from Cloudinary (cost-safe)
      if (existingCertificate.certificateImage) {
        const publicId = existingCertificate.certificateImage
          .split("/")
          .pop()
          .split(".")[0];

        await cloudinary.uploader.destroy(`certificates/${publicId}`);
      }

      // Upload new image
      const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "certificates" }
      );

      updatedData.certificateImage = uploadResult.secure_url;
    }

    // Update certificate
    const updatedCertificate = await certificateModel.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Certificate updated successfully",
      certificate: updatedCertificate
    });

  } catch (error) {
    console.error("UPDATE CERTIFICATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
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






