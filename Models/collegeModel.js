import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    collegeName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const collegeModel = mongoose.model("College", collegeSchema);

export default collegeModel;
