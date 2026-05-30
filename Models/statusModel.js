import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const statusModel = mongoose.model('status', statusSchema);
export default statusModel;
