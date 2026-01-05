
import XLSX from "xlsx";
import questionModel from "../models/questionModel.js";
import topicModel from "../Models/topic.js";

export const createQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const {questions } = req.body;

    if (!id || !questions || !questions.length) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    const existTopic = await topicModel.findById(id);
    if (!existTopic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    const payload = questions.map(q => ({
      topic: id,
      question: q.question.trim(),
      options: q.options,
      correctOption: q.correctOption
    }));

    let insertedCount = 0;

    try {
      const result = await questionModel.insertMany(payload, { ordered: false });
      insertedCount = result.length;
    } catch (err) {
      //  DUPLICATE ERROR IGNORE
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
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getQuestionsByTopic = async (req, res) => {
  try {
    const { id } = req.params;

    if(!id){
      return res.status(400).json({success:false, message: "TopicId is required" });
    }

    const questions = await questionModel.find({ topic:id });

    if (!questions.length) {
      return res.status(404).json({success:false, message: "No questions found for the given topic" });
    }

    res.status(200).json({success:true, message: "Questions found", questions });

  } catch (error) {
    res.status(500).json({success:false, message: error.message });
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
      return res.status(404).json({success:false, message: "Question not found" });
    }

    res.status(201).json({success:true, message: "Question updated", question });

  } catch (error) {
    res.status(500).json({success:false, message: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await questionModel.findByIdAndDelete(id);
    if (!question) {
      return res.status(404).json({success:false, message: "Question not found" });
    }

    res.status(200).json({success:true, message: "Question deleted" });

  } catch (error) {
    res.status(500).json({success:false, message: error.message });
  }
};

export const importQuestionsFromExcel = async (req, res) => {
  try {
    const { id } = req.params;
    //  Basic validation
    if (!req.file) {
      return res.status(400).json({success:false, message: "Excel file is required" });
    }

    if (!id) {
      return res.status(400).json({success:false, message: "topicId is required" });
    }

    // Topic check
    const topic = await topicModel.findById(id);
    if (!topic) {
      return res.status(404).json({success:false, message: "Topic not found" });
    }

    //  Read excel from memory
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return res.status(400).json({success:false, message: "Invalid Excel file" });
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({success:false, message: "Excel file is empty" });
    }

    //  Prepare questions
    const questions = [];
    const failedRows = [];

    rows.forEach((row, index) => {
      const {
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption
      } = row;

      // Row level validation
      if (
        !question ||
        !optionA ||
        !optionB ||
        !optionC ||
        !optionD ||
        !["A", "B", "C", "D"].includes(correctOption)
      ) {
        failedRows.push({
          row: index + 2, // excel row number
          reason: "Invalid or missing fields"
        });
        return;
      }

      questions.push({
        topic: id,
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
      return res.status(400).json({
        success:false,
        message: "No valid questions found in Excel",
        failedRows
      });
    }

    //  Insert (partial success allowed)
    await questionModel.insertMany(questions, { ordered: false });

    //  Final response
    return res.status(201).json({
      success:true,
      message: "Questions imported successfully",
      insertedCount: questions.length,
      failedCount: failedRows.length,
      failedRows
    });

  } catch (error) {
    return res.status(500).json({
      success:false,
      message: "Excel import failed",
      error: error.message
    });
  }
};

