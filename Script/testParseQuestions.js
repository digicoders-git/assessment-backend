import xlsx from "xlsx";
import path from "path";

const file1 = path.resolve("../html and css.xlsx");
const wb1 = xlsx.readFile(file1);
const sheet1 = wb1.Sheets[wb1.SheetNames[0]];
const rows1 = xlsx.utils.sheet_to_json(sheet1, { defval: "" });

console.log("=== Validating HTML & CSS (" + rows1.length + " rows) ===");
const qList1 = [];
rows1.forEach((r, i) => {
  const q = String(r.Questions || r.Question || "").trim();
  const a = String(r.optionA || "").trim();
  const b = String(r.optionB || "").trim();
  const c = String(r.optionC || "").trim();
  const d = String(r.optionD || "").trim();
  const ans = String(r.correctoption || r.Correctoption || "").trim().toUpperCase();

  if (!q || !a || !b || !c || !d || !["A", "B", "C", "D"].includes(ans)) {
    console.error("Invalid at row", i + 2, { q, a, b, c, d, ans });
  } else {
    qList1.push({ question: q, options: { A: a, B: b, C: c, D: d }, correctOption: ans });
  }
});
console.log("HTML & CSS Valid parsed questions:", qList1.length);

const file2 = path.resolve("../react js and java Script.xlsx");
const wb2 = xlsx.readFile(file2);
const sheet2 = wb2.Sheets[wb2.SheetNames[0]];

console.log("\n=== Validating React JS & JavaScript ===");
const qList2 = [];
for (let r = 2; r <= 51; r++) {
  const qText = sheet2["A" + r]?.v ? String(sheet2["A" + r].v).trim() : "";
  const optA = sheet2["B" + r]?.v !== undefined ? String(sheet2["B" + r].v).trim() : "";
  let optB = sheet2["C" + r]?.v !== undefined ? String(sheet2["C" + r].v).trim() : "";
  // Check if cell has formula error (row 15 where formula was ---B3)
  if (sheet2["C" + r]?.t === "e" || !optB) {
    optB = "---";
  }
  const optC = sheet2["D" + r]?.v !== undefined ? String(sheet2["D" + r].v).trim() : "";
  const optD = sheet2["E" + r]?.v !== undefined ? String(sheet2["E" + r].v).trim() : "";
  const ans = sheet2["F" + r]?.v ? String(sheet2["F" + r].v).trim().toUpperCase() : "";

  if (!qText || !optA || !optB || !optC || !optD || !["A", "B", "C", "D"].includes(ans)) {
    console.error("Invalid at row", r, { qText, optA, optB, optC, optD, ans });
  } else {
    qList2.push({ question: qText, options: { A: optA, B: optB, C: optC, D: optD }, correctOption: ans });
  }
}
console.log("React & JS Valid parsed questions:", qList2.length);
console.log("\nSample question 15 React:", qList2[13]);

