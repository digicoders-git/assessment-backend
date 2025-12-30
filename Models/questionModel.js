import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true }
  },
  correctOption: {
    type: String,
    enum: ["A", "B", "C", "D"],
    required: true
  }
});

//  COMPOUND UNIQUE INDEX
questionSchema.index(
  { topic: 1, question: 1 },
  { unique: true }
);

const questionModel = mongoose.model("Question", questionSchema);

export default questionModel;
