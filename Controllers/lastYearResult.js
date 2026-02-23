import multer from "multer";
import XLSX from "xlsx";
import lastYearData from "../Models/lastYearData.js";

const upload = multer({ storage: multer.memoryStorage() });

export const importAssessmentExcel = [
  upload.single("file"),

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Excel file required" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length < 2) {
        return res.status(400).json({ success: false, message: "Invalid Excel file" });
      }

      // 1st row = headers
      const headers = rows[0].map(h => h?.toString().trim());

      const ignoreColumns = ["#", "Action", "Certificate"];

      const dataRows = rows.slice(1);
      const parsedData = [];

      //  Excel parse
      for (const row of dataRows) {
        if (!row || row.every(cell => !cell)) continue;

        const obj = {};

        headers.forEach((header, index) => {
          if (!header || ignoreColumns.includes(header)) return;

          const key = header
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace("studentname", "studentName")
            .replace("obtainedmarks", "obtainedMarks")
            .replace("totalmarks", "totalMarks")
            .replace("datetime", "dateTime")
            .replace("studentbatch", "studentBatch");

          obj[key] = row[index];
        });

        if (obj.studentName && obj.phone) {
          obj.phone = String(obj.phone).trim(); // normalize
          parsedData.push(obj);
        }
      }

      if (!parsedData.length) {
        return res.status(400).json({ success: false, message: "No valid rows found" });
      }

      //  DB me already existing phones nikaalo
      const phones = parsedData.map(d => d.phone);

      const existingRecords = await lastYearData.find(
        { phone: { $in: phones } },
        { phone: 1 }
      );

      const existingPhones = new Set(
        existingRecords.map(r => String(r.phone))
      );

      //  Excel + DB duplicate dono skip
      const uniquePhoneSet = new Set();
      const finalData = [];

      for (const item of parsedData) {
        if (existingPhones.has(item.phone)) continue;      // DB duplicate
        if (uniquePhoneSet.has(item.phone)) continue;      // Excel duplicate

        uniquePhoneSet.add(item.phone);
        finalData.push(item);
      }

      //  Insert (agar kuch bacha ho)
      if (finalData.length) {
        await lastYearData.insertMany(finalData);
      }

      res.json({
        success: true,
        message: "Excel imported successfully",
        inserted: finalData.length,
        skipped: parsedData.length - finalData.length, // duplicate count
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
];


export const getLastYearData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // fixed
    const search = req.query.search?.trim() || "";

    const skip = (page - 1) * limit;

    //  Search ONLY on required fields
    const searchQuery = search
      ? {
          $or: [
            { studentName: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { studentBatch: { $regex: search, $options: "i" } },
            { college: { $regex: search, $options: "i" } },
            { course: { $regex: search, $options: "i" } },
            { year: { $regex: search, $options: "i" } },
          ],
        }
      : {}; //  no search → full data

    //  count AFTER search
    const total = await lastYearData.countDocuments(searchQuery);

    //  fetch data
    const data = await lastYearData
      .find(
        searchQuery,
        {
          "#": 0,
          action: 0,
          certificate: 0,
          __v: 0,
        }
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (error) {
    console.error("GET LAST YEAR DATA ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};