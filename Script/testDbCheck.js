import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "assessment-backend/.env" });

async function run() {
  const connUri = process.env.MONGO_URI.replace("mongodb+srv://", "mongodb://");
  // Try normal connect with directConnection or standard
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    const Assessment = mongoose.model("Assessment", new mongoose.Schema({}, { strict: false }));
    const sampleCW = await Assessment.findOne({ assessmentType: "College Workshop" }).select("assessmentCode assessmentName assessmentType createdAt").lean();
    console.log("Sample CW:", sampleCW);
    const countCW = await Assessment.countDocuments({ assessmentType: "College Workshop" });
    const countTC = await Assessment.countDocuments({ assessmentType: "Training Class" });
    const countNoType = await Assessment.countDocuments({ assessmentType: { $exists: false } });
    console.log({ countCW, countTC, countNoType });
    await mongoose.disconnect();
  } catch (err) {
    console.error("CONN ERROR:", err.message);
  }
}

run();
