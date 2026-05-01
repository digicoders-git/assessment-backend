
import XLSX from "xlsx";
import questionModel from "../Models/questionModel.js";
import topicModel from "../Models/topic.js";
import courseModel from "../Models/courseModel.js";
import academicYearModel from "../Models/academicYearModel.js";

export const createQuestions = async (req, res) => {
  try {
    const { id } = req.params; // topicId
    const { questions, courseId, yearId } = req.body;

    if (!id || !questions || !questions.length || !courseId || !yearId) {
      return res.status(400).json({ success: false, message: "topicId, courseId, yearId and questions are required" });
    }

    const [existTopic, existCourse, existYear] = await Promise.all([
      topicModel.findById(id),
      courseModel.findById(courseId),
      academicYearModel.findById(yearId)
    ]);

    if (!existTopic) return res.status(404).json({ success: false, message: "Topic not found" });
    if (!existCourse) return res.status(404).json({ success: false, message: "Course not found" });
    if (!existYear) return res.status(404).json({ success: false, message: "Year not found" });

    const payload = questions.map(q => ({
      topic: id,
      course: courseId,
      year: yearId,
      question: q.question.trim(),
      options: q.options,
      correctOption: q.correctOption
    }));

    let insertedCount = 0;
    try {
      const result = await questionModel.insertMany(payload, { ordered: false });
      insertedCount = result.length;
    } catch (err) {
      if (err.code === 11000) {
        insertedCount = err.insertedDocs?.length || 0;
      } else {
        throw err;
      }
    }

    return res.status(201).json({
      success: true,
      message: "Questions processed",
      totalReceived: payload.length,
      inserted: insertedCount,
      skipped: payload.length - insertedCount
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getQuestionsByTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId, yearId } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, message: "TopicId is required" });
    }

    const filter = { topic: id };
    if (courseId) filter.course = courseId;
    if (yearId) filter.year = yearId;

    const questions = await questionModel.find(filter)
      .populate("course", "course")
      .populate("year", "academicYear");

    if (!questions.length) {
      return res.status(200).json({ success: true, message: "No questions found for the given topic" });
    }

    res.status(200).json({ success: true, message: "Questions found", questions });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await questionModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    res.status(201).json({ success: true, message: "Question updated", question });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await questionModel.findByIdAndDelete(id);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    res.status(200).json({ success: true, message: "Question deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const importQuestionsFromExcel = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId, yearId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Excel file is required" });
    }
    if (!id || !courseId || !yearId) {
      return res.status(400).json({ success: false, message: "topicId, courseId and yearId are required" });
    }

    const [topic, course, year] = await Promise.all([
      topicModel.findById(id),
      courseModel.findById(courseId),
      academicYearModel.findById(yearId)
    ]);

    if (!topic) return res.status(404).json({ success: false, message: "Topic not found" });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (!year) return res.status(404).json({ success: false, message: "Year not found" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return res.status(400).json({ success: false, message: "Invalid Excel file" });

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows.length) return res.status(400).json({ success: false, message: "Excel file is empty" });

    const questions = [];
    const failedRows = [];

    rows.forEach((row, index) => {
      const { question, optionA, optionB, optionC, optionD, correctOption } = row;

      if (!question || !optionA || !optionB || !optionC || !optionD || !["A", "B", "C", "D"].includes(correctOption)) {
        failedRows.push({ row: index + 2, reason: "Invalid or missing fields" });
        return;
      }

      questions.push({
        topic: id,
        course: courseId,
        year: yearId,
        question: String(question).trim(),
        options: {
          A: String(optionA).trim(),
          B: String(optionB).trim(),
          C: String(optionC).trim(),
          D: String(optionD).trim()
        },
        correctOption
      });
    });

    if (!questions.length) {
      return res.status(400).json({ success: false, message: "No valid questions found in Excel", failedRows });
    }

    await questionModel.insertMany(questions, { ordered: false });

    return res.status(201).json({
      success: true,
      message: "Questions imported successfully",
      insertedCount: questions.length,
      failedCount: failedRows.length,
      failedRows
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Excel import failed", error: error.message });
  }
};

export const exportQuestionsToExcel = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId, yearId } = req.query;

    if (!id) return res.status(400).json({ success: false, message: "Topic ID is required" });

    const topic = await topicModel.findById(id);
    if (!topic) return res.status(404).json({ success: false, message: "Topic not found" });

    const filter = { topic: id };
    if (courseId) filter.course = courseId;
    if (yearId) filter.year = yearId;

    const questions = await questionModel.find(filter).lean();

    if (!questions.length) {
      return res.status(404).json({ success: false, message: "No questions found for this topic" });
    }

    const excelData = questions.map(q => ({
      question: q.question,
      optionA: q.options.A,
      optionB: q.options.B,
      optionC: q.options.C,
      optionD: q.options.D,
      correctOption: q.correctOption
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", `attachment; filename=topic_${id}_questions.xlsx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    return res.send(buffer);

  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to export questions", error: error.message });
  }
};
