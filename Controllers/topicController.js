import topicModel from "../Models/topic.js";



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
    const topics = await topicModel.find();
    res.status(200).json({success:true, message: "All topics", topics });
  } catch (error) {
    res.status(500).json({success:false, message: error.message });
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
      return res.status(404).json({success:false, message: "Topic not found" });
    }

    res.status(200).json({success:true, message: "Topic deleted" });
  } catch (error) {
    res.status(500).json({success:false, message: error.message });
  }
};
