
import mongoose from "mongoose";
import assesmentQuestionIdModel from "../Models/assesmentQuestionsModel.js";
import questionModel from "../Models/questionModel.js";
import assessmentModel from "../Models/assesmentModel.js";
import { toKolkataTime } from "../utils/timezoneHelper.js";

export const addQuestionsToAssessment = async (req, res) => {
  try {
    const { id } = req.params; // assessmentId
    const { courseId, yearId, questionIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid assessmentId" });
    }
    if (!courseId || !yearId) {
      return res.status(400).json({ success: false, message: "courseId and yearId are required" });
    }
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ success: false, message: "questionIds must be a non-empty array" });
    }

    const assessment = await assessmentModel.findById(id).select("totalQuestions");
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    const validIds = questionIds.filter(qid => mongoose.Types.ObjectId.isValid(qid));
    if (validIds.length !== questionIds.length) {
      return res.status(400).json({ success: false, message: "One or more invalid questionIds" });
    }

    let doc = await assesmentQuestionIdModel.findOne({ assesmentId: id });

    if (!doc) {
      doc = await assesmentQuestionIdModel.create({
        assesmentId: id,
        questionIds: [],
        courseYearGroups: []
      });
    }

    // Find existing group for this course+year
    const groupIndex = doc.courseYearGroups.findIndex(
      g => g.course.toString() === courseId && g.year.toString() === yearId
    );

    if (groupIndex === -1) {
      // New group
      doc.courseYearGroups.push({ course: courseId, year: yearId, questionIds: validIds });
    } else {
      // Merge unique ids
      const existingSet = new Set(doc.courseYearGroups[groupIndex].questionIds.map(q => q.toString()));
      const newIds = validIds.filter(qid => !existingSet.has(qid.toString()));
      doc.courseYearGroups[groupIndex].questionIds.push(...newIds);
    }

    // Also update flat questionIds for backward compat
    const allGroupIds = doc.courseYearGroups.flatMap(g => g.questionIds.map(q => q.toString()));
    const uniqueAll = [...new Set(allGroupIds)];
    doc.questionIds = uniqueAll;

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Questions assigned successfully",
      added: validIds.length
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


export const getAssesmentByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { course, year } = req.query; // student's course & year (string values)

    const assessment = await assessmentModel.findOne({
      assessmentCode: code.toUpperCase()
    });

    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    const assesment = await assesmentQuestionIdModel
      .findOne({ assesmentId: assessment._id })
      .populate({ path: "assesmentId" })
      .populate({
        path: "courseYearGroups.questionIds",
        populate: { path: "topic" }
      })
      .populate({
        path: "questionIds",
        populate: { path: "topic" }
      })
      .populate("courseYearGroups.course", "course")
      .populate("courseYearGroups.year", "academicYear");

    if (!assesment) {
      return res.status(200).json({
        success: true,
        message: "No questions assigned yet",
        count: 0,
        assessment,
        questions: []
      });
    }

    // If student's course+year provided, filter questions from matching group
    let filteredQuestionIds = assesment.questionIds;

    if (course && year) {
      if (!assesment.courseYearGroups || assesment.courseYearGroups.length === 0) {
        // No course+year groups assigned yet
        filteredQuestionIds = [];
      } else {
        const matchingGroup = assesment.courseYearGroups.find(g => {
          const gCourse = (g.course?.course || g.course?.toString() || '').toLowerCase().trim();
          const gYear = (g.year?.academicYear || g.year?.toString() || '').toLowerCase().trim();
          return gCourse === course.toLowerCase().trim() && gYear === year.toLowerCase().trim();
        });

        if (matchingGroup) {
          filteredQuestionIds = matchingGroup.questionIds;
        } else {
          filteredQuestionIds = [];
        }
      }
    }

    const responseData = {
      ...assesment.toObject(),
      questionIds: filteredQuestionIds,
      assesmentId: {
        ...assesment.assesmentId.toObject(),
        startDateTime: toKolkataTime(assesment.assesmentId.startDateTime),
        endDateTime: toKolkataTime(assesment.assesmentId.endDateTime),
        createdAt: toKolkataTime(assesment.assesmentId.createdAt),
        updatedAt: toKolkataTime(assesment.assesmentId.updatedAt)
      }
    };

    return res.status(200).json({ success: true, data: responseData });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteQuestionFromAssessment = async (req, res) => {
  try {
    const { assesmentQuestionId, questionId } = req.params;

    const doc = await assesmentQuestionIdModel.findById(assesmentQuestionId);
    if (!doc) {
      return res.status(404).json({ success: false, message: "AssesmentQuestionId not found" });
    }

    // Remove from flat list
    doc.questionIds = doc.questionIds.filter(q => q.toString() !== questionId);

    // Remove from all courseYearGroups
    doc.courseYearGroups.forEach(g => {
      g.questionIds = g.questionIds.filter(q => q.toString() !== questionId);
    });
    doc.markModified('courseYearGroups');

    await doc.save();

    res.status(200).json({ success: true, message: "Question deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
