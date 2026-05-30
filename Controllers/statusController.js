import statusModel from "../Models/statusModel.js";

// Create status
export const createStatus = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Status name is required" });
    }

    const trimmedName = name.trim();

    // Check if status already exists case-insensitively
    const existing = await statusModel.findOne({ name: { $regex: `^${trimmedName}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Status already exists" });
    }

    const status = await statusModel.create({ name: trimmedName });
    return res.status(201).json({ success: true, message: "Status created successfully", status });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all active statuses (with auto-seeding)
export const getStatuses = async (req, res) => {
  try {
    let statuses = await statusModel.find({ isActive: true }).sort({ createdAt: 1 });

    // Auto-seed default values if database is empty
    if (statuses.length === 0) {
      const defaults = ["Call Connected", "Busy", "Not Connected"];
      const seedData = defaults.map(name => ({ name }));
      await statusModel.insertMany(seedData);
      statuses = await statusModel.find({ isActive: true }).sort({ createdAt: 1 });
    }

    return res.status(200).json({ success: true, statuses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a status
export const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await statusModel.findByIdAndDelete(id);
    if (!status) {
      return res.status(404).json({ success: false, message: "Status not found" });
    }
    return res.status(200).json({ success: true, message: "Status deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
