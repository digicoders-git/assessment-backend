import mongoose from "mongoose";
import dotenv from "dotenv";
import topicModel from "../Models/topic.js";
import questionModel from "../Models/questionModel.js";
import assessmentModel from "../Models/assesmentModel.js";
import assesmentQuestionIdModel from "../Models/assesmentQuestionsModel.js";
import counterModel from "../Models/counterModel.js";
import courseModel from "../Models/courseModel.js";
import academicYearModel from "../Models/academicYearModel.js";
import certificateModel from "../Models/certificateModel.js";

dotenv.config();

const rawText = `1	Cell D4 contains =$B$2*C3. The formula is copied to E6. What does E6 contain?	A)  =$B$2*D5	B)  =$B$4*D5	C)  =$C$2*D5	D)  =#REF!*D5	A
2	Range A1:A6 holds 120, "120", "N/A", an empty cell, 0 and 45. What do =COUNT(A1:A6) and =COUNTA(A1:A6) return, in that order?	A)  3 and 5	B)  4 and 5	C)  3 and 6	D)  4 and 6	A
3	SUMPRODUCT((B2:B100="East")*(D2:D100>100)) is entered. What does it return?	A)  The sum of column D for East rows whose D value exceeds 100	B)  The number of rows that are both East and have a D value above 100	C)  The number of East rows multiplied by 100	D)  A #VALUE! error, because the ranges contain text	B
4	A colleague writes =VLOOKUP(A2,Products!A:F,4) and omits the fourth argument. The first column of Products is not sorted. What happens?	A)  It returns #N/A because an exact match is missing	B)  It performs an approximate match on unsorted data and may silently return the wrong record	C)  Excel forces an exact match, so the result is always correct	D)  It returns #REF! because column 4 lies outside the table	B
5	Which capability does XLOOKUP provide that VLOOKUP fundamentally cannot?	A)  Returning a value that sits to the left of the lookup column	B)  Matching text values that differ only in case	C)  Searching a column sorted in descending order	D)  Returning numbers with more than 15 significant digits	A
6	Cell D7 holds the date 09-Mar-2025. What does =TEXT(D7,"mmm-yy") return?	A)  Mar-25	B)  March-25	C)  03-25	D)  09-Mar	A
7	What does =EOMONTH(DATE(2024,7,15),0) return?	A)  31-Jul-2024	B)  30-Jul-2024	C)  01-Aug-2024	D)  30-Jun-2024	A
8	Cell D10 holds 15/08/2025. What does =EOMONTH(D6,1) return?	A)  30-Sep-2025	B)  31-Aug-2025	C)  30-Sep-2026	D)  31-Jul-2025	A
9	FILTER(A2:C50,C2:C50="Open") is entered in F2, but F2:H20 already contain data. What happens?	A)  The existing data is overwritten without a warning	B)  A #SPILL! error appears because the spill range is blocked	C)  A #VALUE! error appears because FILTER cannot return rows	D)  Excel converts the formula to a legacy array formula automatically	B
10	SUMIFS(Sales,Region,"East",Date,">"&DATE(2025,1,1)) is written in a workbook whose fact table has 40,000 rows. Which statement is correct?	A)  It adds every East sale dated after 1 Jan 2025, excluding 1 Jan itself	B)  It adds every East sale dated on or after 1 Jan 2025, including 1 Jan	C)  It returns #VALUE! because the criterion mixes text and a date	D)  It adds every East sale regardless of date, because two criteria are not allowed	A
11	In a model, [Revenue] = SUM(FactSales[Revenue]). What does CALCULATE([Revenue], DimProduct[Category] = "Laptop") do?	A)  Creates a row context over DimProduct and sums the matching rows	B)  Evaluates the expression in a modified filter context where Category is filtered	C)  Adds a calculated column holding only Laptop rows to the model	D)  Removes every filter on the model before evaluating the sum	B
12	Which statement about Margin1 = SUM(FactSales[Profit])/SUM(FactSales[Sales]) and Margin2 = DIVIDE(SUM(FactSales[Profit]),SUM(FactSales[Sales])) is correct?	A)  They are identical in every case	B)  Margin1 errors when the denominator is zero; Margin2 returns BLANK	C)  Margin2 is invalid because DIVIDE takes only two arguments	D)  Margin1 is faster because it avoids the iterator engine	B
13	A page holds a card with Revenue, a bar chart by region and a region slicer. Which filter modifier gives each region's share of the revenue currently selected on the slicer?	A)  ALL(DimRegion)	B)  ALLSELECTED(DimRegion)	C)  REMOVEFILTERS()	D)  KEEPFILTERS(DimRegion)	B
14	FactSales stores Qty and UnitPrice but no line-total column. Which measure returns total revenue correctly?	A)  =SUM(FactSales[Qty])*SUM(FactSales[UnitPrice])	B)  =SUMX(FactSales, FactSales[Qty]*FactSales[UnitPrice])	C)  =SUM(FactSales[Qty]*FactSales[UnitPrice])	D)  =CALCULATE(SUM(FactSales[Qty]), SUM(FactSales[UnitPrice]))	B
15	FactSales relates to DimProduct many-to-one with single-direction filtering from the dimension. A visual slices by DimProduct[Category]. What happens to SUM(FactSales[Sales])?	A)  It is filtered by Category, because filters propagate from the one-side to the many-side	B)  It ignores the slicer, because filters travel only from the many-side to the one-side	C)  It errors unless cross-filter direction is set to Both	D)  It always returns the grand total, because relationships do not affect measures	A
16	Which statement about a star schema is INCORRECT?	A)  The fact table stores numeric measures plus foreign keys to the dimensions	B)  Dimension tables hold the descriptive attributes used for slicing	C)  A snowflake schema normalises a dimension into related tables, adding depth	D)  A star schema duplicates measures into each dimension to improve performance	D
17	A marked date table exists, yet Revenue LY = CALCULATE([Revenue],SAMEPERIODLASTYEAR(DimDate[Date])) returns BLANK for every month of 2025 although 2024 rows exist. What is the most likely cause?	A)  SAMEPERIODLASTYEAR is unsupported in Import mode	B)  The date table contains gaps or is not marked, so the shifted period cannot be resolved	C)  CALCULATE cannot be nested with a time-intelligence function	D)  The fact table must sit on the one-side of the relationship	B
18	All Sales = CALCULATE(SUM(FactSales[Sales]), ALL(DimProduct)) is placed in a matrix with Product on rows. What does every row show?	A)  Only that product's own sales	B)  BLANK	C)  The grand total for all products, identical on every row	D)  A circular-dependency error	C
19	RLS must let each regional manager see only their own region without one role per manager. Which approach is correct?	A)  One role per manager, assigned in the Power BI Service	B)  A single role whose table filter uses DimRegion[ManagerEmail] = USERPRINCIPALNAME()	C)  A page-level slicer on region, shared as a template	D)  ALLSELECTED(DimRegion) inside the RLS filter expression	B
20	Cell B2 has Data Validation (List) pointing to $J$2:$J$6. A user pastes a value that is not in that list into B2 from another workbook. What is the result?	A)  The paste is rejected with an error alert	B)  Paste overrides validation: the invalid value is accepted, and only subsequently typed entries are validated	C)  Excel clears B2 and restores the last valid entry	D)  Validation fires only if the worksheet has been protected	B
21	Which of the following is an absolute cell reference?	A)  A1	B)  $A$1	C)  A$1	D)  #A1	B
22	A workbook records one row per order line. Which function returns the number of orders excluding blank rows in the OrderID column A2:A500?	A)  =COUNT(A2:A500)	B)  =COUNTA(A2:A500)	C)  =COUNTBLANK(A2:A500)	D)  =COUNTIF(A2:A500,"<>"&"")	B
23	Cell B2 has Data Validation (List) pointing to $J$2:$J$6. A user pastes a value that is not in that list into B2 from another workbook. What is the result?	A)  50	B)  37.5	C)  45	D)  30	C
24	What does =COUNTIFS(D2:D100,"North",H2:H100,">=5") return?	A)  The number of North rows whose H value is at least 5	B)  The sum of H for North rows	C)  The number of North rows whose H value is exactly 5	D)  The average of H for North rows	A
25	Which formula returns "Pass" when F2 is at least 40 and "Fail" otherwise?	A)  =IF(F2>=40,"Pass","Fail")	B)  =IF(F2>40,"Pass","Fail")	C)  =IF(F2>=40,"Fail","Pass")	D)  =IFS(F2>=40,"Pass")	A
26	In =IFS(F2>=80,"A",F2>=60,"B",TRUE,"C"), what does the TRUE argument do?	A)  It must be deleted or the formula errors	B)  It acts as a catch-all so every remaining case returns "C"	C)  It converts the result to Boolean	D)  It is ignored because IFS allows only two pairs	B
27	Which function should be used to sum a range only when two conditions on two different columns are both TRUE?	A)  SUMIF	B)  SUMPRODUCT	C)  SUMIFS	D)  SUMIF with nesting	C
28	SUMPRODUCT((A2:A20="A")*(B2:B20)) returns what?	A)  The count of rows where A equals "A"	B)  The sum of B for the rows where A equals "A"	C)  The sum of every B value	D)  The average of B for the rows where A equals "A"	B
29	A user must return the 3rd column of a table where the lookup key sits in the 5th column. Which combination works?	A)  VLOOKUP with col_index_num = 3	B)  HLOOKUP with row_index_num = 3	C)  INDEX with MATCH	D)  VLOOKUP with range_lookup = TRUE	C
30	What does =HLOOKUP("Q2",A1:H3,3,FALSE) return?	A)  The value in the 3rd row of the column where row 1 contains "Q2"	B)  The value in the 2nd row of the column where row 1 contains "Q2"	C)  The value in the 3rd column of the row where column A contains "Q2"	D)  An error, because HLOOKUP searches only columns	A
31	A user needs to count how many times a key appears, then pull the price for the 2nd occurrence. Which approach is most robust?	A)  VLOOKUP with a wildcard	B)  INDEX with a helper rank column and MATCH on a concatenated key	C)  SUMPRODUCT with one condition	D)  COUNTIF followed by manual copy-paste	B
32	A user must return the 3rd column of a table where the lookup key sits in the 5th column. Which combination works?	A)  1234.5	B)  1,234.5	C)  1.234,5	D)  #,##0.0	D
33	What does =TRIM("  Power   BI  ") return?	A)  "  Power   BI  "	B)  "Power BI"	C)  "Power   BI"	D)  "PowerBI"	B
34	What does =LEN(TRIM(" New Delhi ")) return?	A)  11	B)  9	C)  13	D)  8	B
35	MID("FY2025-Q3",3,4) returns which value?	A)  2025	B)  FY20	C)  25-Q	D)  Y202	A
36	SUBSTITUTE("Noida-NCR","-"," / ") returns which text?	A)  Noida / NCR	B)  NoidaNCR	C)  Noida-NCR	D)  Noida//NCR	A
37	A cell shows ######. What does this mean?	A)  The formula contains a syntax error	B)  The column is too narrow to display the value	C)  The cell contains text in a numeric column	D)  The workbook is in Protected View	B
38	Which function returns the number of working days between two dates, excluding a supplied holiday list?	A)  =DAYS()	B)  =NETWORKDAYS()	C)  =WORKDAY()	D)  =DATEDIF()	B
39	dATEDIF("01-Jan-2025","15-Mar-2025","m") returns which value?	A)  2	B)  3	C)  74	D)  73	A
40	What does =NOW()-TODAY() return?	A)  The current date	B)  The current time as a fraction of a day	C)  An error	D)  The number of days since 1900	B
41	Which feature shows the cells feeding into a formula on another sheet?	A)  Trace Precedents	B)  Trace Dependents	C)  Evaluate Formula with F9 only	D)  Watch Window	A
42	A workbook must prevent a user typing a date in the future into a cell. Which Excel feature is designed for this?	A)  Conditional Formatting	B)  Data Validation with a date criterion	C)  Data Table	D)  Goal Seek	B
43	Which conditional-formatting rule formula highlights an entire row A2:G500 where the Status column C2 is "Overdue"?	A)  =$C$2="Overdue"	B)  =$C2="Overdue"	C)  =C2="Overdue"	D)  =C$2="Overdue"	B
44	A PivotTable must show Sales by Region with the regions ordered by Sales descending. Where is that set?	A)  Value Field Settings	B)  More Sort Options on the Row field	C)  PivotTable Options > Layout	D)  The source data sort	B
45	Why does a PivotTable calculated field produce a correct grand-total margin while an averaged worksheet column does not?	A)  The calculated field is computed before aggregation	B)  The calculated field divides the summed fields, so it is a ratio of totals	C)  The calculated field ignores blanks automatically	D)  The calculated field uses array formulas internally	B
46	A source range grows every month. What is the most maintainable way to keep a PivotTable current?	A)  Recreate the PivotTable each month	B)  Convert the source to a Table and point the PivotTable at it	C)  Use entire-column references	D)  Copy the new rows inside the old range manually	B
47	In Power Query, which step converts columns named Jan, Feb, Mar into one Month column and one Value column?	A)  Transpose	B)  Unpivot Columns	C)  Merge Columns	D)  Group By	B
48	Which Power Query operation combines two tables that have the same columns into more rows?	A)  Merge Queries	B)  Append Queries	C)  Combine Files with a join	D)  Group By	B
49	A numeric column imports with #VALUE! errors after a type change. Which Power Query feature finds the offending rows fastest?	A)  Remove Duplicates	B)  Filter the column to keep only errors	C)  Replace Values	D)  Column From Examples	B
50	What is query folding?	A)  The step where Power Query sorts a table	B)  Power Query translating steps into a native query so the source engine does the work	C)  The compression applied when loading to the model	D)  The process of merging duplicate queries	B`;

