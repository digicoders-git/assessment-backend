import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  topicName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status:{
    type: Boolean,
    default: true
  },
  questionCout: {
    type: Number,
    default: 0
  }
});

const topicModel = mongoose.model('Topic', topicSchema);

export default topicModel;
