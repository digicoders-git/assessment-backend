import courseModel from "../Models/courseModel.js";


/* CREATE */
export const createCourse = async (req, res) => {
  try {
    const { course } = req.body;

    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course field is required"
      });
    }

    const courses = await courseModel.create({ course });

    return res.status(201).json({
      success: true,
      message: "Created",
      courses
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internel server error",
      error: error.message
    });
  }
};

/* GET ALL */
export const getCourses = async (req, res) => {
  try {
    const courses = await courseModel.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Courses found",
      courses
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internel server error",
      error: error.message
    });
  }
};

/* UPDATE */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { course } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id required"
      });
    }

    if (!course) {
      return res.status(400).json({
        success: false,
        message: "course required"
      });
    }

    const updatedCourse = await courseModel.findByIdAndUpdate(
      id,
      { course },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "course not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedCourse
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internel server error",
      error: error.message
    });
  }
};

/* DELETE */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    await courseModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Deleted"
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "internel server error"
    });
  }
};
