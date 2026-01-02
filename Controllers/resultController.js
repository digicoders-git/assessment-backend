import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import resultModel from "../Models/resultModel.js";


// create result
export const createResult = async (req, res) => {
  try {
    const {
      student,
      assesmentQuestions,
      answers = [],
      total,
      attempted,
      unattempted,
      correct,
      incorrect,
      marks,
      duration,
      rank
    } = req.body;

    if (
      !student ||
      !assesmentQuestions ||
      !total ||
      !attempted ||
      !unattempted ||
      !correct ||
      !incorrect ||
      !marks ||
      !duration ||
      !rank
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(student)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student id"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(assesmentQuestions)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessmentQuestions id"
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array"
      });
    }

    for (const ans of answers) {
      if (
        !ans.question ||
        !ans.selectedOption ||
        typeof ans.isCorrect !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid answer structure"
        });
      }

      if (!mongoose.Types.ObjectId.isValid(ans.question)) {
        return res.status(400).json({
          success: false,
          message: "Invalid question id in answers"
        });
      }
    }

    const result = await resultModel.create({
      student,
      assesmentQuestions,
      answers,
      total,
      attempted,
      unattempted,
      correct,
      incorrect,
      marks,
      duration,
      rank
    });

    return res.status(201).json({
      success: true,
      message:"Submitted",
      result
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


// get result by assesment
export const getResultsByAssessmentId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessmentId"
      });
    }

    const data = await resultModel.aggregate([
      // assesmentQuestions lookup
      {
        $lookup: {
          from: "assesmentquestions",
          localField: "assesmentQuestions",
          foreignField: "_id",
          as: "assesmentQuestions"
        }
      },
      { $unwind: "$assesmentQuestions" },

      // match assessmentId
      {
        $match: {
          "assesmentQuestions.assesmentId": new mongoose.Types.ObjectId(id)
        }
      },

      // student lookup
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },

      // sort by createdAt (IMPORTANT)
      { $sort: { createdAt: 1 } },

      // group by student mobile
      {
        $group: {
          _id: "$student.mobile",
          results: { $push: "$$ROOT" }
        }
      },

      // split firstSubmission & reattempt
      {
        $project: {
          firstSubmission: { $arrayElemAt: ["$results", 0] },
          reattempt: {
            $cond: [
              { $gt: [{ $size: "$results" }, 1] },
              { $slice: ["$results", 1, { $size: "$results" }] },
              []
            ]
          }
        }
      }
    ]);

    // flatten response
    const firstSubmission = [];
    const reattempt = [];

    data.forEach(item => {
      if (item.firstSubmission) {
        firstSubmission.push(item.firstSubmission);
      }
      if (item.reattempt.length > 0) {
        reattempt.push(...item.reattempt);
      }
    });

    // remove unwanted fields
    const clean = doc => {
      const { assesmentQuestions, answers, questions, topics, ...rest } = doc;
      return rest;
    };

    return res.status(200).json({
      success: true,
      firstSubmission: firstSubmission.map(clean),
      reattempt: reattempt.map(clean)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


// get result by student 

export const getResultsByStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studentId"
      });
    }

    const results = await resultModel
      .find({ student: new mongoose.Types.ObjectId(id) })
      .populate("student") 
      .populate({
        path: "answers.question",
        populate: { path: "topic" }
      })
      .sort({ createdAt: -1 });

    const formattedResults = results.map(result => ({
      student: result.student,  
      marks: result.marks,
      questions: result.answers.map(ans => ({
        _id: ans.question?._id,
        question: ans.question?.question,
        options: ans.question?.options, 
        selectedOption: ans.selectedOption,
        isCorrect: ans.isCorrect
      }))
    }));

    return res.status(200).json({
      success: true,
      count: formattedResults.length,
      results: formattedResults
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};














