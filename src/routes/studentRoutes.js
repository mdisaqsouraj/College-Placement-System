import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  getMyProfile,
  getStudentById,
  updateMyProfile,
} from "../controllers/studentController.js";

const router = express.Router();

// Get logged-in student's profile
router.get("/profile", authMiddleware, getMyProfile);

// Get student by ID
router.get("/:id", authMiddleware, getStudentById);

// Update logged-in student's profile
router.put("/profile", authMiddleware, updateMyProfile);

export default router;