const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const storeRoutes = require("./routes/storeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/attendance")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/attendance", attendanceRoutes);

app.get("/", (req,res)=>{
    res.send("Attendance API running");
});

app.listen(5000, ()=>{
    console.log("Server running on port 5000");
});