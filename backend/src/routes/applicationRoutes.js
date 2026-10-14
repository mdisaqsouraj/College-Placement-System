import express from "express";

import {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/applicationController.js";

const router = express.Router();

router.post("/", createApplication);
router.get("/", getAllApplications);
router.get("/:id", getApplicationById);
router.put("/:id/status", updateApplicationStatus);
router.delete("/:id", deleteApplication);

export default router;