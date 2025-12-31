import academicYearModel from "../Models/academicYearModel.js";


/* CREATE */
export const createAcademicYear = async (req, res) => {
  try {
    const { academicYear } = req.body;
    if(!academicYear){
      return res.status(400).json({ success: false, message: "Year field is required" });
    }
    const academicYears = await academicYearModel.create({academicYear});
    return res.status(201).json({ success: true,message:"Created",academicYears });
  } catch(error) {
    return res.status(500).json({ success: false,message: "internel server error",error:error.message });
  }
};

/* GET ALL */
export const getAcademicYears = async (req, res) => {
  try {
    const years = await academicYearModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true,message:"Years found",years });
  } catch(error) {
    return res.status(500).json({ success: false , message:"internel server error",error:error.message });
  }
};


/* UPDATE */
export const updateAcademicYear = async (req, res) => {
  try {
    const {id} = req.params;
    const {academicYear} = req.body;

    if(!id){
      return res.status(400).json({success: false, message: "id required"})
    } 

    if(!academicYear){
      return res.status(400).json({success: false, message: "year required"})
    }

    const year = await academicYearModel.findByIdAndUpdate(
      id,
      {academicYear},
      { new: true, runValidators: true }
    );
    if (!year) return res.status(404).json({ success: false , message: "year not found" });
    return res.status(200).json({ success: true, data: year });
  } catch(error) {
    return res.status(500).json({ success: false, message: "internel server error",error:error.message });
  }
};

/* DELETE */
export const deleteAcademicYear = async (req, res) => {
  try {
    const { id } = req.params; 
    await academicYearModel.findByIdAndDelete(id);
    return res.status(200).json({ success: true,message:"Deleted" });
  } catch {
    return res.status(500).json({ success: false,message:"internel server error" });
  }
};
