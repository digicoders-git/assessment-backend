import express from 'express'
import adminAuth from '../Middleware/adminAuth.js';
import { getLastYearData, importAssessmentExcel } from '../Controllers/lastYearResult.js';


const lastYearData = express.Router();

lastYearData.post("/last-year-data-add",adminAuth, importAssessmentExcel);
lastYearData.get("/last-year-data-get",adminAuth, getLastYearData);

export default lastYearData;
