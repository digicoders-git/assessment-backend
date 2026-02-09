import mongoose from "mongoose";
import dotenv from "dotenv";

import resultModel from "../Models/resultModel.js";
import studentModel from "../Models/studentModel.js";

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");

    // ONLY docs jisme assessmentCode NAHI hai
    const results = await resultModel
      .find({ assessmentCode: { $exists: false } })
      .populate("student", "code")
      .lean();

    let updated = 0;

    for (const r of results) {
      if (!r.student?.code) continue;

      await resultModel.updateOne(
        { _id: r._id },
        { $set: { assessmentCode: r.student.code } }
      );

      updated++;
    }

    console.log(`Done. Updated ${updated} documents`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
