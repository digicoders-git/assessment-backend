import express from "express";
import {
  getAssignableItems,
  assignItem,
  revokeAssignment,
  getUserAssignments,
  getAssignmentTracking,
  getTelecallerStats,
  getUserLeadReport
} from "../Controllers/assignmentController.js";
import adminAuth from "../Middleware/adminAuth.js";

const assignmentRouter = express.Router();

assignmentRouter.get("/assignable-items", adminAuth, getAssignableItems);
assignmentRouter.post("/assign", adminAuth, assignItem);
assignmentRouter.delete("/revoke/:id", adminAuth, revokeAssignment);
assignmentRouter.get("/user/:userId", adminAuth, getUserAssignments);
assignmentRouter.get("/tracking", adminAuth, getAssignmentTracking);
assignmentRouter.get("/telecaller-stats", adminAuth, getTelecallerStats);
assignmentRouter.get("/user-report", adminAuth, getUserLeadReport);

export default assignmentRouter;
