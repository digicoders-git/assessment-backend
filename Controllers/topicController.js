import topicModel from "../Models/topic.js";
import questionModel from "../Models/questionModel.js";



export const createTopic = async (req, res) => {
  try {
    const { topicName } = req.body;
    if (!topicName) {
      return res.status(400).json({success:false, message: "topicName required" });
    }

    const existTopic = await topicModel.findOne({ topicName }) ;

    if(existTopic) return res.status(400).json({success:false,message: "Topic already exists"})

    const topic = await topicModel.create({ topicName });
    res.status(201).json({success:true, message: "Topic created", topic });
  } catch (error) {
    res.status(500).json({success:false, message: error.message });
  }
};


export const getAllTopics = async (req, res) => {
  try {
    const questionCounts = await questionModel.aggregate([
      {
        $group: {
          _id: "$topic",
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = {};
    questionCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    const topics = await topicModel.find().lean();

    const updatedTopics = topics.map(topic => ({
      ...topic,
      questionCout: countMap[topic._id.toString()] || 0
    }));

    const bulkOps = updatedTopics.map(topic => ({
      updateOne: {
        filter: { _id: topic._id },
        update: { $set: { questionCout: topic.questionCout } }
      }
    }));

    if (bulkOps.length) {
      await topicModel.bulkWrite(bulkOps);
    }

    res.status(200).json({
      success: true,
      message: "All topics with question count",
      topics: updatedTopics
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const toggleTopicStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const topic = await topicModel.findById(id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    // toggle status
    topic.status = !topic.status;
    await topic.save();

    res.status(200).json({
      success: true,
      message: `Topic ${topic.status ? "Activated" : "Deactivated"}`,
      status: topic.status
    });

  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
};


export const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { topicName } = req.body;

    const topic = await topicModel.findByIdAndUpdate(
      id,
      { topicName },
      { new: true, runValidators: true }
    );

    if (!topic) {
      return res.status(404).json({success:false, message: "Topic not found" });
    }

    res.status(200).json({success:true, message: "Topic updated", topic });
  } catch (error) {
    res.status(500).json({success:false, message: error.message });
  }
};


export const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;

    const topic = await topicModel.findByIdAndDelete(id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    await questionModel.deleteMany({ topic: id });

    res.status(200).json({
      success: true,
      message: "Topic and related questions deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

