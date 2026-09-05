import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Test Route
app.get("/", (req, res) => {
    res.send("College-Placement-System server is running successfully");
});

// Start Server
app.listen(PORT, () => {
    console.log(`App is Running On PORT number: ${PORT}`);
});