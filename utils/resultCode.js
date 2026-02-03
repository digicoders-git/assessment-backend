import mongoose from "mongoose";
import resultModel from "../Models/resultModel.js";
import studentModel from "../Models/studentModel.js";

import dotenv from "dotenv";
dotenv.config();


const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");

    const results = await resultModel.find()
      .populate("student", "code")
      .lean();

    console.log("Total results found:", results.length);

    let updated = 0;

    for (const r of results) {
      if (!r.student || !r.student.code) continue;

      await resultModel.updateOne(
        { _id: r._id },
        { $set: { assessmentCode: r.student.code } }
      );

      updated++;
    }

    console.log(`Migration done Updated ${updated} results`);
    process.exit();
  } catch (err) {
    console.error("Migration error", err);
    process.exit(1);
  }
};

migrate();
