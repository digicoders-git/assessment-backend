import studentModel from "../Models/studentModel.js";


export const studen_reg = async (req,res)=>{
    try {
        const {name, mobile, email, college, year, course, code} = req.body;
        if(!name || !mobile || !email || !college || !year || !course || !code){
            return res.status(400).json({success:false,message: "All fields are required"})
        }

        const newStudent = await studentModel.create(req.body);
        if(!newStudent){
            return res.status(400).json({success:false,message: "Student not created"})
        }

        return res.status(200).json({success:true,message: "Student created successfully",newStudent})

    } catch (error) {
        res.status(500).json({success:false,message:'intetnal server error',error: error.message})
    }
}

export const updateStuednt = async (req, res)=>{
    try {
        const {id} = req.params;
        const {name, mobile, email, college, year, course} = req.body; 
        if(!name || !mobile || !email || !college || !year || !course){
            return res.status(400).json({success:false, message: "Every fields required"})
        }
        const updateStudent = await studentModel.findByIdAndUpdate(id, req.body, {new:true});
        if(!updateStudent){
            return res.status(400).json({success:false, message: "Something wnet wrong"})
        }
        return res.status(200).json({success:true, message: "Student updated successfully", updateStudent})
    } catch (error) {
        return res.status(500).json({success:false, message:'intetnal server error', error: error.message})
    }
}

export const existStudent = async (req,res)=>{
    try {
        const {mobile} = req.body;
        const existMobile = await studentModel.findOne({mobile});
        if(existMobile){
            return res.status(200).json({success:true,message: `wlecome ${existMobile.name}`,existMobile})
        }
        return res.status(404).json({success:false,message: "new student"})
    } catch (error) {
        return res.status(500).json({success:false,message:'intetnal server error', error: error.message})
    }
}

export const getAllStudent = async (req, res)=>{
    try {
        const allStudent = await studentModel.find();
        if(!allStudent){
            return res.status(404).json({success:false, message: "Student not found"})
        }
        return res.status(200).json({success:true, message: "Student found", allStudent})
    } catch (error) {
        return res.status(500).json({success:false, message:'intetnal server error', error: error.message})
    }
}  

export const getStudentByAssesmet = async (req, res)=>{
    try {
        const {assesmentCode} = req.params;
        const student = await studentModel.find({code:assesmentCode});
        if(!student){
            return res.status(404).json({success:false, message: "Student not found"})
        }
        return res.status(200).json({success:true, message: "Student found", student})
    } catch (error) {
        return res.status(500).json({success:false, message:'intetnal server error', error: error.message})
    }
}
