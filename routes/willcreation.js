const mongoose = require("mongoose");
const express = require("express");
var cloudinary = require('cloudinary').v2;
const multer = require("multer");
var fs=require('fs')

var route = express.Router();
var Will = require('../models/willcreation')
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
// add products
route.post("/createwill",upload.array('selfies'),async(req,res)=>{
    var {personalDetails, wivesDetails, executorDetails, childrenDetails, guardianDetails,
    distributionDetails, remainderDetails, otherDetails, petDetails, burialDetails,additionalDetails,
  signingDetails, userID} = req.body
  const urls=[]
  const files= req.files
  let image=''
  if(req.method==='POST'){
    try {
      for (const filename of files) {
        const { path } = filename;
        var uniqueFileName = `${filename.originalname}`;
        image = await cloudinary.uploader.upload(path, {
          public_id: `selfies/${uniqueFileName}`,
          tags: "selfies",
        });
        urls.push(image.url)
      
        fs.unlinkSync(path)
      }
      const p= JSON.parse(personalDetails)
      const w= JSON.parse(wivesDetails)
      const exe= JSON.parse(executorDetails)
      const c= JSON.parse(childrenDetails)
      const g= JSON.parse(guardianDetails)
      const d= JSON.parse(distributionDetails)
      const r= JSON.parse(remainderDetails)
      const o= JSON.parse(otherDetails)
      const pet= JSON.parse(petDetails)
      const b= JSON.parse(burialDetails)
      const a= JSON.parse(additionalDetails)
      const s= JSON.parse(signingDetails)


      const newProduct = new Will({
        personalDetails: p,
        wivesDetails: w,
        executorDetails: exe,
        childrenDetails: c,
        guardianDetails:g,
        distributionDetails:d,
        remainderDetails:r,
        otherDetails:o,
        petDetails: pet,
        burialDetails:b,
        additionalDetails:a,
        signingDetails:s,
        selfies: urls,
        userID
    
        
      })
       await newProduct.save();

    } catch (error) {
      console.log(error)
    }
    res.status(200).json({
      message: 'images uploaded successfully',
      data: urls
    })

  }
  else{
    res.status(405).json({
      err: `${req.method} method not allowed`
    })
  }

  
  
  })
module.exports= route