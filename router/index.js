const express = require("express");
const User = require("../model");
const bcrypt  = require('bcryptjs');
const generateToken = require("../utils");
const verifyToken = require("../middleware");
const nodemalier = require("nodemailer");


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


// reset-password api
router.post("/reset-password",async(req,res)=>{
  const {email} = req.body;
  const user = await User.findOne({email});

  if(!user){
    return res.status(404).json({message:"user not found"})
  }

  const token = Math.random().toString(36).slice(-8)
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 360000; // 1hour for valid
  await user.save();
  const transporter = nodemalier.createTransport({
    service:"gmail",
    auth:{
      user:"rajarajan2k1@gmail.com",
      pass:"lxtbifszbjrvxsir"
    },
  })
  const message = {
    from:"rajarajan2k1@gmail.com",
    to:user.email,
    subject:"Password reset request",
    text:`you are receiving this email because you(or someone else) has requested a password reset for your account.\n\n please use the following token to reset your password: ${token}\n\n If you did not request your password  reset, please ignore this email.`
  }
  transporter.sendMail(message,(err,info) => {
    if (err) {
      res.status(404).json({message:"Something went wrong, try again"})
    }
    res.status(200).json({message:"Password reset email sent" + info.response});
  });
})



module.exports = router;