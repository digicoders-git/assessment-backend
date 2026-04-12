import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false,
        default: null
    },
    userId: {
        type: String,
        required: false,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
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