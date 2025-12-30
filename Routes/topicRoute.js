import express from "express";
import { createTopic, deleteTopic, getAllTopics, toggleTopicStatus, updateTopic } from "../Controllers/topicController.js";


const topicRouter = express.Router();

topicRouter.post("/topic/create", createTopic);
topicRouter.get("/topic/get", getAllTopics);
topicRouter.patch("/topic/:id", toggleTopicStatus);
topicRouter.put("/topic/update/:id", updateTopic);
topicRouter.delete("/topic/delete/:id", deleteTopic);

export default topicRouter;
