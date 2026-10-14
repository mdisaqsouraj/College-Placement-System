import Student from "../models/Student.js";
import User from "../models/User.js";

// Get currently logged-in student's profile
export const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate("user", "name email role");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student profile",
    });
  }
};

// Get student by ID
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .populate("user", "name email role");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Get Student Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student",
    });
  }
};

// Update currently logged-in student's profile
export const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      rollNumber,
      branch,
      year,
      CGPA,
      backlogs,
      skills,
      resume,
    } = req.body;

    // Find student using logged-in user's ID
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Update User information
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;

    await user.save();

    // Update Student information
    if (rollNumber !== undefined) student.rollNumber = rollNumber;
    if (branch !== undefined) student.branch = branch;
    if (year !== undefined) student.year = year;
    if (CGPA !== undefined) student.CGPA = CGPA;
    if (backlogs !== undefined) student.backlogs = backlogs;
    if (skills !== undefined) student.skills = skills;
    if (resume !== undefined) student.resume = resume;

    await student.save();

    const updatedStudent = await Student.findById(student._id)
      .populate("user", "name email role");

    return res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update student profile",
    });
  }
};