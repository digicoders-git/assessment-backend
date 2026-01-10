
import mongoose from "mongoose";
import assesmentQuestionIdModel from "../Models/assesmentQuestionsModel.js";
import questionModel from "../Models/questionModel.js";
import assessmentModel from "../Models/assesmentModel.js";
import { toKolkataTime } from "../utils/timezoneHelper.js";

export const addQuestionsToAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionIds } = req.body;

    // 1️⃣ assessmentId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessmentId"
      });
    }

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "questionIds must be a non-empty array"
      });
    }

    // 2️⃣ Get assessment & totalQuestions
    const assessment = await assessmentModel.findById(id).select("totalQuestions");
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found"
      });
    }

    const totalQuestionsLimit = assessment.totalQuestions;

    // 3️⃣ Validate questionIds
    const validIds = questionIds.filter(qid =>
      mongoose.Types.ObjectId.isValid(qid)
    );

    if (validIds.length !== questionIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more invalid questionIds"
      });
    }

    const existingQuestions = await questionModel.find({
      _id: { $in: validIds }
    }).select("_id");

    if (existingQuestions.length !== validIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more questions do not exist"
      });
    }

    // 4️⃣ Get existing assigned questions
    let assessmentQuestions = await assesmentQuestionIdModel.findOne({
      assesmentId: id
    });

    const existingCount = assessmentQuestions
      ? assessmentQuestions.questionIds.length
      : 0;

    // 🔴 LIMIT FULL
    if (existingCount >= totalQuestionsLimit) {
      return res.status(400).json({
        success: false,
        message: "Question limit already reached. Cannot add more questions.",
        totalQuestionsLimit,
        existingCount,
        added: 0,
        failed: validIds.length,
        reason: "Assessment already has maximum questions"
      });
    }

    // 5️⃣ Remove duplicates
    const existingSet = assessmentQuestions
      ? new Set(assessmentQuestions.questionIds.map(id => id.toString()))
      : new Set();

    const uniqueNewIds = validIds.filter(
      qid => !existingSet.has(qid.toString())
    );

    if (uniqueNewIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No new questions to add (all already assigned)",
        added: 0,
        failed: 0
      });
    }

    //  Apply limit logic
    const remainingSlots = totalQuestionsLimit - existingCount;

    const questionsToAdd = uniqueNewIds.slice(0, remainingSlots);
    const failedQuestions = uniqueNewIds.slice(remainingSlots);

    //  Save
    if (!assessmentQuestions) {
      assessmentQuestions = await assesmentQuestionIdModel.create({
        assesmentId: id,
        questionIds: questionsToAdd
      });
    } else {
      await assesmentQuestionIdModel.updateOne(
        { assesmentId: id },
        { $addToSet: { questionIds: { $each: questionsToAdd } } }
      );
    }

    //  Final response
    return res.status(200).json({
      success: true,
      message: "Questions assignment processed",
      totalQuestionsLimit,
      previouslyAssigned: existingCount,
      requested: validIds.length,
      added: questionsToAdd.length,
      failed: failedQuestions.length,
      failedReason:
        failedQuestions.length > 0
          ? "Assessment question limit exceeded"
          : null
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


export const getAssesmentByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const assessment = await assessmentModel.findOne({
      assessmentCode: code.toUpperCase()
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found"
      });
    }

    const assesment = await assesmentQuestionIdModel
      .findOne({ assesmentId: assessment._id })
      .populate({
        path: "assesmentId"
      })
      .populate({
        path: "questionIds",
        populate: { path: "topic" }
      });

    if (!assesment) {
      return res.status(200).json({
        success: true,
        message: "No questions assigned yet",
        count: 0,
        assessment,
        questions: []
      });
    }


    //  KOLKATA TIMEZONE FIX
    const responseData = {
      ...assesment.toObject(),
      assesmentId: {
        ...assesment.assesmentId.toObject(),
        startDateTime: toKolkataTime(assesment.assesmentId.startDateTime),
        endDateTime: toKolkataTime(assesment.assesmentId.endDateTime),
        createdAt: toKolkataTime(assesment.assesmentId.createdAt),
        updatedAt: toKolkataTime(assesment.assesmentId.updatedAt)
      }
    };

    return res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
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
