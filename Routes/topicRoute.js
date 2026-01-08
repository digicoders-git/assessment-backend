import express from "express";
import { createTopic, deleteTopic, getAllTopics, toggleTopicStatus, updateTopic } from "../Controllers/topicController.js";
import adminAuth from "../Middleware/adminAuth.js";


const topicRouter = express.Router();

topicRouter.post("/topic/create",adminAuth, createTopic);
topicRouter.get("/topic/get",adminAuth, getAllTopics);
topicRouter.patch("/topic/:id",adminAuth, toggleTopicStatus);
topicRouter.put("/topic/update/:id",adminAuth, updateTopic);
topicRouter.delete("/topic/delete/:id",adminAuth, deleteTopic);

export default topicRouter;