function cleanOption(text, prefix) {
  let cleaned = text.trim();
  const regex = new RegExp('^' + prefix + '[\\)\\.:]\\s*', 'i');
  return cleaned.replace(regex, '').trim();
}

async function createExcelPowerBITest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Certificate template: Training Quiz Certificate - 1
  const targetCertId = "6a2cf0da392c9ac737d14b34";
  const cert = await certificateModel.findById(targetCertId);
  if (!cert) throw new Error("Certificate template not found: " + targetCertId);
  console.log("Using Certificate Template:", cert.certificateName, cert._id);

  // Default course & year
  const defaultCourse = await courseModel.findOne({ course: /BCA/i }) || await courseModel.findOne();
  const defaultYear = await academicYearModel.findOne({ academicYear: /1st Year/i }) || await academicYearModel.findOne();

  // Topic: Excel & Power BI (50 Questions)
  const topicName = "Excel & Power BI (50 Questions)";
  let topic = await topicModel.findOne({ topicName });
  if (!topic) {
    topic = await topicModel.create({
      topicName,
      status: true,
      questionCout: 50
    });
    console.log("Created Topic:", topic.topicName, topic._id);
  } else {
    console.log("Found existing Topic:", topic.topicName, topic._id);
  }

  // Parse questions
  const lines = rawText.trim().split('\n');
  const qDocs = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const parts = lines[idx].split('\t');
    const questionText = parts[1].trim();
    const optA = cleanOption(parts[2], 'A');
    const optB = cleanOption(parts[3], 'B');
    const optC = cleanOption(parts[4], 'C');
    const optD = cleanOption(parts[5], 'D');
    const correctOption = parts[6].trim().toUpperCase();

    let q = await questionModel.findOne({ topic: topic._id, question: questionText });
    if (!q) {
      q = await questionModel.create({
        topic: topic._id,
        course: defaultCourse._id,
        year: defaultYear._id,
        question: questionText,
        options: { A: optA, B: optB, C: optC, D: optD },
        correctOption
      });
    }
    qDocs.push(q._id);
  }

  await topicModel.findByIdAndUpdate(topic._id, { questionCout: qDocs.length });
  console.log("Excel & Power BI questions ready in database:", qDocs.length);

  // Timing: 30 minutes duration, active for 14 days
  const now = new Date();
  const startDateTime = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const endDateTime = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  // Assessment Code: DCT0255
  const code = "DCT0255";

  // Increment counter
  const counter = await counterModel.findOneAndUpdate(
    { name: "assessment" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const assessment = await assessmentModel.create({
    assessmentId: counter.seq,
    assessmentName: "Excel & Power BI Champion Test",
    assessmentCode: code,
    certificateOnly: false,
    totalQuestions: 50,
    timeDuration: 30, // 30 minutes
    startDateTime,
    endDateTime,
    generateCertificate: true,
    certificateName: cert._id,
    remark: "Excel & Power BI Champion Test",
    allowedYears: [],
    status: true,
    start: 0,
    submit: 0,
    count: 0
  });

  await assesmentQuestionIdModel.create({
    assesmentId: assessment._id,
    questionIds: qDocs,
    courseYearGroups: []
  });

  console.log("\n=== EXCEL & POWER BI CHAMPION TEST CREATED SUCCESSFULLY ===");
  console.log({
    _id: assessment._id,
    assessmentId: assessment.assessmentId,
    assessmentName: assessment.assessmentName,
    assessmentCode: assessment.assessmentCode,
    totalQuestions: assessment.totalQuestions,
    timeDuration: assessment.timeDuration + " Minutes",
    generateCertificate: assessment.generateCertificate,
    certificateName: cert.certificateName,
    certificateId: cert._id.toString(),
    status: assessment.status,
    questionsAssigned: qDocs.length
  });

  console.log("\nTest Link: https://assessment.thedigicoders.com/" + assessment.assessmentCode);

  await mongoose.disconnect();
}

createExcelPowerBITest().catch(err => {
  console.error("Error creating Excel & Power BI assessment:", err);
  mongoose.disconnect();
  process.exit(1);
});

