
import express from 'express';
import { existStudent, getStudent, studen_reg } from '../Controllers/student-controller.js';

const studentRoute = express.Router();

studentRoute.post('/create',studen_reg)
studentRoute.post('/exist',existStudent)
studentRoute.get('/get',getStudent)

export default studentRoute;
