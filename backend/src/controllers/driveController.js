import mongoose from "mongoose";
import PlacementDrive from "../models/PlacementDrive.js";
import Company from "../models/Company.js";

// Create a new placement drive
export const createDrive = async (req, res) => {
  try {
    const {
      company,
      jobRole,
      package: packageAmount,
      minimumCGPA,
      allowedBranches,
      maximumBacklogs,
      applicationDeadline,
    } = req.body;

    if (
      !company ||
      !jobRole ||
      packageAmount === undefined ||
      minimumCGPA === undefined ||
      !allowedBranches ||
      maximumBacklogs === undefined ||
      !applicationDeadline
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID",
      });
    }

    const existingCompany = await Company.findById(company);

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const drive = await PlacementDrive.create({
      company,
      jobRole,
      package: packageAmount,
      minimumCGPA,
      allowedBranches,
      maximumBacklogs,
      applicationDeadline,
    });

    res.status(201).json({
      success: true,
      message: "Placement drive created successfully",
      data: drive,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create placement drive",
    });
  }
};

// Get all placement drives
export const getAllDrives = async (req, res) => {
  try {
    const drives = await PlacementDrive.find().populate(
      "company",
      "name location website description jobRoles package"
    );

    res.status(200).json({
      success: true,
      message: "Placement drives fetched successfully",
      data: drives,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch placement drives",
    });
  }
};

// Get a placement drive by ID
export const getDriveById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid placement drive ID",
      });
    }

    const drive = await PlacementDrive.findById(id).populate(
      "company",
      "name location website description jobRoles package"
    );

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Placement drive fetched successfully",
      data: drive,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch placement drive",
    });
  }
};

// Update a placement drive
export const updateDrive = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid placement drive ID",
      });
    }

    if (req.body.company !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(req.body.company)) {
        return res.status(400).json({
          success: false,
          message: "Invalid company ID",
        });
      }

      const existingCompany = await Company.findById(req.body.company);

      if (!existingCompany) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        });
      }
    }

    const drive = await PlacementDrive.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "company",
      "name location website description jobRoles package"
    );

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Placement drive updated successfully",
      data: drive,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update placement drive",
    });
  }
};

// Delete a placement drive
export const deleteDrive = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid placement drive ID",
      });
    }

    const drive = await PlacementDrive.findByIdAndDelete(id);

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Placement drive deleted successfully",
      data: drive,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete placement drive",
    });
  }
};