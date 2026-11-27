import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "assessment-backend/.env" });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const Assessment = mongoose.model("Assessment", new mongoose.Schema({}, { strict: false }));
  
  const total = await Assessment.countDocuments({});
  const cw = await Assessment.countDocuments({ assessmentType: "College Workshop" });
  const tc = await Assessment.countDocuments({ assessmentType: "Training Class" });
  const noType = await Assessment.countDocuments({ assessmentType: { $exists: false } });
  const nullType = await Assessment.countDocuments({ assessmentType: null });
  
  console.log("DB Stats:", { total, cw, tc, noType, nullType });
  await mongoose.disconnect();
}

check().catch(console.error);
