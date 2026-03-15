const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const SECRET = "attendance_secret";


/* =========================
   REGISTER USER
========================= */

router.post("/register", async (req,res)=>{

try{

const {name,email,password} = req.body;

const existingUser = await User.findOne({email});

if(existingUser){
return res.status(400).json({
message:"User already exists"
});
}

const hashedPassword = await bcrypt.hash(password,10);

const user = new User({
name,
email,
password:hashedPassword
});

await user.save();

res.json({
message:"User registered successfully"
});

}catch(err){

res.status(500).json({
message:"Server error"
});

}

});


/* =========================
   LOGIN USER
========================= */

router.post("/login", async (req,res)=>{

try{

const {email,password} = req.body;

const user = await User.findOne({email});

if(!user){
return res.status(404).json({
message:"User not found"
});
}

const validPassword = await bcrypt.compare(password,user.password);

if(!validPassword){
return res.status(401).json({
message:"Invalid password"
});
}

const token = jwt.sign(
{email:user.email},
SECRET,
{expiresIn:"1d"}
);

res.json({
message:"Login successful",
token
});

}catch(err){

res.status(500).json({
message:"Server error"
});

}

});


module.exports = router;