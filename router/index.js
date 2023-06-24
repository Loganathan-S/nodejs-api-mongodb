const express = require("express");
const User = require("../model");
const bcrypt  = require('bcryptjs');
const generateToken = require("../utils");
const verifyToken = require("../middleware");



const router = express.Router();

// for testing api - get 
router.get("/test", (req, res) =>
  res.json({ message: "Api testing Successful" })
);


//user create api - post
router.post('/user',async(req,res)=>{
  const {email,password} = req.body;
  const user = await User.findOne({email});

  if(!user){
    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = new User({email,password:hashedPassword});
    await newUser.save();
    return res.status(201).json({message:"User created"}); 
  }

  res.status(404).json({message:"User already Exists"})

})

//authenticate user api
router.post("/authenticate",async(req,res)=>{
  const {email,password} = req.body;
  const user = await User.findOne({email});
  if(!user){
    return res.status(404).json({message:"User not found"});
  }
  const isMatch = await bcrypt.compare(password,user.password);

  if(!isMatch){
    return res.status(401).json({message:"incorrect Password"});
  }

  const token = generateToken(user);
  res.json({token});
})


//Protected data api
router.get("/data",verifyToken,(req,res)=>{
  res.json({message:`welcome,${req.user.email}! This is protected data`})
})


module.exports = router;