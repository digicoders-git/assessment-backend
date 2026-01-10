
import express from 'express';
import { academicData, downloadStudentsByAssessmentExcel, existStudent, getAllStudent, getSingle, getStudentByAssesmet, studen_reg, updateStuednt } from '../Controllers/student-controller.js';
import { uploadCertificateImage } from '../Middleware/multer.js';

const studentRoute = express.Router();

studentRoute.post('/create',studen_reg)
studentRoute.get('/admin/getAll',getAllStudent)
studentRoute.get('/admin/getSingle/:id',getSingle)
studentRoute.get('/admin/getByAssesment/:assesmentCode',getStudentByAssesmet)
studentRoute.post('/exist',existStudent)
studentRoute.get('/admin/student-excel-byassesment/:assesmentCode',downloadStudentsByAssessmentExcel)
studentRoute.put('/admin/update/:id',uploadCertificateImage.single("certificate"),updateStuednt)


// academic data 
studentRoute.get('/admin/getAcademicData', academicData)

export default studentRoute;
