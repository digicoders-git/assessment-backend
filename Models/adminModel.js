import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false,
        default: null
    }
},{timestamps:true})

const amdidnModel = mongoose.model("admin", adminSchema);

export default amdidnModel;