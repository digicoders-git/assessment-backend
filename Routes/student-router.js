
import express from 'express';
import { academicData, downloadStudentsExcel, downloadStudentsPDF, existStudent, getAllStudent, getSingle, getStudentByAssesmet, studen_reg, studen_reg_without_contact, updateStuednt } from '../Controllers/student-controller.js';
import { uploadCertificateImage } from '../Middleware/multer.js';

const studentRoute = express.Router();

studentRoute.post('/create', studen_reg)
studentRoute.post('/register', studen_reg_without_contact)
studentRoute.get('/admin/getAll',getAllStudent)
studentRoute.get('/admin/getSingle/:id',getSingle)
studentRoute.get('/admin/getByAssesment/:assesmentCode',getStudentByAssesmet)
studentRoute.post('/exist',existStudent)
studentRoute.get('/admin/student-excel-byassesment/:assesmentCode',downloadStudentsExcel)
studentRoute.get('/admin/student-excel',downloadStudentsExcel)
studentRoute.get('/admin/student-pdf-byassesment/:assesmentCode',downloadStudentsPDF)
studentRoute.get('/admin/student-pdf',downloadStudentsPDF)
studentRoute.put('/admin/update/:id',uploadCertificateImage.single("certificate"),updateStuednt)


// academic data 
studentRoute.get('/admin/getAcademicData', academicData)

export default studentRoute;
