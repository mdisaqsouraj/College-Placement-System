import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    jobRoles: {
      type: [String],
      required: true,
      validate: {
        validator: (roles) => roles.length > 0,
        message: "At least one job role is required",
      },
    },

    package: {
      minimum: {
        type: Number,
        required: true,
        min: 0,
      },

      maximum: {
        type: Number,
        required: true,
        min: 0,
      },

      currency: {
        type: String,
        default: "INR",
        trim: true,
      },

      unit: {
        type: String,
        default: "LPA",
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model("Company", companySchema);

export default Company;