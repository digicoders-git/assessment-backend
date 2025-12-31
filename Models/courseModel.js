import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    course: {
      type: String,
      required: true,
      unique: true,
      trim: true
    }
  },
  { timestamps: true }
);

const courseModel = mongoose.model("Course", courseSchema);

export default courseModel;
