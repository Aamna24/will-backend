
const mongoose = require("mongoose");
const express = require("express");
var route = express.Router();
const Flyer = require('../models/Flyer')
const multer = require("multer");
var fs = require('fs');
var cloudinary = require('cloudinary').v2;


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
// upload flyer
route.post("/uploadFlyer", upload.single('img'),  async (req, res) => {
    const { name , description } = req.body;
  const path = req.file && req.file.path
  const uniqueFileName = name
  try{
    const image = await cloudinary.uploader.upload(path, {
      public_id: `flyer/${uniqueFileName}`,
      tags: "flyer",
    })
    fs.unlinkSync(path);
    if(image){
      const newFlyer = new Flyer({
        _id: new mongoose.Types.ObjectId(),
        name,
        description,
        img: image && image.url,  
      });
      const response = await newFlyer.save();
      if(response){
        res.status(201).json({
          success: true,
          data: response,
          message: "Flyer Successfully added",
      });
     }
     else{
      res.status(501).json({
        success: false,
        data: [],
        message: "Error while adding flyer",
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

// get route flyer
route.get("/",  async (req, res) => {
  try {
    const flyerData = await Flyer.find();
    if (flyerData.length === 0) {
      res.status(200).send({
        success: true,
        data: flyerData,
        message: "No Flyer uploaded"
      });
    } else {
      res.status(200).send({
        success: true,
        data: flyerData
      });
    }
  } catch (err) {
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  }
});



module.exports = route;