import mongoose from "mongoose";
import resultModel from "../Models/resultModel.js";
// import axios from "axios";
// import { createCanvas, loadImage } from "canvas";
// import studentModel from "../Models/studentModel.js";
// import assessmentModel from "../Models/assesmentModel.js";


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
      message: "Submitted",
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


// download certificate 

// drawText helper in generateCertificate controller
// const drawText = (ctx, canvas, value, config) => {
//   if (!config || !value) return;

//   const canvasWidth = canvas.width;
//   const canvasHeight = canvas.height;

//   // FONT SIZE
//   let fontSize = 20;
//   if (typeof config.fontSize === "string") fontSize = parseInt(config.fontSize);
//   else if (typeof config.fontSize === "number") fontSize = config.fontSize;

//   // STYLE
//   const weight = config.bold ? "700" : "400";
//   const style = config.italic ? "italic" : "normal";

//   // ✅ Font family with quotes for spaces
//   ctx.font = `${style} ${weight} ${fontSize}px ${config.fontFamily.includes(" ") ? `"Monsieur La Doulaise"` : "Monsieur La Doulaise"}`;
//   ctx.fillStyle = config.textColor || "#000";
//   ctx.textAlign = "center";
//   ctx.textBaseline = "middle";

//   // X,Y positions
//   let x = typeof config.horizontalPosition === "string" && config.horizontalPosition.includes("%")
//     ? (parseFloat(config.horizontalPosition) / 100) * canvasWidth
//     : Number(config.horizontalPosition);

//   let y = typeof config.verticalPosition === "string" && config.verticalPosition.includes("%")
//     ? (parseFloat(config.verticalPosition) / 100) * canvasHeight
//     : Number(config.verticalPosition);

//   if (isNaN(x) || isNaN(y)) return;

//   ctx.fillText(value, x, y);

//   // UNDERLINE
//   if (config.underline) {
//     const textWidth = ctx.measureText(value).width;
//     ctx.beginPath();
//     ctx.moveTo(x - textWidth / 2, y + fontSize / 2);
//     ctx.lineTo(x + textWidth / 2, y + fontSize / 2);
//     ctx.strokeStyle = ctx.fillStyle;
//     ctx.lineWidth = 1.5;
//     ctx.stroke();
//   }
// };


// export const generateCertificate = async (req, res) => {
//   try {
//     const { studentId, assesmentId } = req.params;

//     if (
//       !studentId ||
//       !assesmentId ||
//       !mongoose.Types.ObjectId.isValid(studentId) ||
//       !mongoose.Types.ObjectId.isValid(assesmentId)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid studentId or assessmentId"
//       });
//     }

//     // STUDENT
//     const student = await studentModel.findById(studentId);
//     if (!student) {
//       return res.status(404).json({ success: false, message: "Student not found" });
//     }

//     // ASSESSMENT + CERTIFICATE
//     const assessment = await assessmentModel
//       .findById(assesmentId)
//       .populate("certificateName");

//     if (!assessment || !assessment.certificateName) {
//       return res.status(404).json({
//         success: false,
//         message: "Certificate not linked with assessment"
//       });
//     }

//     const certificate = assessment.certificateName;

//     if (!certificate.certificateImage || !certificate.studentName) {
//       return res.status(400).json({
//         success: false,
//         message: "Incomplete certificate configuration"
//       });
//     }

//     // FIRST TIME DATE
//     if (!certificate.generatedAt) {
//       certificate.generatedAt = new Date();
//       await certificate.save();
//     }

//     const imageResponse = await axios.get(
//       certificate.certificateImage,
//       { responseType: "arraybuffer" }
//     );

//     const bgImage = await loadImage(imageResponse.data);
//     const canvas = createCanvas(bgImage.width, bgImage.height);
//     const ctx = canvas.getContext("2d");

//     ctx.drawImage(bgImage, 0, 0);

//     // DRAW TEXT
//     drawText(ctx, canvas, student.name, certificate.studentName);
//     drawText(ctx, canvas, assessment.assessmentName, certificate.assessmentName);
//     drawText(ctx, canvas, assessment.assessmentCode, certificate.assessmentCode);
//     drawText(ctx, canvas, student.college, certificate.collegeName);
//     drawText(
//       ctx,
//       canvas,
//       certificate.generatedAt.toLocaleDateString(),
//       certificate.date
//     );

//     const buffer = canvas.toBuffer("image/png");

//     res.set({
//       "Content-Type": "image/png",
//       "Content-Disposition": `attachment; filename="${student.name}-certificate.png"`
//     });

//     return res.send(buffer);

//   } catch (error) {
//     console.error("CERTIFICATE ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Certificate generation failed",
//       error: error.message
//     });
//   }
// };





