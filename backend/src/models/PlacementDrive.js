import mongoose from "mongoose";

const placementDriveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    jobRole: {
      type: String,
      required: true,
      trim: true,
    },

    package: {
      type: Number,
      required: true,
      min: 0,
    },

    minimumCGPA: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    allowedBranches: {
      type: [String],
      required: true,
      validate: {
        validator: (branches) => branches.length > 0,
        message: "At least one branch is required",
      },
    },

    maximumBacklogs: {
      type: Number,
      required: true,
      min: 0,
    },

    applicationDeadline: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PlacementDrive = mongoose.model("PlacementDrive", placementDriveSchema);

export default PlacementDrive;