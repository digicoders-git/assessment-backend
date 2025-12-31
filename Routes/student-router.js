
import express from 'express';
import { existStudent, getAllStudent, getStudentByAssesmet, studen_reg, updateStuednt } from '../Controllers/student-controller.js';

const studentRoute = express.Router();

studentRoute.post('/create',studen_reg)
studentRoute.get('/admin/getAll',getAllStudent)
studentRoute.get('/admin/getByAssesment/:assesmentCode',getStudentByAssesmet)
studentRoute.post('/exist',existStudent)
studentRoute.put('/admin/update/:id',updateStuednt)

export default studentRoute;
