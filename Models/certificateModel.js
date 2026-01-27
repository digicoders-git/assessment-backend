import mongoose from "mongoose";

const textFieldSchema = new mongoose.Schema(
  {
    fontFamily: { type: String, required: true },

    bold: { type: Boolean, default: false },
    italic: { type: Boolean, default: false },
    underline: { type: Boolean, default: false },

    fontSize: { type: String, required: true },
    textColor: { type: String, required: true },
    verticalPosition: { type: String, required: true },
    horizontalPosition: { type: String, required: true },
  },
  { _id: false }
);


const certificateSchema = new mongoose.Schema(
  {
    certificateName: {
      type: String,
      required: true,
      trim: true
    },
    certificateImage: {
      type: String, // cloudinary image URL
      required: true
    },

    studentName: {
      type: textFieldSchema,
      required: true
    },
    assessmentName: {
      type: textFieldSchema,
    },
    assessmentCode: {
      type: textFieldSchema,
    },
    collegeName: {
      type: textFieldSchema,
    },
    status: {
      type: Boolean,
      default: true
    },
    date: {
      type: textFieldSchema,
    },
    height: {
      type: String,
      required: true
    },
    width: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

const certificateModel = mongoose.model("Certificate", certificateSchema);
export default certificateModel;
