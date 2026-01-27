import mongoose from "mongoose";
import resultModel from "../Models/resultModel.js";
import studentModel from "../Models/studentModel.js";
import { toKolkataTime } from "../utils/timezoneHelper.js";
import ExcelJS from "exceljs";

// import axios from "axios";
// import { createCanvas, loadImage } from "canvas";
// import studentModel from "../Models/studentModel.js";
// import assessmentModel from "../Models/assesmentModel.js";


// create result

export const createResult = async (req, res) => {
  try {
    let {
      student,
      assesmentQuestions,
      answers = [],
      total,
      attempted,
      unattempted,
      correct,
      incorrect,
      marks,
      duration // "mm:ss"
    } = req.body;

    marks = Number(marks);

    if (
      !student ||
      !assesmentQuestions ||
      total === undefined ||
      attempted === undefined ||
      unattempted === undefined ||
      correct === undefined ||
      incorrect === undefined ||
      Number.isNaN(marks) ||
      !duration
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided correctly"
      });
    }

    // BLOCK same student + same assessment
    const alreadySubmitted = await resultModel.findOne({
      student,
      assesmentQuestions
    });

    if (alreadySubmitted) {
      return res.status(409).json({
        success: false,
        message: "Result already submitted for this student"
      });
    }

    // student check
    const studentData = await studentModel.findById(student);
    if (!studentData) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // check reattempt (same mobile + same assessment)
    const previousAttempt = await resultModel
      .findOne({ assesmentQuestions })
      .populate("student");

    const isReattempt =
      previousAttempt &&
      previousAttempt.student.mobile === studentData.mobile;

    // create result
    const newResult = await resultModel.create({
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
      rank: isReattempt ? null : 0
    });

    // ONLY FIRST ATTEMPTS → RANK CALCULATION
    if (!isReattempt) {
      const rankedResults = await resultModel.aggregate([
        {
          $match: {
            assesmentQuestions: new mongoose.Types.ObjectId(assesmentQuestions),
            rank: { $ne: null }
          }
        },

        // convert duration "mm:ss" → seconds
        {
          $addFields: {
            durationSeconds: {
              $add: [
                {
                  $multiply: [
                    {
                      $toInt: {
                        $arrayElemAt: [{ $split: ["$duration", ":"] }, 0]
                      }
                    },
                    60
                  ]
                },
                {
                  $toInt: {
                    $arrayElemAt: [{ $split: ["$duration", ":"] }, 1]
                  }
                }
              ]
            }
          }
        },

        { $sort: { marks: -1, durationSeconds: 1 } }
      ]);

      // assign ranks
      for (let i = 0; i < rankedResults.length; i++) {
        await resultModel.findByIdAndUpdate(rankedResults[i]._id, {
          rank: i + 1
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: isReattempt
        ? "Reattempt submitted successfully"
        : "Result submitted successfully",
      result: newResult
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// getallresult

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

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // filters & search
    const { college, year, course, search = "" } = req.query;

    // ---------------- STUDENT MATCH ----------------
    let studentMatch = {};

    // ---------------- STUDENT FILTERS (PARTIAL + CASE INSENSITIVE) ----------------
    if (college && college !== "all") {
      studentMatch["student.college"] = {
        $regex: college.trim(),
        $options: "i"
      };
    }

    if (year && year !== "all") {
      studentMatch["student.year"] = {
        $regex: year.trim(),
        $options: "i"
      };
    }

    if (course && course !== "all") {
      studentMatch["student.course"] = {
        $regex: course.trim(),
        $options: "i"
      };
    }


    if (search && search.trim() !== "") {
      const orConditions = [
        { "student.name": { $regex: search, $options: "i" } }
      ];

      if (!isNaN(search)) {
        orConditions.push({ "student.mobile": Number(search) });
      }

      studentMatch.$or = orConditions;
    }

    // ---------------- AGGREGATION ----------------
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

      // assessment filter
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

      //  APPLY FILTER + SEARCH HERE
      { $match: studentMatch },

      // sort by createdAt (oldest first → first attempt)
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
      },

      // pagination (ONLY on firstSubmission)
      { $skip: skip },
      { $limit: limit }
    ]);

    // ---------------- FLATTEN ----------------
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

    // clean response
    const clean = doc => {
      const { assesmentQuestions, answers, questions, topics, ...rest } = doc;
      return rest;
    };

    return res.status(200).json({
      success: true,
      firstSubmission: firstSubmission.map(clean),
      reattempt: reattempt.map(clean),
      pagination: {
        page,
        limit,
        count: firstSubmission.length
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};



// get by number;

export const getResultsByMobile = async (req, res) => {
  try {
    const { mobile } = req.params;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required"
      });
    }

    // 1️⃣ Find ALL students with same mobile
    const students = await studentModel.find({ mobile });

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found with this mobile number"
      });
    }

    // 2️⃣ Extract student IDs
    const studentIds = students.map(stu => stu._id);

    // 3️⃣ Find ALL results + POPULATE assessmentName
    const results = await resultModel
      .find({ student: { $in: studentIds } })
      .populate("student")
      .populate({
        path: "assesmentQuestions",
        populate: {
          path: "assesmentId",
          select: "assessmentName"
        }
      })
      .populate("answers.question")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalStudents: students.length,
      totalResults: results.length,
      results
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
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
      .find({ student: id })
      .populate("student")
      .populate({
        path: "answers.question",
        populate: { path: "topic" }
      })
      .sort({ createdAt: -1 }).populate({
        path: "assesmentQuestions",
        populate: {
          path: "assesmentId",
          select: "assessmentName"
        }
      })

    const formattedResults = results.map(result => ({
      //  RESULT basic fields
      _id: result._id,
      student: result.student,
      assessmentQuestions: result.assesmentQuestions,

      total: result.total,
      attempted: result.attempted,
      unattempted: result.unattempted,
      correct: result.correct,
      incorrect: result.incorrect,

      marks: result.marks,
      duration: result.duration,
      rank: result.rank,

      //  RESULT createdAt (Kolkata)
      createdAt: toKolkataTime(result.createdAt),
      updatedAt: toKolkataTime(result.updatedAt),

      //  QUESTIONS + ANSWERS
      questions: result.answers.map(ans => ({
        _id: ans.question?._id,
        question: ans.question?.question,
        options: ans.question?.options,
        selectedOption: ans.selectedOption,
        isCorrect: ans.isCorrect,
        topic: ans.question?.topic
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


// download excel file 




// Helper: Build student match for aggregation

export const downloadAssessmentResultsExcel = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid assessmentId" });

    const { college, year, course, search } = req.query;

    // ---------------- FETCH RESULTS ----------------
    const pipeline = [
      {
        $lookup: {
          from: "assesmentquestions",
          localField: "assesmentQuestions",
          foreignField: "_id",
          as: "assesmentQuestions",
        },
      },
      { $unwind: "$assesmentQuestions" },
      {
        $match: { "assesmentQuestions.assesmentId": new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
    ];

    // ---------------- APPLY FILTERS ----------------
    const studentMatch = {};

    if (college && college !== "all") studentMatch["student.college"] = { $regex: college, $options: "i" };
    if (year && year !== "all") studentMatch["student.year"] = { $regex: year, $options: "i" };
    if (course && course !== "all") studentMatch["student.course"] = { $regex: course, $options: "i" };

    if (search && search.trim() !== "") {
      const orConditions = [{ "student.name": { $regex: search, $options: "i" } }];
      const mobileDigits = search.replace(/\D/g, "");
      if (mobileDigits) orConditions.push({ "student.mobile": Number(mobileDigits) }); // exact match
      studentMatch["$or"] = orConditions;
    }

    if (Object.keys(studentMatch).length) {
      pipeline.push({ $match: studentMatch });
    }

    pipeline.push({ $sort: { createdAt: 1 } });
    pipeline.push({
      $group: {
        _id: "$student.mobile",
        results: { $push: "$$ROOT" },
      },
    });
    pipeline.push({ $project: { firstSubmission: { $arrayElemAt: ["$results", 0] } } });

    const results = await resultModel.aggregate(pipeline);

    const finalResults = results.map((r) => r.firstSubmission).filter(Boolean);
    finalResults.sort((a, b) => Number(a.rank) - Number(b.rank));

    // ---------------- EXCEL ----------------
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Assessment Results");

    worksheet.columns = [
      { header: "Rank", key: "rank", width: 8 },
      { header: "Name", key: "name", width: 20 },
      { header: "Code", key: "code", width: 15 },
      { header: "Course", key: "course", width: 15 },
      { header: "Year", key: "year", width: 15 },
      { header: "College", key: "college", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Score", key: "score", width: 12 },
      { header: "Duration", key: "duration", width: 12 },
      { header: "Date", key: "datetime", width: 15 },
    ];

    finalResults.forEach((item) => {
      worksheet.addRow({
        rank: item.rank,
        name: item.student.name,
        code: item.student.code,
        course: item.student.course,
        year: item.student.year,
        college: item.student.college,
        phone: item.student.mobile,
        score: `${item.marks}/${item.total}`,
        duration: item.duration,
        datetime: new Date(item.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }),
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=assessment-results.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("EXCEL DOWNLOAD ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to download excel", error: error.message });
  }
};