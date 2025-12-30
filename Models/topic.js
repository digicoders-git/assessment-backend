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
  }
});

const topicModel = mongoose.model('Topic', topicSchema);

export default topicModel;
