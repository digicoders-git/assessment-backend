
import mongoose from "mongoose";
import assesmentQuestionIdModel from "../Models/assesmentQuestionsModel.js";
import questionModel from "../Models/questionModel.js";
import assessmentModel from "../Models/assesmentModel.js";
import { toKolkataTime } from "../utils/timezoneHelper.js";

export const addQuestionsToAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId, yearId, questionIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid assessmentId" });
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

    if (courseId && yearId) {
      // Course+Year specific assignment
      const groupIndex = doc.courseYearGroups.findIndex(
        g => g.course.toString() === courseId && g.year.toString() === yearId
      );

      if (groupIndex === -1) {
        doc.courseYearGroups.push({ course: courseId, year: yearId, questionIds: validIds });
      } else {
        const existingSet = new Set(doc.courseYearGroups[groupIndex].questionIds.map(q => q.toString()));
        const newIds = validIds.filter(qid => !existingSet.has(qid.toString()));
        doc.courseYearGroups[groupIndex].questionIds.push(...newIds);
      }
      doc.markModified('courseYearGroups');
    } else {
      // General assignment (all students) - add to flat questionIds only, not in any group
      const existingSet = new Set(doc.questionIds.map(q => q.toString()));
      const newIds = validIds.filter(qid => !existingSet.has(qid.toString()));
      doc.questionIds.push(...newIds);
    }

    // Sync flat questionIds = general + all group questions
    const groupedIds = doc.courseYearGroups.flatMap(g => g.questionIds.map(q => q.toString()));
    const generalIds = doc.questionIds.map(q => q.toString()).filter(id => !groupedIds.includes(id));
    const allIds = [...new Set([...generalIds, ...groupedIds])];
    doc.questionIds = allIds;

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Questions assigned successfully",
      added: validIds.length,
      mode: courseId && yearId ? "course+year" : "general"
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


export const getAssesmentByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { course, year } = req.query;

    const assessment = await assessmentModel.findOne({
      assessmentCode: code.toUpperCase()
    }).populate("allowedYears", "academicYear");

    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    const assesment = await assesmentQuestionIdModel
      .findOne({ assesmentId: assessment._id })
      .populate({ path: "assesmentId", populate: { path: "allowedYears", select: "academicYear" } })
      .populate({ path: "courseYearGroups.questionIds", populate: { path: "topic" } })
      .populate({ path: "questionIds", populate: { path: "topic" } })
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

    let filteredQuestionIds = assesment.questionIds;

    if (course && year) {
      const hasCourseYearGroups = assesment.courseYearGroups && assesment.courseYearGroups.length > 0;

      if (hasCourseYearGroups) {
        // Try to find matching course+year group
        const matchingGroup = assesment.courseYearGroups.find(g => {
          const gCourseId = g.course?._id?.toString() || g.course?.toString() || '';
          const gYearId = g.year?._id?.toString() || g.year?.toString() || '';
          const gCourseName = (g.course?.course || '').toLowerCase().trim();
          const gYearName = (g.year?.academicYear || '').toLowerCase().trim();
          const qCourse = course.toLowerCase().trim();
          const qYear = year.toLowerCase().trim();
          return (gCourseId === qCourse || gCourseName === qCourse) &&
                 (gYearId === qYear || gYearName === qYear);
        });

        if (matchingGroup && matchingGroup.questionIds.length > 0) {
          // Found specific group for this course+year
          filteredQuestionIds = matchingGroup.questionIds;
        } else {
          // No specific group - return general questions (not in any group)
          const groupedIdSet = new Set(
            assesment.courseYearGroups.flatMap(g =>
              g.questionIds.map(q => q._id?.toString() || q.toString())
            )
          );
          const generalQuestions = assesment.questionIds.filter(
            q => !groupedIdSet.has(q._id?.toString() || q.toString())
          );
          filteredQuestionIds = generalQuestions;
        }
      }
      // If no courseYearGroups at all - return all flat questionIds (general mode)
    }

    if (!filteredQuestionIds || filteredQuestionIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions assigned for your course and year. Please contact admin."
      });
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

    doc.questionIds = doc.questionIds.filter(q => q.toString() !== questionId);

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
