import collegeModel from "../Models/collegeModel.js";


/* Create college */
export const createCollege = async (req, res) => {
  try {
    const { collegeName, location } = req.body;

    if (!collegeName || !location) {
      return res.status(400).json({
        success: false,
        message: "collegeName and location are required"
      });
    }

    const college = await collegeModel.create({
      collegeName,
      location
    });

    return res.status(201).json({
      success: true,
      message: "College created successfully",
      college
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* Get all colleges */
export const getAllColleges = async (req, res) => {
  try {
    const colleges = await collegeModel.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: colleges.length,
      colleges
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* Update college */
export const updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    if(!id){
      return res.status(400).json({
        success: false,
        message: "College ID is required"
      });
    }   
    const { collegeName, location } = req.body;

    if (!collegeName && !location) {
      return res.status(400).json({
        success: false,
        message: "At least one field (collegeName or location) is required to update"
      });
    }

    const updatedCollege = await collegeModel.findByIdAndUpdate(
      id,
      { collegeName, location },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedCollege) {
      return res.status(404).json({
        success: false,
        message: "College not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "College updated successfully",
      updatedCollege
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete college 
export const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;

    if(!id){
      return res.status(400).json({
        success: false,
        message: "College ID is required"
      });
    } 

    await collegeModel.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message:'deleted'});
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};


