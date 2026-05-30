import express from "express";
import { createStatus, getStatuses, deleteStatus } from "../Controllers/statusController.js";
import adminAuth from "../Middleware/adminAuth.js";

const statusRouter = express.Router();

statusRouter.post("/status", adminAuth, createStatus);
statusRouter.get("/status", adminAuth, getStatuses);
statusRouter.delete("/status/:id", adminAuth, deleteStatus);

export default statusRouter;
