import mongoose from "mongoose";

const courseYearGroupSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  year: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true
  },
  questionIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question"
    }
  ]
}, { _id: false });

const questionIdCollectionSchema = new mongoose.Schema({
  assesmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assessment",
    unique: true,
    required: true,
    index: true
  },
  // Legacy flat list (kept for backward compat)
  questionIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question"
    }
  ],
  // New: per course+year groups
  courseYearGroups: [courseYearGroupSchema]
}, { timestamps: true });

const assesmentQuestionIdModel = mongoose.model("assesmentQuestion", questionIdCollectionSchema);

export default assesmentQuestionIdModel;
