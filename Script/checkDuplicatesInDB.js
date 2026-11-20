import mongoose from "mongoose";
import dotenv from "dotenv";
import xlsx from "xlsx";
import path from "path";
import questionModel from "../Models/questionModel.js";

dotenv.config();

async function checkDuplicates() {
  await mongoose.connect(process.env.MONGO_URI);

  const file1 = path.resolve("../html and css.xlsx");
  const wb1 = xlsx.readFile(file1);
  const rows1 = xlsx.utils.sheet_to_json(wb1.Sheets[wb1.SheetNames[0]], { defval: "" });

  let dup1 = 0;
  for (const r of rows1) {
    const qText = String(r.Questions || r.Question || "").trim();
    const found = await questionModel.findOne({ question: qText });
    if (found) dup1++;
  }
  console.log("HTML & CSS existing in DB:", dup1, "out of", rows1.length);

  const file2 = path.resolve("../react js and java Script.xlsx");
  const wb2 = xlsx.readFile(file2);
  const rows2 = xlsx.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]], { defval: "" });

  let dup2 = 0;
  for (const r of rows2) {
    const qText = String(r.Question || r.Questions || "").trim();
    const found = await questionModel.findOne({ question: qText });
    if (found) dup2++;
  }
  console.log("React & JS existing in DB:", dup2, "out of", rows2.length);

  await mongoose.disconnect();
}

checkDuplicates().catch(console.error);

