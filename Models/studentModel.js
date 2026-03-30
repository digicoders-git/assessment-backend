import mongoose from "mongoose";

const Schema =  new mongoose.Schema({
    mobile:{
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    college: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    certificate: {
        type: String,
        required: false
    }
}, {timestamps: true});

const studentModel =
  mongoose.models.student || mongoose.model("student", Schema);

export default studentModel;