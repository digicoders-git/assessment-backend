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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Certificate"
  },
  remark: {
    type: String
  },
  status: {
    type: Boolean,
    default: true
  },
  start:{
    type: Number,
    default:0
  },
  submit:{
    type: Number,
    default:0
  },
  count:{
    type:Number,
    default:0
  }
}, { timestamps: true });

const assessmentModel = mongoose.model('Assessment', assessmentSchema);

export default assessmentModel;
