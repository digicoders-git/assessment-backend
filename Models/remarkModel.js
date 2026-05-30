import mongoose from "mongoose";

const remarkSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
}, { timestamps: true });

const remarkModel = mongoose.model('remark', remarkSchema);
export default remarkModel;
