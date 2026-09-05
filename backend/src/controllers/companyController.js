import Company from "../models/Company.js";

export const createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);

    res.status(201).json({
      status: "success",
      data: company,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();

    res.status(200).json({
      status: "success",
      results: companies.length,
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        status: "fail",
        message: "Company not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: company,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!company) {
      return res.status(404).json({
        status: "fail",
        message: "Company not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: company,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({
        status: "fail",
        message: "Company not found",
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};