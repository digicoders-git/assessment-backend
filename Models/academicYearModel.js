import mongoose from "mongoose";

const academicYearSchema = new mongoose.Schema(
  {
    academicYear: {
      type: String,
      required: true,
      unique: true,
      trim: true
    }
  },
  { timestamps: true }
);

const academicYearModel = mongoose.model("AcademicYear", academicYearSchema);

export default academicYearModel;
