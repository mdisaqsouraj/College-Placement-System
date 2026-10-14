import mongoose from "mongoose";
import Application from "../models/Application.js";
import Student from "../models/Student.js";
import PlacementDrive from "../models/PlacementDrive.js";

// Create a new application
export const createApplication = async (req, res) => {
  try {
    const { placementDrive } = req.body;

    if (!placementDrive) {
      return res.status(400).json({
        success: false,
        message: "Placement drive ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(placementDrive)) {
      return res.status(400).json({
        success: false,
        message: "Invalid placement drive ID",
      });
    }

    const existingDrive = await PlacementDrive.findById(placementDrive);

    if (!existingDrive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    let studentId;

    // Get student from authenticated request
    if (req.user) {
      // If authentication middleware provides a Student ID directly
      if (req.user.student) {
        studentId = req.user.student;
      }
      // If authentication middleware provides the Student document ID
      else if (req.user._id && req.user.role !== "admin") {
        const student = await Student.findOne({ user: req.user._id });

        if (student) {
          studentId = student._id;
        }
      }
    }

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Authenticated student information not found",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const existingApplication = await Application.findOne({
      student: studentId,
      placementDrive,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "Student has already applied for this placement drive",
      });
    }

    const application = await Application.create({
      student: studentId,
      placementDrive,
    });

    res.status(201).json({
      success: true,
      message: "Application created successfully",
      data: application,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Student has already applied for this placement drive",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create application",
    });
  }
};

// Get all applications
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "-password",
        },
      })
      .populate("placementDrive");

    res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};

// Get application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findById(id)
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "-password",
        },
      })
      .populate("placementDrive");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application fetched successfully",
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch application",
    });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const allowedStatuses = [
      "Applied",
      "Shortlisted",
      "Rejected",
      "Selected",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Status must be Applied, Shortlisted, Rejected, or Selected",
      });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "-password",
        },
      })
      .populate("placementDrive");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: application,
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
      message: "Failed to update application status",
    });
  }
};

// Delete an application
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findByIdAndDelete(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete application",
    });
  }
};