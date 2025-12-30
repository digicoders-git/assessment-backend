import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema({
  assessmentId: {
    type: Number,
    unique: true
  },
  assessmentName: {
    type: String,
    required: true,
    trim: true
  },
  assessmentCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  timeDuration: {
    type: Number,
    required: true
  },
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  generateCertificate: {
    type: Boolean,
    default: false
  },
  certificateName: {
    type: String
  },
  remark: {
    type: String
  },
  status: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const assessmentModel = mongoose.model('Assessment', assessmentSchema);

export default assessmentModel;
