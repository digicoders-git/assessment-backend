
import mongoose from "mongoose";
import assesmentQuestionIdModel from "../Models/assesmentQuestionsModel.js";
import questionModel from "../Models/questionModel.js";

export const addQuestionsToAssessment = async (req, res) => {
    try {
        const { id } = req.params; // assessmentId
        const { questionIds } = req.body;

        if (!Array.isArray(questionIds) || !questionIds.length) {
            return res.status(400).json({
                success: false,
                message: "questions required"
            });
        }

        //  validate ObjectId format
        const validIds = questionIds.filter(qid =>
            mongoose.Types.ObjectId.isValid(qid)
        );

        if (validIds.length !== questionIds.length) {
            return res.status(400).json({
                success: false,
                message: "One or more invalid ObjectIds"
            });
        }

        //  check existence in Question collection
        const existingQuestions = await questionModel.find({
            _id: { $in: validIds }
        }).select("_id");

        if (existingQuestions.length !== validIds.length) {
            return res.status(400).json({
                success: false,
                message: "One or more questions do not exist"
            });
        }

        //  save only verified IDs
        await assesmentQuestionIdModel.create({
            assesmentId: id,
            questionIds: validIds
        });

        return res.status(201).json({
            success: true,
            message: "Questions Assigned"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAssesmentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) { return res.status(400).json({ success: false, message: "Assessment Id required" }) }

        const assesment = await assesmentQuestionIdModel.findOne({ _id: id }).populate({
            path: "questionIds",
            populate: {
                path: "topic"
            }
        });

        if (!assesment) {
            return res.status(404).json({ success: false, message: "Assessment not found" });
        }

        res.status(200).json({ success: true, message: "Assessment found", data: assesment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteQuestionFromAssessment = async (req, res) => {
    try {
        const { assesmentQuestionId, questionId } = req.params;

        const existAssesmeQuestiontnId = await assesmentQuestionIdModel.findById({ _id: assesmentQuestionId });
        if (!existAssesmeQuestiontnId) {
            return res.status(404).json({ success: false, message: "AssesmentQuestionId not found" });
        }
        const questionArray = existAssesmeQuestiontnId.questionIds;
        const existQuestionId = questionArray.includes(questionId);

        if (!existQuestionId) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }
        await assesmentQuestionIdModel.findByIdAndUpdate({ _id: assesmentQuestionId }, { $pull: { questionIds: questionId } });

        res.status(200).json({ success: true, message: "Question deleted" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
