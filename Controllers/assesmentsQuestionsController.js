
import mongoose from "mongoose";
import assesmentQuestionIdModel from "../Models/assesmentQuestionsModel.js";
import questionModel from "../Models/questionModel.js";

export const addQuestionsToAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid assessmentId" });
    }

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ success: false, message: "questionIds must be a non-empty array" });
    }

    const validIds = questionIds.filter(qid =>
      mongoose.Types.ObjectId.isValid(qid)
    );

    if (validIds.length !== questionIds.length) {
      return res.status(400).json({ success: false, message: "One or more invalid questionIds" });
    }

    const existingQuestions = await questionModel.find({
      _id: { $in: validIds }
    }).select("_id");

    if (existingQuestions.length !== validIds.length) {
      return res.status(400).json({ success: false, message: "One or more questions do not exist" });
    }

    let assessmentQuestions = await assesmentQuestionIdModel.findOne({ assesmentId: id });

    if (!assessmentQuestions) {
      assessmentQuestions = await assesmentQuestionIdModel.create({
        assesmentId: id,
        questionIds: validIds
      });

      return res.status(201).json({
        success: true,
        message: "Questions assigned successfully"
      });
    }

    const existingSet = new Set(
      assessmentQuestions.questionIds.map(q => q.toString())
    );

    const newUniqueIds = validIds.filter(
      qid => !existingSet.has(qid.toString())
    );

    if (newUniqueIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No new questions to add"
      });
    }

    await assesmentQuestionIdModel.updateOne(
      { assesmentId: id },
      { $addToSet: { questionIds: { $each: newUniqueIds } } }
    );

    return res.status(200).json({
      success: true,
      message: "New questions added successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
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
