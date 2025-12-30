import mongoose from "mongoose";

const questionIdCollectionSchema = new mongoose.Schema({
    assesmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assesment",
        required: true
    },
    questionIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true
        }
    ]
}, { timestamps: true });

const assesmentQuestionIdModel = mongoose.model("assesmentQuestion", questionIdCollectionSchema);

export default assesmentQuestionIdModel;
