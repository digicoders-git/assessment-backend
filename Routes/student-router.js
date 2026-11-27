
import express from 'express';
import { academicData, downloadMultiAssessmentExcel, downloadStudentsExcel, downloadStudentsPDF, existStudent, getAllStudent, getSingle, getStudentByAssesmet, studen_reg, studen_reg_without_contact, updateStuednt } from '../Controllers/student-controller.js';
import { uploadCertificateImage } from '../Middleware/multer.js';
import adminAuth from '../Middleware/adminAuth.js';

const studentRoute = express.Router();

studentRoute.post('/create', studen_reg)
studentRoute.post('/register', studen_reg_without_contact)
studentRoute.get('/admin/getAll', adminAuth, getAllStudent)
studentRoute.get('/admin/getSingle/:id', adminAuth, getSingle)
studentRoute.get('/admin/getByAssesment/:assesmentCode', adminAuth, getStudentByAssesmet)
studentRoute.post('/exist', existStudent)
studentRoute.get('/admin/student-excel-byassesment/:assesmentCode', adminAuth, downloadStudentsExcel)
studentRoute.get('/admin/student-excel', adminAuth, downloadStudentsExcel)
studentRoute.post('/admin/multi-assessment-excel', adminAuth, downloadMultiAssessmentExcel)
studentRoute.get('/admin/student-pdf-byassesment/:assesmentCode', adminAuth, downloadStudentsPDF)
studentRoute.get('/admin/student-pdf', adminAuth, downloadStudentsPDF)
studentRoute.put('/admin/update/:id', uploadCertificateImage.single("certificate"), adminAuth, updateStuednt)


// academic data 
studentRoute.get('/admin/getAcademicData', adminAuth, academicData)

export default studentRoute;
