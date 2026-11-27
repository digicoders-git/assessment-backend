import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true
  },
  type: {
    type: String,
    enum: ["college", "assessment"],
    required: true
  },
  // If type === 'college', value is collegeName (or ID if applicable)
  // If type === 'assessment', value is assessmentCode
  targetId: {
    type: String,
    required: true
  },
  targetName: {
    type: String,
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true
  },
  status: {
    type: String,
    enum: ["active", "reassigned", "revoked"],
    default: "active"
  }
}, { timestamps: true });

assignmentSchema.index({ type: 1, targetId: 1, status: 1 });

const assignmentModel = mongoose.model("Assignment", assignmentSchema);
export default assignmentModel;
