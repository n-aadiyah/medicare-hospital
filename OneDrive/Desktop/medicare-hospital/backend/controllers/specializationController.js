
const Specialization = require("../models/Specialization");

// CREATE specialization
const createSpecialization = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Specialization name is required.",
      });
    }

    const existingSpecialization = await Specialization.findOne({
      name: name.trim(),
    });

    if (existingSpecialization) {
      return res.status(409).json({
        success: false,
        message: "Specialization already exists.",
      });
    }

    const specialization = await Specialization.create({
      name: name.trim(),
      description: description || "",
    });

    return res.status(201).json({
      success: true,
      message: "Specialization created successfully.",
      specialization,
    });
  } catch (error) {
    console.error("Create specialization error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating specialization.",
    });
  }
};

// GET all specializations
const getAllSpecializations = async (req, res) => {
  try {
    const specializations = await Specialization.find().sort({
      name: 1,
    });

    return res.status(200).json({
      success: true,
      count: specializations.length,
      specializations,
    });
  } catch (error) {
    console.error("Get specializations error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching specializations.",
    });
  }
};

// UPDATE specialization
const updateSpecialization = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const specialization = await Specialization.findById(req.params.id);

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found.",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Specialization name cannot be empty.",
        });
      }

      const duplicate = await Specialization.findOne({
        name: name.trim(),
        _id: { $ne: specialization._id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another specialization already uses this name.",
        });
      }

      specialization.name = name.trim();
    }

    if (description !== undefined) {
      specialization.description = description;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be true or false.",
        });
      }

      specialization.isActive = isActive;
    }

    await specialization.save();

    return res.status(200).json({
      success: true,
      message: "Specialization updated successfully.",
      specialization,
    });
  } catch (error) {
    console.error("Update specialization error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating specialization.",
    });
  }
};

// DEACTIVATE specialization
const deactivateSpecialization = async (req, res) => {
  try {
    const specialization = await Specialization.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Specialization deactivated successfully.",
      specialization,
    });
  } catch (error) {
    console.error("Deactivate specialization error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deactivating specialization.",
    });
  }
};

module.exports = {
  createSpecialization,
  getAllSpecializations,
  updateSpecialization,
  deactivateSpecialization,
};
