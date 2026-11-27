import mongoose from "mongoose";

const assignmentLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["college", "assessment"],
    required: true
  },
  targetId: {
    type: String,
    required: true
  },
  targetName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ["assigned", "reassigned", "revoked"],
    required: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    default: null
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true
  }
}, { timestamps: true });

assignmentLogSchema.index({ toUser: 1, createdAt: -1 });

const assignmentLogModel = mongoose.model("AssignmentLog", assignmentLogSchema);
export default assignmentLogModel;
