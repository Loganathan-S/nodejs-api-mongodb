const express = require("express");
const User = require("../model");
const bcrypt  = require('bcryptjs');



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


module.exports = router;