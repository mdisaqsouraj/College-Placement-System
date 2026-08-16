import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.get("/",(req,res)=>{
    res.send("College-Placement-System server is running sucessfully")
})
app.listen(PORT,()=>{
    console.log(`App is Running On PORT number: ${PORT}`);
})