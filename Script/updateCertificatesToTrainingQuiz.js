import mongoose from "mongoose";
import dotenv from "dotenv";
import assessmentModel from "../Models/assesmentModel.js";
import certificateModel from "../Models/certificateModel.js";

dotenv.config();

async function updateCertificates() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const targetCertId = "6a2cf0da392c9ac737d14b34";
  const cert = await certificateModel.findById(targetCertId);
  if (!cert) throw new Error("Certificate template not found: " + targetCertId);
  console.log("Found Certificate Template:", cert.certificateName, cert._id);

  // Update Assessment 1: DCT3152
  const updated1 = await assessmentModel.findOneAndUpdate(
    { assessmentCode: "DCT3152" },
    { certificateName: cert._id },
    { new: true }
  );
  console.log("Updated Assessment DCT3152:", {
    code: updated1.assessmentCode,
    name: updated1.assessmentName,
    certificateName: cert.certificateName,
    certificateId: updated1.certificateName
  });

  // Update Assessment 2: DCT3162
  const updated2 = await assessmentModel.findOneAndUpdate(
    { assessmentCode: "DCT3162" },
    { certificateName: cert._id },
    { new: true }
  );
  console.log("Updated Assessment DCT3162:", {
    code: updated2.assessmentCode,
    name: updated2.assessmentName,
    certificateName: cert.certificateName,
    certificateId: updated2.certificateName
  });

  await mongoose.disconnect();
  console.log("Done!");
}

updateCertificates().catch(err => {
  console.error("Error updating certificates:", err);
  mongoose.disconnect();
  process.exit(1);
});

