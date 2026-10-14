import express from "express";

import {
  createDrive,
  getAllDrives,
  getDriveById,
  updateDrive,
  deleteDrive,
} from "../controllers/driveController.js";

const router = express.Router();

router.post("/", createDrive);
router.get("/", getAllDrives);
router.get("/:id", getDriveById);
router.put("/:id", updateDrive);
router.delete("/:id", deleteDrive);

export default router;