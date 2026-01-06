

import mongoose from "mongoose";

const studenResultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    assesmentQuestions: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'assesmentQuestion',
        required: true
    },
    answers: [
        {
            question: { type: mongoose.Schema.Types.ObjectId,ref: 'Question' },
            selectedOption: { type: String},
            isCorrect: { type: Boolean }
        }
    ],
    total: {
        type: String,
        required: true
    },
    attempted: {
        type: String,
        required: true
    },
    unattempted: {
        type: String,
        required: true
    },
    correct: {
        type: String,
        required: true
    },
    incorrect: {
        type: String,
        required: true
    },
    marks: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    rank: {
        type: String,
        required: false
    }
},{ timestamps: true })

const resultModel = mongoose.model('result',studenResultSchema);

export default resultModel;