var express = require('express');
var route = express.Router();
const mongoose = require("mongoose");
const User = require("../models/users");
const Document = require("../models/regDocument")
const authMiddleware = require("../middleware/authenticateToken");
const jwt = require("jsonwebtoken");
const Discount = require("../models/discount")
var cloudinary = require('cloudinary').v2;
const multer = require("multer");
var fs = require('fs');


cloudinary.config({ 
    cloud_name: 'dexn8tnt9', 
    api_key: '828443825275634', 
    api_secret: 'oYWmlitChe7pZ7K9PatCNZaXfMk' 
  });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + file.originalname);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/JPG" ||
      file.mimetype === "image/png"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  const upload = multer({ storage: storage, fileFilter: fileFilter });
/* GET users listing. */
route.get("/", async (req, res) => {
  try {
    const userData = await User.find();
    if (userData.length === 0) {
      res.status(200).send({
        success: true,
        data: userData,
        message: "No User registered"
      });
    } else {
      res.status(200).send({
        success: true,
        data: userData
      });
    }
  } catch (err) {
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  }
});

//Login user route
route.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const getUser = await User.find({
      email,
      password
    });


    if (getUser.length > 0) {
      let token = jwt.sign({ id: getUser[0]._id, name: getUser[0].name,email: getUser[0].email,
        isAdmin: getUser[0].isAdmin }, "secret_key");
      res
        .header("auth-token", token)
        .status(200)
        .send({
          data: getUser,
          message: "Successfully login",
          token,
          
        });
    } else {
      console.log("else");
      res.status(404).send({
        success: false,
        message: "User not found!"
      });
    }
  } catch (err) {
    console.log("catch");
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  }
})

//Register the user route
route.post("/register/:role", upload.single('selfie'), async (req, res) => {
  const {  email, password, phoneNo, add1, add2, town, country } = req.body;
  const {role} = req.params
  const path = req.file && req.file.path
  const uniqueFileName = phoneNo
  try{
    const image = await cloudinary.uploader.upload(path, {
      public_id: `selfie/${uniqueFileName}`,
      tags: "selfie",
    })
    fs.unlinkSync(path);
    if(image){
      const newUser= new User({
        _id: new mongoose.Types.ObjectId(),
        email,
        password,
        phoneNo,
        add1,
        add2,
        town,
        country,
        selfie: image && image.url,  
        type: role,
        isAdmin: false,
        status: "Active"
      });
      const response = await newUser.save();
      if(response){
        res.status(201).json({
          success: true,
          data: response,
          message: "User Successfully added",
      });
     }
     else{
      res.status(501).json({
        success: false,
        data: [],
        message: "Error while registering user",
      });
     }
  }
  
  }
  catch (error) {
    res.status(501).json({
      success: false,
      data: [],
      message: error.message,
    });
  }

})


// register will document
route.post("/register-document", async(req,res)=>{
  const {docDate, docName, docType, docNo, docDesc, docLoc,activeWillId} = req.body;

  const newDocument = new Document({
    _id: new mongoose.Types.ObjectId(),
    activeWillId,
    docDate,
    docName,
    docType,
    docNo,
    docDesc,
    docLoc

  });

  newDocument
    .save()
    .then(response => {
      res.status(200).send({
        success: true,
        message: "Successfully Registered",
        data: response
      });
    })
    .catch(err => {
      res.status(400).send({
        success: false,
        message: "error registering document",
        Error: err
      });
    });

})




// setup discount
route.post("/setup-discount", async(req,res)=>{
  const{type, fromNoQty, toNoQty, discountPercentage} = req.body;

  const newDiscount = new Discount({
    type,
    fromNoQty,
    toNoQty,
    discountPercentage
  })
  newDiscount
  .save()
  .then(response => {
    res.status(200).send({
      success: true,
      message: "Discount Added",
      data: response
    });
  })
  .catch(err => {
    res.status(400).send({
      success: false,
      message: "Discount failed",
      Error: err
    });
  });

})
module.exports = route;
